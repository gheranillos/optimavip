import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";

// Client-side uploads to Vercel Blob.
//
// We intentionally DO NOT define `onUploadCompleted`. That callback makes the
// browser's `upload()` wait for a server-to-server confirmation from Vercel
// Blob back to this route; if that callback can't complete (deployment
// protection, cold start, etc.) the upload hangs forever. We persist images
// when the property form is submitted, so the callback isn't needed.
//
// Auth is enforced in `onBeforeGenerateToken` (runs only for the token request,
// which comes from the authenticated browser).
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
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      // No onUploadCompleted on purpose (see note above).
    } as Parameters<typeof handleUpload>[0]);

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
