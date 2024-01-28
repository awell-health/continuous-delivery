import { HomeView, KnownBlock } from "@slack/bolt";
import { Release } from "../types";
import {
  PromoteActionBlock,
  RollbackActionBlock,
  makeReleaseBlocks,
  AppSelectBlock,
} from "./ReleaseBlock";

interface ReleaseProps {
  name: string;
  releases: Release[];
  rollbacks: (string | null)[];
}

const homeView = (props: ReleaseProps): HomeView => {
  const blocks: KnownBlock[] = [];
  const { name, releases, rollbacks } = props;
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `${name}`,
      emoji: true,
    },
  });
  blocks.push(AppSelectBlock);
  if (releases.length !== 3) throw new Error("Expected 3 releases");
  const [development, sandbox, production] = releases;
  const [devRollback, sandRollback, prodRollback] = rollbacks;
  const devBlock: KnownBlock[] = makeReleaseBlocks(development);
  const sandBlock: KnownBlock[] = makeReleaseBlocks(sandbox);
  const prodBlock: KnownBlock[] = makeReleaseBlocks(production);
  const divider: KnownBlock = {
    type: "divider",
  };
  /**
   * Each of these control statements below conditionally add an action button
   * if a promote or rollback action is available. You'll notice the sandbox
   * environment will be promoted to the version in development and production
   * can be promoted to sandbox or rolled back to a previous version of prod,
   * whereas the rollbacks will go back to the most recent successful release
   * of that same environment.
   *
   * Rollbacks come before the promotions because they show up later in the
   * slack message
   */
  /**
   * DEVELOPMENT
   */
  if (devRollback) {
    devBlock.splice(1, 0, RollbackActionBlock(development, devRollback));
  }
  /**
   * SANDBOX
   */
  const safeDevVersion = devRollback ?? development.version;
  if (sandRollback) {
    sandBlock.splice(1, 0, RollbackActionBlock(sandbox, sandRollback));
  }
  if (sandbox.version !== safeDevVersion) {
    sandBlock.splice(1, 0, PromoteActionBlock(sandbox, safeDevVersion));
  }
  /**
   * PRODUCTION
   */
  const safeSandboxVersion = sandRollback ?? sandbox.version;
  if (prodRollback) {
    prodBlock.splice(1, 0, RollbackActionBlock(production, prodRollback));
  }
  if (production.version !== safeSandboxVersion) {
    prodBlock.splice(1, 0, PromoteActionBlock(production, safeSandboxVersion));
  }
  blocks.push(
    divider,
    ...devBlock,
    divider,
    ...sandBlock,
    divider,
    ...prodBlock,
    divider
  );

  return {
    type: "home",
    blocks,
  };
};

export default homeView;
