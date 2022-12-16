import { describe, test } from 'vitest';
import { inputMachine } from '../fixtures/input.machine';
import { testEscalate } from './escalate';
import { testSend } from './send';

describe('#1 -> Acceptance', () => {
  test.concurrent.fails('#1 -> Function not exists => fails', () => {
    const [acceptance] = testEscalate(inputMachine, 'notExists' as any);
    acceptance();
  });

  test.concurrent('#2 -> Escalate Function => success', () => {
    const [acceptance] = testSend(inputMachine, 'escalateError');
    acceptance();
  });
});

test.concurrent('#2 -> Workflow', () => {
  const [, expect] = testEscalate(inputMachine, 'escalateError');
  return expect('ERROR');
});
