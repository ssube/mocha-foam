import { expect } from 'chai';
import { array, defaultReportMessage, integer, lorem, tuple, uuid } from 'fast-check';

import { over } from '../src';

const LARGE_VALUE = Math.floor(Math.random() * 1_000_000_000);

describe('example properties', () => {
  over('some numbers', integer(), (it) => {
    it('should be a small number', (n: number) => {
      return n < LARGE_VALUE;
    });

    it('should be even', (n: number) => {
      return n % 2 === 0;
    });

    it('should not throw', (n: number) => {
      if (n.toString()[3] === '9') {
        throw new Error('not a real number!');
      }

      return true;
    });

    it('should resolve async checks', async (n: number) => {
      expect(n).to.be.lessThanOrEqual(90);
    });
  });

  over('some IDs', uuid(), (it) => {
    // beforeEach hooks work normally, since the wrapped it calls through to real it
    beforeEach(() => {
      console.log('before each ID test');
    });

    it('should be a good one', (id: string) => {
      return id[9] !== 'a';
    });

    it('should be long enough', (id: string) => {
      return id.length > 2;
    });
  }, {
    // fast-check parameters are supported, like examples
    examples: ['a', 'b'],
    numRuns: 1_000_000_000,
  });

  over('even numbers', integer().filter(n => n % 2 === 0), (it) => {
    it('should be even', (n: number) => {
      return n % 2 === 0;
    });
  });

  over('mapped properties', tuple(lorem(), integer()).map(([a, b]) => a.substr(b)), (it) => {
    it('should have content', (text: string) => {
      return text.length > 0;
    });
  }, {
    // error formatting can be overridden with a custom handler, or fast-check's default
    errorReporter: defaultReportMessage,
  });

  over('tuples', tuple(integer(), integer()), (it) => {
    // tuple properties are passed as a single parameter
    it('should not be equal', ([a, b]) => {
      return a === b;
    });

    it('should be uneven', ([a, b]) => {
      return a < b;
    });
  }, {
    examples: [[1, 2]]
  });

  over('arrays', array(integer()), (it) => {
    it('should have items', (t: Array<number>) => {
      expect(t).to.have.length.lessThan(5_000);
    });
  }, {
    numRuns: 1_000,
  });
});
