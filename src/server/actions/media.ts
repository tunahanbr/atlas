"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SUPABASE_MEDIA_BUCKET } from "@/lib/supabase/config";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadImage(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image first." };
  const extension = TYPES[file.type];
  if (!extension) return { ok: false, error: "Use a JPEG, PNG or WebP image." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Images must be 5 MB or smaller." };

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Media storage is not configured." };

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) return { ok: false, error: "Media storage is unavailable." };
  const bucket = buckets.find((entry) => entry.name === SUPABASE_MEDIA_BUCKET);
  if (!bucket) {
    const { error } = await admin.storage.createBucket(SUPABASE_MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: Object.keys(TYPES),
    });
    if (error) return { ok: false, error: "Could not initialize media storage." };
  } else if (!bucket.public) {
    const { error } = await admin.storage.updateBucket(SUPABASE_MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: Object.keys(TYPES),
    });
    if (error) return { ok: false, error: "Media storage must be a public bucket." };
  }

  const path = `${session.user.id}/${randomUUID()}.${extension}`;
  const { error } = await admin.storage.from(SUPABASE_MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return { ok: false, error: "Upload failed. Please try again." };
  const { data } = admin.storage.from(SUPABASE_MEDIA_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
