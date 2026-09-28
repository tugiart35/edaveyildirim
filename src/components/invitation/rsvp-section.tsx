import { RsvpForm } from "@/components/invitation/rsvp-form";
import type { GuestWithRsvp } from "@/types";

/** Davetiyenin RSVP kartının içeriği (şartname §13). */
export function RsvpSection({ guest }: { guest: GuestWithRsvp }) {
  return (
    <div className="flex flex-col items-center text-center">
      <h3 className="type-display text-3xl text-charcoal sm:text-4xl">
        Aramızda olacak mısınız?
      </h3>

      <p className="mt-6 max-w-sm text-balance text-sm leading-loose text-graphite">
        Planlamamızı yapabilmemiz için katılım durumunuzu bildirmenizi rica
        ederiz.
      </p>

      <RsvpForm
        guest={{
          token: guest.token,
          invitationLimit: guest.invitationLimit,
          rsvp: guest.rsvp,
        }}
      />
    </div>
  );
}
