import { FirebaseApp, getApp, initializeApp } from "firebase/app";

export function getFirebaseApp() {
  try {
    // Try to get the default app
    const app = getApp();
    return app;
  } catch (err) {
    // If we have an error getting default app, create one
    return initializeApp({
      apiKey: "AIzaSyAPczHoT5cJ1fxv4fk_fQjnRHaL8WXPX-o",
      authDomain: "multi-migrate.firebaseapp.com",
      projectId: "multi-migrate",
      storageBucket: "multi-migrate.appspot.com",
      messagingSenderId: "296730327999",
      appId: "1:296730327999:web:74c09b878bd58e8a28ff0a",
      measurementId: "G-V87LXV2M29",
    });
  }
}
