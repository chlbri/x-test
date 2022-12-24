import { assign } from '@xstate/immer';
import { createMachine } from 'xstate';
import { escalate } from 'xstate/lib/actions';
import { ERRORS } from './constants';
import { NewsResponse, newsResponseSchema } from './entities/objects';
import { buildURL } from './functions';
import { Context, Events } from './machine.types';

const machine = createMachine(
  {
    id: 'fetchNews',
    initial: 'environment',
    context: {},
    states: {
      environment: {
        initial: 'API_URL',
        states: {
          API_URL: {
            invoke: {
              src: 'get_API_URL',
              onDone: {
                target: 'API_KEY',
                actions: 'assignAPI_URL',
              },
              onError: {
                target: '#error',
                actions: ['escalateNoAPI_URL'],
              },
            },
          },
          API_KEY: {
            invoke: {
              src: 'get_API_KEY',
              onDone: {
                target: '#constructErrors',
                actions: 'assignAPI_KEY',
              },
              onError: {
                target: '#error',
                actions: ['escalateNoAPI_KEY'],
              },
            },
          },
        },
      },
      constructErrors: {
        id: 'constructErrors',
        always: {
          target: 'idle',
          actions: ['constructErrors'],
        },
      },
      idle: {
        id: 'idle',
        on: {
          QUERY: {
            target: 'fetch',
            actions: ['buildURL'],
          },
        },
      },
      fetch: {
        invoke: {
          src: 'fetchNews',
          id: 'fetch',
          onDone: { target: 'json', actions: 'assignResponse' },
          onError: {
            target: 'error',
            actions: 'escalateFetchError',
          },
        },
      },
      json: {
        invoke: {
          src: 'json',
          id: 'json',
          onDone: { target: 'zod', actions: 'assignJSON' },
          onError: {
            target: 'error',
            actions: 'escalateJsonError',
          },
        },
      },
      zod: {
        invoke: {
          src: 'zod',
          id: 'zod',
          onDone: {
            target: 'success',
            actions: ['assignNews', 'assignPagination'],
          },
          onError: {
            target: 'error',
            actions: 'escalateZodError',
          },
        },
      },
      success: {
        type: 'final',
        data: ({ news, pagination }) => ({
          news,
          pagination,
        }),
      },
      error: {
        id: 'error',
        type: 'final',
      },
    },

    schema: {
      context: {} as Context,
      events: {} as Events,
      services: {} as {
        get_API_URL: { data: string };
        get_API_KEY: { data: string };
        fetchNews: { data: Response };
        json: { data: unknown };
        zod: { data: NewsResponse };
      },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./machine.typegen').Typegen0,
  },
  {
    actions: {
      constructErrors: assign(context => {
        context._errors = ERRORS.object;
      }),
      assignAPI_URL: assign((context, { data }) => {
        context.API_URL = data;
      }),
      assignAPI_KEY: assign((context, { data }) => {
        context.API_KEY = data;
      }),

      buildURL: assign((context, { categories, limit, offset }) => {
        context.URL = buildURL({
          API_KEY: context.API_KEY,
          API_URL: context.API_URL,
          categories,
          limit,
          offset,
        });
      }),
      assignResponse: assign((context, { data }) => {
        context.response = data;
      }),
      assignJSON: assign((context, { data }) => {
        context.json = data;
      }),
      assignNews: assign((context, { data }) => {
        context.news = data.news;
      }),
      assignPagination: assign((context, { data }) => {
        context.pagination = data.pagination;
      }),

      // #region Errors
      //TODO: test the escalations
      escalateFetchError: escalate(({ _errors }) => _errors?.FETCH_ERROR),
      escalateJsonError: escalate(({ _errors }) => _errors?.JSON_ERROR),
      escalateZodError: escalate(({ _errors }) => _errors?.ZOD_ERROR),
      escalateNoAPI_KEY: escalate(({ _errors }) => _errors?.API_KEY_ERROR),
      escalateNoAPI_URL: escalate(({ _errors }) => _errors?.API_URL_ERROR),
      // #endregion
    },
    services: {
      get_API_URL: async () => {
        const out = process.env.MEDIA_STACK_API_URL;
        const empty = !out || out === 'undefined';
        if (empty) throw new Error('No API_URL');

        return out;
      },

      get_API_KEY: async () => {
        const out = process.env.MEDIA_STACK_APIKEY;
        const empty = !out || out === 'undefined';
        if (empty) throw new Error('No API_KEY');

        return out;
      },

      fetchNews: async context => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const response = await fetch(context.URL!);
        if (!response.ok) throw new Error('not OK');
        return response;
      },

      json: async ({ response }) => {
        const data = await response?.json();
        // if (!data) throw new Error('no data');
        return data;
      },

      zod: ({ json }) => newsResponseSchema.parseAsync(json),
    },
  },
);

export default machine;
