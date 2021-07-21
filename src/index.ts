import { Arbitrary, check, property } from 'fast-check';

export type TestDone = () => Promise<void>;
export type Test<T> = (this: Mocha.Context, args: T) => Promise<void>;
export type WrappedTest<T> = (this: Mocha.Context) => Promise<void>;

export type WrappedCheck<T> = (t: T) => boolean;
export type WrappedIt<T> = (name: string, test: WrappedCheck<T>) => void;
export type Suite<T> = (it: WrappedIt<T>) => void;

export function over<T>(name: string, strategy: Arbitrary<T>, suite: Suite<T>): void {
  describe(name, () => {
    suite((name, test) => {
      it(name, function (this: Mocha.Context): Promise<void> {
        const ctx = this;

        return new Promise((res, rej) => {
          const result = check(property(strategy, (t) => test.call(ctx, t)));
          if (result.failed) {
            if (result.counterexample !== null) {
              const examples = result.counterexample.join(',');
              const error = `failed after ${result.numRuns} runs and ${result.numShrinks} shrinks, failing on: ${examples}`;
              rej(new Error(error));
            } else {
              rej(new Error('failed without counterexample'));
            }
          } else {
            res();
          }
        });
      });
    });
  });
}
