import { test } from 'vitest';
import { inputMachine } from './fixtures/input.machine';
import { testGuard } from './guard';

test.concurrent.fails('Function not exists', () => {
  const { acceptance } = testGuard(inputMachine, 'notExists' as any);
  acceptance();
});

test.concurrent('Context in function Helper is undefined', () => {
  const { expect } = testGuard(inputMachine, 'isEditing');
  expect({ expected: true });
});

test.concurrent('Workflow', () => {
  const { expect } = testGuard(inputMachine, 'isEditing');
  expect({ expected: true, context: { name: 'any', editing: true } });
});
