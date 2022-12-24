import { dequal } from 'dequal';

// #region SubType
type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

type AllowedNames<Base, Condition> = FilterFlags<
  Base,
  Condition
>[keyof Base];

export type SubType<Base extends object, Condition> = Pick<
  Base,
  AllowedNames<Base, Condition>
>;
// #endregion

type Fn<P extends any[] = any, R = any> = (...arg: P) => R;
type KeysFn<T extends object = object> = keyof SubType<T, Fn>;

function _reFunction<P extends any[] = any[], R = any>(
  fn: Fn<P, R>,
  bind: any,
) {
  return (...args: P) => fn.bind(bind)(...args);
}

export function reFunction<
  T extends object = object,
  FnKey extends KeysFn<T> = KeysFn<T>,
>(object: T, fn: FnKey) {
  const _fn = object[fn];
  type Pm = T[FnKey] extends (...args: infer P) => any ? P : any[];
  type Re = T[FnKey] extends (...args: any) => infer R ? R : any;
  return _reFunction<Pm, Re>(_fn as any, object);
}

export function _expect<T>(actual: T, expected: T, error = defaultError) {
  const check = dequal(actual, expected);
  if (!check) throw new Error(error(actual, expected));
}

export function defaultError(actual: any, expected: any) {
  const actualJSON = JSON.stringify(actual, null, 2);
  const expectedJSON = JSON.stringify(expected, null, 2);
  return `
${actualJSON} 
not equals to
${expectedJSON}
`;
}

export const emptyAction = () => void 0;
export const trueGuard = () => true;
export const falseGuard = () => false;

export const EMPTY_DELAY = 0;

export const emptyService = async () => {
  /* EMPTY */
};

export function isNone(value?: any): value is null | undefined {
  const out = value === undefined || value === null;
  return out;
}

export function isDefined<T>(
  value?: T,
): value is Exclude<T, null | undefined> {
  const out = value === undefined || value === null;
  return !out;
}

type Reducer<T extends object, F> = { [k in keyof T]: F };

export function fillObject<T extends object, F>(object?: T, fill?: F) {
  if (isNone(object) || isNone(fill)) return <Reducer<T, F>>{};
  const keys = Object.keys(object) as (keyof T)[];
  const reducer = keys.reduce((acc, key) => {
    acc[key] = fill;
    return acc;
  }, <Reducer<T, F>>{});
  return reducer;
}

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

export function transformParentEventsToLocal<T extends _Options>(
  options: T,
) {
  const actions = options.actions;
  const localActions: any = {};
  const inner: any = {};
  const parentEvents: string[] = [];
  for (const key in actions) {
    const action = actions[key];
    if (action.to === '#_parent') {
      localActions[key] = () => {
        parentEvents.push(key);
      };
    } else {
      localActions[key] = action;
    }
  }
  inner.actions = localActions;
  inner.guards = options.guards;
  inner.services = options.services;
  inner.delays = options.delays;
  return [inner as T, parentEvents] as const;
}
