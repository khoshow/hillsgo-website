import { useState } from "react";
import { db } from "../../../../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Header from "@/components/Header";
import AdminLayout from "@/components/layout/AdminLayout";
import Admin from "@/components/auth/Admin";

export default function CreateBanner() {
  const [name, setName] = useState("");
  const [type, setType] = useState("image");
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inAppLink, setInAppLink] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [isActive, setIsActive] = useState(true); // new state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await addDoc(collection(db, "estoresBanners"), {
        name,
        type,
        imageUrl,
        startDate: startDate ? new Date(startDate) : null,
        createdAt: serverTimestamp(),
        endDate: endDate ? new Date(endDate) : null,
        inAppLink: inAppLink || null,
        externalLink: externalLink || null,
        isActive, // store in Firestore
      });

      setMessage(`Banner "${name}" created successfully!`);
      setName("");
      setType("image");
      setImageUrl("");
      setStartDate("");
      setEndDate("");
      setInAppLink("");
      setExternalLink("");
      setIsActive(true); // reset to default
    } catch (error) {
      console.error("Error creating banner: ", error);
      setMessage("Error creating banner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 className="text-2xl font-bold mb-6">Create New Estores Banner</h1>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Banner Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Banner Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            {/* Type */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={styles.input}
              >
                <option value="image">Image URL</option>
                <option value="video">Video URL</option>
              </select>
            </div>

            {/* Media URL */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                {type === "image" ? "Image URL" : "Video URL"}
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={`Enter ${type} URL`}
                required
                style={styles.input}
              />
            </div>

            {/* In-app link */}
            <div style={styles.formGroup}>
              <label style={styles.label}>In-app Link (Optional)</label>
              <input
                type="text"
                value={inAppLink}
                onChange={(e) => setInAppLink(e.target.value)}
                placeholder="/products/productID or /estores/estoreID"
                style={styles.input}
              />
            </div>

            {/* External link */}
            <div style={styles.formGroup}>
              <label style={styles.label}>External Link (Optional)</label>
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://example.com"
                style={styles.input}
              />
            </div>

            {/* Dates */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* Active Status */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                Active
              </label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Saving..." : "Create Banner"}
            </button>
          </form>

          {message && <p className="mt-4">{message}</p>}
        </div>
      </AdminLayout>
    </Admin>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#f9f9f9",
    fontFamily: "'Arial', sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "0.3rem",
  },
  input: {
    padding: "0.5rem",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "#f8f9fa",
  },
  button: {
    padding: "0.7rem",
    fontSize: "16px",
    borderRadius: "4px",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};
