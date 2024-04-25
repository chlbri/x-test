import { describe, test } from 'vitest';
import { inputMachine } from './fixtures/input.machine';
import { interpret } from './interpret';

const { delay } = interpret(inputMachine);

describe('Acceptance', () => {
  test.concurrent.fails('Fails if Function not exists', () => {
    const [acceptance] = delay('notExists' as any);
    acceptance();
  });

  test.concurrent('Function exists', () => {
    const [acceptance] = delay('THROTTLE_TIME');
    acceptance();
  });
});

describe('Workflows', () => {
  test.concurrent('Number', () => {
    const [, expect] = delay('THROTTLE_TIME');
    expect({
      expected: 200,
    });
  });

  test.concurrent('Function', () => {
    const [, expect] = delay('CUSTOM_DELAY');
    expect({
      expected: 3,
      context: { name: 'any' },
    });
  });
});
