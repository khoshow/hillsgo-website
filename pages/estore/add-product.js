import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db, storage } from "../../firebase/firebase"; // Import Firestore and Storage from Firebase config
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "../../contexts/UserContext"; // Assumes UserContext is set up
import Estore from "@/components/auth/Estore";
import EstoreLayout from "@/components/layout/EstoreLayout";
import Header from "@/components/Header";
import { category } from "@/data/category";

export default function AddProduct() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser(); // Assume user is available in UserContext
  const [isEstoreOwner, setIsEstoreOwner] = useState(false); // Track if user is an e-store owner
  const [loading, setLoading] = useState(true); // Loading state for verification and submission
  const [submitting, setSubmitting] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    mrp: "",
    wholesalePrice: "",
    size: "",
    weight: "",
    categories: [],
    description: "",
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);

  const [images, setImages] = useState([]);
  const dataCategories = category;
  const storage = getStorage();

  // Check if the user is an e-store owner
  useEffect(() => {
    const verifyEstoreOwner = async () => {
      if (userLoading) return;
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      setLoading(true);
      try {
        const estoresQuery = query(
          collection(db, "estores"),
          where("ownerEmail", "==", user.email)
        );
        const querySnapshot = await getDocs(estoresQuery);

        if (!querySnapshot.empty) {
          setIsEstoreOwner(true); // User is an e-store owner
        } else {
          alert("You are not authorized to add products.");
          router.push("/"); // Redirect unauthorized users
        }
      } catch (error) {
        console.error("Error verifying e-store owner:", error);
        alert("Failed to verify e-store owner status.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    verifyEstoreOwner();
  }, [user, router]);

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

  // Submit product to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productData.categories.length) return;
    if (!user || !isEstoreOwner) return;

    setSubmitting(true);
    try {
      // Upload images to Firebase Storage and get URLs
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          if (!image) throw new Error("Invalid image file"); // Validate image
          const imageRef = ref(
            storage,
            `estoreProducts/${Date.now()}_${image.name}`
          ); // Unique name
          await uploadBytes(imageRef, image);
          return await getDownloadURL(imageRef);
        })
      );

      console.log("word", productData.name.toLowerCase());

      const enhancedKeywords = [
        ...new Set([
          ...keywords, // existing user input
          productData.name.toLowerCase(), // additional keyword based on name
          ...productData.name.toLowerCase().split(" "),
        ]),
      ];

      await addDoc(collection(db, "estoreProducts"), {
        ...productData,
        mrp: parseFloat(productData.mrp),
        price: parseFloat(productData.mrp),
        wholesalePrice: parseFloat(productData.wholesalePrice),
        images: imageUrls,
        ownerId: user.uid,
        createdAt: new Date(),
        ownerEmail: user.email,
        ownerName: user.name,
        estoreName: user.estoreName,
        estoreContact: user.estoreContact,
        keywords: enhancedKeywords,
      });

      alert("Product added successfully!");
      setProductData({
        name: "",
        mrp: "",
        price: "",
        wholesalePrice: "",
        size: "",
        weight: "",
        categories: [],
        description: "",
      });
      setKeywords([]);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      categories: checked
        ? [...prevData.categories, value] // Add category ID if checked
        : prevData.categories.filter((categoryId) => categoryId !== value), // Remove if unchecked
    }));
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();

    if (!trimmed) return;

    if (keywords.length >= 8) {
      alert("You can only add up to 8 keywords.");
      return;
    }

    if (!keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
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
  console.log("Keywords", keywords);

  // Show loading message or form based on verification
  if (loading)
    return (
      <Estore>
        <EstoreLayout>
          <Header />
          <p>Loading...</p>
        </EstoreLayout>
      </Estore>
    );
  if (!isEstoreOwner) return null; // Hide form if not authorized

  return (
    <Estore>
      <EstoreLayout>
        <Header />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <h1>Add a New Product</h1>
          <form onSubmit={handleSubmit} style={formStyles.form}>
            <label style={formStyles.label}>
              Product Name:
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                required
                style={formStyles.input}
              />
            </label>
            <label style={formStyles.label}>
              Maximum Retail Price (MRP):
              <input
                type="number"
                name="mrp"
                value={productData.mrp}
                onChange={handleInputChange}
                required
                style={formStyles.input}
              />
            </label>
            <label style={formStyles.label}>
              HillsGO Price:
              <input
                type="number"
                name="wholesalePrice"
                value={productData.wholesalePrice}
                onChange={handleInputChange}
                required
                style={formStyles.input}
              />
            </label>
            <label style={formStyles.label}>
              Size:
              <input
                type="text"
                name="size"
                value={productData.size}
                onChange={handleInputChange}
                style={formStyles.input}
              />
            </label>
            <label style={formStyles.label}>
              Weight:
              <input
                type="text"
                name="weight"
                value={productData.weight}
                onChange={handleInputChange}
                style={formStyles.input}
              />
            </label>
            <div style={formStyles.label}>
              Category:
              {dataCategories.map((category) => (
                <label key={category.id} style={formStyles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value={category.name} // Use category ID as the value
                    checked={productData.categories.includes(category.name)}
                    onChange={handleCategoryChange}
                    style={formStyles.checkbox}
                  />
                  {category.name}
                </label>
              ))}
            </div>
            <label style={formStyles.label}>
              Description:
              <textarea
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                required
                style={formStyles.textarea}
              />
            </label>
            <div style={{ marginBottom: "1rem" }}>
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
                {keywords.map((kw, idx) => (
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
            <label style={formStyles.label}>
              Images:
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                accept="image/*"
                style={formStyles.fileInput}
                required
              />
            </label>
            <button type="submit" disabled={loading} style={formStyles.button}>
              {submitting ? "Adding Product..." : "Add Product"}
            </button>
          </form>
        </div>
      </EstoreLayout>
    </Estore>
  );
}

const formStyles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "500",
    marginBottom: "5px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    backgroundColor: "#f8f9fa",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    backgroundColor: "#f8f9fa",
  },
  fileInput: {
    padding: "8px",
  },
  button: {
    padding: "10px 15px",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#0070f3",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    margin: "5px 0",
  },
  checkbox: {
    marginRight: "10px",
  },
};
