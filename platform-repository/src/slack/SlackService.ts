/* eslint-disable quotes */
/* eslint-disable max-len */
import { WebClient } from "@slack/web-api";
import homeView from "./HomeBlocks";
import { releaseService } from "../firestore";
export class SlackService {
  client: WebClient;
  userId: string;

  nameMap: Record<string, string> = {
    "awell-platform": "Awell Platform",
    extensions: "Extensions",
  };

  public constructor(client: WebClient, userId: string) {
    this.client = client;
    this.userId = userId;
  }

  async updateHome(appName: string) {
    const releases = await releaseService.getRecentReleases(appName);
    const rollbacks = await Promise.all(
      releases.map((release) => releaseService.getRollbackRelease(release))
    );
    const obj = {
      name: this.nameMap[appName],
      releases,
      rollbacks,
    };
    const view = homeView(obj);
    await this.client.views.publish({
      user_id: this.userId,
      view,
    });
  }

  async blankHome() {
    await this.client.views.publish({
      user_id: this.userId,
      view: {
        type: "home",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Sorry, you don't have permission to view this screen.",
            },
          },
        ],
      },
    });
  }
}
