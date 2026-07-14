import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob public URLs
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Cloudinary (optional, if image transformations are needed later)
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Google user content / maps static (avatars, etc.)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Prisma 7 generated client + pg driver should not be bundled by Turbopack.
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
};

export default withNextIntl(nextConfig);
