import { describe, expect, test, vi } from 'vitest';
import { AnyStateMachine, StateNode } from 'xstate';
import { inputMachine } from './fixtures/input.machine';
import { mockMachine } from './mock';
import {
  emptyAction,
  emptyService,
  EMPTY_DELAY,
  trueGuard,
} from './utils';

describe('Accpetance', () => {
  test('Function is defined', () => {
    expect(mockMachine).toBeDefined();
  });

  test('Always return machine', () => {
    const fn = vi.fn(mockMachine);
    fn(inputMachine as AnyStateMachine);
    expect(fn).toHaveReturnedWith(expect.any(StateNode));
  });
});

type Keys = Exclude<
  keyof Exclude<
    Exclude<Parameters<typeof mockMachine>[1], undefined>['options'],
    undefined
  >,
  'activities'
>;

describe('Workflow', () => {
  const machine = mockMachine(inputMachine);
  const useTest = (key: Keys, contains: any) => {
    const options = machine.options[key];
    expect(options).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const functions = Object.values(options!);
    expect(functions).toContainEqual(contains);
  };

  test('All Guards return true by default', () => {
    useTest('guards', trueGuard);
  });

  test('All Action are empty by default', () => {
    useTest('actions', emptyAction);
  });

  test(`All delays are "${EMPTY_DELAY}" by default`, () => {
    useTest('delays', EMPTY_DELAY);
  });

  test('All services are empty by default', () => {
    useTest('services', emptyService);
  });
});
