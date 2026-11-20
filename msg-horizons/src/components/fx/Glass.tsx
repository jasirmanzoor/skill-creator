/**
 * Glass is retired in the Industrial Intelligence system: bars and panels are solid surfaces with a hairline rule.
 * The component and hook stay so existing bars keep compiling; both now say "no glass".
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for the bars that still pass a radius
export default function Glass(_props: { radius?: number; frost?: number }) {
  return null;
}

export const useGlass = () => false;
