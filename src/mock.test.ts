/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { dequal } from 'dequal';
import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import { AnyStateMachine, StateNode } from 'xstate';
import { inputMachine } from './fixtures/input.machine';
import { mockMachine } from './mock';
import {
  emptyAction,
  emptyService,
  EMPTY_DELAY,
  trueGuard,
} from './utils';

describe('Acceptance', () => {
  test.concurrent('Function is defined', () => {
    expect(mockMachine).toBeDefined();
  });

  test.concurrent('Always returns machine', () => {
    const fn = vi.fn(mockMachine);
    fn(inputMachine as AnyStateMachine);
    expect(fn).toHaveReturnedWith(expect.any(StateNode));
    expectTypeOf<AnyStateMachine>(mockMachine(inputMachine));
  });
});

describe('Workflow', () => {
  type Keys = Exclude<
    keyof Exclude<
      Exclude<Parameters<typeof mockMachine>[1], undefined>['options'],
      undefined
    >,
    'activities'
  >;
  const machine = mockMachine(inputMachine);
  const useTest = (key: Keys, contains: any) => {
    const options = machine.options[key];
    expect(options).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const functions = Object.values(options!);
    const check = functions.every(fn => dequal(fn, contains));
    expect(check).toBe(true);
  };

  test.concurrent('All Guards return true by default', () => {
    useTest('guards', trueGuard);
  });

  test.concurrent('All Action are empty by default', () => {
    useTest('actions', emptyAction);
  });

  test.concurrent(
    `All delays are equal to "${EMPTY_DELAY}" by default`,
    () => {
      useTest('delays', EMPTY_DELAY);
    },
  );

  test.concurrent('All services are empty by default', () => {
    useTest('services', emptyService);
  });

  describe("With user's config, it will deepmerge", () => {
    const machine = mockMachine(inputMachine, {
      options: { actions: { input: () => 'lastName' } },
    });

    test.concurrent('The defined action is respected', () => {
      const fn = machine.options.actions?.input as () => any;
      const actual = fn();
      expect(actual).not.toBe('firstName');
      expect(actual).toBe('lastName');
    });

    test.concurrent('Other actions are default', () => {
      const check2 = Object.values(machine.options.actions!).every(fn =>
        dequal(fn, emptyAction),
      );
      expect(check2).toBe(false);
      const entries = Object.entries(machine.options.actions!);
      const filtered = entries.filter(([key]) => key !== 'input');
      const actions = filtered.map(([, value]) => value);
      const check = actions.every(fn => dequal(fn, emptyAction));
      expect(check).toBe(true);
    });
  });
});
