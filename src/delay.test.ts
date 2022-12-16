import { describe, test } from 'vitest';
import { testDelay } from './delay';
import { inputMachine } from './fixtures/input.machine';

describe('Acceptance', () => {
  test.concurrent.fails('Fails if Function not exists', () => {
    const [acceptance] = testDelay(inputMachine, 'notExists' as any);
    acceptance();
  });

  test.concurrent('Function exists', () => {
    const [acceptance] = testDelay(inputMachine, 'THROTTLE_TIME');
    acceptance();
  });
});

describe('Workflows', () => {
  test.concurrent('Number', () => {
    const [, expect] = testDelay(inputMachine, 'THROTTLE_TIME');
    expect({
      expected: 200,
    });
  });

  test.concurrent('Function', () => {
    const [, expect] = testDelay(inputMachine, 'CUSTOM_DELAY');
    expect({
      expected: 3,
      context: { name: 'any' },
    });
  });
});
