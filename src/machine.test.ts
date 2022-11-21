import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { advanceByTime } from './fixtures/advanceByTime';
import { THROTTLE_TIME } from './fixtures/constants';
import { inputMachine } from './fixtures/input.machine';
import testMachine from './machine';

const emptyFn = () => vi.fn(() => void {});

const startQuery = emptyFn();
const sendParentInput = emptyFn();
const machine = inputMachine.withConfig(
  {
    actions: {
      startQuery,
      sendParentInput,
    },
  },
  { name: 'test' },
);

const {
  start,
  context,
  hasTags,
  matches,
  stop,
  sender,
  send,
  assignAction,
  guard,
  promise,
} = testMachine(machine);

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe('Acceptance', () => {
  test.concurrent('Assign', () => {
    const { createAcceptance } = assignAction('input');
    const acceptance = createAcceptance();
    acceptance();
  });

  test.concurrent('Guards', () => {
    const { createAcceptance } = guard('isEditing');
    createAcceptance()();
  });

  test.concurrent('Promises', () => {
    const { createAcceptance } = promise('fetch');
    createAcceptance()();
  });

  test.concurrent('Send action', () => {
    const { sendAction } = testMachine(inputMachine);
    const { createAcceptance: acceptance } = sendAction('sendParentInput');
    acceptance();
  });
});

describe('Workflows', () => {
  const usePrepareTest = () => {
    beforeAll(() => {
      //Start
      start();
    });

    afterAll(() => {
      [startQuery, sendParentInput].forEach(fn => fn.mockClear());
      //Stop
      stop();
    });
  };

  describe('Workflow - 1', () => {
    usePrepareTest();

    test('State is "idle"', () => {
      matches('idle');
    });

    test('Property "editing" is undefined', () => {
      context(undefined, context => context.editing);
    });

    test('Send Input', () => {
      send({ type: 'INPUT', input: 'name' });
    });

    test('Property "editing" is true', () => {
      context(true, context => context.editing);
    });

    test('Input is sent to parent', () => {
      expect(sendParentInput).toBeCalledTimes(1);
    });

    test('WAIT THROTTLE_TIME', () => advanceByTime(THROTTLE_TIME + 5));

    test('State was passed by "done"', () => {
      context(false, context => context.editing);
    });

    test('The machine starts the query', () => {
      expect(startQuery).toBeCalledTimes(1);
    });
  });

  describe('Workflow - 2', () => {
    usePrepareTest();

    test('State is "idle"', () => {
      matches('idle');
    });

    test('WAIT THROTTLE_TIME', async () => {
      await advanceByTime(THROTTLE_TIME + 5);
    });

    test('Nothing is inputed', () => {
      context(undefined, context => context.editing);
      context(undefined, context => context.input);
    });

    test('Nothing is sent', () => {
      expect(sendParentInput).not.toBeCalled();
    });

    test('The state has a tag "busy"', () => {
      hasTags('busy');
    });

    test('Send a input "bemedev" with function sender', () => {
      const input = sender('INPUT');
      input({ input: 'bemedev' });
    });

    test('Input is edited', () => {
      context(true, context => context.editing);
    });

    test('Input is defined to "bemedev"', () => {
      context({ name: 'test', input: 'bemedev', editing: true });
    });
  });
});
