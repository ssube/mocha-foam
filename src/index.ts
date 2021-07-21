import { Arbitrary, check, property } from 'fast-check';

export type Check<T> = (this: Mocha.Context, t: T) => boolean;
export type WrappedIt<T> = (name: string, check: Check<T>) => void;
export type Suite<T> = (it: WrappedIt<T>) => void;

export function over<T>(name: string, strategy: Arbitrary<T>, suite: Suite<T>): void {
  describe(name, () => {
    suite((name, test) => {
      it(name, function (this: Mocha.Context): Promise<void> {
        const ctx = this;

        return new Promise((res, rej) => {
          const result = check(property(strategy, (t) => test.call(ctx, t)));
          if (result.failed) {
            console.log(result);
            if (result.counterexample !== null) {
              const examples = result.counterexample.map(it => {
                if (typeof it === 'string' && it.length === 0) {
                  return "''";
                } else {
                  return it;
                }
              }).join(',');
              const error = `failed after ${result.numRuns} runs and ${result.numShrinks} shrinks, failing on: ${examples}`;
              rej(new Error(error));
            } else {
              rej(new Error(`failed after ${result.numRuns} runs and ${result.numShrinks} shrinks, without counterexamples`));
            }
          } else {
            res();
          }
        });
      });
    });
  });
}
