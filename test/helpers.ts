import { expect } from 'chai';

export function itFails(msg: string, done: Mocha.Done, count = 1): Mocha.TestFunction {
  const expectations: Array<Chai.PromisedAssertion> = [];

  const mockIt =  function (this: Mocha.Context, name: string, test: Mocha.AsyncFunc) {
    console.log(`mock it invoked for '${name}' with test '${test.name}', ${expectations.length} of ${count}`);

    expectations.push(expect(test.call(this), name).to.eventually.be.rejectedWith(Error, `Property failed ${msg}`));

    if (expectations.length >= count) {
      console.log(`all ${expectations.length} expectations queued for '${name}'`);

      Promise.all(expectations).then((_val) => done(), (err) => done(err));
    }
  };

  return (mockIt as unknown as Mocha.TestFunction);
}

export function itPasses(done: Mocha.Done, count = 1): Mocha.TestFunction {
  const expectations: Array<Chai.PromisedAssertion> = [];

  const mockIt =  function (this: Mocha.Context, name: string, test: Mocha.AsyncFunc) {
    console.log(`mock it invoked for '${name}' with test '${test.name}', ${expectations.length} of ${count}`);

    expectations.push(expect(test.call(this), name).to.eventually.be.oneOf([true, undefined]));

    if (expectations.length >= count) {
      console.log(`all ${expectations.length} expectations queued for '${name}'`);

      Promise.all(expectations).then((_val) => done(), (err) => done(err));
    }
  };

  return (mockIt as unknown as Mocha.TestFunction);
}
