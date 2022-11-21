import { test } from 'vitest';
import { inputMachine } from './fixtures/input.machine';
import { testGuard } from './guard';

test.concurrent.fails('Fails if Function not exists', () => {
  const [acceptance] = testGuard(inputMachine, 'notExists' as any);
  acceptance();
});

const [, expect] = testGuard(inputMachine, 'isEditing');

test.concurrent('Context in function Helper is undefined', () =>
  expect({ expected: true }),
);

test.concurrent('Workflow', () =>
  expect({
    expected: true,
    context: { name: 'any', editing: true },
  }),
);
