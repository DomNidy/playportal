import * as admin from "firebase-admin";

/**
 * Creates a firebase admin app, if one exists, returns the already existing one
 * @returns {any} A `admin.app.App`from `firebase-admin` sdk
 */
export function getFirebaseAdminApp() {
  // If no firebase apps exist, create one
  if (admin.apps.length === 0) {
    console.log("No firebase apps exist, creating one!");
    const app = admin.initializeApp({
      credential: admin.credential.cert({
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
      } as admin.ServiceAccount),
      databaseURL: "https://multi-migrate-default-rtdb.firebaseio.com",
    });

    return app;
  } else {
    return admin.app();
  }
}
