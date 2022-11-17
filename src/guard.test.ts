import { expect, test } from 'vitest';
import { inputMachine } from './fixtures/input.machine';
import { testGuard } from './guard';

test.concurrent('Function not exists', () => {
  const safe = () => testGuard(inputMachine, 'notExists' as any);
  expect(safe).toThrow('Guard not exists');
});

test.concurrent('Context in function Helper is undefined', () => {
  const [, expect] = testGuard(inputMachine, 'isEditing');
  expect({ expected: true });
});

test.concurrent('Workflow', () => {
  const [, expect] = testGuard(inputMachine, 'isEditing');
  expect({ expected: true, context: { name: 'any', editing: true } });
});
