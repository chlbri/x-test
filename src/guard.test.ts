import { test } from 'vitest';
import { inputMachine } from './fixtures/input.machine';
import { testGuard } from './guard';

test.concurrent.fails('Function not exists', () => {
  const { createAcceptance } = testGuard(inputMachine, 'notExists' as any);
  createAcceptance()();
});

const { createExpect } = testGuard(inputMachine, 'isEditing');

test.concurrent(
  'Context in function Helper is undefined',
  createExpect({ expected: true }),
);

test.concurrent(
  'Workflow',
  createExpect({
    expected: true,
    context: { name: 'any', editing: true },
  }),
);
