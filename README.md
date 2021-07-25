# mocha-foam

An experimental Mocha BDD wrapper for fast-check.

## Contents

- [mocha-foam](#mocha-foam)
  - [Contents](#contents)
  - [Install](#install)
  - [Usage](#usage)
  - [Build](#build)
  - [License](#license)

## Install

Add `mocha-foam` to your project as a dev dependency:

```shell
> yarn add -D mocha-foam
```

## Usage

This is a BDD-style wrapper around `fc.check(fc.asyncProperty(...))`, and supports all of the same [Arbitraries](https://github.com/dubzzz/fast-check/blob/main/documentation/Arbitraries.md)
that fast-check normally provides.

The entrypoint function is `over` and the library is provided as an ES module:

```typescript
import { expect } from 'chai';
import { integer } from 'fast-check';
import { over } from 'mocha-foam';

describe('example properties', () => {
  over('some numbers', integer(), (it) => {
    it('should be even', (n: number) => {
      return n % 2 === 0;
    });

    it('should be odd', async (n: number) => {
      expect(n % 2).to.equal(1);
    });
  });
});
```

Assertions can be made through `expect` (and the other chai assertions) or by returning a boolean.

Note the wrapped `it` passed to the suite callback by `over`. This calls through to Mocha's `it`, after wrapping the
test in a fast-check property. Most Mocha features, like `beforeEach` and `afterEach` hooks, work correctly within
the suite defined by `over`.

You can pass additional parameters to the fast-check Runner after the suite callback:

```typescript
describe('more examples', () => {
  over('some UUIDs', uuid(), (it) => {
    // beforeEach hooks work normally, since the wrapped it calls through to real it
    beforeEach(() => {
      console.log('before each UUID test');
    });

    it('should be a good one', (id: string) => {
      return id[9] !== 'a';
    });

    it('should be long enough', (id: string) => {
      expect(id).to.have.length.greaterThan(2);
    });
  }, {
    // fast-check parameters are supported, like examples
    examples: ['a', 'b'],
    numRuns: 1_000,
  });

  over('mapped properties', tuple(lorem(), integer()).map(([a, b]) => a.substr(b)), (it) => {
    it('should have content', (text: string) => {
      return text.length > 0;
    });
  }, {
    // error formatting can be overridden with a custom handler, or fast-check's default reporter
    errorReporter: defaultReportMessage,
  });
});
```

The default reporter, `briefReporter`, will print the number of runs, number of shrinks, and any counterexamples
found:

```none
  5) example properties
       some IDs
         should be a good one:
     Error: Property failed by returning false after 3 runs and 8 shrinks, failing on: "00000000-a000-300d-8000-000000000000" (seed: -886543855, path: '2:0:10:0:10:0:2:3:3')
      at /home/ssube/code/ssube/mocha-foam/out/src/index.js:20:385
      at processTicksAndRejections (internal/process/task_queues.js:97:5)
```

## Build

To build `mocha-foam`, run `make`. The build depends on:

- Node 14+
- Yarn 1.x

To run small tests with coverage, run `make cover`.

The `make help` target will print help for the available targets.

## License

`mocha-foam` is released under [the MIT license](LICENSE.md).
