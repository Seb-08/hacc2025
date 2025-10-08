import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "../../../server/db/uploadthing";

// Export routes for UploadThing to handle
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
