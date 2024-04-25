import { describe, expect, test } from 'vitest';
import { interpret } from '../interpret';
import { inputMachine } from './../fixtures/input.machine';
import { testPromise } from './promise';

const [acceptance, expects, promise] =
  interpret(inputMachine).promise('fetch');

const EXPECTED = 3;
const NOT_EXPECTED = 999;

describe('Acceptance', () => {
  test.concurrent('#1 Function is defined', () => {
    expect(testPromise).toBeInstanceOf(Function);
  });

  test.concurrent('#2 Acceptance is function', () => {
    expect(acceptance).toBeInstanceOf(Function);
  });

  test.concurrent('#3 Expect is function', () => {
    expect(expects).toBeInstanceOf(Function);
  });

  test.concurrent('#4 Promise is function', () => {
    expect(promise).toBeInstanceOf(Function);
  });

  test.concurrent('#5 No service for undefined name', () => {
    const [acceptance] = testPromise(inputMachine, 'not exists' as any);
    expect(acceptance).toThrowError('not exists is not accepted');
  });

  test.concurrent('#6 Check with no user tests', () => acceptance());

  describe('#7 User adds some tests', () => {
    test.concurrent('Adding failing test will failed', () =>
      acceptance(async fn => {
        const actual = await fn();
        // expect(true).toBeFalsy();
        expect(actual).not.toBe(NOT_EXPECTED);
      }),
    );

    test.concurrent('Adding successful tests will success', () =>
      acceptance(
        fn => {
          expect(fn).toBeDefined();
        },
        () => {
          expect(true).toBeTruthy();
        },
        fn => {
          const actual = fn();
          return expect(actual).resolves.toBe(EXPECTED);
        },
      ),
    );
  });
});

describe('Workflow', () => {
  test.concurrent.fails(
    '#2 Will fail if context or event are defined, and expected is not right',
    () => expects({ expected: NOT_EXPECTED, context: { name: 'any' } }),
  );

  test.concurrent(
    '#3 Will succeed if context or event are defined, and expected is  right',
    () => expects({ expected: EXPECTED, context: { name: 'any' } }),
  );
});
