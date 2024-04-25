import { test } from 'vitest';
import { inputMachine } from './fixtures/input.machine';
import { interpret } from './interpret';

const { guard } = interpret(inputMachine);

test.concurrent.fails('Fails if Function not exists', () => {
  const [acceptance] = guard('notExists' as any);
  acceptance();
});

test.concurrent('Workflow', () => {
  const [, expect] = guard('isEditing');
  expect({
    expected: true,
    context: { name: 'any', editing: true },
  });
});
