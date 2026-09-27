import { Reveal } from "@/components/invitation/primitives";
import { RsvpForm } from "@/components/invitation/rsvp-form";
import type { GuestWithRsvp } from "@/types";

/** Davetiyenin RSVP kartının içeriği (şartname §13). */
export function RsvpSection({ guest }: { guest: GuestWithRsvp }) {
  return (
    <Reveal className="flex flex-col items-center text-center">
      <h3 className="font-display text-3xl font-light text-charcoal sm:text-4xl">
        Aramızda olacak mısınız?
      </h3>

      <p className="mt-6 max-w-sm text-balance text-sm leading-loose text-graphite">
        Planlamamızı yapabilmemiz için katılım durumunuzu bildirmenizi rica
        ederiz.
      </p>

      <RsvpForm guest={guest} />
    </Reveal>
  );
}
