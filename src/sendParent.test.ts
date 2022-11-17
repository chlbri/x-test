import { describe, expect, test } from 'vitest';
import { inputMachine } from './fixtures/input.machine';
import { testSendParent } from './sendParent';

describe('Acceptance', () => {
  test.concurrent('Function not exists', () => {
    const safe = () => testSendParent(inputMachine, 'notExists' as any);
    expect(safe).toThrow('Action not exists');
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
  test('Object', () => {
    expectObject({
      expected: { type: 'START_QUERY' },
      context: { name: 'any' },
    });
  });

  test('Function', () => {
    expectFunction({
      expected: { type: 'CHILD/(machine)/INPUT' },
      context: { name: '(machine)' },
      event: { type: 'INPUT' },
    });
  });
});
