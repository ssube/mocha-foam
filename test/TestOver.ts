import { integer, uuid } from 'fast-check';

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
  });

  over('some IDs', uuid(), (it) => {
    it('should be a good one', (id: string) => {
      return id[9] !== 'a';
    });
  });
});
