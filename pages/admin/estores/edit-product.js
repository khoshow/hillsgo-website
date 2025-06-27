import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, storage } from "../../../firebase/firebase"; // Import your Firestore and Storage
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { useUser } from "../../../contexts/UserContext"; // Import your UserContext
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";
import Header from "@/components/Header";

export default function EditProduct() {
  const router = useRouter();
  const { user } = useUser(); // Get user from context
  const { id } = router.query; // Get product ID from query params
  const [productData, setProductData] = useState({
    name: "",
    mrp: "",
    price: "",
    wholesalePrice: "",
    discountPrice: "",
    size: "",
    weight: "",
    categories: [],
    description: "",
    images: [],
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const storage = getStorage();
  useEffect(() => {
    const fetchProduct = async () => {
      if (!user || !id) return; // Redirect if not logged in or ID is missing

      try {
        const productRef = doc(db, "estoreProducts", id);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          setProductData(productDoc.data());
          setKeywords(productDoc.data().keywords);
        } else {
          alert("Product not found!");
          router.push("/my-products"); // Redirect if product not found
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to fetch product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [user, id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };
  const calculatePrice = () => {
    const mrp = parseFloat(productData.mrp) || 0;

    const discountRaw = productData.discountPrice;
    const discount = discountRaw === "N/A" ? 0 : parseFloat(discountRaw);

    return mrp - (isNaN(discount) ? 0 : discount);
  };
  // Submit updated product to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    setSubmitting(true);
    try {
      // Handle image upload if new images are selected
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          if (!image) throw new Error("Invalid image file");
          const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
          await uploadBytes(imageRef, image);
          return await getDownloadURL(imageRef);
        })
      );

      // Update product data in Firestore
      await updateDoc(doc(db, "estoreProducts", id), {
        ...productData,
        mrp: parseFloat(productData.mrp),
        price: calculatePrice(),
        wholesalePrice: parseFloat(productData.wholesalePrice),
        discountPrice: parseFloat(productData.discountPrice),
        keywords,
        images: [...productData.images, ...imageUrls], // Append new image URLs,
      });

      alert("Product updated successfully!");
      setProductData({
        name: "",
        mrp: "",
        price: "",
        wholesalePrice: "",
        discountPrice: "",
        size: "",
        weight: "",
        categories: [],
        description: "",
      });
      setKeywords([]);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteImage = async (image) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?"
    );
    if (!confirmDelete) return;
    try {
      // Decode the URI to get the proper filename
      const imageName = decodeURIComponent(
        image.substring(image.lastIndexOf("/") + 1, image.indexOf("?"))
      );

      // Construct the storage reference using the correct path
      const imageRef = ref(storage, `/${imageName}`); // Use the original upload path

      // Delete the image from Firebase Storage
      await deleteObject(imageRef);

      // Update Firestore document to remove the image from the images array
      const updatedImages = productData.images.filter((img) => img !== image);
      await updateDoc(doc(db, "estoreProducts", id), {
        images: updatedImages,
      });

      // Update local state
      setProductData((prevData) => ({
        ...prevData,
        images: updatedImages,
      }));

      alert("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error); // Check the error message
      alert("Failed to delete image.");
    }
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();

    if (!trimmed) return;

    if (keywords?.length >= 8) {
      alert("You can only add up to 8 keywords.");
      return;
    }

    if (trimmed && trimmed.length > 0) {
      setKeywords((prev) => {
        const updated = prev || []; // fallback if prev is undefined
        if (!updated.includes(trimmed)) {
          return [...updated, trimmed];
        }
        return updated;
      });
    }

    setKeywordInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default Enter behavior
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (wordToRemove) => {
    setKeywords((prev) => prev.filter((kw) => kw !== wordToRemove));
  };

  if (loading)
    return (
      <Admin>
        <AdminLayout>
          <Header />
          <p>Loading...</p>
        </AdminLayout>
      </Admin>
    );

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1>Edit Product</h1>
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Product Name:
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </label>
            <label style={{ ...styles.label, ...styles.discountLabel }}>
              Discount Price:
              <input
                type="number"
                name="discountPrice"
                value={productData.discountPrice}
                onChange={handleInputChange}
                style={{ ...styles.input, ...styles.discountLabel }}
              />
            </label>
            <label style={styles.label}>
              Maximum Retail Price (MRP):
              <input
                type="number"
                name="mrp"
                value={productData.mrp}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Wholesale Price:
              <input
                type="number"
                name="wholesalePrice"
                value={productData.wholesalePrice}
                onChange={handleInputChange}
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Size:
              <input
                type="text"
                name="size"
                value={productData.size}
                onChange={handleInputChange}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Weight:
              <input
                type="text"
                name="weight"
                value={productData.weight}
                onChange={handleInputChange}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Description:
              <textarea
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                style={styles.textarea}
              />
            </label>
            <div style={{ marginBottom: "1rem" }}>
              <label style={styles.label}>
                Add up to 8 keywords to help people find the product
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a keyword and press Enter"
                  style={{ padding: "0.5rem", flex: 1 }}
                />
                <button
                  onClick={handleAddKeyword}
                  type="button"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Add
                </button>
              </div>

              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {keywords?.map((kw, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: "#eee",
                      padding: "0.4rem 0.7rem",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRemoveKeyword(kw)}
                    title="Click to remove"
                  >
                    {kw} ✕
                  </span>
                ))}
              </div>
            </div>
            <label style={styles.label}>
              Images:
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                accept="image/*"
                style={styles.fileInput}
              />
            </label>
            <button type="submit" style={styles.button}>
              {submitting ? "Editing Product..." : "Edit Product"}
            </button>
          </form>
          <div style={styles.container}>
            <div style={styles.currentImages}>
              <h3 style={styles.label}>Current Images:</h3>
              {productData.images?.map((img, index) => (
                <div key={index} style={styles.imageContainer}>
                  <img
                    src={img}
                    alt={`Product Image ${index + 1}`}
                    style={styles.image}
                  />
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDeleteImage(img)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            {/* Add other form fields for editing the product */}
          </div>
        </div>
      </AdminLayout>
    </Admin>
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
  discountLabel: {
    backgroundColor: "#95d500",
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
