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
import { identity } from '../helpers';
import type {
  Action,
  ActionKey,
  MachineActionsFrom,
  TestHelper,
} from '../types';
import { _expect } from '../utils';

type Props<
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
  Machine extends StateMachine<
    TContext,
    any,
    TEvents,
    TTypestate,
    TAction,
    TServiceMap,
    TResolvedTypesMeta
  > = StateMachine<
    TContext,
    any,
    TEvents,
    TTypestate,
    TAction,
    TServiceMap,
    TResolvedTypesMeta
  >,
> = {
  machine: Machine;
  action: ActionKey<Machine>;
  accessFunction?: (action?: any) => any;
  typeCheck?: (action?: any) => boolean;
};

export const testAction = <
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
>({
  machine,
  action: name,
  accessFunction = identity,
  typeCheck = () => true,
}: Props<
  TContext,
  TEvents,
  TTypestate,
  TAction,
  TServiceMap,
  TResolvedTypesMeta
>) => {
  const action = machine.options.actions?.[name] as MachineActionsFrom<
    typeof machine
  >;

  const func = accessFunction(action) as
    | Action<Partial<TContext>, TEvents, any>
    | EventObject;

  const acceptance = () => {
    const definedCheck = action !== undefined && action !== null;
    const assignCheck = func !== undefined && func !== null;
    const _typeCheck = typeCheck(action);
    const check = definedCheck && assignCheck && _typeCheck;
    _expect(check, true, () => `${name} is not accepted`);
  };

  const expect = ({
    context,
    event,
    expected,
  }: TestHelper<Partial<TContext>, TEvents, any>) => {
    // const { context, event, expected } = helper;
    if (typeof func === 'function') {
      const actual = func(context, event);
      _expect(actual, expected);
    } else {
      _expect(func, expected);
    }
  };

  return [acceptance, expect, func] as const;
};
