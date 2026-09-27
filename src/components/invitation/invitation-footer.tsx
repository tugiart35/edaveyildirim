import { Hairline, Reveal } from "@/components/invitation/primitives";
import { monogram } from "@/lib/utils/wedding";
import type { Wedding } from "@/types";

/** Kapanış: monogram ve kısa bir veda satırı. */
export function InvitationFooter({ wedding }: { wedding: Wedding }) {
  return (
    <footer className="relative z-50 bg-ivory px-6 py-20 sm:py-24">
      <Reveal className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="text-[0.7rem] tracking-[0.5em] text-gold">
          {monogram(wedding)}
        </p>
        <Hairline className="mt-6 w-10" />
        <p className="mt-6 text-xs leading-relaxed text-stone">
          Sevgilerimizle
        </p>
      </Reveal>
    </footer>
  );
}
