import { describe, expect, test } from 'vitest';
import {
  emptyAction,
  emptyService,
  falseGuard,
  fillObject,
  isDefined,
  trueGuard,
} from './utils';

// #region Preparation
// eslint-disable-next-line @typescript-eslint/ban-types
const useEmptyTest = (fn: Function, expected: any) => {
  test('Function is defined', () => {
    expect(fn).toBeInstanceOf(Function);
  });

  test('workflow', async () => {
    const actual = await fn();
    expect(actual).toEqual(expected);
  });
};

// eslint-disable-next-line @typescript-eslint/ban-types
const useTest = (fn: Function, args: any[], expected: any) => {
  test('Function is defined', () => {
    expect(fn).toBeInstanceOf(Function);
  });

  test('workflow', async () => {
    const actual = await fn(...args);
    expect(actual).toEqual(expected);
  });
};
// #endregion

describe('trueGuard', () => {
  useEmptyTest(trueGuard, true);
});

describe('falseGuard', () => {
  useEmptyTest(falseGuard, false);
});

describe('emptyAction', () => {
  useEmptyTest(emptyAction, undefined);
});

describe('emptyService', () => {
  useEmptyTest(emptyService, undefined);
});

describe('isDefined', () => {
  useTest(isDefined, [2], true);
});

describe('fillObject', () => {
  useEmptyTest(fillObject, {});
});
