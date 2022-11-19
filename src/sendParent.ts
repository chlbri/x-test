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
import type { Action, ActionKey, TestHelper } from './types';
import { isTestHelperDefined, _expect } from './utils';

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
  // if (!action) throw 'Action not exists';

  type Event = EventObject & Record<string, any>;
  const send = action?.event as Action<TContext, TEvents, Event> | Event;

  const acceptance = () => {
    const definedCheck = action !== undefined && action !== null;
    const typeCheck = action?.type === 'xstate.send';
    const sendCheck = send !== undefined && send !== null;
    const check = definedCheck && typeCheck && sendCheck;
    if (!check) {
      const json = JSON.stringify(action, null, 2);
      const error = new Error(`${json} is not accepted`);
      throw error;
    }
  };

  const testExpect = (helper: TestHelper<TContext, TEvents, Event>) => {
    const checkAll = isTestHelperDefined(helper);
    if (!checkAll) return;

    const { context, event, expected } = helper;

    if (typeof send === 'function') {
      const actual = send(context, event);
      _expect(actual, expected);
    } else {
      _expect(send, expected);
    }
  };

  return [acceptance, testExpect] as const;
};
