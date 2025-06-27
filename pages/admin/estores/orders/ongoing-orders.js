import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { db } from "../../../../firebase/firebase"; // Import your Firestore config
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
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { colors } from "@/data/colors";

import { useUser } from "../../../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";

export default function MyOrders() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryNote, setDeliveryNote] = useState({});
  const [orderDetail1, setOrderDetail1] = useState({});
  const [copiedThankYou, setCopiedThankYou] = useState(false);
  const [copiedAcknowledgement, setCopiedAcknowledgement] = useState(false);
  const router = useRouter();
  const storage = getStorage();

  const [deliveryCode, setDeliveryCode] = useState({});

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

  const copyText = (item) => {
    const copyItem = () => {
      return `*HILLSGO - Order Confirmation*

*Dear ${item.userData.userName},*
Thank you for placing your order with HILLSGO! Your order has been successfully received and is being processed.

Details: 
${item.product.productData.name} , 
Quantity – ${item.product.productData.quantity}
Order ID: *${item.orderId}*

Amount payable: *₹${
        item.product.deliveryCost +
        item.product.tip +
        item.product.productData.subtotal
      }*
Delivery Address: ${item.userData.deliveryAddress}


We'll send another update when it ships. If you have any questions, feel free to contact our support team.
We appreciate your trust in us and look forward to serving you further!

*Team HILLSGO* 

_Contact : +91-690-985-6940_
_www.hillsgo.com_
`;
    };
    navigator.clipboard.writeText(copyItem()).then(() => {
      setCopiedAcknowledgement(true);
      setTimeout(() => setCopiedAcknowledgement(false), 2000); // Reset after 2 seconds
    });
  };

  const copyTextWhatsapp = (item) => {
    return `*HILLSGO - Order Confirmation*

*Dear ${item.userData.userName},*
Thank you for placing your order with HILLSGO! Your order has been successfully received and is being processed.

Details: 
${item.product.productData.name} , 
Quantity – ${item.product.productData.quantity}
Order ID: *${item.orderId}*

Amount payable: *₹${
      item.product.deliveryCost +
      item.product.tip +
      item.product.productData.subtotal
    }*
Delivery Address: ${item.userData.deliveryAddress}


We'll send another update when it ships. If you have any questions, feel free to contact our support team.
We appreciate your trust in us and look forward to serving you further!

*Team HILLSGO* 

_Contact : +91-690-985-6940_
_www.hillsgo.com_
`;
  };

  const copyThankYouText = (item) => {
    const copyItem = () => {
      return `*HILLSGO - Order Delivered*

*Dear ${item.userData.userName},*
We're happy to inform you that your order has been successfully delivered!

Details: 
${item.product.productData.name} , 
Quantity – ${item.product.productData.quantity}
Order ID: *${item.orderId}*


If you have any questions or feedback, our team is always here to assist you.
We appreciate your trust in us and look forward to serving you further!

*Team HILLSGO* 

_Contact : +91-690-985-6940_
_www.hillsgo.com_
`;
    };
    navigator.clipboard.writeText(copyItem()).then(() => {
      setCopiedThankYou(true);
      setTimeout(() => setCopiedThankYou(false), 2000); // Reset after 2 seconds
    });
  };

  const copyThankYouWhatsapp = (item) => {
    return `*HILLSGO - Order Confirmation*

*Dear ${item.userData.userName},*
We're happy to inform you that your order has been successfully delivered!

Details: 
${item.product.productData.name} , 
Quantity – ${item.product.productData.quantity}
Order ID: *${item.orderId}*

If you have any questions or feedback, our team is always here to assist you.
We appreciate your trust in us and look forward to serving you further!

*Team HILLSGO* 

_Contact : +91-690-985-6940_
_www.hillsgo.com_
`;
  };

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

  const handleDeliveryCodeChange = (id, value) => {
    setDeliveryCode((prev) => ({
      ...prev,
      [id]: value, // Update only the specific item
    }));
  };

  const completeOrder = async (order, deliveryCode) => {
    if (!order?.id) {
      alert("Invalid order ID");
      return;
    }

    try {
      const orderRef = doc(db, "orders", order.id);

      // Get the current order data
      const orderSnapshot = await getDoc(orderRef);
      if (!orderSnapshot.exists()) {
        alert("Order not found");
        return;
      }

      const orderData = orderSnapshot.data();

      if (Number(order.deliveryCode) !== Number(deliveryCode[order.orderId])) {
        alert("Wrong delivery code. Please try again.");
        return;
      }

      const targetDocRef = doc(db, "ordersHistory", order.id);

      await runTransaction(db, async (transaction) => {
        transaction.set(targetDocRef, {
          ...orderData,
          status: "completed",
          driver: {
            name: "Admin",
            image: "",
            driverId: "",
          },
          deliveredAt: serverTimestamp(),
        });
        transaction.delete(orderRef);
      });

      alert("Order completed successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

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

    const newStatus = deliveryNote[order.orderId];

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
          <h1>Current Orders</h1>
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
                          <th>Delivery Code: </th>
                          <td>{item.deliveryCode}</td>
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
                    <div style={{ marginTop: "20px", textAlign: "left" }}>
                      {/* <label
                        htmlFor={`status-${index}`}
                        style={{ marginRight: "10px", fontWeight: "bold" }}
                      >
                        Delivery Note:
                      </label> */}

                      <label>
                        <textarea
                          value={deliveryNote[item.orderId] || ""}
                          onChange={(e) =>
                            handleNoteChange(item.orderId, e.target.value)
                          }
                          style={{
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            marginRight: "10px",
                          }}
                        />
                      </label>
                      <br></br>
                      <button
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          marginTop: "10px",
                        }}
                        onClick={() => addDeliveryNote(item, deliveryNote)}
                      >
                        Update Delivery Note
                      </button>

                      <div className="d-flex">
                        <div>
                          {/* <input
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                        /> */}
                          <button
                            style={{
                              padding: "10px 20px",
                              backgroundColor: "#107a8b",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              marginTop: "10px",
                            }}
                            onClick={() => {
                              const phoneNumber = item.userData.phone; // Ensure it's in the correct format
                              const message = encodeURIComponent(
                                copyTextWhatsapp(item)
                              );

                              window.open(
                                `https://wa.me/${phoneNumber}?text=${message}`,
                                "_blank"
                              );
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-whatsapp"
                              viewBox="0 0 16 16"
                            >
                              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                            </svg>
                            &#8202; Send Acknowledgement
                          </button>
                        </div>
                        <div>
                          {/* <input
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                        /> */}
                          <button
                            style={{
                              padding: "10px 20px",
                              backgroundColor: "#ff9f68",
                              color: "white",
                              border: "1px solid white",
                              borderRadius: "5px",
                              cursor: "pointer",
                              marginTop: "10px",
                            }}
                            onClick={() => copyText(item)}
                          >
                            Copy
                          </button>
                          {copiedAcknowledgement && (
                            <span
                              style={{ marginLeft: "10px", color: "green" }}
                            >
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="d-flex">
                        <div>
                          {/* <input
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                        /> */}
                          <button
                            style={{
                              padding: "10px 20px",
                              backgroundColor: "#107a8b",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              marginTop: "10px",
                            }}
                            onClick={() => {
                              const phoneNumber = item.userData.phone; // Ensure it's in the correct format
                              const message = encodeURIComponent(
                                copyThankYouWhatsapp(item)
                              );

                              window.open(
                                `https://wa.me/${phoneNumber}?text=${message}`,
                                "_blank"
                              );
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-whatsapp"
                              viewBox="0 0 16 16"
                            >
                              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                            </svg>
                            &#8202; Send Thank You
                          </button>
                        </div>
                        <div>
                          {/* <input
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                        /> */}
                          <button
                            style={{
                              padding: "10px 20px",
                              backgroundColor: "#ff9f68",
                              color: "white",
                              border: "1px solid white",
                              borderRadius: "5px",
                              cursor: "pointer",
                              marginTop: "10px",
                            }}
                            onClick={() => copyThankYouText(item)}
                          >
                            Copy
                          </button>
                          {copiedThankYou && (
                            <span
                              style={{ marginLeft: "10px", color: "green" }}
                            >
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: "20px" }}>
                        {/* <label
                        htmlFor={`status-${index}`}
                        style={{ marginRight: "10px", fontWeight: "bold" }}
                      >
                        Delivery Code:
                      </label> */}

                        <input
                          type="number"
                          placeholder="Enter delivery code"
                          value={deliveryCode[item.orderId]}
                          onChange={(e) =>
                            handleDeliveryCodeChange(
                              item.orderId,
                              e.target.value
                            )
                          }
                          style={{
                            padding: "8px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            marginRight: "10px",
                          }}
                        />
                        <br></br>
                        <button
                          style={{
                            padding: "10px 20px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginTop: "10px",
                          }}
                          onClick={() => completeOrder(item, deliveryCode)}
                        >
                          Complete Delivery
                        </button>
                      </div>
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
