import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { THROTTLE_TIME } from './fixtures/constants';
import { inputMachine } from './fixtures/input.machine';
import { interpret } from './index';

const machine = inputMachine.withConfig(
  {
    actions: {
      sendParentInput: () => {},
      startQuery: () => {},
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
  __status,
  advanceTime,
} = interpret(machine, { simulateClock: false });

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

  describe('Workflow - 1', ({ sequential: test }) => {
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

    test('#5: Wait THrOTTLE TIME', () => advanceTime(THROTTLE_TIME));

    test('#6 State was passed by "done"', () => {
      context(false, context => context.editing);
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

    test('#9: Wait THrOTTLE TIME', () => advanceTime(THROTTLE_TIME));

    test('#10: State was passed by "done"', () => {
      context(false, context => context.editing);
    });
  });
});
