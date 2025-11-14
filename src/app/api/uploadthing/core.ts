// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  /**
   * Signature uploads:
   *  - JPEG/PNG
   *  - Max 1MB
   */
  signature: f({ image: { maxFileSize: '1MB' } })
    .onUploadComplete(async ({ file }) => {
      console.log('✅ Signature uploaded:', file.ufsUrl);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;