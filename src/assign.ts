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
import type { ActionKey, TestHelper } from './types';
import { isTestHelperDefined, _expect } from './utils';

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
  const assign = action?.assignment;

  const acceptance = () => {
    const definedCheck = action !== undefined && action !== null;
    const typeCheck = action?.type === 'xstate.assign';
    const assignCheck = assign !== undefined && assign !== null;
    const check = definedCheck && typeCheck && assignCheck;
    if (!check) {
      const json = JSON.stringify(action, null, 2);
      const error = new Error(`${json} is not accepted`);
      throw error;
    }
  };

  const testExpect = (helper: TestHelper<TContext, TEvents, TContext>) => {
    const checkAll = isTestHelperDefined(helper);
    if (!checkAll) return;

    const { context, event, expected } = helper;
    const actual = assign(context, event);
    _expect(actual, expected);
  };

  return [acceptance, testExpect] as const;
};
