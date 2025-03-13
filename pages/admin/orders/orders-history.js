import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../firebase/firebase"; // Import your Firestore config
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
import { colors } from "@/data/colors";
import ImageSlider from "../../../components/sliders/ImageSliders";
import { useUser } from "../../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import AdminLayout from "@/components/layout/AdminLayout"; // Assuming you have a layout for Estore
import Admin from "@/components/auth/Admin";
import Image from "next/image";

export default function MyItems() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const storage = getStorage();

  useEffect(() => {
    if (userLoading) return;
    const fetchItems = async () => {
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      try {
        const itemsQuery = query(
          collection(db, "ordersHistory")
          // where("driver.driverId", "==", user.uid) // Fetch products created by the logged-in user
        );

        const querySnapshot = await getDocs(itemsQuery);
        const itemsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItems(itemsList); // Update state with fetched products
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user, router]);

  console.log("items", items);

  const handleDelete = async (itemId, imageUrls) => {
    const confirmed = confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      // Delete product document from Firestore
      await deleteDoc(doc(db, "driversItems", itemId));
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

      // Update local state to remove deleted product
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete the item.");
    }
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
          <h1 style={styles.heading}>My Delivered Items</h1>
          <div style={styles.productGrid}>
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} style={styles.productCard}>
                  <div style={styles.tableContainerBox}>
                    <div style={styles.tableContainer}>
                      {/* <img
                        src="https://firebasestorage.googleapis.com/v0/b/hillsgodev.appspot.com/o/estoreProducts%2F1734802647603_dd.jpg?alt=media&token=719f9c2e-111a-4266-addc-86c98d0508ee"
                        alt="E-store Product"
                        style="max-width: 300px; height: auto;"
                      /> */}

                      <h2>Order Details</h2>
                      <table>
                        <tr>
                          <th>Order ID</th>
                          <td>ORDER-LCUXK4AR</td>
                        </tr>
                        <tr>
                          <th>Delivery Code</th>
                          <td>5411</td>
                        </tr>
                        <tr>
                          <th>Status</th>
                          <td>Completed</td>
                        </tr>
                        <tr>
                          <th>Ordered Date</th>
                          <td>08/08/2025</td>
                        </tr>
                        <tr>
                          <th>Date of Delivery</th>
                          <td>09/09/2025</td>
                        </tr>
                      </table>
                    </div>
                    <div style={styles.tableContainer}>
                      <h3>User Details</h3>
                      <table>
                        <tr>
                          <th>Name</th>
                          <td>Khoshow</td>
                        </tr>
                        <tr>
                          <th>Phone</th>
                          <td>9873411884</td>
                        </tr>
                        <tr>
                          <th>Email</th>
                          <td>khoshow.developer@gmail.com</td>
                        </tr>
                        <tr>
                          <th>Delivery Address</th>
                          <td>Hha</td>
                        </tr>
                      </table>
                    </div>
                    <div class="table-container">
                      <h3>Store Details</h3>
                      <table>
                        <tr>
                          <th>Store Name</th>
                          <td>Store 2</td>
                        </tr>
                        <tr>
                          <th>Owner Name</th>
                          <td>Tommy Baltimore</td>
                        </tr>
                        <tr>
                          <th>Owner Email</th>
                          <td>store2@hillsgo.com</td>
                        </tr>
                        <tr>
                          <th>Store Contact</th>
                          <td>55555</td>
                        </tr>
                      </table>
                    </div>
                    <div class="table-container">
                      <h3>Product Details</h3>
                      <table>
                        <tr>
                          <th>Product Name</th>
                          <td>{item.product.productData.name}</td>
                        </tr>
                        <tr>
                          <th>Product Description</th>
                          <td>{item.product.productData.description}</td>
                        </tr>
                        <tr>
                          <th>Weight</th>
                          <td>{item.product.productData.weight}</td>
                        </tr>
                        <tr>
                          <th>Size</th>
                          <td>{item?.product?.productData?.size}</td>
                        </tr>

                        <tr>
                          <th>Categories</th>
                          {item?.product?.productData?.categories.map(
                            (item, index) => (
                              <td key={index}>{`${item}`} </td>
                            )
                          )}
                        </tr>
                      </table>
                    </div>
                    <div class="table-container">
                      <h3>Driver Details</h3>
                      <table>
                        <tr>
                          <th>Name</th>
                          <td>{item.driver.name}</td>
                        </tr>
                      </table>
                    </div>
                    <div class="table-container">
                      <h3>Pricing Details</h3>
                      <table>
                        <tr>
                          <th>Price</th>
                          <td>₹{item.product.productData.price}</td>
                        </tr>

                        <tr>
                          <th>Quantity</th>
                          <td>{item.product.productData.quantity}</td>
                        </tr>

                        <tr>
                          <th>Subtotal</th>
                          <td>₹{item.product.productData.subtotal}</td>
                        </tr>
                        <tr>
                          <th>Tip</th>
                          <td>₹{item.product.tip}</td>
                        </tr>
                        <tr>
                          <th>Delivery Cost</th>
                          <td>₹{item.product.deliveryCost}</td>
                        </tr>
                        <tr>
                          <th>Total Payment</th>
                          <td>
                            ₹
                            {item.product.deliveryCost +
                              item.product.tip +
                              item.product.productData.subtotal}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No items found.</p>
            )}
          </div>
        </div>
      </AdminLayout>
    </Admin>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  productGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },
  productCard: {
    // width: "50%",
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    // textAlign: "center",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableContainerBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "spaceBetween",
  },
  tableContainer: {
    flex: "1",
    minWidth: "300px",
  },
  td: {
    padding: "8px",
    border: "1px solid #ddd",
  },
  th: {
    textAlign: "left",
    padding: "10px",
    backgroundColor: "#f4f4f4",
    border: "1px solid #ddd",
  },

  imagesContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "10px",
  },
  image: {
    width: "50%",
    height: "auto",
    objectFit: "cover",
    marginBottom: "5px",
  },
  categoriesContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "10px",
  },
  categoryBadge: {
    fontSize: "14px",
    backgroundColor: colors.greyLight,
    color: "#fff",
    borderRadius: "2px",
    height: "20px",
    margin: "2px",
    padding: "2px",
  },
  editButton: {
    margin: "5px",
    padding: "10px",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    margin: "5px",
    padding: "10px",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
