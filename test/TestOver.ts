import { integer, uuid } from 'fast-check';

import { over } from '../src/index';

describe('some foo', () => {
  over('the bars', integer(), (it) => {
    it('should be a small number', (bar: number) => {
      return bar < 1_000;
    });
  });

  over('some IDs', uuid(), (it) => {
    it('should be a good one', (id: string) => {
      return id[9] !== 'a';
    });
  });
});
