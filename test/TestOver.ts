import { integer, lorem, tuple, uuid } from 'fast-check';

import { over } from '../src/index';

describe('some foo', () => {
  over('the bars', integer(), (it) => {
    const large = Math.floor(Math.random() * 1_000_000);
    it('should be a small number', (bar: number) => {
      return bar < large;
    });

    it('should be even', (bar: number) => {
      return bar % 2 === 0;
    });

    it('should not throw', (t: number) => {
      if (t.toString()[3] === '9') {
        throw new Error('not a real number!');
      }

      return true;
    });
  });

  over('some IDs', uuid(), (it) => {
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
    examples: [['a']],
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
  });
});
