import { expect, vi } from 'vitest';
import type {
  BaseActionObject,
  EventObject,
  NoInfer,
  ResolveTypegenMeta,
  ServiceMap,
  StateMachine,
  TypegenDisabled,
  Typestate,
} from 'xstate';
import { isTestHelperDefined } from './helpers';
import type { ActionKey, TestHelper } from './types';

export const testAssign = <
  TContext extends object,
  TEvents extends EventObject = EventObject,
  TTypestate extends Typestate<TContext> = {
    value: any;
    context: TContext;
  },
  TAction extends BaseActionObject = BaseActionObject,
  TServiceMap extends ServiceMap = ServiceMap,
  TResolvedTypesMeta = ResolveTypegenMeta<
    TypegenDisabled,
    NoInfer<TEvents>,
    TAction,
    TServiceMap
  >,
>(
  machine: StateMachine<
    TContext,
    any,
    TEvents,
    TTypestate,
    TAction,
    TServiceMap,
    TResolvedTypesMeta
  >,
  name: ActionKey<TContext, TEvents, TResolvedTypesMeta>,
) => {
  const action = machine.options.actions?.[name] as any;
  const fn = action?.assignment;
  const mockFn = vi.fn(fn);
  if (!fn) throw 'Action not exists';

  const acceptance = () => {
    expect(action).toBeDefined();
    expect(action?.type).toBe('xstate.assign');
    expect(mockFn).toBeDefined();
  };

  const testExpect = (helper: TestHelper<TContext, TEvents, TContext>) => {
    const checkAll = isTestHelperDefined(helper);
    if (!checkAll) return;

    const { context, event, expected } = helper;
    expect(mockFn(context, event)).toEqual(expected);
  };

  return [acceptance, testExpect, mockFn] as const;
};
