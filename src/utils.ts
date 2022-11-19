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

export function _expect<T>(actual: T, expected: T) {
  const check = dequal(actual, expected);
  if (!check) {
    const actualJSON = JSON.stringify(actual, null, 2);
    const expectedJSON = JSON.stringify(expected, null, 2);
    throw new Error(`
  ${actualJSON} 
  not equals to
  ${expectedJSON}
  `);
  }
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
