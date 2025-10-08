import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "../server/db/uploadthing";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
