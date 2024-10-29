// // firebaseAdmin.js
// import admin from "firebase-admin";

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//     }),
//   });
// }

// export const verifyIdToken = async (token) => {
//   console.log("token verify", token);

//   try {
//     return await admin.auth().verifyIdToken(token);
//   } catch (error) {
//     console.error("Token verification error:", error);
//     throw error;
//   }
// };
