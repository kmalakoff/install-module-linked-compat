const assert = require('assert');
const installModule = require('install-module-linked-compat');

describe('exports .cjs', () => {
  it('exists', () => {
    assert.equal(typeof installModule, 'function');
  });
});
