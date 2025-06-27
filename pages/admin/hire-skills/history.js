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
import DropdownSorting from "@/components/ui/dropdowns";

export default function PickDropOrders() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSort, setSelectedSort] = useState("desc");
  const [sortDefault, setSortDefault] = useState("Newest First");

  const router = useRouter();

  const fetchOrders = async (sortValue) => {
    if (!user) {
      router.push("/"); // Redirect if not logged in
      return;
    }

    try {
      const ordersQuery = query(
        collection(db, "hireSkillsHistory"),
        orderBy("deliveredAt", sortValue)
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
    fetchOrders(selectedSort);
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

  const handleDropdownSortChange = (value) => {
    setSelectedSort(value);
    fetchOrders(value);
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
            <h1>Hire Skills History</h1>
            <div>
              <DropdownSorting
                label={sortDefault}
                value={selectedSort}
                options={[
                  { label: "Latest First", value: "desc" },
                  { label: "Oldest First", value: "asc" },
                ]}
                onChange={handleDropdownSortChange}
              />
            </div>
            <div style={styles.productGrid}>
              {orders.length > 0 ? (
                orders.map((order, index) =>
                  order ? (
                    <div key={index} style={styles.productCard}>
                      <h3
                        style={{
                          // textAlign: "center",
                          // marginBottom: "20px",
                          color: "#333",
                        }}
                        className="subTitle"
                      >
                        {index + 1}
                      </h3>
                      <div style={styles.tableWrapper}>
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                          className="tableNoSpace"
                        >
                          <tbody>
                            {/* Order Details */}
                            <tr>
                              <th style={styles.label}>Request ID:</th>
                              <td style={styles.value}>{order.id}</td>
                              <th style={styles.label}>Order ID:</th>
                              <td style={styles.value}>{order.orderId}</td>
                            </tr>
                            <tr>
                              <th style={styles.label}>Status:</th>
                              <td style={styles.value}>{order.status}</td>
                            </tr>
                            <tr>
                              <th style={styles.label}>Ordered Date:</th>
                              <td style={styles.value}>
                                {outputDateTime(order.createdAt)}
                              </td>
                              <th style={styles.label}>Completion Date:</th>
                              <td style={styles.value}>
                                {outputDateTime(order.deliveredAt)}
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
                            <tr>
                              <th colSpan="4" style={styles.sectionHeader}>
                                Pricing Details
                              </th>
                            </tr>
                            <tr>
                              <th style={styles.label}>HillsGO Earning:</th>
                              <td style={styles.value2}>
                                {order.hasOwnProperty("fee") &&
                                typeof order.fee === "number"
                                  ? `₹${order.fee.toFixed(2)}`
                                  : ""}
                              </td>
                            </tr>
                            <tr>
                              <th style={styles.label}>Workers Earning:</th>
                              <td colSpan="3" style={styles.value}>
                                {order.hasOwnProperty("workerEarning") &&
                                typeof order.workerEarning === "number"
                                  ? `₹${order.workerEarning.toFixed(2)}`
                                  : ""}
                              </td>
                            </tr>

                            <tr>
                              <th colSpan="4" style={styles.sectionHeader}>
                                Worker Details
                              </th>
                            </tr>
                            <tr>
                              <th style={styles.label}>Worker Name:</th>
                              <td style={styles.value2}>
                                {order.hasOwnProperty("workerName")
                                  ? `${order.workerName}`
                                  : ""}
                              </td>
                              <th style={styles.label}>Worker Contact:</th>
                              <td style={styles.value2}>
                                {order.hasOwnProperty("workerContact")
                                  ? `${order.workerContact}`
                                  : ""}
                              </td>
                            </tr>
                            <tr>
                              <th style={styles.label}>Local Or Non-Local:</th>
                              <td style={styles.value}>
                                {order.hasOwnProperty("localNonLocal")
                                  ? `${order.localNonLocal}`
                                  : ""}
                              </td>
                              <th style={styles.label}>Worker Rating:</th>
                              <td style={styles.value}>
                                {order.hasOwnProperty("workerRating") &&
                                typeof order.workerEarning === "number"
                                  ? `${order.workerRating.toFixed(2)}`
                                  : ""}
                              </td>
                            </tr>
                            <tr>
                              <th colSpan="4" style={styles.sectionHeader}>
                                Remark
                              </th>
                            </tr>
                            <tr>
                              <td style={styles.value}>
                                {order.hasOwnProperty("remark")
                                  ? `${order.remark}`
                                  : ""}
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
