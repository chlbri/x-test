import { test } from 'vitest';
import { inputMachine } from '../fixtures/input.machine';
import { testAssign } from './assign';

test.concurrent.fails('Function not exists', () => {
  const { createAcceptance } = testAssign(
    inputMachine,
    'notExists' as any,
  );
  const acceptance = createAcceptance();
  acceptance();
});

const { createExpect } = testAssign(inputMachine, 'input');
test.concurrent(
  'Context in function Helper is undefined',
  createExpect({ expected: { name: '' } }),
);

test.concurrent(
  'Workflow',
  createExpect({
    expected: { name: 'any', input: 'input', editing: true },
    context: { name: 'any' },
    event: { type: 'INPUT', input: 'input' },
  }),
);

test.concurrent.fails(
  'Workflow',
  createExpect({
    expected: { name: 'any', input: 'step1', editing: true },
    context: { name: 'any' },
    event: { type: 'INPUT', input: 'step2' },
  }),
);
