import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } from "../../config/config.service";

const isFirebaseConfigured = !!(FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY);

if (isFirebaseConfigured && !getApps().length) {
    initializeApp({
        credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
    });
} else if (!isFirebaseConfigured) {
    console.log("Firebase is not configured yet - push notifications are disabled");
}

export const sendPushNotification = async ({
    tokens,
    title,
    body,
}: {
    tokens: string[];
    title: string;
    body: string;
}) => {
    if (!isFirebaseConfigured || !tokens || tokens.length === 0) return;

    try {
        await getMessaging().sendEachForMulticast({
            tokens,
            notification: { title, body },
        });
    } catch (error) {
        console.log("Error sending push notification:", error);
    }
};