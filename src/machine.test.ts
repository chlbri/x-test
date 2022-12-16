import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { advanceByTime } from './fixtures/advanceByTime';
import { THROTTLE_TIME } from './fixtures/constants';
import { inputMachine } from './fixtures/input.machine';
import testMachine from './machine';

const emptyFn = () => vi.fn(() => void {});

const startQuery = emptyFn();
const sendParentInput = emptyFn();
const escalateError = emptyFn();
const forwardToAny = emptyFn();
const machine = inputMachine.withConfig(
  {
    actions: {
      startQuery,
      sendParentInput,
      escalateError,
      forwardToAny,
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
  action,
  assign,
  delay,
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
    const [acceptance] = assign('input');
    acceptance();
  });

  test.concurrent('Action', () => {
    const [acceptance] = action({ action: 'input' });
    acceptance();
  });

  test.concurrent('Escalate', () => {
    const { escalate } = testMachine(inputMachine);
    const [acceptance] = escalate('escalateError');
    acceptance();
  });

  test.concurrent('Guards', () => {
    const [acceptance] = guard('isEditing');
    acceptance();
  });

  test.concurrent('Promises', () => {
    const [acceptance] = promise('fetch');
    acceptance();
  });

  test.concurrent('Send action', () => {
    const { sendAction } = testMachine(inputMachine);
    const [acceptance] = sendAction('sendParentInput');
    acceptance();
  });

  test.concurrent('Delays', () => {
    const [acceptance] = delay('THROTTLE_TIME');
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

    test('#1 State is "idle"', () => {
      matches('idle');
    });

    test('#2 Property "editing" is undefined', () => {
      context(undefined, context => context.editing);
    });

    test('#3 Send Input', () => {
      send({ type: 'INPUT', input: 'name' });
    });

    test('#4 Property "editing" is true', () => {
      context(true, context => context.editing);
    });

    test('#5 Input is sent to parent', () => {
      expect(sendParentInput).toBeCalledTimes(1);
    });

    test('#6 WAIT THROTTLE_TIME', () => advanceByTime(THROTTLE_TIME + 5));

    test('#7 State was passed by "done"', () => {
      context(false, context => context.editing);
    });

    test('#8 The machine starts the query', () => {
      expect(startQuery).toBeCalledTimes(1);
    });
  });

  describe('Workflow - 2', () => {
    usePrepareTest();

    test('#1 State is "idle"', () => {
      matches('idle');
    });

    test('#2 WAIT THROTTLE_TIME', async () => {
      await advanceByTime(THROTTLE_TIME + 5);
    });

    test('#3 Nothing is inputed', () => {
      context(undefined, context => context.editing);
      context(undefined, context => context.input);
    });

    test('#4 Nothing is sent', () => {
      expect(sendParentInput).not.toBeCalled();
    });

    test('#5 The state has a tag "busy"', () => {
      hasTags('busy');
    });

    test('#6 Send a input "bemedev" with function sender', () => {
      const input = sender('INPUT');
      input({ input: 'bemedev' });
    });

    test('#7 Input is edited', () => {
      context(true, context => context.editing);
    });

    test('#8 Input is defined to "bemedev"', () => {
      context({ name: 'test', input: 'bemedev', editing: true });
    });
  });
});
