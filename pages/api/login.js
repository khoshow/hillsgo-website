// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth, db } from "../../firebase/firebase"; // Adjust path as necessary
// import { collection, query, where, getDocs } from "firebase/firestore";
import nookies from "nookies";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  console.log("hUI");
  const { email, password, role } = req.body;

  // try {
  //   // Authenticate the user with Firebase
  //   const userCredential = await signInWithEmailAndPassword(
  //     auth,
  //     email,
  //     password
  //   );
  //   const user = userCredential.user;

  //   // Get the user's ID token
  //   const token = await user.getIdToken();
  //   console.log("tokem", token);

  //   // Set the token as an httpOnly cookie
  //   nookies.set({ res }, "token", token, {
  //     path: "/",
  //     maxAge: 30 * 24 * 60 * 60, // 30 days
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production", // Only secure in production
  //     sameSite: "Strict",
  //   });

  //   console.log("role", role);

  //   // Check user role and get additional details if necessary
  //   let redirectPath;
  //   if (role === "storeOwner") {
  //     const estoreRef = collection(db, "restaurants");
  //     const estoreQuery = query(estoreRef, where("ownerId", "==", user.uid));
  //     const querySnapshot = await getDocs(estoreQuery);

  //     if (querySnapshot.empty) {
  //       throw new Error("You are not registered as a store owner.");
  //     }
  //     // Get the store owner details
  //     const storeOwnerDetails = querySnapshot.docs[0].data();

  //     // Set additional user details as non-httpOnly cookies
  //     nookies.set({ res }, "storeOwnerName", user.name, {
  //       path: "/",
  //       maxAge: 30 * 24 * 60 * 60, // 30 days
  //     });

  //     nookies.set({ res }, "storeOwnerEmail", user.email, {
  //       path: "/",
  //       maxAge: 30 * 24 * 60 * 60, // 30 days
  //     });

  //     nookies.set({ res }, "storeOwnerID", user.userId, {
  //       path: "/",
  //       maxAge: 30 * 24 * 60 * 60, // 30 days
  //     });

  //     res.status(200).json({
  //       message: "Cookies set successfully",
  //       redirectPath: "/estores/dashboard",
  //     });
  //   } else if (role === "skilledWorker") {
  //     redirectPath = "/hire-skills/dashboard"; // Change as necessary
  //   } else {
  //     throw new Error("Invalid role specified.");
  //   }

  //   // Respond with a redirect path
  //   return res.status(200).json({ redirectPath });
  // } catch (error) {
  //   console.error("Login error:", error);
  //   return res.status(401).json({ error: error.message });
  // }
}
