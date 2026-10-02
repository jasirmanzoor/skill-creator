"use client";

import { track } from "@/lib/analytics";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: string;
  props?: Record<string, string | number | boolean>;
};

/** Anchor that records a conversion event before navigating. */
export default function TrackedLink({ event, props, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        track(event, props);
        onClick?.(e);
      }}
    />
  );
}
