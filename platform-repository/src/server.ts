import { initializeSlackApp } from "./slack-bolt";
import { releasesRouter } from "./routers";

export const app = initializeSlackApp();
app.disable("x-powered-by");
app.use("/releases", releasesRouter);
