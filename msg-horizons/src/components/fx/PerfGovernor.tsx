"use client";

import { useEffect } from "react";
import { watchFrameRate } from "@/lib/perf";

/** Starts the frame-rate watch (lib/perf): heavy motion steps down on a device that cannot keep up. Draws nothing. */
export default function PerfGovernor() {
  useEffect(() => watchFrameRate(), []);
  return null;
}
