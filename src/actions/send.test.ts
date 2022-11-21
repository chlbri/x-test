import { describe, test } from 'vitest';
import { inputMachine } from '../fixtures/input.machine';
import { testSend } from './send';

describe('Acceptance', () => {
  test.concurrent.fails('Function not exists', () => {
    const { acceptance } = testSend(inputMachine, 'notExists' as any);
    acceptance();
  });

  test.concurrent('Acceptance', () => {
    const { acceptance } = testSend(inputMachine, 'startQuery');
    acceptance();
  });

  test.concurrent('Context in function Helper is undefined', () => {
    const { expect } = testSend(inputMachine, 'startQuery');
    expect({ expected: { type: 'any' } });
  });
});

describe('Workflows', () => {
  const { expect: expectObject } = testSend(inputMachine, 'startQuery');
  const { expect: expectFunction } = testSend(
    inputMachine,
    'sendParentInput',
  );
  test.concurrent('Object', () => {
    expectObject({
      expected: { type: 'START_QUERY' },
      context: { name: 'any' },
    });
  });

  test.concurrent('Function', () => {
    expectFunction({
      expected: { type: 'CHILD/(machine)/INPUT', input: undefined },
      context: { name: '(machine)' },
      event: { type: 'INPUT' },
    });
  });

  test.concurrent.fails('Function - 2', () => {
    expectFunction({
      expected: { type: 'CHILD/(machine)/INPUT', input: 'nothing' },
      context: { name: '(machine)' },
      event: { type: 'INPUT', input: 'something' },
    });
  });
});
