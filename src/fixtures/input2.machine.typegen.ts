// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    '': { type: '' };
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
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    input: 'INPUT';
    resetEdititng: 'xstate.after(THROTTLE_TIME)#(machine).idle';
    sendParentInput: 'INPUT';
    startQuery: '';
  };
  eventsCausingServices: {
    fetch: 'xstate.after(THROTTLE_TIME)#(machine).idle';
  };
  eventsCausingGuards: {
    isEditing: 'xstate.after(THROTTLE_TIME)#(machine).idle';
  };
  eventsCausingDelays: {
    THROTTLE_TIME: '' | 'INPUT' | 'xstate.init';
  };
  matchesStates: 'done' | 'idle';
  tags: 'busy';
}
