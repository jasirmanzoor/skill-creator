/**
 * The dark stage that live tracking and the plan builder were designed on (it used to be their shared deck): deep
 * teal with a faint grid, so their white type and glass panels read the same now that each has a chapter of its own.
 */
export default function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="dark" className="on-dark relative overflow-hidden bg-deep/[0.9] pt-20 text-white lg:pt-24">
      <div className="relative">{children}</div>
    </div>
  );
}
