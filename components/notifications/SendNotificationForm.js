import { useState } from "react";
import styles from "../../styles/SendNotificationForm.module.css";

let api;
if (process.env.NEXT_PUBLIC_NODE_ENV == "production") {
  api =
    "https://seahorse-app-pir2f.ondigitalocean.app/api/send-notifications/send-push-notifications";
} else if (process.env.NEXT_PUBLIC_NODE_ENV == "development") {
  api = "http://localhost:8000/api/send-notifications/send-push-notifications";
}

export default function SendNotificationForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage("");

    try {
      console.log("Api", api);

      const response = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body: message, image: imageUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        setResponseMessage(
          `Success: ${data.successCount} notifications sent. ${data.errorCount} failed.`
        );
      } else {
        setResponseMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponseMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Send Push Notification</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>
            Message:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className={styles.textarea}
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="imageUrl" className={styles.label}>
            Image URL (Optional):
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Sending..." : "Send Notification"}
        </button>
      </form>

      {responseMessage && (
        <p
          className={
            responseMessage.startsWith("Success")
              ? styles.successMessage
              : styles.errorMessage
          }
        >
          {responseMessage}
        </p>
      )}
    </div>
  );
}
