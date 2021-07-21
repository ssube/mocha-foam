import { Arbitrary, check, property, RunDetails, Parameters } from 'fast-check';

export type Check<T> = (this: Mocha.Context, val: T) => boolean;
export type WrappedIt<T> = (name: string, check: Check<T>) => void;
export type Suite<T> = (it: WrappedIt<T>) => void;

export function over<T>(name: string, strategy: Arbitrary<T>, suite: Suite<T>, parameters?: Parameters<[T]>): void {
  describe(name, () => {
    suite((name, test) => {
      it(name, function (this: Mocha.Context): Promise<void> {
        const ctx = this;

        return new Promise((res, rej) => {
          const result = check(property(strategy, (val) => test.call(ctx, val)), parameters);
          if (result.failed) {
            rej(new Error(formatDetails(result)));
          } else {
            res();
          }
        });
      });
    });
  });
}

export function formatDetails<T>(details: RunDetails<[T]>): string {
  const prefix = formatPrefix(details);
  const counts = `${prefix} after ${details.numRuns} runs and ${details.numShrinks} shrinks`;

  if (details.counterexample !== null) {
    const examples = details.counterexample.map((val) => {
      if (isString(val)) {
        return `'${val}'`;
      } else {
        return val;
      }
    }).join(',');
    return `${counts}, failing on: ${examples}`;
  } else {
    return `${counts}, without counterexamples`;
  }
}

export function formatPrefix<T>(details: RunDetails<[T]>): string {
  if (isString(details.error)) {
    if (details.error.startsWith('Error:')) {
      return 'Property failed by throwing an error';
    }

    return details.error;
  }

  return 'Property failed without a reason';
}

export function isString(val: unknown): val is string {
  return typeof val === 'string';
}
