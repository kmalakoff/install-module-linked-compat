import assert from 'assert';
import path from 'path';
import type { OverlayDetection } from '../../src/compat.ts';
import overlay, { detect, overlayFor } from '../../src/compat.ts';

const MODERN: OverlayDetection = { major: 18, minor: 0, hasFetch: true, hasRm: true, hasMkdir: true, hasHomedir: true, hasExecFileSync: true };
const OLD: OverlayDetection = { major: 0, minor: 8, hasFetch: false, hasRm: false, hasMkdir: false, hasHomedir: false, hasExecFileSync: false };

describe('overlayFor', () => {
  it('is empty on Node >= 18', () => {
    assert.deepEqual(overlayFor(MODERN), {});
  });

  it('injects every shim on Node 0.8', () => {
    const o = overlayFor(OLD);
    assert.equal(typeof o.spawn, 'function');
    assert.equal(typeof o.fetchText, 'function');
    assert.equal(typeof o.rm, 'function');
    assert.equal(typeof o.rmSync, 'function');
    assert.equal(typeof o.mkdir, 'function');
    assert.equal(typeof o.homedir, 'function');
    assert.equal(typeof o.syncExec, 'function');
    // From src the path names the source half; the dist/cjs path is proven by the 0.8 sync suite.
    assert.equal(o.workerModule ? path.basename(o.workerModule) : undefined, 'compat.js', `workerModule: ${o.workerModule}`);
  });

  it('injects homedir only below Node 4', () => {
    assert.equal(typeof overlayFor(OLD).homedir, 'function');
    assert.equal(overlayFor({ ...OLD, hasHomedir: true }).homedir, undefined);
  });

  it('injects rm and rmSync only below Node 14.14', () => {
    assert.equal(typeof overlayFor({ ...MODERN, hasRm: false }).rm, 'function');
    assert.equal(typeof overlayFor({ ...MODERN, hasRm: false }).rmSync, 'function');
    assert.equal(overlayFor(MODERN).rm, undefined);
  });

  it('injects mkdir only below Node 10.12', () => {
    assert.equal(typeof overlayFor({ ...MODERN, hasMkdir: false }).mkdir, 'function');
    assert.equal(overlayFor(MODERN).mkdir, undefined);
  });

  it('injects fetchText and workerModule below Node 18', () => {
    const o = overlayFor({ ...MODERN, major: 17, hasFetch: false });
    assert.equal(typeof o.fetchText, 'function');
    assert.ok(o.workerModule, 'workerModule should be set below 18');
    assert.equal(o.spawn, undefined);
    assert.equal(o.rm, undefined);
    assert.equal(o.mkdir, undefined);
    assert.equal(o.homedir, undefined);
    assert.equal(o.syncExec, undefined);
  });

  it('injects syncExec only below Node 0.12', () => {
    assert.equal(typeof overlayFor(OLD).syncExec, 'function');
    assert.equal(overlayFor({ ...OLD, hasExecFileSync: true }).syncExec, undefined);
  });

  it('injects spawn only on Node 0.x', () => {
    assert.equal(typeof overlayFor(OLD).spawn, 'function');
    assert.equal(overlayFor(MODERN).spawn, undefined);
  });

  it('injects workerModule only when the sync child needs a shim', () => {
    assert.equal(overlayFor(MODERN).workerModule, undefined);
    assert.ok(overlayFor({ ...MODERN, hasRm: false }).workerModule, 'workerModule should be set when rm is missing');
  });
});

describe('overlay', () => {
  it('injects exactly the shims this node lacks', () => {
    assert.deepEqual(Object.keys(overlay), Object.keys(overlayFor(detect())));
  });
});
