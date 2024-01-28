import * as dotenv from "dotenv";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      rawBody: Buffer;
      requestId: string;
    }
  }
}

const init = () => {
  dotenv.config();
};

export default init;
