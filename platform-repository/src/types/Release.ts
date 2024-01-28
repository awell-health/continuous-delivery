import { isValid, parseISO } from "date-fns";
import z from "zod";
import { FirestoreTimestamp } from "./Timestamp";
import { firestore } from "firebase-admin";

export enum ReleaseEnvironment {
  PRODUCTION = "production",
  SANDBOX = "sandbox",
  DEVELOPMENT = "development",
}

export enum ReleaseStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export const ReleaseSchema = z.object({
  name: z.string(),
  version: z.string(),
  date: z.union([z.string(), FirestoreTimestamp]).transform((date) => {
    if (typeof date === "object") {
      return date;
    }
    if (!isValid(parseISO(date))) {
      return new Date();
    } else {
      return parseISO(date);
    }
  }),
  environment: z.nativeEnum(ReleaseEnvironment),
  status: z.nativeEnum(ReleaseStatus),
  slack_message_ts: z.string().optional(),
  author: z.string().optional(),
  url: z.string().optional(),
  notes: z.string().optional(),
});

export type Release = z.infer<typeof ReleaseSchema>;
export type ReleaseSnapshot = firestore.DocumentSnapshot<Release>;
