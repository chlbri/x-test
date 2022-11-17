import { expect, test } from 'vitest';
import { testAssign } from './assign';
import { inputMachine } from './fixtures/input.machine';

test.concurrent('Function not exists', () => {
  const safe = () => testAssign(inputMachine, 'notExists' as any);
  expect(safe).toThrow('Action not exists');
});

test.concurrent('Context in function Helper is undefined', () => {
  const [, expect] = testAssign(inputMachine, 'input');
  expect({ expected: { name: '' } });
});

test.concurrent('Workflow', () => {
  const [, expect] = testAssign(inputMachine, 'input');
  const input = 'input';
  expect({
    expected: { name: 'any', input, editing: true },
    context: { name: 'any' },
    event: { type: 'INPUT', input },
  });
});
