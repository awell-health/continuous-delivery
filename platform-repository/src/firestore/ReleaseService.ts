import {
  Release,
  ReleaseEnvironment,
  ReleaseSchema,
  ReleaseStatus,
} from "../types";
import { Document } from "../types/Document";
import { db } from "./firestore";

const releaseCollection = db.collection("releases");

interface ReleaseService {
  getRelease: ({
    name,
    environment,
    version,
  }: Pick<
    Release,
    "name" | "environment" | "version"
  >) => Promise<Release | null>;
  getRecentReleases: (name: string) => Promise<Release[]>;
  getRollbackRelease: (release: Release) => Promise<string | null>;
  addOrUpdateRelease: (release: Release) => Promise<Document<Release>>;
}

export const releaseService: ReleaseService = {
  getRelease: async ({
    name,
    environment,
    version,
  }: Pick<Release, "name" | "environment" | "version">) => {
    const snapshot = await releaseCollection
      .where("name", "==", name)
      .where("environment", "==", environment)
      .where("version", "==", version)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return null;
    }
    return ReleaseSchema.parse(snapshot.docs[0].data());
  },
  getRecentReleases: async (name: string) => {
    const releaseDocs = await Promise.all(
      [
        ReleaseEnvironment.DEVELOPMENT,
        ReleaseEnvironment.SANDBOX,
        ReleaseEnvironment.PRODUCTION,
      ].map(async (env) => {
        const snapshot = await releaseCollection
          .where("name", "==", name)
          .where("environment", "==", env)
          .orderBy("date", "desc")
          .limit(1)
          .get();
        return snapshot;
      })
    );
    return releaseDocs.map((rel) => ReleaseSchema.parse(rel.docs[0].data()));
  },
  getRollbackRelease: async (release: Release) => {
    if (release.status === ReleaseStatus.SUCCESS) {
      return null;
    }
    const snapshot = await releaseCollection
      .where("name", "==", release.name)
      .where("status", "==", "success")
      .where("environment", "==", release.environment)
      .orderBy("date", "desc")
      .limit(1)
      .get();
    if (snapshot.empty) {
      return null;
    }
    return ReleaseSchema.parse(snapshot.docs[0].data()).version;
  },
  addOrUpdateRelease: async (
    releaseData: Release
  ): Promise<Document<Release>> => {
    const releasesSnap = await releaseCollection
      .where("name", "==", releaseData.name)
      .where("version", "==", releaseData.version)
      .where("environment", "==", releaseData.environment)
      .get();
    if (!releasesSnap.empty) {
      const releaseDoc = releasesSnap.docs[0];
      await releaseDoc.ref.update({
        status: releaseData.status,
        date: releaseData.date ?? new Date(),
      });
      return { ...releaseData, _id: releaseDoc.id };
    } else {
      const newDoc = releaseCollection.doc();
      await newDoc.set({
        ...releaseData,
        date: releaseData.date ?? new Date(),
      });
      return { ...releaseData, _id: newDoc.id };
    }
  },
};
