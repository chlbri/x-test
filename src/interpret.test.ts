import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { THROTTLE_TIME } from './fixtures/constants';
import { inputMachine } from './fixtures/input.machine';
import { interpret } from './interpret';

const machine = inputMachine.withContext({ name: 'test' });
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
  __status,
  advanceAlways,
  advanceTime,
  parentSend,
} = interpret(machine);

describe('Acceptance', () => {
  test.concurrent('Assign', () => {
    const [acceptance] = assign('input');
    acceptance();
  });

  test.concurrent('Action', () => {
    const [acceptance] = action({ action: 'input' });
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
    const { sendAction } = interpret(inputMachine);
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
      parentSend('sendParentInput');
    });

    test('#6 WAIT THROTTLE_TIME', () => advanceTime(THROTTLE_TIME));

    test('#7 State was passed by "done"', () => {
      context(false, context => context.editing);
    });

    test('#8 Wait for always', () => advanceAlways());

    test('#9 The machine starts the query', () => {
      parentSend('startQuery');
    });
  });

  describe('Workflow - 2', () => {
    usePrepareTest();

    test('#1 State is "idle"', () => {
      matches('idle');
    });

    test('#2 WAIT THROTTLE_TIME', async () => {
      await advanceTime(THROTTLE_TIME + 5);
    });

    test('#3 Nothing is inputed', () => {
      expect(__status()).toBe(1);
      context(undefined, context => context.editing);
      context(undefined, context => context.input);
    });

    test.fails('#4 Nothing is sent', () => {
      parentSend('sendParentInput');
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
