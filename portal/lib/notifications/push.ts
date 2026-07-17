import webpush from "web-push";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type PushMessage = { title: string; body: string; url?: string };

export async function sendPushNotification(message: PushMessage) {
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!privateKey) return;

  webpush.setVapidDetails(
    "mailto:admin@501elitebaseball.com",
    "BJhWPgWNbi-Ib2CquTUb5jCFxLob5Gc_b3HVGmZiggeNshHeAx9QMZS08Ojj4MXU8qdZATPmYv4E3assWrgMRYg",
    privateKey,
  );

  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("push_subscriptions")
    .select("id,endpoint,p256dh,auth")
    .eq("active", true);

  await Promise.allSettled(
    (data ?? []).map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(message),
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("push_subscriptions").update({ active: false }).eq("id", subscription.id);
        }
      }
    }),
  );
}
