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
  runTransaction,
  serverTimestamp,
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
import { useUser } from "../../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";

export default function PickDropOrders() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryCode, setDeliveryCode] = useState({});
  const [deliveryNote, setDeliveryNote] = useState({});
  const [hillsgoFee, setHillsgoFee] = useState({});
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const storage = getStorage();

  const fetchOrders = async () => {
    if (!user) {
      router.push("/"); // Redirect if not logged in
      return;
    }

    try {
      const ordersQuery = query(
        collection(db, "hireSkillsOngoing"),
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
  useEffect(() => {
    if (userLoading) return;
    fetchOrders();
  }, [user, router]);

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

  const handleDeliveryNoteChange = (id, value) => {
    setDeliveryNote((prev) => ({
      ...prev,
      [id]: value, // Update only the specific item
    }));
  };

  const handleHillsgoFeeChange = (id, value) => {
    setHillsgoFee((prev) => ({
      ...prev,
      [id]: value, // Update only the specific item
    }));
  };

  const handleDeliveryCodeChange = (id, value) => {
    setDeliveryCode((prev) => ({
      ...prev,
      [id]: value, // Update only the specific item
    }));
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
      const orderRef = doc(db, "hireSkillsOngoing", order.id);

      if (newStatus === "Completed" || newStatus === "Cancelled") {
        // Get the current order data
        const orderSnapshot = await getDoc(orderRef);
        const orderData = orderSnapshot.data();

        if (!orderData) {
          alert("Order not found");
          return;
        }

        // Determine the target collection
        const targetCollection =
          newStatus === "completed"
            ? "hireSkillsHistory"
            : "hireSkillsCancelled";

        // Add the order to the target collection
        const targetDocRef = doc(db, targetCollection, order.id);
        await setDoc(targetDocRef, {
          ...orderData,
          status: newStatus,
          driver: { name: user?.name || "Unknown", image: user?.image || "" },
        });

        // Remove the order from the current collection
        await deleteDoc(orderRef);

        alert(`Order moved to "${targetCollection}" successfully!`);
        fetchOrders();
      } else {
        // Update the status in the current collection
        await updateDoc(orderRef, { status: newStatus });
        alert(`Order status updated to "${newStatus}" successfully!`);
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const addDeliveryNote = async (order, deliveryNote) => {
    if (!order?.id) {
      alert("Invalid order ID");
      return;
    }
    if (!deliveryNote[order.id]) {
      alert("Please add a delivery note.");
      return;
    }
    const newStatus = deliveryNote[order.id];
    try {
      const orderRef = doc(db, "hireSkillsOngoing", order.id);

      // Get the current order data
      const orderSnapshot = await getDoc(orderRef);
      if (!orderSnapshot.exists()) {
        alert("Order not found");
        return;
      }

      await updateDoc(orderRef, { status: newStatus });
      alert(`Order status updated to "${newStatus}" successfully!`);
      setDeliveryNote("");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const completeOrder = async (order) => {
    if (!order?.id) {
      alert("Invalid order ID");
      return;
    }
    if (!hillsgoFee) {
      alert("Enter HillsGO fee to complete");
      return;
    }
    try {
      const orderRef = doc(db, "hireSkillsOngoing", order.id);

      // Get the current order data
      const orderSnapshot = await getDoc(orderRef);
      if (!orderSnapshot.exists()) {
        alert("Order not found");
        return;
      }

      const orderData = orderSnapshot.data();

      const targetDocRef = doc(db, "hireSkillsHistory", order.id);

      await runTransaction(db, async (transaction) => {
        transaction.set(targetDocRef, {
          ...orderData,
          status: "completed",
          fee: hillsgoFee[order.id],
          deliveredAt: serverTimestamp(),
        });
        transaction.delete(orderRef);
      });

      alert("Order completed successfully!");
      setShowModal(false);
      fetchOrders();
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
        <div className="container">
          <div style={styles.container}>
            <h1 >Hire Skills Requests</h1>
            <div style={styles.productGrid}>
              {orders.length > 0 ? (
                orders.map((order, index) =>
                  order ? (
                    <div key={index} style={styles.productCard}>
                      <h2
                        style={{
                          textAlign: "center",
                          // marginBottom: "20px",
                          color: "#333",
                        }}
                      >
                        {index + 1}
                      </h2>
                      <div style={styles.tableWrapper}>
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <tbody>
                            {/* Order Details */}
                            <tr>
                              <th style={styles.label}>Request ID:</th>
                              <td style={styles.value}>{order.id}</td>
                              <th style={styles.label}>Status:</th>
                              <td style={styles.value}>{order.status}</td>
                            </tr>
                            <tr>
                              <th style={styles.label}>Ordered Date:</th>
                              <td style={styles.value}>
                                {outputDateTime(order.createdAt)}
                              </td>
                            </tr>

                            {/* Sender Details */}
                            <tr>
                              <th colSpan="4" style={styles.sectionHeader}>
                                User Details
                              </th>
                            </tr>
                            <tr>
                              <th style={styles.label}>Name:</th>
                              <td style={styles.value}>{order.name}</td>
                              <th style={styles.label}>Phone:</th>
                              <td style={styles.value}>{order.phone}</td>
                            </tr>
                            <tr>
                              <th style={styles.label}>Location:</th>
                              <td colSpan="3" style={styles.value}>
                                {order.location}
                              </td>
                            </tr>

                            {/* Receiver Details */}
                            <tr>
                              <th colSpan="4" style={styles.sectionHeader}>
                                Work Details
                              </th>
                            </tr>
                            <tr>
                              <th style={styles.label}>Service:</th>
                              <td style={styles.value}>{order.service}</td>
                              <th style={styles.label}>Details:</th>
                              <td style={styles.value}>{order.description}</td>
                            </tr>
                            <tr>
                              <th style={styles.label}>Needed On:</th>
                              <td colSpan="3" style={styles.value2}>
                                {order.date}
                              </td>
                            </tr>

                            {/* Item Details */}
                          </tbody>
                        </table>
                      </div>
                      <div style={styles.orderActionsContainer}>
                        {/* Order Status Update */}
                        <div style={styles.actionRow}>
                          <select
                            id={`status-${index}`}
                            style={styles.select}
                            defaultValue={order?.status || "Pending"}
                            onChange={(e) =>
                              handleStatusChange(e.target.value, order)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value=" Worker Coming Today">
                              Worker Coming Today
                            </option>

                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            style={styles.button}
                            onClick={() => updateOrderStatus(order)}
                          >
                            Update Status
                          </button>
                        </div>

                        {/* Delivery Note Update */}
                        <div style={styles.actionRow}>
                          <textarea
                            value={deliveryNote[order.id] || ""}
                            onChange={(e) =>
                              handleDeliveryNoteChange(order.id, e.target.value)
                            }
                            style={styles.textarea}
                            placeholder="Add status note..."
                          />
                          <button
                            style={styles.button}
                            onClick={() => addDeliveryNote(order, deliveryNote)}
                          >
                            Update Note
                          </button>
                        </div>

                        {/* Complete Delivery */}
                        <div style={styles.actionRow}>
                          <button
                            style={styles.completeButton}
                            onClick={() => setShowModal(true)}
                          >
                            Skilled Workers Delivered
                          </button>
                        </div>

                        {showModal && (
                          <div
                            style={{
                              position: "fixed",
                              top: "0",
                              left: "0",
                              width: "100%",
                              height: "100%",
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: "white",
                                padding: "20px",
                                borderRadius: "10px",
                                textAlign: "center",
                              }}
                            >
                              <p>
                                Are you sure you want to complete this delivery?
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  margin: "12px",
                                }}
                              >
                                <p style={{ margin: 0, whiteSpace: "nowrap" }}>
                                  Enter HillsGO fee
                                </p>
                                <input
                                  style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "10px",
                                    padding: "12px",
                                    width: "100%", // You can also use fixed width like '150px'
                                  }}
                                  type="number"
                                  placeholder="Add a fee"
                                  required
                                  value={hillsgoFee[order.id] || ""}
                                  onChange={(e) =>
                                    handleHillsgoFeeChange(
                                      order.id,
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </div>

                              <button
                                style={{
                                  padding: "8px 15px",
                                  backgroundColor: "red",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                }}
                                onClick={() => setShowModal(false)}
                              >
                                Cancel
                              </button>
                              <button
                                style={{
                                  marginLeft: "10px",
                                  padding: "8px 15px",
                                  backgroundColor: "green",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  completeOrder(order, deliveryCode)
                                }
                              >
                                Yes, Confirm
                              </button>
                            </div>
                          </div>
                        )}
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

  value2: {
    padding: "10px",
    textAlign: "left",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    fontWeight: "bold",
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

  td: {
    padding: "8px",
    border: "1px solid #ddd",
    width: "100%",
  },
  th: {
    textAlign: "left",
    padding: "10px",
    backgroundColor: "#f4f4f4",
    border: "1px solid #ddd",
  },
  sectionHeader: {
    backgroundColor: "#e3f2fd",
    fontWeight: "bold",
    textAlign: "left",
    padding: "10px",
    fontSize: "16px",
    color: "#1e3a8a",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto", // Enables horizontal scrolling
    WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    backgroundColor: "#ffffff",
  },

  orderActionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    background: "#f9f9f9",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "500px",
    margin: "20px auto",
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  select: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    flex: "1",
  },
  textarea: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    flex: "1",
    minHeight: "60px",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  completeButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flex: "1",
    textAlign: "center",
  },
  input: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "12px",
    width: "100%",
    // display: "flex",
  },
};
