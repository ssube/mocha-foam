import { Arbitrary, check, property } from 'fast-check';

export type TestDone = () => Promise<void>;
export type Test<T> = (this: Mocha.Context, args: T) => Promise<void>;
export type WrappedTest<T> = (done: TestDone) => Promise<void>;

export type WrappedIt<T> = (name: string, test: Test<T>) => void;
export type Suite<T> = (it: WrappedIt<T>) => void;

export function over<T>(name: string, strategy: Arbitrary<T>, suite: Suite<T>): void {
  describe(name, () => {
    suite((name, test) => {
      console.log('registered over suite');
      it(name, function (this: Mocha.Context) {
        console.log('calling over test');
        // return test.call(this, 0 as any);

        return new Promise((res, rej) => {
          const result = check(property(strategy, (t) => {
            test.call(this, t);
          }));

          if (result.failed) {
            rej();
          }
        });
      });
    });
  });
}

/*
describe('some foo', () => {
  over('the bars', integer(), (oit) => {
    oit('should be greater than 0', async (bar: number) => {
      expect(bar).to.be.greaterThan(0);
    });
  });
});
 */