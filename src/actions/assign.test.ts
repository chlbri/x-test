import { test } from 'vitest';
import { inputMachine } from '../fixtures/input.machine';
import { testAssign } from './assign';

test.concurrent.fails('Function not exists', () => {
  const { acceptance } = testAssign(inputMachine, 'notExists' as any);
  acceptance();
});

test.concurrent('Context in function Helper is undefined', () => {
  const { expect } = testAssign(inputMachine, 'input');
  expect({ expected: { name: '' } });
});

test.concurrent('Workflow', () => {
  const { expect } = testAssign(inputMachine, 'input');
  const input = 'input';
  expect({
    expected: { name: 'any', input, editing: true },
    context: { name: 'any' },
    event: { type: 'INPUT', input },
  });
});

test.concurrent.fails('Workflow', () => {
  const { expect } = testAssign(inputMachine, 'input');
  expect({
    expected: { name: 'any', input: 'step1', editing: true },
    context: { name: 'any' },
    event: { type: 'INPUT', input: 'step2' },
  });
});
