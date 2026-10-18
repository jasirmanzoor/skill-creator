import { InteractiveStarfieldHero } from "@/components/ui/starfield-hero";

const settings = {
  particleCount: 300,
  interactionRadius: 140,
  speed: 0.5,
  particleColor: "#60a5fa",
  activeColor: "#ffffff",
};

export default function Demo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <div className="h-screen w-screen">
      <InteractiveStarfieldHero {...s} className="h-full min-h-full rounded-none" />
    </div>
  );
}
