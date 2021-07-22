import { Arbitrary, check, Parameters, property, RunDetails } from 'fast-check';

export type Check<T> = (this: Mocha.Context, val: T) => boolean | never | void;
export type WrappedIt<T> = (name: string, check: Check<T>) => void;
export type Suite<T> = (it: WrappedIt<T>) => void;

export type ErrorReporter<T> = (details: RunDetails<T>) => string | undefined;
export interface ErrorParameters<T> extends Parameters<T> {
  errorReporter?: ErrorReporter<T>;
}

export function over<T>(name: string, strategy: Arbitrary<T>, suite: Suite<T>, parameters?: ErrorParameters<T>): void {
  describe(name, () => {
    suite((name, test) => {
      it(name, function (this: Mocha.Context): Promise<void> {
        const ctx = this;
        // something about check's type signature requires examples to be tuples,
        // which leads to triple-wrapping examples for tuple properties. help remove one layer
        const examples: Array<[T]> = parameters?.examples?.map((it) => [it]) || [];
        const checkParameters: Parameters<[T]> = {
          ...parameters,
          // handle result formatting here
          asyncReporter: undefined,
          reporter: undefined,
          examples,
        };
        const reporter = (parameters?.errorReporter || briefReporter) as ErrorReporter<[T]>;

        return new Promise((res, rej) => {
          // wrap the strategy arb in a one-shot property checking the test fn
          const result = check(property(strategy, (val) => test.call(ctx, val)), checkParameters);
          if (result.failed) {
            rej(new Error(reporter(result)));
          } else {
            res();
          }
        });
      });
    });
  });
}

export function briefReporter<T>(details: RunDetails<[T]>): string {
  const prefix = formatPrefix(details);
  const counts = `${prefix} after ${details.numRuns} runs and ${details.numShrinks} shrinks`;
  const examples = formatExamples(details);

  if (isErrorRun(details)) {
    return `${counts}, ${examples}\n${details.error}`;
  } else {
    return `${counts}, ${examples}`;
  }
}

export function formatExamples<T>(details: RunDetails<[T]>): string {
  if (details.counterexample !== null) {
    const examples = details.counterexample.map((val) => {
      if (isString(val)) {
        return `'${val}'`;
      } else {
        return val;
      }
    }).join(',');
    return `failing on: ${examples}`;
  } else {
    return `without counterexamples`;
  }

}

export function formatPrefix<T>(details: RunDetails<[T]>): string {
  if (isString(details.error)) {
    if (isErrorRun(details)) {
      return 'Property failed by throwing an error';
    }

    return details.error;
  }

  return 'Property failed without a reason';
}

export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function isErrorRun<T>(details: RunDetails<T>): boolean {
  return details.error?.startsWith('Error:') || false;
}