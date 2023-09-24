import { initFirestore } from "@auth/firebase-adapter";
import { ServiceAccount, cert } from "firebase-admin/app";

export const firestore = initFirestore({
  credential: cert({
    type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE,
    project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
    private_key_id: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
    client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
    auth_uri: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
    token_uri: process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url:
      process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
  } as ServiceAccount),
});

/**
 * This function updates transfer logs with track log objects
 *
 * By track log objects we are referring to the "matching" or "not matching" kind of logs that contain data about songs that failed or passed the track resolution stage
 *
 * We do this because we have to fetch data from spotify / youtube api to read the track metadata, so in order to avoid duplicate data fetching, we store the data on firestore.
 */
export async function updateTransferLogWithTrackLogObjects() {}
