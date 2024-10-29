// // lib/withAuth.js
// import { useEffect } from "react";
// import { useRouter } from "next/router";
// import { auth } from "../firebase/firebase";
// import { onAuthStateChanged } from "firebase/auth";

// const withAuth = (WrappedComponent) => {
//   return (props) => {
//     const router = useRouter();

//     useEffect(() => {
//       const unsubscribe = onAuthStateChanged(auth, (user) => {
//         if (!user) {
//           router.push("/auth/signin"); // Redirect to login if not authenticated
//         }
//       });

//       return () => unsubscribe(); // Cleanup subscription
//     }, [router]);

//     return <WrappedComponent {...props} />;
//   };
// };

// export default withAuth;
