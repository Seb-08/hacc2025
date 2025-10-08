"use client";

import { useState } from "react";
import { useUploadThing } from "../../../lib/uploadthing";

export default function UploadingPage() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { startUpload } = useUploadThing("postImage");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select an image file.");
    if (rating === "" || rating < 0 || rating > 5)
      return alert("Rating must be between 0.0 and 5.0.");

    try {
      setLoading(true);

      // Upload file to UploadThing
      const uploaded = await startUpload([file]);
      const uploadedInfo = uploaded?.[0] as any;
      const imageUrl = uploadedInfo?.fileUrl ?? uploadedInfo?.url;
      if (!imageUrl) throw new Error("Upload failed — no URL returned.");

      // Save DB record via API route
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rating: Number(rating),
          imageUrl,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create post.");
      }

      alert("✅ Post created successfully!");
      setName("");
      setRating("");
      setFile(null);
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md bg-base-200 shadow-xl p-6 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Add New Post</h2>

        {/* Name Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter post name"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Rating Field (Decimal allowed) */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Rating (0.0 - 5.0)</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 4.5"
            min={0}
            max={5}
            step="0.1"
            className="input input-bordered w-full"
            value={rating === "" ? "" : String(rating)}
            onChange={(e) =>
              setRating(
                e.target.value === "" ? "" : parseFloat(e.target.value)
              )
            }
            required
          />
          <small className="text-gray-500 mt-1">
            You can enter decimals (e.g. 3.7 or 4.25)
          </small>
        </div>

        {/* Image Upload */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Image</span>
          </label>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
