import { describe, test } from 'vitest';
import { inputMachine } from '../fixtures/input.machine';
import { testAction } from './_default';

describe('#1 -> Acceptance', () => {
  test.concurrent.fails('#1 -> Function not exists => fails', () => {
    const [acceptance] = testAction({
      machine: inputMachine,
      action: 'notExists' as any,
    });
    acceptance();
  });

  test.concurrent('#2 -> Custom Function => success', () => {
    const [acceptance] = testAction({
      machine: inputMachine,
      action: 'other',
    });
    acceptance();
  });
});

test.concurrent('#2 -> Workflow', () => {
  const [, expect] = testAction({
    machine: inputMachine,
    action: 'other',
  });
  return expect({ expected: 'POTHER' });
});
