import type { EventObject } from 'xstate';
import type { TestHelper } from './types';

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
