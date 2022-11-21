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

export function mockMachine<
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
  config?: {
    options?: MachineOptionsFrom<typeof machine>;
    context?: TContext;
  },
) {
  const _options: any = merge(config?.options ?? {}, {
    guards: fillObject(machine.options.guards, trueGuard),
    actions: fillObject(machine.options.actions, emptyAction),
    delays: fillObject(machine.options.delays, EMPTY_DELAY),
    services: fillObject(machine.options.services, emptyService),
  });
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
    // #endregion
  >;

  return _machine as unknown as Return;
}
