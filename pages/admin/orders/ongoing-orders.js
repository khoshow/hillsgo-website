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
  updateDoc,
  getDoc,
  setDoc,
  orderBy,
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
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";

export default function MyOrders() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryNote, setDeliveryNote] = useState({});
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
          collection(db, "orders"),
          orderBy("createdAt", "desc")
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
      <Admin>
        <AdminLayout>
          <Header />
          <p>Loading...</p>
        </AdminLayout>
      </Admin>
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

  const handleNoteChange = (id, value) => {
    setDeliveryNote((prev) => ({
      ...prev,
      [id]: value, // Update only the specific item
    }));
  };

  const addDeliveryNote = async (order, deliveryNote) => {
    if (!order?.id) {
      alert("Invalid order ID");
      return;
    }
    if (!deliveryNote) {
      alert("Please add a delivery note.");
      return;
    }

    const newStatus = Object.values(deliveryNote)[0];

    try {
      const orderRef = doc(db, "orders", order.id);

      // Get the current order data
      const orderSnapshot = await getDoc(orderRef);
      if (!orderSnapshot.exists()) {
        alert("Order not found");
        return;
      }

      await updateDoc(orderRef, { status: newStatus });
      alert(`Order status updated to "${newStatus}" successfully!`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const outputDateTime = (time) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    const milliseconds = time.seconds * 1000 + time.nanoseconds / 1e6;

    // Create a Date object
    const date = new Date(milliseconds);
    return date.toISOString(), date.toLocaleString("en-US", options);
   
  };


  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.heading}>Current Orders</h1>
          <div style={styles.productGrid}>
            {orders.length > 0 ? (
              orders.map((item, index) => (
                <div key={item.id} style={styles.productCard}>
                  <h3 style={{ textAlign: "center" }}>{index + 1}</h3>
                  <img
                    src={item.product.productData.images[0]} // Assuming first image is used for the card
                    alt="image detail"
                    style={styles.image}
                  />

                  <div style={styles.tableContainerBox}>
                    <div style={styles.tableContainer}>
                      <p className="subTitle">Order Details</p>
                      <table>
                        <tr>
                          <th>Order ID: </th>
                          <td>{item.orderId}</td>
                        </tr>
                        <tr>
                          <th>Status: </th>
                          <td>{item.status}</td>
                        </tr>
                        <tr>
                          <th>Ordered Date: </th>
                          <td>{outputDateTime(item.createdAt)}</td>
                        </tr>
                        {/* <tr>
                          <th>Date of Delivery</th>
                          <td>{outputDateTime(item.deliveredAt)}</td>
                        </tr> */}
                      </table>
                    </div>
                    <div style={styles.tableContainer}>
                      <p className="subTitle">User Details</p>
                      <table>
                        <tr>
                          <th>Name: </th>
                          <td>{item.userData.userName}</td>
                        </tr>
                        <tr>
                          <th>Phone: </th>
                          <td>{item.userData.phone}</td>
                        </tr>
                        <tr>
                          <th>Email: </th>
                          <td>{item.userData.email}</td>
                        </tr>
                        <tr>
                          <th>Delivery Address: </th>
                          <td>{item.userData.deliveryAddress}</td>
                        </tr>
                      </table>
                    </div>
                    <div class="table-container">
                      <p className="subTitle">Store Details</p>
                      <table>
                        <tr>
                          <th>Store Name: </th>
                          <td>{item.estoreInfo.estoreName}</td>
                        </tr>
                        <tr>
                          <th>Owner Name: </th>
                          <td>{item.estoreInfo.ownerName}</td>
                        </tr>
                        <tr>
                          <th>Owner Email: </th>
                          <td>{item.estoreInfo.ownerEmail}</td>
                        </tr>
                        <tr>
                          <th>Store Contact: </th>
                          <td>{item.estoreInfo.estoreContact}</td>
                        </tr>
                      </table>
                    </div>
                    <div class="table-container">
                      <p className="subTitle">Product Details</p>
                      <table>
                        <tr>
                          <th>Product Name: </th>
                          <td>{item.product.productData.name}</td>
                        </tr>
                        <tr>
                          <th>Product Description: </th>
                          <td>{item.product.productData.description}</td>
                        </tr>
                        <tr>
                          <th>Weight: </th>
                          <td>{item.product.productData.weight}</td>
                        </tr>
                        <tr>
                          <th>Size: </th>
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
                      <p className="subTitle">Pricing Details</p>
                      <table>
                        <tr>
                          <th>Price: </th>
                          <td>₹{item.product.productData.price}</td>
                        </tr>

                        <tr>
                          <th>Quantity: </th>
                          <td>{item.product.productData.quantity}</td>
                        </tr>

                        <tr>
                          <th>Subtotal: </th>
                          <td>₹{item.product.productData.subtotal}</td>
                        </tr>
                        <tr>
                          <th>Tip: </th>
                          <td>₹{item.product.tip}</td>
                        </tr>
                        <tr>
                          <th>Delivery Cost: </th>
                          <td>₹{item.product.deliveryCost}</td>
                        </tr>
                        <tr>
                          <th>Total Payment: </th>
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
    width: "200px",
    height: "auto",
    objectFit: "cover",
    marginBottom: "5px",
    // margin: "0 auto",
    // justifyContent: "center",
    // textAlign: "center",
    borderRadius: "10px",
    display: "block",
    margin: "0 auto 2rem",
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

  productGrid: {
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
    borderCollapse: "",
  },
  tableContainerBox: {
    padding: "8px",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
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
};
