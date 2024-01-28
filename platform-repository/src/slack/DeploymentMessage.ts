/* eslint-disable valid-jsdoc */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
/* eslint-disable max-len */
import { Deployment } from "../types";
import { type ReleaseBlock } from "./ReleaseBlock";

/** @deprecated Use the {@link ReleaseBlock}*/
const deploymentMessage = ({
  name: name,
  url,
  version: version,
  status,
  echoes_deployment_id: echoes_deployment_id,
}: {
  name: string;
  url: string;
  version: string;
  status?: Deployment["status"];
  echoes_deployment_id: string;
}) => {
  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `A new release has been deployed:\n\nApplication:\t*${name}*\n\nRelease tag:\t${version}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Status:\t\t\t${
            status === "success"
              ? ":white_check_mark: *Success*"
              : status === "failure"
              ? ":x: *Failure*"
              : ":stopwatch: *Pending*"
          }`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          // eslint-disable-next-line quotes
          text:
            status === "pending"
              ? "Manually update the deployment status below"
              : `_Status updated at <!date^${unixTimestamp}^{date_num}, {time_secs}|${date.toISOString()}>_`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Success",
              emoji: true,
            },
            style: "primary",
            action_id: "update_release_success",
            value: echoes_deployment_id,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Failed",
              emoji: true,
            },
            style: "danger",
            action_id: "update_release_failure",
            value: echoes_deployment_id,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View release",
              emoji: true,
            },
            url,
            action_id: "view_release_url",
          },
        ],
      },
    ],
  };
};
export default deploymentMessage;
