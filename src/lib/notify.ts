// ~/lib/notify.ts
import { CreateEngagespotClient } from "@engagespot/node";

const engagespot = new CreateEngagespotClient({
  apiKey: process.env.ENGAGESPOT_API_KEY!,
  apiSecret: process.env.ENGAGESPOT_API_SECRET!,
});

export async function sendNotification(
  recipientId: string,
  title: string,
  message: string,
  url?: string
) {
  await engagespot.send({
    notification: {
      title,
      message,
      url,
    },
    sendTo: {
      recipients: [recipientId],
    },
  });
}
