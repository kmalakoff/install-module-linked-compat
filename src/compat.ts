import childProcess from 'child_process';
import fs from 'fs';
import { safeRm, safeRmSync } from 'fs-remove-compat';
import { getContent } from 'get-file-compat';
import type { InstallOptions } from 'install-module-linked';
import mkdirp from 'mkdirp-classic';
import Module from 'module';
import { bind } from 'node-version-call-local';
import os from 'os';
import path from 'path';
import url from 'url';

// Tier 2 deferral: these load only on the sync and pre-Node 4 paths.
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

// Workers MUST always load from dist/cjs/ for old Node compatibility (works from both cjs and esm).
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const cjsDir = typeof require === 'undefined' ? path.join(__dirname, '..', 'cjs') : __dirname;

export interface OverlayDetection {
  major: number;
  minor: number;
  hasFetch: boolean;
  hasRm: boolean;
  hasMkdir: boolean;
  hasHomedir: boolean;
  hasExecFileSync: boolean;
}

export function detect(): OverlayDetection {
  const [major, minor] = process.versions.node.split('.').map(Number) as [number, number];
  return {
    major,
    minor,
    hasFetch: typeof fetch === 'function',
    hasRm: typeof fs.rm === 'function' && typeof fs.rmSync === 'function',
    hasMkdir: major > 10 || (major === 10 && minor >= 12),
    hasHomedir: typeof os.homedir === 'function',
    hasExecFileSync: typeof childProcess.execFileSync === 'function',
  };
}

// The shims the running node lacks, keyed by the core's InstallOptions names;
// empty on Node >= 18.
export type Overlay = Partial<Pick<InstallOptions, 'spawn' | 'fetchText' | 'rm' | 'rmSync' | 'mkdir' | 'homedir' | 'syncExec' | 'workerModule'>>;

export function overlayFor(detection: OverlayDetection): Overlay {
  const overlay: Overlay = {};
  if (detection.major === 0) {
    // 0.x npm cannot install modern packages: delegate the spawn to a newer
    // local node, which runs the worker (the proven 1.6.5 mechanism).
    overlay.spawn = bind('>0.12', path.join(cjsDir, 'workers', 'spawn.js'), { callbacks: true });
  }
  if (!detection.hasFetch) {
    overlay.fetchText = (u, callback) => getContent(u, 'utf8', (err, res) => (err ? callback(err) : callback(null, res?.content)));
  }
  if (!detection.hasRm) {
    overlay.rm = (p, callback) => safeRm(p, (err) => callback(err ?? null));
    overlay.rmSync = (p) => safeRmSync(p);
  }
  if (!detection.hasMkdir) {
    overlay.mkdir = (p, callback) => mkdirp(p, callback);
  }
  if (!detection.hasHomedir) {
    overlay.homedir = () => _require('homedir-polyfill')();
  }
  if (!detection.hasExecFileSync) {
    overlay.syncExec = (workerPath, data) => {
      const payload = JSON.parse(data) as { installString: string; nodeModulesPath: string; cachePath?: string; workerModule?: string };
      return _require('function-exec-sync')({ callbacks: true }, workerPath, payload.installString, payload.nodeModulesPath, { cachePath: payload.cachePath, workerModule: payload.workerModule }) as string | undefined;
    };
  }
  // The sync child is a fresh process on this same node: it needs every shim
  // this node lacks, resolved from this module in its own process.
  if (detection.major === 0 || !detection.hasFetch || !detection.hasRm || !detection.hasMkdir || !detection.hasHomedir) {
    overlay.workerModule = path.join(cjsDir, 'compat.js');
  }
  return overlay;
}

export default overlayFor(detect());
