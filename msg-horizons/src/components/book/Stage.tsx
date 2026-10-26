/**
 * The dark stage that live tracking and the plan builder were designed on (it used to be their shared deck): deep
 * teal with a faint grid, so their white type and glass panels read the same now that each has a chapter of its own.
 */
export default function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="dark" className="on-dark relative overflow-hidden bg-deep/[0.9] pt-20 text-white lg:pt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_0%,rgba(201,150,46,0.20),transparent_70%),radial-gradient(50%_45%_at_0%_100%,rgba(11,125,54,0.16),transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(80%_70%_at_50%_30%,#000,transparent)]" />
      <div className="relative">{children}</div>
    </div>
  );
}
