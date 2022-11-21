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
import { Action, ServiceKey, TestHelper } from '../types';
import { isTestHelperDefined, _expect } from '../utils';

export const testPromise = <
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
  name: ServiceKey<typeof machine>,
) => {
  const service = machine.options.services?.[name];
  type PR = Promise<TServiceMap[typeof name]['data']>;
  const promise = service as Action<TContext, TEvents, PR>;

  const acceptance = (...tests: ((serv: typeof service) => void)[]) => {
    const definedCheck = service !== undefined && service !== null;
    const typeCheck = typeof service === 'function';
    const check = definedCheck && typeCheck;
    _expect(check, true, () => `${name} is not accepted`);
    tests.forEach(test => test(service));
  };

  const expect = async (
    helper: TestHelper<TContext, TEvents, Awaited<PR>>,
  ) => {
    const checkAll = isTestHelperDefined(helper);
    if (!checkAll) return;

    const { context, event, expected } = helper;

    const actual = await promise(context, event);
    _expect(actual, expected);
  };

  return { acceptance, expect, promise } as const;
};
