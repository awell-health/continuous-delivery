/* eslint-disable quotes */
/* eslint-disable max-len */
import {
  App,
  ExpressReceiver,
  AppOptions,
  BlockButtonAction,
  AllMiddlewareArgs,
  BlockStaticSelectAction,
} from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import { Application } from "express";
import { SlackService, deserializeTriggerReleaseButton } from "./slack";
import { gitlab } from "./gitlab";

export const initializeSlackApp: () => Application = () => {
  const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET ?? "",
  });
  const appConfig: AppOptions = {
    token: process.env.SLACK_BOT_TOKEN,
    processBeforeResponse: true, // Important for Cloud Functions
    receiver, // So we can add other routes and middleware
  };

  const app = new App(appConfig);
  app.client = new WebClient(process.env.SLACK_BOT_TOKEN);

  /**
   * Here you could add middleware to authenticate requests so
   * clicking a slack button is only available to certain users
   * or usergroups
   */
  const exampleMiddleware = (args: AllMiddlewareArgs) => {
    args.next();
  };
  receiver.router.post("/slack/events", exampleMiddleware);

  app.event<"app_home_opened">("app_home_opened", async ({ event, client }) => {
    const svc = new SlackService(client, event.user);
    await svc.updateHome("awell-platform");
  });

  app.action<BlockButtonAction>(
    "trigger_release",
    async ({ ack, action, body }) => {
      await ack();
      const user = body.user.name ?? "unknown";
      const {
        environment: releaseEnv,
        version,
        name,
      } = deserializeTriggerReleaseButton(action.value);
      /**
       * promote/rollback is dependent on text rather than the action's value
       * ¯\_(ツ)_/¯
       */
      const isPromotion = action.text.text.startsWith("Promote");
      const message = isPromotion
        ? "Promotion from slack"
        : "Rollback from slack";
      await gitlab.triggerDeployment({
        env: releaseEnv,
        version,
        name,
        user,
        message,
      });
    }
  );

  app.action<BlockStaticSelectAction>(
    "app_select",
    async ({ ack, client, action, body }) => {
      await ack();
      const user = body.user.id ?? "unknown";
      const svc = new SlackService(client, user);
      await svc.updateHome(action.selected_option.value);
    }
  );

  // to keep slack from complaining...
  app.action("view_release_url", async ({ ack }) => {
    await ack();
  });
  return receiver.app;
};
