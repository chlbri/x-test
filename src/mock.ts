import merge from 'deepmerge';
import type {
  BaseActionObject,
  EventObject,
  MachineOptionsFrom,
  NoInfer,
  ResolveTypegenMeta,
  ServiceMap,
  StateMachine,
  TypegenDisabled,
  Typestate,
} from 'xstate';
import {
  emptyAction,
  emptyService,
  EMPTY_DELAY,
  fillObject,
  trueGuard,
} from './utils';

function buildMockConfig<
  // #region Types
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
  // #endregion
>(
  // #region @param machine
  machine: StateMachine<
    TContext,
    any,
    TEvents,
    TTypestate,
    TAction,
    TServiceMap,
    TResolvedTypesMeta
  >,
  // #endregion
) {
  const guards = fillObject(machine.options.guards, trueGuard);
  const actions = fillObject(machine.options.actions, emptyAction);
  const delays = fillObject(machine.options.delays, EMPTY_DELAY);
  const services = fillObject(machine.options.services, emptyService);

  return {
    actions,
    guards,
    delays,
    services,
  };
}

export function mockMachine<
  // #region Types
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
  // #endregion
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
  config?: {
    options?: MachineOptionsFrom<typeof machine>;
    context?: TContext;
  },
) {
  const _options: any = merge(
    buildMockConfig(machine),
    config?.options ?? {},
  );
  const _machine = machine.withConfig(_options, config?.context);

  // #region type Return
  type Return = StateMachine<
    TContext,
    any,
    TEvents,
    TTypestate,
    TAction,
    TServiceMap,
    ResolveTypegenMeta<
      TypegenDisabled,
      NoInfer<TEvents>,
      TAction,
      TServiceMap
    >
  >;
  // #endregion

  return _machine as unknown as Return;
}
