import { voidNothing } from '@bemedev/fsf';
import { ALWAYS_TIME } from './constants';
import { deepClone } from './helpers';

type _State = {
  always?: any;
  after?: any;
  states?: Record<string, _State>;
} & Record<string, any>;

export function transformAlwaysToAfter<T extends _State>(state: T) {
  const inner = deepClone(state);
  if (inner.always) {
    inner.after = { [ALWAYS_TIME]: inner.always, ...inner.after };
    delete inner.always;
  }
  const states = inner.states;
  if (states) {
    for (const key in states) {
      const _state = states[key];
      states[key] = transformAlwaysToAfter(_state);
    }
  }
  inner.states = states;
  return inner;
}

type _Options = {
  actions?: Record<string, any>;
} & Record<string, any>;

export function transformToLocal<T extends _Options>(options: T) {
  const actions = options.actions;
  const localActions: any = {};
  const inner: any = {};
  for (const key in actions) {
    const action = actions[key];
    if (action.to === '#_parent') {
      localActions[key] = voidNothing;
    } else {
      localActions[key] = action;
    }
  }
  inner.actions = localActions;
  inner.guards = options.guards;
  inner.services = options.services;
  inner.delays = options.delays;
  return inner as T;
}
