import { integer } from 'fast-check';

import { over } from '../src/index';

describe('some foo', () => {
  over('the bars', integer(), (it) => {
    it('should be a small number', (bar: number) => {
      return bar < 1_000;
    });
  });
});
