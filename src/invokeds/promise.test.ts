import { describe, expect, test } from 'vitest';
import { inputMachine } from './../fixtures/input.machine';
import { testPromise } from './promise';

const { createAcceptance, createExpect, promise } = testPromise(
  inputMachine,
  'fetch',
);

const EXPECTED = 3;
const NOT_EXPECTED = 999;

describe('Acceptance', () => {
  test.concurrent('Function is defined', () => {
    expect(testPromise).toBeInstanceOf(Function);
  });

  test.concurrent('Acceptance is function', () => {
    expect(createAcceptance).toBeInstanceOf(Function);
  });

  test.concurrent('Expect is function', () => {
    expect(createExpect).toBeInstanceOf(Function);
  });

  test.concurrent('Promise is function', () => {
    expect(promise).toBeInstanceOf(Function);
  });

  test.concurrent('No service for undefined name', () => {
    const { createAcceptance } = testPromise(
      inputMachine,
      'not exists' as any,
    );
    expect(createAcceptance()).toThrowError('not exists is not accepted');
  });

  test.concurrent('Check with no user tests', createAcceptance);

  describe('User adds some tests', () => {
    test.concurrent(
      'Adding failing test will failed',
      createAcceptance(async fn => {
        const actual = await fn();
        // expect(true).toBeFalsy();
        expect(actual).not.toBe(NOT_EXPECTED);
      }),
    );

    test.concurrent(
      'Adding successful tests will success',
      createAcceptance(
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
  test.concurrent(
    'Will succeed if context and event are undefineds',
    createExpect({ expected: NOT_EXPECTED }),
  );

  test.concurrent.fails(
    'Will fail if context or event are defined, and expected is not right',
    createExpect({ expected: NOT_EXPECTED, context: { name: 'any' } }),
  );

  test.concurrent(
    'Will succeed if context or event are defined, and expected is  right',
    createExpect({ expected: EXPECTED, context: { name: 'any' } }),
  );
});
