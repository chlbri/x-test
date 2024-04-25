import { test } from 'vitest';
import { inputMachine } from '../fixtures/input.machine';
import { interpret } from '../interpret';
import { testAssign } from './assign';

test.concurrent.fails('Function is not defined in the machine', () => {
  const [acceptance] = testAssign(inputMachine, 'notExists' as any);
  acceptance();
});

test.concurrent('#1 Workflow', () => {
  const [, expect] = testAssign(inputMachine, 'input');
  return expect({
    expected: { name: 'any', input: 'input', editing: true },
    context: { name: 'any' },
    event: { type: 'INPUT', input: 'input' },
  });
});

test.concurrent.fails('#2 Workflow', () => {
  const { assign } = interpret(inputMachine);
  const [, expect] = assign('input');
  return expect({
    expected: { name: 'any', input: 'step1', editing: true },
    context: { name: 'any' },
    event: { type: 'INPUT', input: 'step2' },
  });
});
