import { describe, test } from 'vitest';
import { inputMachine } from './fixtures/input.machine';
import { testSendParent } from './sendParent';

describe('Acceptance', () => {
  test.concurrent.fails('Function not exists', () => {
    const [acceptance] = testSendParent(inputMachine, 'notExists' as any);
    acceptance();
  });

  test.concurrent('Acceptance', () => {
    const [acceptance] = testSendParent(inputMachine, 'startQuery');
    acceptance();
  });

  test.concurrent('Context in function Helper is undefined', () => {
    const [, expect] = testSendParent(inputMachine, 'startQuery');
    expect({ expected: { type: 'any' } });
  });
});

describe('Workflows', () => {
  const [, expectObject] = testSendParent(inputMachine, 'startQuery');
  const [, expectFunction] = testSendParent(
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
