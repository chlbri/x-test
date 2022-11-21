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
import type { Action, ActionKey, TestHelper } from '../types';
import { isTestHelperDefined, _expect } from '../utils';

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
  name: ActionKey<typeof machine>,
) => {
  const action = machine.options.actions?.[name] as any;
  const assign = action?.assignment as Action<TContext, TEvents, TContext>;

  const acceptance = () => {
    const definedCheck = action !== undefined && action !== null;
    const typeCheck = action?.type === 'xstate.assign';
    const assignCheck = assign !== undefined && assign !== null;
    const check = definedCheck && typeCheck && assignCheck;
    _expect(check, true, () => `${name} is not accepted`);
  };

  const expect = (helper: TestHelper<TContext, TEvents, TContext>) => {
    const checkAll = isTestHelperDefined(helper);
    if (!checkAll) return;

    const { context, event, expected } = helper;
    const actual = assign(context, event);
    _expect(actual, expected);
  };

  return { acceptance, expect, assign } as const;
};
