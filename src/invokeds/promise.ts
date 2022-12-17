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
import { _expect } from '../utils';
import { OptionalTester } from './../types';

/**
 * Only works for promise, don't use with invoked machines or callbacks or subscribables or anything else
 * @param machine The machine to Test
 * @param name the name of the promise service
 * @returns Some function to test this promise service
 */
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
  type Out = Action<TContext, TEvents, PR>;
  const promise = service as Out;

  const acceptance = (...tests: OptionalTester<Out>[]) => {
    const check = service !== undefined;
    _expect(check, true, () => `${name} is not accepted`);

    tests.forEach(test => test(promise));
  };

  const expect = async (
    helper: TestHelper<TContext, TEvents, Awaited<PR>>,
  ) => {
    const { context, event, expected } = helper;

    const actual = await promise(context, event);
    _expect(actual, expected);
  };

  return [acceptance, expect, promise] as const;
};
