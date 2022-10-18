import { expect } from 'chai';
import { array, defaultReportMessage, integer, lorem, tuple, uuid } from 'fast-check';
import { describe } from 'mocha';

import { over } from '../src/index.js';
import { itFails, itPasses } from './helpers.js';

const LARGE_VALUE = Math.floor(Math.random() * 1_000_000_000);

describe('example properties', () => {
  it('number arbitrary', (done) => {
    over('some numbers', integer(), (it) => {
      it('should be a small number', (n: number) => {
        return n < LARGE_VALUE;
      });
    }, {}, itFails('by returning false', done));
  });

  it('another number arbitrary', (done) => {
    over('some numbers', integer(), (it) => {
      it('should be even', (n: number) => {
        return n % 2 === 0;
      });
    }, {}, itFails('by returning false', done));
  });

  it('yet another number arbitrary', (done) => {
    over('some numbers', integer(), (it) => {
      it('should not throw', (n: number) => {
        throw new Error('bad number!');
      });
    }, {}, itFails('by throwing an error', done));
  });


  it('many number arbitrary', (done) => {
    over('some numbers', integer(), (it) => {
      it('should resolve async checks', async (n: number) => {
        expect(n).to.be.lessThanOrEqual(90);
      });
    }, {}, itFails('by throwing an error', done));
  });

  it('UUID arbitrary', (done) => {
    over('some IDs', uuid(), (it) => {
      // beforeEach hooks work normally, since the wrapped it calls through to real it
      beforeEach(() => {
        console.log('before each ID test');
      });

      it('should be long enough', (id: string) => {
        expect(id).to.have.length.greaterThan(2);
      });
    }, {
      // fast-check parameters are supported, like examples
      // examples: ['a', 'b'],
      numRuns: 1_000,
    }, itPasses(done));
  });

  it('UUID arbitrary failure', (done) => {
    over('some IDs', uuid(), (it) => {
      it('should be a good one', (id: string) => {
        return id[9] !== 'a';
      });
    }, {
      // fast-check parameters are supported, like examples
      examples: ['a', 'b'],
      numRuns: 1_000,
    }, itFails('by returning false', done));
  });

  it('even numbers', (done) => {
    over('even numbers', integer().filter(n => n % 2 === 0), (it) => {
      it('should be even', (n: number) => {
        return n % 2 === 0;
      });
    }, {}, itPasses(done));
  });

  it('mapped properties', (done) => {
    over('mapped properties', tuple(lorem(), integer()).map(([a, b]) => a.substr(b)), (it) => {
      it('should have content', (text: string) => {
        return text.length > 0;
      });
    }, {
      // error formatting can be overridden with a custom handler, or fast-check's default
      errorReporter: defaultReportMessage,
    }, itFails('after 1 tests', done));
  });

  it('equal tuples', (done) => {
    over('tuples', tuple(integer(), integer()), (it) => {
      // tuple properties are passed as a single parameter
      it('should not be equal', ([a, b]) => {
        return a === b;
      });
    }, {
      examples: [[1, 2]]
    }, itFails('by returning false', done));
  });

  it('uneven tuples', (done) => {
    over('tuples', tuple(integer(), integer()), (it) => {
      it('should be uneven', ([a, b]) => {
        return a < b;
      });
    }, {
      examples: [[1, 2]]
    }, itFails('by returning false', done));
  });

  it('arrays', (done) => {
    over('arrays', array(integer()), (it) => {
      it('should have items', (t: Array<number>) => {
        expect(t).to.have.length.lessThan(5_000);
      });
    }, {
      numRuns: 1_000,
    }, itPasses(done));
  });
});
