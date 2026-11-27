/**
 * Right-sized copies of MSG's own photographs for plain <img> tags (the ones next/image can't wrap: book pages,
 * scroll scenes, carousels). The browser picks the smallest copy that fills the frame at the screen's density, from
 * Next's own image optimiser (the same one next/image uses), so a phone no longer decodes a 1,600 px original into a
 * 150 px frame. The original stays the fallback `src` and the largest choice. Widths are ones the optimiser allows by default.
 */
const WIDTHS = [256, 384, 640, 828, 1080];

export function fit(src: string, sizes: string): { srcSet?: string; sizes?: string } {
  if (!/^\/[^?#]+\.(webp|jpe?g|png)$/i.test(src)) return {};
  const u = encodeURIComponent(src);
  // the original (MSG's photos are 1,250-1,700 px wide) is the largest choice: nothing is ever upscaled
  return { srcSet: [...WIDTHS.map((w) => `/_next/image?url=${u}&w=${w}&q=75 ${w}w`), `${src} 1600w`].join(", "), sizes };
}
