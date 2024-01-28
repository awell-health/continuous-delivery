/* eslint-disable indent */
import { ActionsBlock, KnownBlock, MrkdwnElement } from "@slack/web-api";
import { Release, ReleaseStatus } from "../types";

const makeTime = (d: Date): string => {
  const unixTimestamp = Math.floor(d.getTime() / 1000);
  return `<!date^${unixTimestamp}^{date_num}, {time_secs}|${d.toISOString()}>`;
};

const makeStatus = (s: ReleaseStatus): string => {
  switch (s) {
    case "success": {
      return ":white_check_mark:";
    }
    case "failed": {
      return ":x:";
    }
    case "pending": {
      return ":hourglass_flowing_sand:";
    }
    default: {
      return s;
    }
  }
};

type ReleaseBlockProps = Pick<Release, "name" | "version" | "environment">;

const serializeTriggerReleaseButton = (release: ReleaseBlockProps): string => {
  return JSON.stringify({
    name: release.name,
    version: release.version,
    environment: release.environment,
  });
};

export const deserializeTriggerReleaseButton = (
  value: string
): ReleaseBlockProps => {
  return JSON.parse(value);
};

const makeTriggerReleaseButton = (
  release: ReleaseBlockProps,
  buttonType: "promote" | "rollback"
): ActionsBlock => {
  return {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text:
            buttonType === "promote"
              ? `Promote to ${release.version}`
              : `Rollback to ${release.version}`,
          emoji: true,
        },
        style: buttonType === "promote" ? "primary" : "danger",
        value: serializeTriggerReleaseButton(release),
        action_id: "trigger_release",
      },
    ],
  };
};

export const PromoteActionBlock = (
  release: ReleaseBlockProps,
  version: string
): ActionsBlock => {
  return makeTriggerReleaseButton({ ...release, version }, "promote");
};

export const RollbackActionBlock = (
  release: ReleaseBlockProps,
  version: string
): ActionsBlock => {
  return makeTriggerReleaseButton({ ...release, version }, "rollback");
};

export type ReleaseBlock = (release: Release) => KnownBlock[];
export const makeReleaseBlocks: ReleaseBlock = (release: Release) => {
  const contextElements: MrkdwnElement[] = [
    {
      type: "mrkdwn",
      text: `_${makeTime(release.date)}_`,
    },
  ];

  if (release.url) {
    contextElements.push({
      type: "mrkdwn",
      text: `<${release.url}|View pipeline>`,
    });
  }
  return [
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `Name: *${release.name}*`,
        },
        {
          type: "mrkdwn",
          text: `Environment: *${release.environment}*`,
        },
        {
          type: "mrkdwn",
          text: `Version: ${release.version}`,
        },
        {
          type: "mrkdwn",
          text: `Status: ${makeStatus(release.status)}`,
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${release.author ?? "(no author)"} - ${
          release.notes ?? "(no commit message)"
        }`,
      },
    },
    {
      type: "context",
      elements: contextElements,
    },
  ];
};

export const AppSelectBlock: KnownBlock = {
  type: "actions",
  elements: [
    {
      type: "static_select",
      placeholder: {
        type: "plain_text",
        text: "Select an application",
        emoji: true,
      },
      options: [
        {
          text: {
            type: "plain_text",
            text: "Awell Platform",
            emoji: true,
          },
          value: "awell-platform",
        },
        {
          text: {
            type: "plain_text",
            text: "Extensions",
            emoji: true,
          },
          value: "extensions",
        },
      ],
      // initial_option: {
      //   text: {
      //     type: "plain_text",
      //     text: "Awell Platform",
      //     emoji: true,
      //   },
      //   value: "awell-platform",
      // },
      action_id: "app_select",
    },
  ],
};
