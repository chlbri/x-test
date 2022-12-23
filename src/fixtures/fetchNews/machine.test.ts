import { afterAll, beforeAll, describe, test, vi } from 'vitest';
import { ALWAYS_TIME } from '../../constants';
import testMachine from '../../machine';
import { advanceByTime } from '../advanceByTime';
import machine from './machine';

function useTestConfig() {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });
}

const MEDIA_STACK_API_URL = 'MEDIA_STACK_API_URL';
const MEDIA_STACK_APIKEY = 'MEDIA_STACK_APIKEY';

function useEnvDefined() {
  beforeAll(() => {
    process.env = {
      MEDIA_STACK_APIKEY,
      MEDIA_STACK_API_URL,
    };
  });

  afterAll(() => {
    process.env = {};
  });
}

function useEnvUndefined() {
  beforeAll(() => {
    process.env = {};
  });
  afterAll(() => {
    process.env = {
      MEDIA_STACK_APIKEY,
      MEDIA_STACK_API_URL,
    };
  });
}

useTestConfig();

const { assign, promise, escalate, start, matches, stop, send, context } =
  testMachine(
    machine.withConfig({
      // actions: {
      //   escalateNoAPI_URL: voidNothing,
      //   escalateNoAPI_KEY: voidNothing,
      // },
    }),
  );

function useFecthMock<T>(obj: T) {
  beforeAll(() => {
    global.fetch = vi.fn().mockResolvedValue(obj as any);
  });
}

describe('Worflow 1', () => {
  test('#1 Start the machine', () => {
    start();
  });

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

  test('#2: Inside the "constructErrors" state', () => {
    matches('constructErrors');
  });

  test('#3 Advance in time for always', () => advanceByTime(ALWAYS_TIME));
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

  // test('#3 Advance in time for always', () => advanceByTime(ALWAYS_TIME));

  test('', () => {
    matches('success');
  });
});

describe('Worflow 2:  Env error', () => {
  test('#1 Start the machine', () => {
    start();
  });

  test('#2: No env variables gives an error', () => {
    matches('error');
  });
});
