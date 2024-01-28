import { Firestore } from "@google-cloud/firestore";

export const db = new Firestore({
  projectId: "awell-turtle-pond", // Replace with your actual project ID
  //   keyFilename: "./sa.json"
  ignoreUndefinedProperties: true,
});
