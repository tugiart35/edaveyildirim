import { RsvpForm } from "@/components/invitation/rsvp-form";
import type { GuestWithRsvp, Wedding } from "@/types";

/**
 * Davetiyenin RSVP kartı (şartname §13).
 *
 * Soruyu çizim soruyorsa tipografik başlık tekrarlanmaz — aynı soruyu
 * iki kez sormuş olurduk. Çizim yoksa yazılı başlık devreye girer.
 */
export function RsvpSection({
  guest,
  wedding,
}: {
  guest: GuestWithRsvp;
  wedding: Wedding;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {wedding.rsvpImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={wedding.rsvpImage}
          alt="Aramızda olacak mısınız?"
          loading="lazy"
          decoding="async"
          className="mb-2 h-auto w-auto max-h-[min(34vh,18rem)] max-w-full object-contain"
        />
      ) : (
        <>
          <h3 className="type-display text-3xl text-charcoal sm:text-4xl">
            Aramızda olacak mısınız?
          </h3>
          <p className="mt-6 max-w-sm text-balance text-sm leading-loose text-graphite">
            Planlamamızı yapabilmemiz için katılım durumunuzu bildirmenizi rica
            ederiz.
          </p>
        </>
      )}

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
