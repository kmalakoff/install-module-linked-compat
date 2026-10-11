# install-module-linked-compat

Installs and symlinks a module into node_modules

This is the broad-Node version of install-module-linked (engines >= 0.8): it re-exports the identical API and injects shims only for the built-ins the running Node lacks. On Node >= 18 it is a pure pass-through to install-module-linked.

```sh
npm install install-module-linked-compat
```

For older CommonJS applications:

```js
var path = require('path');
var installModule = require('install-module-linked-compat');

installModule('is-number@7.0.0', path.join(__dirname, 'node_modules'), function (err, installedAt) {
  if (err) throw err;
  console.log(installedAt);
});
```

Install strings take the same forms as install-module-linked: an exact version, a semver range or a dist-tag. A range or tag resolves to the version npm would install, on every supported Node.

### Documentation

[API Docs](https://kmalakoff.github.io/install-module-linked-compat/)
