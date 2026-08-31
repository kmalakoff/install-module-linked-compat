import type { CleanOptions, InstallCallback, InstallOptions } from 'install-module-linked';
import installModuleCore, { clear as clearCore, install as installCore, parseInstallString, sync as syncCore } from 'install-module-linked';
import overlay from './compat.ts';

export type * from 'install-module-linked';

// Identical API to install-module-linked; the overlay supplies the shims the
// running node lacks (empty on Node >= 18), and user options always win.

export default function installModule(installString: string, nodeModulesPath: string, callback: InstallCallback): void;
export default function installModule(installString: string, nodeModulesPath: string, options: InstallOptions, callback: InstallCallback): void;
export default function installModule(installString: string, nodeModulesPath: string, options?: InstallOptions): Promise<string>;
export default function installModule(installString: string, nodeModulesPath: string, options?: InstallOptions | InstallCallback, callback?: InstallCallback): void | Promise<string> {
  const userOptions = typeof options === 'function' ? {} : options || {};
  const userCallback = typeof options === 'function' ? options : callback;
  const merged = { ...overlay, ...userOptions };
  if (typeof userCallback === 'function') return installModuleCore(installString, nodeModulesPath, merged, userCallback);
  return installModuleCore(installString, nodeModulesPath, merged);
}

export function sync(installString: string, nodeModulesPath: string, options?: InstallOptions): string | undefined {
  return syncCore(installString, nodeModulesPath, { ...overlay, ...options });
}

export function clear(options?: CleanOptions): void {
  clearCore({ ...overlay, ...options });
}

export function install(specifier: string, dest: string, options: InstallOptions, callback: InstallCallback): void;
export function install(specifier: string, dest: string, options?: InstallOptions, callback?: InstallCallback): void {
  callback = typeof options === 'function' ? options : (callback as InstallCallback);
  options = typeof options === 'function' ? {} : ((options || {}) as InstallOptions);

  installCore(specifier, dest, { ...overlay, ...options }, callback);
}

export { parseInstallString };
