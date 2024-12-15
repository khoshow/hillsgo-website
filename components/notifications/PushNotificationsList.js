import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebase/firebase"; // Import your Firestore config
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useUser } from "../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import EstoreLayout from "@/components/layout/EstoreLayout"; // Assuming you have a layout for Estore
import Estore from "@/components/auth/Estore";

export default function MyNotifications() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const storage = getStorage();

  useEffect(() => {
    if (userLoading) return;
    const fetchNotifications = async () => {
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      try {
        const notificationsQuery = query(
          collection(db, "notifications")
          //   where("ownerId", "==", user.uid) // Fetch notifications created by the logged-in user
        );

        const querySnapshot = await getDocs(notificationsQuery);
        const notificationList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(notificationList); // Update state with fetched notifications
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, router]);
  const handleDelete = async (notificationId, imageUrls) => {
    const confirmed = confirm(
      "Are you sure you want to delete this notification?"
    );
    if (!confirmed) return;

    try {
      // Delete notification document from Firestore
      await deleteDoc(doc(db, "notifications", notificationId));
      // Delete each image from Firebase Storage
      if (imageUrls) {
        const deletePromises = imageUrls.map(async (url) => {
          const imageName = decodeURIComponent(
            url.substring(url.lastIndexOf("/") + 1, url.indexOf("?"))
          );

          const imageRef = ref(storage, `${imageName}`);
          await deleteObject(imageRef);
        });
        await Promise.all(deletePromises);
      }

      // Update local state to remove deleted notification
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );

      alert("Notification deleted successfully!");
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete the notification.");
    }
  };
  if (loading)
    return (
      <>
        <p>Loading...</p>
      </>
    );
  console.log("Notification", notifications);

  return (
    <>
      <div style={styles.container}>
        <h1 style={styles.heading}>Notifications</h1>
        <div style={styles.notificationGrid}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} style={styles.notificationCard}>
                <img
                  src={notification.image} // Assuming first image is used for the card
                  alt={notification.name}
                  style={styles.image}
                />
                <h3 style={styles.notificationName}>{notification.title}</h3>

                <p style={styles.notificationDescription}>
                  {notification.body}
                </p>
                <p style={styles.notificationDescription}>
                  {notification.sentAt?.toDate().toLocaleString() ||
                    "Date unavailable"}
                </p>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(
                      `/admin/push-notifications/edit-notification?id=${notification.id}`
                    )
                  }
                >
                  Edit
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() =>
                    handleDelete(notification.id, notification.images)
                  }
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No notifications found.</p>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
  },
  heading: {
    fontSize: "2.5em",
    marginBottom: "20px",
  },
  notificationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  notificationCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    textAlign: "left",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  notificationName: {
    fontSize: "1.5em",
    margin: "10px 0",
  },
  notificationPrice: {
    fontSize: "1.2em",
    color: "#e67e22",
  },
  notificationDescription: {
    fontSize: "0.9em",
    color: "#7f8c8d",
  },
  editButton: {
    marginRight: "10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
