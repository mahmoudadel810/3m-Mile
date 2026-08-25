import type { NextConfig } from 'next';

/**
 * The legacy 301s are NOT configured here: `redirects()` cannot match a non-ASCII
 * `source`, the same limitation that stops Next serving non-ASCII route directories.
 * They are handled as route params instead — see `src/data/routes.ts` → `legacyRedirects`.
 *
 * Output mode is standard, not `output: 'export'`. An export requires
 * `dynamicParams = false` everywhere, which the CMS-backed routes need set to true, and
 * it has nowhere to emit `permanentRedirect()`. Switching would mean re-homing those
 * redirects in the hosting layer and losing the image optimizer.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,

  // A stray package-lock.json in the user's home directory otherwise wins the
  // workspace-root inference and breaks build tracing.
  outputFileTracingRoot: import.meta.dirname,

  images: {
    formats: ['image/webp'],
    // Matches the real render widths measured across the three breakpoints.
    deviceSizes: [390, 640, 820, 1080, 1440, 1920],
    imageSizes: [64, 128, 180, 256, 400, 600],

    /**
     * All CMS media is served from Cloudinary. Without this, every admin-uploaded image
     * throws "hostname is not configured" at render time — which, since the CMS ships
     * empty, would be every image on the site.
     *
     * Scoped to the delivery host rather than a wildcard: the optimizer will fetch and
     * re-serve anything matched here, so a loose pattern turns the site into an open
     * image proxy.
     */
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
