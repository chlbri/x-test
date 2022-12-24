import { createLogic, interpret } from '@bemedev/fsf';
import { Context, FetchNewsQuery } from './machine.types';

const logic = createLogic({
  schema: {
    data: {} as string | undefined,
    context: {} as Pick<Context, 'URL'> & Pick<Context, 'categories'>,
    events: {} as Pick<Context, 'API_KEY' | 'API_URL'> &
      Pick<FetchNewsQuery, 'categories' | 'offset' | 'limit'>,
  },
  context: {},
  initial: 'primary',
  states: {
    primary: {
      always: {
        target: 'categories',
        actions: ['startBuild'],
      },
    },
    categories: {
      always: [
        {
          cond: 'hasCategories',
          target: 'offset',
          actions: ['concatCategories', 'addCategories'],
        },
        'offset',
      ],
    },
    offset: {
      always: [
        {
          cond: 'hasOffset',
          target: 'limit',
          actions: ['addOffset'],
        },
        'limit',
      ],
    },
    limit: {
      always: [
        {
          cond: 'hasLimit',
          target: 'final',
          actions: ['addLimit'],
        },
        'final',
      ],
    },
    final: {
      data: 'URL',
    },
  },
}).withOptions({
  actions: {
    startBuild: (context, { API_KEY, API_URL }) => {
      context.URL = `${API_URL}?access_key=${API_KEY}`;
    },
    concatCategories: (context, { categories }) => {
      context.categories = categories?.join(',');
    },
    addCategories: context => {
      context.URL += `&keywords=${context.categories}`;
    },
    addOffset: (context, { offset }) => {
      context.URL += `&offset=${offset}`;
    },
    addLimit: (context, { limit }) => {
      context.URL += `&limit=${limit}`;
    },
  },
  guards: {
    hasCategories: (_, { categories }) =>
      !!categories && categories.length > 0,
    hasOffset: (_, { offset }) => !!offset,
    hasLimit: (_, { limit }) => !!limit,
  },
  datas: {
    URL: context => context.URL,
  },
});

export const buildURL = interpret(logic);
