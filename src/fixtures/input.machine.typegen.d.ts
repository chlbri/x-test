// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    '': { type: '' };
    'error.platform.(machine).done:invocation[0]': {
      type: 'error.platform.(machine).done:invocation[0]';
      data: unknown;
    };
    'xstate.after(THROTTLE_TIME)#(machine).idle': {
      type: 'xstate.after(THROTTLE_TIME)#(machine).idle';
    };
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {
    fetch: 'done.invoke.(machine).done:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    escalateError: 'error.platform.(machine).done:invocation[0]';
    input: 'INPUT';
    other: 'INPUT';
    resetEdititng: 'xstate.after(THROTTLE_TIME)#(machine).idle';
    sendParentInput: 'INPUT';
    startQuery: '';
  };
  eventsCausingDelays: {
    CUSTOM_DELAY: 'xstate.after(THROTTLE_TIME)#(machine).idle';
    THROTTLE_TIME: '' | 'INPUT' | 'xstate.init';
  };
  eventsCausingGuards: {
    isEditing: 'xstate.after(THROTTLE_TIME)#(machine).idle';
  };
  eventsCausingServices: {
    fetch: 'xstate.after(THROTTLE_TIME)#(machine).idle';
  };
  matchesStates: 'done' | 'idle';
  tags: 'busy';
}
