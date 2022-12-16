import { describe, test } from 'vitest';
import { inputMachine } from '../fixtures/input.machine';
import { testSend } from './send';

describe('Acceptance', () => {
  test.concurrent('Function not exists', () => {
    const [acceptance] = testSend(inputMachine, 'forwardToAny' as any);
    acceptance();
  });

  test.concurrent('Context in function Helper is undefined', () => {
    const [, expect] = testSend(inputMachine, 'startQuery');
    () => expect({ expected: { type: 'any' } });
  });
});

describe('Workflows', () => {
  const [, expectFunction2] = testSend(inputMachine, 'startQuery');
  const [, expectFunction] = testSend(inputMachine, 'sendParentInput');
  test.concurrent('Object', () =>
    expectFunction2({
      expected: { type: 'START_QUERY' },
      context: {},
    }),
  );

  test.concurrent('Function - 1', () =>
    expectFunction({
      expected: { type: 'CHILD/(machine)/INPUT', input: undefined },
      context: { name: '(machine)' },
      event: { type: 'INPUT' },
    }),
  );

  test.concurrent.fails('Function - 2', () =>
    expectFunction({
      expected: { type: 'CHILD/(machine)/INPUT', input: 'nothing' },
      context: { name: '(machine)' },
      event: { type: 'INPUT', input: 'something' },
    }),
  );
});
