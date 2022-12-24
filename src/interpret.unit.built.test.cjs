import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { ERRORS } from './fixtures/fetchNews/constants';
import machine from './fixtures/fetchNews/machine';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { interpret } = require('../lib/interpret.js');
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

describe('Acceptance test', () => {
  // const _machine = mockMachine(machine);
  const { assign, promise, sendAction } = interpret(machine);
  useEnvDefined();

  describe('Promises', () => {
    describe('#1 -> get_API_URL', () => {
      const [acceptance, expect] = promise('get_API_URL');
      test('Acceptance', () => acceptance());

      test('It returns the API_URL', () =>
        expect({
          expected: MEDIA_STACK_API_URL,
        }));

      describe('Mock env undefined', () => {
        useEnvUndefined();
        test.fails('It will throw if no API_URL', () =>
          expect({
            expected: MEDIA_STACK_API_URL,
          }),
        );
      });
    });

    describe('#2 -> get_API_KEY', () => {
      const [acceptance, expect] = promise('get_API_KEY');
      test('Acceptance', () => acceptance());

      test('It returns the API_URL', () => {
        return expect({
          expected: MEDIA_STACK_APIKEY,
        });
      });

      describe('Mock env undefined', () => {
        useEnvUndefined();
        test.fails('It will throw if no API_KEY', async () =>
          expect({
            expected: MEDIA_STACK_APIKEY,
          }),
        );
      });
    });

    describe('#3 -> fetchNews', () => {
      const [acceptance, expect] = promise('fetchNews');
      test('#1 -> Acceptance', () => acceptance());

      test('#2 -> It returns the Response', async () => {
        const mockObj = {
          ok: true,
          data: 'data',
        };

        global.fetch = vi.fn().mockResolvedValue(mockObj);

        await expect({
          expected: mockObj,
          context: { URL: 'URL' },
        });
      });

      test.fails('#3 -> It will throw if Response is not ok', async () => {
        const mockObj = {
          ok: false,
          data: 'data',
        };
        global.fetch = vi.fn().mockResolvedValue(mockObj);
        await expect({
          expected: mockObj,
          context: { URL: 'URL' },
        });
      });
    });

    describe('#4 -> json', () => {
      const [acceptance, expect] = promise('json');

      test('#1 -> Acceptance', () => acceptance());

      test('#2 -> It will transform in JSON', async () => {
        const json = async () => 'data';
        expect({
          expected: 'data',
          context: { response: { json } },
        });
      });

      test.fails('#3 -> It will throw if some Error', async () => {
        const json = async () => {
          throw new Error('Something went wrong');
        };
        await expect({
          expected: 'data',
          context: { response: { json } },
        });
      });
    });

    describe('#5 -> zod', () => {
      const [acceptance, expect] = promise('zod');

      test('#1 -> Acceptance', () => acceptance());

      test('#2 -> It will validate the JSON', async () => {
        const json = {
          pagination: {
            limit: 10,
            offset: 0,
            count: 10,
            total: 10,
          },
          news: [],
        };
        await expect({
          expected: json,
          context: { json },
        });
      });

      test.fails(
        '#3 -> It will throw if JSON is not conform',
        async () => {
          const json = {
            pagination: {
              limit: 10,
              offset: 0,
              count: 10,
              total: '10',
            },
            news: [],
          };
          await expect({
            expected: json,
            context: { json },
          });
        },
      );
    });
  });

  describe('Actions', () => {
    describe('#1 -> assignAPI_URL', () => {
      const [acceptance, expect] = assign('assignAPI_URL');
      test('#1 -> Acceptance', () => acceptance());

      test('It assigns the API_URL', () =>
        expect({
          expected: { API_URL: process.env.MEDIA_STACK_API_URL },
          context: {},
          //@ts-ignore safe
          event: { type: '', data: process.env.MEDIA_STACK_API_URL },
        }));
    });

    describe('#2 -> assignAPI_KEY', () => {
      const [acceptance, expect] = assign('assignAPI_KEY');

      test('#1 -> Acceptance', () => acceptance());

      test('It assigns the API_KEY', () =>
        expect({
          expected: { API_KEY: process.env.MEDIA_STACK_APIKEY },
          context: {},
          //@ts-ignore safe
          event: { type: '', data: process.env.MEDIA_STACK_APIKEY },
        }));
    });

    describe('#4 -> buildURL', () => {
      const [acceptance, expect] = assign('buildURL');

      test('#1 -> Acceptance', () => acceptance());

      test('It builds the URL', () => {
        // #region Prepare
        const API_URL = process.env.MEDIA_STACK_API_URL;
        const API_KEY = process.env.MEDIA_STACK_APIKEY;
        const categories = ['business', 'health'];
        const _categories = 'business,health';
        const URL = `${API_URL}?access_key=${API_KEY}&keywords=${_categories}`;
        // #endregion

        expect({
          expected: {
            URL,
            API_URL,
            API_KEY,
          },
          context: { API_URL, API_KEY },
          event: { type: 'QUERY', categories },
        });
      });
    });

    describe('#5 -> assignResponse', () => {
      const [acceptance, expect] = assign('assignResponse');

      test('#1 -> Acceptance', () => acceptance());

      test('It assigns the response', () => {
        const response = 'data';
        expect({
          expected: {
            response,
          },
          context: {},
          //@ts-ignore safe
          event: { data: response },
        });
      });
    });

    describe('#5 -> assignJSON', () => {
      const [acceptance, expect] = assign('assignJSON');

      test('#1 -> Acceptance', () => acceptance());

      test('It assigns the json', () => {
        const json = 'data';
        expect({
          expected: {
            json,
          },
          context: {},
          //@ts-ignore safe
          event: { type: '', data: json },
        });
      });
    });

    describe('#6 -> assignNews', () => {
      const [acceptance, expect] = assign('assignNews');

      test('#1 -> Acceptance', () => acceptance());

      test('It assigns the news', () => {
        const data = {
          pagination: {
            limit: 10,
            offset: 0,
            count: 10,
            total: 10,
          },
          news: [{ name: 'Obélix' }],
        };
        expect({
          expected: {
            news: data.news,
          },
          context: {},
          //@ts-ignore safe
          event: { type: '', data },
        });
      });
    });

    describe('#7 -> assignPagination', () => {
      const [acceptance, expect] = assign('assignPagination');

      test('#1 -> Acceptance', () => acceptance());

      test('It assigns the pagination', () => {
        const data = {
          pagination: {
            limit: 10,
            offset: 0,
            count: 10,
            total: 10,
          },
          news: [{ name: 'Obélix' }],
        };
        expect({
          expected: {
            pagination: data.pagination,
          },
          context: {},
          //@ts-ignore safe
          event: { data },
        });
      });
    });

    describe('#8 -> Errors', () => {
      const escalateTest = action => {
        test(action, () => {
          const escalate = machine.options.actions?.[action];
          expect(escalate).toBeDefined();
        });
      };

      [
        'escalateFetchError',
        'escalateJsonError',
        'escalateZodError',
        'escalateNoAPI_KEY',
        'escalateNoAPI_URL',
      ].forEach(escalateTest);
      //TODO: test the escalations

      describe('#1: escaladeFetchError', () => {
        const [acceptance, expect] = sendAction('escalateFetchError');

        test('#1: Acceptance', () => acceptance());

        test('#2: It escalates the fetch error', () => {
          expect({
            expected: {
              type: 'xstate.error',
              data: ERRORS.object.FETCH_ERROR,
            },
            context: {
              _errors: ERRORS.object,
            },
          });
        });
      });

      describe('#2: escalateJsonError', () => {
        const [acceptance, expect] = sendAction('escalateJsonError');

        test('#1: Acceptance', () => acceptance());

        test('#2: It escalates the JSON error', () => {
          expect({
            expected: {
              type: 'xstate.error',
              data: ERRORS.object.JSON_ERROR,
            },
            context: {
              _errors: ERRORS.object,
            },
          });
        });
      });

      describe('#3: escalateZodError', () => {
        const [acceptance, expect] = sendAction('escalateZodError');

        test('#1: Acceptance', () => acceptance());

        test('#2: It escalates the zod error', () => {
          expect({
            expected: {
              type: 'xstate.error',
              data: ERRORS.object.ZOD_ERROR,
            },
            context: {
              _errors: ERRORS.object,
            },
          });
        });
      });

      describe('#4: escalateNoAPI_KEY', () => {
        const [acceptance, expect] = sendAction('escalateNoAPI_KEY');

        test('#1: Acceptance', () => acceptance());

        test('#2: It escalates the fetch error', () => {
          expect({
            expected: {
              type: 'xstate.error',
              data: ERRORS.object.API_KEY_ERROR,
            },
            context: {
              _errors: ERRORS.object,
            },
          });
        });
      });

      describe('#5: escalateNoAPI_URL', () => {
        const [acceptance, expect] = sendAction('escalateNoAPI_URL');

        test('#1 : Acceptance', () => acceptance());

        test('#2: It escalates the fetch error', () => {
          expect({
            expected: {
              type: 'xstate.error',
              data: ERRORS.object.API_URL_ERROR,
            },
            context: {
              _errors: ERRORS.object,
            },
          });
        });
      });

      describe('#6: constructErrors', () => {
        const [acceptance, expect] = assign('constructErrors');

        test('#1: Acceptance', () => acceptance());

        test('#2: It constructs the errors', () => {
          const _errors = ERRORS.object;
          expect({
            expected: {
              _errors,
            },
            context: {},
          });
        });
      });
    });
  });
});
