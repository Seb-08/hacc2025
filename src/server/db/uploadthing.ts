import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  postImage: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      // file.url or file.fileUrl — UploadThing logs it server-side
      console.log("✅ Upload complete:", file);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;