import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, storage } from "../../firebase/firebase"; // Import your Firestore and Storage
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { useUser } from "../../contexts/UserContext"; // Import your UserContext

export default function EditNotification() {
  const router = useRouter();
  const { user } = useUser(); // Get user from context
  const { id } = router.query; // Get notification ID from query params
  console.log("if id", id);

  const [notificationData, setNotificationData] = useState({
    title: "",
    body: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      if (!user || !id) return; // Redirect if not logged in or ID is missing

      try {
        const notificationRef = doc(db, "notifications", id);
        const notificationDoc = await getDoc(notificationRef);

        if (notificationDoc.exists()) {
          setNotificationData(notificationDoc.data());
        } else {
          alert("Notification not found!");
          router.push("/admin/push-notifications/sent"); // Redirect if notification not found
        }
      } catch (error) {
        console.error("Error fetching notification:", error);
        alert("Failed to fetch notification details.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [user, id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Submit updated notification to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    setSubmitting(true);
    try {
      await updateDoc(doc(db, "notifications", id), {
        ...notificationData,
      });
      alert("Notification updated successfully!");
      setNotificationData({
        title: "",
        body: "",
        image: "",
      });
    } catch (error) {
      console.error("Error updating notification:", error);
      alert("Failed to update notification.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div style={styles.container}>
        <h1 style={styles.heading}>Edit Notification</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Title:
            <input
              type="text"
              name="title"
              value={notificationData.title}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Body:
            <textarea
              name="body"
              value={notificationData.body}
              onChange={handleInputChange}
              required
              style={styles.textarea}
            />
          </label>
          <label style={styles.label}>
            Image:
            <input
              type="text"
              name="image"
              value={notificationData.image}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </label>
          <button type="submit" style={styles.button}>
            {submitting ? "Editing Notification..." : "Edit Notification"}
          </button>
        </form>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
  },
  heading: {
    fontSize: "2.5em",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontSize: "1.1em",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    height: "100px",
  },
  fileInput: {
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  currentImages: {
    marginTop: "20px",
  },
  image: {
    width: "100px",
    height: "auto",
    marginRight: "10px",
    borderRadius: "5px",
  },
};
