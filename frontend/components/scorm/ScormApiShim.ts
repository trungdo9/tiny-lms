export type ScormHandlers = {
  getValue: (key: string) => string;
  setValue: (key: string, value: string) => string;
  commit: () => string;
  finish: () => string;
};

export function createScorm12Api(handlers: ScormHandlers) {
  return {
    LMSInitialize: (_: string) => 'true',
    LMSFinish: (_: string) => handlers.finish(),
    LMSGetValue: (key: string) => handlers.getValue(key),
    LMSSetValue: (key: string, value: string) => handlers.setValue(key, value),
    LMSCommit: (_: string) => handlers.commit(),
    LMSGetLastError: () => '0',
    LMSGetErrorString: (_: string) => '',
    LMSGetDiagnostic: (_: string) => '',
  };
}

export function createScorm2004Api(handlers: ScormHandlers) {
  return {
    Initialize: (_: string) => 'true',
    Terminate: (_: string) => handlers.finish(),
    GetValue: (key: string) => handlers.getValue(key),
    SetValue: (key: string, value: string) => handlers.setValue(key, value),
    Commit: (_: string) => handlers.commit(),
    GetLastError: () => '0',
    GetErrorString: (_: string) => '',
    GetDiagnostic: (_: string) => '',
  };
}
