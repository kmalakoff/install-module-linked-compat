## install-module-linked-compat

Installs and symlinks a module into node_modules

This is the broad-Node version of install-module-linked (engines >= 0.8): it re-exports the identical API and injects shims only for the built-ins the running Node lacks. On Node >= 18 it is a pure pass-through to install-module-linked.

### Example 1

```typescript
import installModule from 'install-module-linked-compat';

const res = await installModule('my-module@1.2.3', /* path to node_modules */ );
```

### Documentation

[API Docs](https://kmalakoff.github.io/install-module-linked-compat/)
