import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, storage } from "../../firebase/firebase"; // Import your Firestore and Storage
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { useUser } from "../../contexts/UserContext"; // Import your UserContext
import Estore from "@/components/auth/Estore";
import EstoreLayout from "@/components/layout/EstoreLayout";
import Header from "@/components/Header";

export default function EditProduct() {
  const router = useRouter();
  const { user } = useUser(); // Get user from context
  const { id } = router.query; // Get product ID from query params
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    size: "",
    weight: "",
    categories: [],
    description: "",
    images: [],
  });
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
        price: parseFloat(productData.price),
        images: [...productData.images, ...imageUrls], // Append new image URLs
      });

      alert("Product updated successfully!");
      setProductData({
        name: "",
        price: "",
        size: "",
        weight: "",
        categories: [],
        description: "",
      });
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

  if (loading)
    return (
      <Estore>
        <EstoreLayout>
          <Header />
          <p>Loading...</p>
        </EstoreLayout>
      </Estore>
    );

  return (
    <Estore>
      <EstoreLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.heading}>Edit Product</h1>
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
            <label style={styles.label}>
              Price:
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                required
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
                required
                style={styles.textarea}
              />
            </label>
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
              {productData.images.map((img, index) => (
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
      </EstoreLayout>
    </Estore>
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
