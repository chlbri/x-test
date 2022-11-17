import { expect } from 'vitest';
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
import type { Action, ActionKey, TestHelper } from './types';

export const testSendParent = <
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
  if (!action) throw 'Action not exists';

  type Event = EventObject & Record<string, any>;
  const send = action.event as Action<TContext, TEvents, Event> | Event;

  const acceptance = () => {
    expect(action).toBeDefined();
    expect(action.type).toBe('xstate.send');
    expect(send).toBeDefined();
  };

  const testExpect = (helper: TestHelper<TContext, TEvents, Event>) => {
    const checkAll = isTestHelperDefined(helper);
    if (!checkAll) return;

    const { context, event, expected: result } = helper;

    if (typeof send === 'function') {
      const actual = send(context, event);
      expect(actual).toEqual(result);
    } else {
      expect(send).toEqual(result);
    }
  };

  return [acceptance, testExpect] as const;
};
