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

export function reFunction<
  T extends object = object,
  FnKey extends KeysFn<T> = KeysFn<T>,
  Pm extends any[] = T[FnKey] extends (...args: infer P) => any
    ? P
    : any[],
  Re = T[FnKey] extends (...args: any) => infer R ? R : any,
>(object: T, fn: FnKey) {
  return (...args: Pm) => (object[fn] as Function)(...args) as Re;
}

// export function reReFunction<
//   T extends object = object,
//   FnKey extends KeysFn<T> = KeysFn<T>,
//   Pm extends any[] = T[FnKey] extends (...args: infer P) => any
//     ? P
//     : any[],
//   Re = T[FnKey] extends (...args: any) => infer R ? R : any,
// >(object: T, fn: FnKey) {
//   return (...args: Pm) =>
//     () => {
//       (object[fn] as Function)(...args) as Re;
//     };
// }

export function _expect<T>(actual: T, expected: T, error = defaultError) {
  const diffs = dequal(actual, expected);
  if (!diffs) throw new Error(error(actual, expected));
}

export function defaultError<T>(actual: T, expected: T) {
  const _actual = JSON.stringify(actual);
  const _expected = JSON.stringify(expected);
  return `${_actual}
not equals
${_expected}`;
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
  const reducer = keys.reduce(
    (acc, key) => {
      acc[key] = fill;
      return acc;
    },
    <Reducer<T, F>>{},
  );
  return reducer;
}
