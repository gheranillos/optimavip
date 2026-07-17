import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";

// Client-side uploads to Vercel Blob.
//
// IMPORTANT: this route receives TWO kinds of requests:
//  1. `blob.generate-client-token` — from the authenticated user's browser.
//  2. `blob.upload-completed` — a server-to-server callback from Vercel Blob
//     (NO user session). It is verified via the signed `x-vercel-signature`
//     header by `handleUpload`.
//
// Therefore auth MUST be checked inside `onBeforeGenerateToken` only — never at
// the top level, or the completion callback gets 401 and the upload hangs.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (
          !session?.user ||
          (session.user.role !== UserRole.ADMIN &&
            session.user.role !== UserRole.REALTOR)
        ) {
          throw new Error("No autorizado para subir archivos");
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
            "video/mp4",
            "video/webm",
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB (covers short videos)
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // Images are persisted when the property form is submitted, so nothing
        // to do here. Must stay defined for the completion callback to resolve.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
