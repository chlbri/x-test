import { decompose, StateMatching, StateValue } from '@bemedev/decompose';

export type MatchOptions<T extends string = string> =
  | {
      or: MatchOptions<T>[];
    }
  | { and: MatchOptions<T>[] }
  | T;

function buildMatches(
  decomposeds: readonly string[],
  value: MatchOptions
): boolean {
  let out = false;
  if (typeof value === 'string') {
    out = decomposeds.includes(value);
  } else if ('or' in value) {
    const _values = value.or;
    out = _values
      .map((value) => buildMatches(decomposeds, value))
      .some((value) => value === true);
  } else {
    const _values = value.and;
    out = _values
      .map((value) => buildMatches(decomposeds, value))
      .every((value) => value === true);
  }

  return out;
}

export function matches<T extends StateValue = StateValue>(value?: T) {
  if (!value) {
    return (..._: MatchOptions<StateMatching<T>>[]) => false;
  }
  const decomposeds = decompose(value);
  return (...values: MatchOptions<StateMatching<T>>[]) => {
    const matchers = values.map((value) =>
      buildMatches(decomposeds, value)
    );
    return matchers.every((matcher) => matcher === true);
  };
}
