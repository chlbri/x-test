import { afterAll, beforeAll, describe, test, vi } from 'vitest';
import { interpret } from './interpret';

import machine from './fixtures/fetchNews/machine';

const MEDIA_STACK_API_URL = 'MEDIA_STACK_API_URL';
const MEDIA_STACK_APIKEY = 'MEDIA_STACK_APIKEY';

function useEnvDefined() {
  beforeAll(() => {
    /** @ts-ignore global */
    process.env = {
      MEDIA_STACK_APIKEY,
      MEDIA_STACK_API_URL,
    };
  });

  afterAll(() => {
    /** @ts-ignore global */
    process.env = {};
  });
}

const machine1 = machine.withConfig({
  actions: {
    escalateNoAPI_URL: () => {},
    escalateFetchError: () => {},
    escalateJsonError: () => {},
  },
});

function useFecthMock<T>(obj: T) {
  beforeAll(() => {
    /** @ts-ignore global */
    global.fetch = vi.fn().mockResolvedValue(obj as any);
  });
  afterAll(() => {
    /** @ts-ignore global */
    global.fetch = () => {};
  });
}

describe('Workflow 1', () => {
  useEnvDefined();

  useFecthMock({
    ok: true,
    json: () => ({
      pagination: {
        limit: 100,
        offset: 0,
        count: 100,
        total: 100,
      },
      news: [],
    }),
  });

  const { start, matches, send, stop, advanceTime } = interpret(machine1);

  test('#1 Start the machine', () => {
    start();
  });

  // await new Promise(resolve => setTimeout(resolve, 1000));
  // send('QUERY');

  test('#2 We are in the "idle" state', () => {
    matches('idle');
    // context('MEDIA_STACK_API_URL', ctx => ctx.API_URL);
    // context('MEDIA_STACK_APIKEY', ctx => ctx.API_KEY);
  });

  test('#3 Send query', () => {
    send({ type: 'QUERY', limit: 20 });
  });

  test('#4: Wait a little', () => advanceTime());

  test('#5: The success', () => {
    matches('success');
  });

  test('#6: Stop', () => {
    stop();
  });
});

describe('Workflow 2: Env error', () => {
  const { start, matches, stop, advanceTime } = interpret(machine1);

  test('#1: Start the machine', () => {
    start();
  });

  test('#2: Wait a little', async () => {
    return advanceTime();
  });

  test('#3: No env variables found', () => {
    matches('error');
  });

  test('#4: Stop', () => {
    stop();
  });
});

describe('Workflow 3:  JSON error', () => {
  useEnvDefined();
  useFecthMock({
    ok: true,
    json: () => {
      throw 'any';
    },
  });

  const { start, matches, send, context, stop, advanceTime } =
    interpret(machine1);

  test('#1 Start the machine', () => {
    start();
  });

  test('#3: Inside the "idle" state', () => {
    matches('idle');
  });

  test('#5 We are in the "idle" state', () => {
    matches('idle');
    context('MEDIA_STACK_API_URL', ctx => ctx.API_URL);
    context('MEDIA_STACK_APIKEY', ctx => ctx.API_KEY);
  });

  test('#6 Send query', () => {
    send({ type: 'QUERY', limit: 20 });
  });

  test('#7: Wait a little', () => advanceTime());

  test('#8: It finializes to error', () => {
    matches('error');
  });

  test('#9 Stop', () => {
    stop();
  });
});
