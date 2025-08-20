import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../../firebase/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Header from "@/components/Header";
import AdminLayout from "@/components/layout/AdminLayout";
import Admin from "@/components/auth/Admin";

export default function EditBanner() {
  const router = useRouter();
  const { id } = router.query; // bannerId from URL

  const [name, setName] = useState("");
  const [type, setType] = useState("image");
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [inAppLink, setInAppLink] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isActive, setIsActive] = useState(true); // new field

  // Fetch banner details on mount
  useEffect(() => {
    if (!id) return;
    const fetchBanner = async () => {
      try {
        const docRef = doc(db, "hireSkillsBanners", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setType(data.type || "image");
          setImageUrl(data.imageUrl || "");
          setInAppLink(data.inAppLink || "");
          setExternalLink(data.externalLink || "");
          setIsActive(data.isActive ?? true);
          setStartDate(
            data.startDate
              ? new Date(data.startDate.seconds * 1000)
                  .toISOString()
                  .split("T")[0]
              : ""
          );
          setEndDate(
            data.endDate
              ? new Date(data.endDate.seconds * 1000)
                  .toISOString()
                  .split("T")[0]
              : ""
          );
        } else {
          setMessage("Banner not found.");
        }
      } catch (error) {
        console.error("Error fetching banner: ", error);
        setMessage("Error loading banner.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBanner();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const docRef = doc(db, "hireSkillsBanners", id);
      await updateDoc(docRef, {
        name,
        type,
        imageUrl,
        inAppLink: inAppLink || null,
        externalLink: externalLink || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        updatedAt: serverTimestamp(),
        isActive,
      });

      setMessage(`Banner "${name}" updated successfully!`);
    } catch (error) {
      console.error("Error updating banner: ", error);
      setMessage("Error updating banner.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <p>Loading banner details...</p>;

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 className="text-2xl font-bold mb-6">Edit Hire Skills Banner</h1>
          <form onSubmit={handleSubmit} style={styles.form}>
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

            <div style={styles.formGroup}>
              <label style={styles.label}>In-app Link (Optional)</label>
              <input
                type="text"
                value={inAppLink}
                onChange={(e) => setInAppLink(e.target.value)}
                placeholder="/hireSkills/workerID"
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

            <div style={styles.formGroup}>
              <label>Start Date:</label>
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

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Updating..." : "Update Banner"}
            </button>
          </form>

          {message && <p className="mt-4">{message}</p>}
        </div>
      </AdminLayout>
    </Admin>
  );
}

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
