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
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { colors } from "@/data/colors";
import ImageSlider from "../../components/sliders/ImageSliders";
import { useUser } from "../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import DriverLayout from "@/components/layout/DriverLayout"; // Assuming you have a layout for Estore
import Driver from "@/components/auth/Driver";

export default function MyOrders() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const storage = getStorage();

  useEffect(() => {
    if (userLoading) return;
    const fetchOrders = async () => {
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      try {
        const ordersQuery = query(
          collection(db, "orders")
          // where("driverId", "==", user.uid) // Fetch products created by the logged-in user
        );

        const querySnapshot = await getDocs(ordersQuery);
        const ordersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(ordersList); // Update state with fetched products
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  const handleDelete = async (postId, imageUrls) => {
    const confirmed = confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      // Delete product document from Firestore
      await deleteDoc(doc(db, "driversOrders", postId));
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
      setOrders((prevOrders) =>
        prevOrders.filter((post) => post.id !== postId)
      );

      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete the post.");
    }
  };

  if (loading)
    return (
      <Driver>
        <DriverLayout>
          <Header />
          <p>Loading...</p>
        </DriverLayout>
      </Driver>
    );

  const handleStatusChange = (newStatus, order) => {
    order.status = newStatus; // Update status locally
  };

  // Update status in Firebase
  const updateOrderStatus = async (order) => {
    try {
      const newStatus = order.status;
      if (!order.id) {
        alert("Invalid order ID");
        return;
      }

      // Reference to the Firestore document
      const orderRef = doc(db, "orders", order.id);

      if (newStatus === "completed" || newStatus === "cancelled") {
        // Get the current order data
        const orderSnapshot = await getDoc(orderRef);
        const orderData = orderSnapshot.data();

        if (!orderData) {
          alert("Order not found");
          return;
        }

        // Determine the target collection
        const targetCollection =
          newStatus === "completed" ? "ordersHistory" : "cancelledOrders";

        // Add the order to the target collection
        const targetDocRef = doc(db, targetCollection, order.id);
        await setDoc(targetDocRef, {
          ...orderData,
          status: newStatus,
          driver: { name: user.name, image: user.image },
        });

        // Remove the order from the current collection
        await deleteDoc(orderRef);

        alert(`Order moved to "${targetCollection}" successfully!`);
      } else {
        // Update the status in the current collection
        await updateDoc(orderRef, { status: newStatus });
        alert(`Order status updated to "${newStatus}" successfully!`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  return (
    <Driver>
      <DriverLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.heading}>Current Orders</h1>
          <div style={styles.productGrid}>
            {orders.length > 0 ? (
              orders.map((order, index) =>
                order ? (
                  <div
                    key={index}
                    style={{
                      margin: "20px",
                      padding: "20px",
                      border: "1px solid #ccc",
                      borderRadius: "10px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <h2
                      style={{
                        textAlign: "center",
                        marginBottom: "20px",
                        color: "#333",
                      }}
                    >
                      {index + 1}
                    </h2>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <tbody>
                        <tr>
                          <td style={styles.label}>Order ID:</td>
                          <td style={styles.value}>
                            {order?.orderId || "Order ID Not Available"}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.label}>Name:</td>
                          <td style={styles.value}>
                            {order?.product?.userName ||
                              "Customer Name Not Available"}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.label}>Contact:</td>
                          <td style={styles.value}>
                            {order?.product?.userContact ||
                              "Customer Contact Not Available"}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.label}>Delivery Address:</td>
                          <td style={styles.value}>
                            {order?.userData?.deliveryAddress ||
                              "Delivery Address Not Available"}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.label}>Product Name:</td>
                          <td style={styles.value}>
                            {order?.product?.productData?.name ||
                              "Product Name Unavailable"}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.label}>Quantity:</td>
                          <td style={styles.value}>
                            {order?.product?.productData?.quantity ||
                              "Quantity Unavailable"}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.label}>Amount:</td>
                          <td style={styles.value}>
                            {order?.product?.productData?.subtotal ||
                              "Amount Not Available"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                      <label
                        htmlFor={`status-${index}`}
                        style={{ marginRight: "10px", fontWeight: "bold" }}
                      >
                        Update Status:
                      </label>
                      <select
                        id={`status-${index}`}
                        style={{
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          marginRight: "10px",
                        }}
                        defaultValue={order?.status || "pending"} // Pre-select current status
                        onChange={(e) =>
                          handleStatusChange(e.target.value, order)
                        }
                      >
                        <option value="Delivering Today">
                          Delivering Today
                        </option>
                        <option value="Out for Delivery">
                          Out for Delivery
                        </option>

                        <option value="completed">Completed</option>
                        <option value="cancelled">Canceled</option>
                      </select>
                      <button
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => updateOrderStatus(order)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ) : (
                  <p key={index} style={{ color: "black" }}></p>
                )
              )
            ) : (
              <p>No orders found.</p>
            )}
          </div>
        </div>
      </DriverLayout>
    </Driver>
  );
}

const styles = {
  container: {
    padding: "20px",
    // maxWidth: "1200px",
    margin: "auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  productGrid: {
    // display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    colors: "black",
  },
  productCard: {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
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

  label: {
    fontWeight: "bold",
    padding: "10px",
    textAlign: "left",
    backgroundColor: "#eaeaea",
    border: "1px solid #ddd",
  },
  value: {
    padding: "10px",
    textAlign: "left",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
  },
};
