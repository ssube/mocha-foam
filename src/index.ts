import { Arbitrary, asyncProperty, check, Parameters, RunDetails } from 'fast-check';

export type CheckStatus = boolean | void;
export type Check<T> = (this: Mocha.Context, val: T) => never | CheckStatus | Promise<CheckStatus>;
export type WrappedIt<T> = (name: string, check: Check<T>) => void;
export type Suite<T> = (it: WrappedIt<T>) => void;

export type ErrorReporter<T> = (details: RunDetails<T>) => string | undefined;
export interface ErrorParameters<T> extends Parameters<T> {
  errorReporter?: ErrorReporter<T>;
}

export function over<T>(name: string, strategy: Arbitrary<T>, suite: Suite<T>, parameters: ErrorParameters<T> = {}): void {
  describe(name, () => {
    suite((name, test) => {
      it(name, function (this: Mocha.Context): Promise<void> {
        const ctx = this;
        // something about check's type signature requires examples to be tuples,
        // which leads to triple-wrapping examples for tuple properties. help remove one layer
        const examples: Array<[T]> = parameters.examples?.map((it) => [it]) || [];
        const checkParameters: Parameters<[T]> = {
          ...parameters,
          // clear these in favor of the errorReporter
          asyncReporter: undefined,
          reporter: undefined,
          examples,
        };
        const reporter = (parameters.errorReporter || briefReporter) as ErrorReporter<[T]>;

        // wrap the strategy arbitrary in a property checking the test fn
        // TODO: switch between property and asyncProperty as needed
        const property = asyncProperty(strategy, (val) => Promise.resolve(test.call(ctx, val)));
        return Promise.resolve(check(property, checkParameters)).then((result) => {
          if (result.failed) {
            throw new Error(reporter(result));
          } else {
            return undefined;
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
    return `failing on: ${examples} (seed: ${details.seed}, path: '${details.counterexamplePath}')`;
  } else {
    return `without counterexamples (seed: ${details.seed})`;
  }
}

export function formatPrefix<T>(details: RunDetails<[T]>): string {
  if (isErrorRun(details)) {
    return 'Property failed by throwing an error';
  }

  if (isString(details.error)) {
    return details.error;
  }

  return 'Property failed without a reason';
}

export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function isErrorRun<T>(details: RunDetails<T>): boolean {
  if (isString(details.error)) {
    return /^([A-Z][a-z]*)*Error:/.test(details.error);
  }
  return false;
}