import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";

// Client-side uploads to Vercel Blob. Only admins/realtors can request a token.
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.ADMIN &&
      session.user.role !== UserRole.REALTOR)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
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
      }),
      onUploadCompleted: async () => {
        // Optional: persist blob metadata here in phase 2.
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
