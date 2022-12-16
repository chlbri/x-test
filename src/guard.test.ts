import { test } from 'vitest';
import { inputMachine } from './fixtures/input.machine';
import { testGuard } from './guard';

test.concurrent.fails('Fails if Function not exists', () => {
  const [acceptance] = testGuard(inputMachine, 'notExists' as any);
  acceptance();
});

test.concurrent('Workflow', () => {
  const [, expect] = testGuard(inputMachine, 'isEditing');
  expect({
    expected: true,
    context: { name: 'any', editing: true },
  });
});
