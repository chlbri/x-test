import { dequal } from 'dequal';

import type { EventObject } from 'xstate';
import type { TestHelper } from './types';

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

export const isTestHelperDefined = <
  TContext extends object = object,
  TEvents extends EventObject = EventObject,
  T = TContext,
>(
  helper: TestHelper<TContext, TEvents, T>,
) => {
  const { context, event } = helper;
  const checkAll = !context && !event;
  if (checkAll) return false;
  return true;
};

export function defaultError(actual: any, expected: any) {
  const actualJSON = JSON.stringify(actual, null, 2);
  const expectedJSON = JSON.stringify(expected, null, 2);
  return `
${actualJSON} 
not equals to
${expectedJSON}
`;
}

export const emptyAction = () => {
  /* EMPTY */
};
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
