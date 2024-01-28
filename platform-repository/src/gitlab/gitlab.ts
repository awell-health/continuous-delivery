import { environment } from "../environment";

const URL = "https://gitlab.com/api/v4/projects/41852705/trigger/pipeline";
export const gitlab = {
  triggerDeployment: async ({
    env,
    version,
    name,
    user,
    message,
  }: {
    env: string;
    version: string;
    name: string;
    user: string;
    message: string;
  }) => {
    const token = environment.gitlab.trigger_token;
    // eslint-disable-next-line max-len
    const params = `token=${token}&ref=main&variables[ENVIRONMENT]=${env}&variables[VERSION]=${version}&variables[NAME]=${name}&variables[AUTHOR]=${user}&variables[COMMIT_MESSAGE]=${message}`;
    const response = await fetch(`${URL}?${params}`, {
      method: "POST",
    });
    const data = await response.json();
    if (data.message) {
      throw new Error(data.message);
    }
  },
};
