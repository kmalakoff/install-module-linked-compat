# Changelog

All notable changes to install-module-linked-compat are documented here.

## [1.0.0] - 2026-10-11

Same API and behaviour as 0.2.4.

## [0.2.4] - 2026-10-11

### Added

- Install strings may name a semver range or a dist-tag, on every supported Node from 0.8. Each
  resolves to the version npm would install and is cached under that exact version
  (install-module-linked 2.1.0).
