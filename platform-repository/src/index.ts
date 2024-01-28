import init from "./bootstrap";
init();
import { onRequest } from "firebase-functions/v2/https";
import { app } from "./server";
export * from "./db/releases/onWriteRelease";
export const platformServer = onRequest(
  {
    memory: "512MiB",
    timeoutSeconds: 60,
    minInstances: 1,
    maxInstances: 3,
  },
  app
);
