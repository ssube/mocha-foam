import { expect } from 'chai';
import { integer } from 'fast-check';

import { over } from '../src/index';

describe('some foo', () => {
  over('the bars', integer(), (oit) => {
    console.log('oit outer');
    oit('should be greater than 0', async (bar: number) => {
      console.log('oit inner');
      expect(bar).to.be.greaterThan(0);
    });
  });
});
