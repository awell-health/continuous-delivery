import * as express from "express";
import { Release, ReleaseSchema } from "../types";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { db, releaseService } from "../firestore";
import { Query } from "firebase-admin/firestore";

const middleware = [express.json() /** add auth / logging / etc */];
const releasesCollection = db.collection("releases");
interface ReleaseResponse extends Release {
  _id: string;
}

interface ReleaseRequest
  extends Partial<
    Pick<Release, "name" | "environment" | "version" | "status">
  > {
  limit?: number;
}

const router = express.Router();
router.use(...middleware);
router.get(
  "",
  async (
    req: express.Request<
      {},
      { releases: ReleaseResponse[] },
      {},
      ReleaseRequest
    >,
    res: express.Response<{ releases: ReleaseResponse[] }>
  ) => {
    let releasesQuery: Query = releasesCollection;
    if (req.query.version) {
      releasesQuery = releasesQuery.where("version", "==", req.query.version);
    }
    if (req.query.name) {
      releasesQuery = releasesQuery.where("name", "==", req.query.name);
    }
    if (req.query.status) {
      releasesQuery = releasesQuery.where("status", "==", req.query.status);
    }
    if (req.query.environment) {
      releasesQuery = releasesQuery.where(
        "environment",
        "==",
        req.query.environment
      );
    }
    if (req.query.limit) {
      releasesQuery = releasesQuery.limit(Number(req.query.limit));
    }
    const releasesSnap = await releasesQuery.orderBy("date", "desc").get();
    const releases = releasesSnap.docs.map((doc) => {
      return { ...(doc.data() as Release), _id: doc.id };
    });
    res.json({ releases });
  }
);

router.get("/:name", async (req: express.Request, res: express.Response) => {
  const releaseName = req.params.name;
  const releases = await releaseService.getRecentReleases(releaseName);
  res.json({ releases });
});

/**
 * This endpoint notifies of a new release in infrastructure
 */
router.post("", async (req: express.Request, res: express.Response) => {
  try {
    const releaseData = ReleaseSchema.parse(req.body);
    const release = await releaseService.addOrUpdateRelease(releaseData);
    return res.status(201).json(release);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: fromZodError(err) });
    } else {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
});

export default router;
