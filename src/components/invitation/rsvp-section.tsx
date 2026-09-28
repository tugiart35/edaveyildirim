import { RsvpForm } from "@/components/invitation/rsvp-form";
import type { GuestWithRsvp, Wedding } from "@/types";

/**
 * Davetiyenin RSVP kartı (şartname §13).
 *
 * Soruyu çizim soruyorsa tipografik başlık tekrarlanmaz — aynı soruyu
 * iki kez sormuş olurduk. Çizim yoksa yazılı başlık devreye girer.
 *
 * Çizim forma prop olarak geçer, burada çizilmez: ayrıntılar girilirken
 * küçülmesi gerekir (bkz. `RsvpForm`) ve o an hangi adımda olunduğunu
 * yalnızca form bilir.
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
      {wedding.rsvpImage ? null : (
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
        image={wedding.rsvpImage}
        guest={{
          token: guest.token,
          invitationLimit: guest.invitationLimit,
          rsvp: guest.rsvp,
        }}
      />
    </div>
  );
}
