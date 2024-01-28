import {
  Change,
  DocumentSnapshot,
  FirestoreEvent,
  onDocumentWritten,
} from "firebase-functions/v2/firestore";
import {
  ReleaseSnapshot,
  ReleaseSchema,
  Release,
  ReleaseStatus,
  ReleaseEnvironment,
} from "../../types";
import * as slack from "@slack/web-api";
import { makeReleaseBlocks } from "../../slack";
import { logger } from "firebase-functions/v1";

const channel = process.env.SLACK_RELEASE_CHANNEL ?? "";
const token = process.env.SLACK_BOT_TOKEN ?? "";
const statusChanged = (prev?: Release, next?: Release) =>
  next?.status !== undefined && prev?.status !== next?.status;

/**
 * This action is triggered when a release is created, updated, or deleted.
 *
 * On create, we send a slack message
 *
 * On update, we add to the thread (if the status is changed)
 *
 * On delete, we're currently doing nothing
 */
export const onWriteRelease = onDocumentWritten(
  "releases/{releaseId}",
  async (
    event: FirestoreEvent<
      Change<DocumentSnapshot> | undefined,
      { releaseId: string }
    >
  ) => {
    const change = event.data as Change<ReleaseSnapshot>;
    /**
     * DELETE
     */
    if (!change.after.exists) {
      logger.info("release delete, exiting...");
      return;
    }

    const newRelease = ReleaseSchema.parse(change.after.data());
    const slackClient = new slack.WebClient(token);
    /**
     * NEW
     */
    if (!change.before.exists) {
      const resp = await slackClient.chat.postMessage({
        blocks: makeReleaseBlocks(newRelease),
        channel,
        text: "Release triggered",
      });
      await change.after.ref.update({ slack_message_ts: resp.ts });
      return;
    }

    /**
     * UPDATE
     */
    const oldRelease = ReleaseSchema.parse(change.before.data());
    if (statusChanged(oldRelease, newRelease) && newRelease.slack_message_ts) {
      await slackClient.chat.postMessage({
        blocks: makeReleaseBlocks(newRelease),
        channel,
        thread_ts: newRelease.slack_message_ts,
        text: `Release updated with status ${newRelease.status}`,
      });
    }
    /**
     * If a production release fails then we're going to @dev.
     */
    if (
      newRelease.status === ReleaseStatus.FAILED &&
      newRelease.environment === ReleaseEnvironment.PRODUCTION
    ) {
      await slackClient.chat.postMessage({
        channel,
        thread_ts: newRelease.slack_message_ts,
        text:
          "Pinging <!subteam^S04LXS3R2P2> - " +
          `Production release (${newRelease.version}) failed, ` +
          "please check the pipeline.",
      });
    }
  }
);
