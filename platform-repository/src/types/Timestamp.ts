import { Timestamp } from "firebase-admin/firestore";
import z from "zod";

export const FirestoreTimestamp = z
  .object({
    seconds: z.number(),
    nanoseconds: z.number(),
  })
  .transform(({ seconds, nanoseconds }) =>
    new Timestamp(seconds, nanoseconds).toDate()
  );
