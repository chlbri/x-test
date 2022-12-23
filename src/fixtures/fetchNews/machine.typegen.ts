
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"done.invoke.fetch": { type: "done.invoke.fetch"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.fetchNews.environment.API_KEY:invocation[0]": { type: "done.invoke.fetchNews.environment.API_KEY:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.fetchNews.environment.API_URL:invocation[0]": { type: "done.invoke.fetchNews.environment.API_URL:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.json": { type: "done.invoke.json"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.zod": { type: "done.invoke.zod"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.fetch": { type: "error.platform.fetch"; data: unknown };
"error.platform.fetchNews.environment.API_KEY:invocation[0]": { type: "error.platform.fetchNews.environment.API_KEY:invocation[0]"; data: unknown };
"error.platform.fetchNews.environment.API_URL:invocation[0]": { type: "error.platform.fetchNews.environment.API_URL:invocation[0]"; data: unknown };
"error.platform.json": { type: "error.platform.json"; data: unknown };
"error.platform.zod": { type: "error.platform.zod"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "fetchNews": "done.invoke.fetch";
"get_API_KEY": "done.invoke.fetchNews.environment.API_KEY:invocation[0]";
"get_API_URL": "done.invoke.fetchNews.environment.API_URL:invocation[0]";
"json": "done.invoke.json";
"zod": "done.invoke.zod";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "assignAPI_KEY": "done.invoke.fetchNews.environment.API_KEY:invocation[0]";
"assignAPI_URL": "done.invoke.fetchNews.environment.API_URL:invocation[0]";
"assignJSON": "done.invoke.json";
"assignNews": "done.invoke.zod";
"assignPagination": "done.invoke.zod";
"assignResponse": "done.invoke.fetch";
"buildURL": "QUERY";
"constructErrors": "";
"escaladeFetchError": "error.platform.fetch";
"escaladeJsonError": "error.platform.json";
"escaladeZodError": "error.platform.zod";
"escalateNoAPI_KEY": "error.platform.fetchNews.environment.API_KEY:invocation[0]";
"escalateNoAPI_URL": "error.platform.fetchNews.environment.API_URL:invocation[0]";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "fetchNews": "QUERY";
"get_API_KEY": "done.invoke.fetchNews.environment.API_URL:invocation[0]";
"get_API_URL": "xstate.init";
"json": "done.invoke.fetch";
"zod": "done.invoke.json";
        };
        matchesStates: "constructErrors" | "environment" | "environment.API_KEY" | "environment.API_URL" | "error" | "fetch" | "idle" | "json" | "success" | "zod" | { "environment"?: "API_KEY" | "API_URL"; };
        tags: never;
      }
  