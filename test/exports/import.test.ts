import assert from 'assert';
import installModule from 'install-module-linked-compat';

describe('exports .ts', () => {
  it('exists', () => {
    assert.equal(typeof installModule, 'function');
  });
});
