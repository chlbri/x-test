import { afterAll, beforeAll, describe, test, vi } from 'vitest';
import { interpret } from '../lib';

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

const { start, matches, send, context, parentSend, stop, advanceAlways } =
  interpret(machine);

function useFecthMock<T>(obj: T) {
  beforeAll(() => {
    /** @ts-ignore global */
    global.fetch = vi.fn().mockResolvedValue(obj as any);
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

  test('#1 Start the machine', () => {
    start();
  });

  test('#2: Inside the "constructErrors" state', () => {
    matches('constructErrors');
  });

  test('#3 Advance in time for always', () => advanceAlways());
  // await new Promise(resolve => setTimeout(resolve, 1000));
  // send('QUERY');

  test('#4 We are in the "idle" state', () => {
    matches('idle');
    // context('MEDIA_STACK_API_URL', ctx => ctx.API_URL);
    // context('MEDIA_STACK_APIKEY', ctx => ctx.API_KEY);
  });

  test('#5 Send query', () => {
    send({ type: 'QUERY', limit: 20 });
  });

  test('#6 Advance in time for always', () => advanceAlways());

  test('#7: The success', () => {
    matches('success');
  });

  test('#8: Stop', () => {
    stop();
  });
});

describe('Workflow 2:  Env error', () => {
  test('#1 Start the machine', () => {
    start();
  });

  test('#2: No env variables found', () => {
    parentSend('escalateNoAPI_URL');
    matches('error');
  });

  test('#3 Stop', () => {
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

  test('#1 Start the machine', () => {
    start();
  });

  test.fails('#2: Env variables found', () => {
    parentSend('escalateNoAPI_URL');
  });

  test('#3: Inside the "constructErrors" state', () => {
    matches('constructErrors');
  });

  test('#4 Advance in time for always', () => advanceAlways());

  test('#5 We are in the "idle" state', () => {
    matches('idle');
    context('MEDIA_STACK_API_URL', ctx => ctx.API_URL);
    context('MEDIA_STACK_APIKEY', ctx => ctx.API_KEY);
  });

  test('#6 Send query', () => {
    send({ type: 'QUERY', limit: 20 });
  });

  test('#7: It sends a json error to parent', () => {
    parentSend('escalateJsonError');
  });

  test('#8: It finializes to error', () => {
    matches('error');
  });

  test('#9 Stop', () => {
    stop();
  });
});
