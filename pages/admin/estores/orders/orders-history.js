import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  limit,
  startAfter,
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
import AdminLayout from "@/components/layout/AdminLayout"; // Assuming you have a layout for Estore
import Admin from "@/components/auth/Admin";
import Image from "next/image";

export default function MyItems() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
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
          collection(db, "ordersHistory"),
          orderBy("createdAt", "desc"), // Ensures sorting for pagination
          limit(20) // Fetch first 20
        );

        const querySnapshot = await getDocs(itemsQuery);
        if (!querySnapshot.empty) {
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // Store last document
          setItems(
            querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user, router]);

  const fetchMoreItems = async () => {
    if (!lastVisible || !hasMore) return; // Stop if no more items

    try {
      const nextQuery = query(
        collection(db, "ordersHistory"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(20)
      );

      const querySnapshot = await getDocs(nextQuery);

      if (!querySnapshot.empty) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // Update last doc
        setItems((prevItems) => [
          ...prevItems,
          ...querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        ]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more items:", error);
    }
  };

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

  const outputDateTime = (time) => {
    if (
      !time ||
      typeof time.seconds !== "number" ||
      typeof time.nanoseconds !== "number"
    ) {
      return "Invalid time";
    }

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
    const date = new Date(milliseconds);

    if (isNaN(date.getTime())) return "Invalid date";

    return {
      iso: date.toISOString(),
      formatted: date.toLocaleString("en-US", options),
    };
  };

  const groupedItems = items.reduce((acc, item) => {
    const orderDate = outputDateTime(item.createdAt).formatted.split(",")[0]; // Extract just the date (without time)

    if (!acc[orderDate]) {
      acc[orderDate] = [];
    }

    acc[orderDate].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedItems).sort(
    (a, b) => new Date(b) - new Date(a)
  );

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
          <h1>Delivered Items</h1>

          <div style={styles.productGrid}>
            {sortedDates.length > 0 ? (
              sortedDates.map((date) => (
                <div key={date}>
                  <h4
                    style={{
                      // textAlign: "center",
                      margin: "20px 0",
                      color: "#333",
                    }}
                  >
                    {date} {/* Display Date Heading */}
                  </h4>
                  {groupedItems[date].map((item, index) => (
                    <div key={item.id} style={styles.productCard}>
                      <h3 style={{ textAlign: "center" }}>{index + 1}</h3>
                      <img
                        src={item.product?.productData.images[0]} // Assuming first image is used for the card
                        alt="image detail"
                        style={styles.image}
                      />

                      <div style={styles.tableContainerBox}>
                        <div style={styles.tableContainer}>
                          <p style={styles.subTitle}>Order Details</p>
                          <table>
                            <tr>
                              <th>Order ID</th>
                              <td>{item.orderId}</td>
                            </tr>
                            <tr>
                              <th>Status</th>
                              <td>{item.status}</td>
                            </tr>
                            <tr>
                              <th>Ordered Date</th>
                              <td>{outputDateTime(item.createdAt).formatted}</td>
                            </tr>
                            <tr>
                              <th>Date of Delivery</th>
                              <td>{outputDateTime(item.deliveredAt).formatted}</td>
                            </tr>
                          </table>
                        </div>
                        {item.userData &
                        (
                          <div style={styles.tableContainer}>
                            <p className="subTitle">User Details</p>
                            <table>
                              <tr>
                                <th>Name</th>
                                <td>{item.userData?.userName}</td>
                              </tr>
                              <tr>
                                <th>Phone</th>
                                <td>{item.userData?.phone}</td>
                              </tr>
                              <tr>
                                <th>Email</th>
                                <td>{item.userData?.email}</td>
                              </tr>
                              <tr>
                                <th>Delivery Address</th>
                                <td>{item.userData?.deliveryAddress}</td>
                              </tr>
                            </table>
                          </div>
                        )}

                        <div class="table-container">
                          <p className="subTitle">Store Details</p>
                          <table>
                            <tr>
                              <th>Store Name</th>
                              <td>{item.estoreInfo?.estoreName}</td>
                            </tr>
                            <tr>
                              <th>Owner Name</th>
                              <td>{item.estoreInfo?.ownerName}</td>
                            </tr>
                            <tr>
                              <th>Owner Email</th>
                              <td>{item.estoreInfo?.ownerEmail}</td>
                            </tr>
                            <tr>
                              <th>Store Contact</th>
                              <td>{item.estoreInfo?.estoreContact}</td>
                            </tr>
                            <tr>
                              <th>Store Address</th>
                              <td>{item.estoreInfo?.estoreAddress}</td>
                            </tr>
                          </table>
                        </div>
                        <div class="table-container">
                          <p className="subTitle">Product Details</p>
                          <table>
                            <tr>
                              <th>Product Name</th>
                              <td>{item.product?.productData.name}</td>
                            </tr>
                            <tr>
                              <th>Product Description</th>
                              <td>{item.product?.productData.description}</td>
                            </tr>
                            <tr>
                              <th>Weight</th>
                              <td>{item.product?.productData.weight}</td>
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
                          <p className="subTitle">Driver Details</p>
                          <table>
                            <tr>
                              <th>Name</th>
                              <td>{item.driver?.name}</td>
                            </tr>
                          </table>
                        </div>
                        <div class="table-container">
                          <p className="subTitle">Pricing Details</p>
                          <table>
                            <tr>
                              <th>Price</th>
                              <td>₹{item.product?.productData.price}</td>
                            </tr>

                            <tr>
                              <th>Quantity</th>
                              <td>{item.product?.productData.quantity}</td>
                            </tr>

                            <tr>
                              <th>Subtotal</th>
                              <td>₹{item.product?.productData.subtotal}</td>
                            </tr>
                            <tr>
                              <th>Tip</th>
                              <td>₹{item.product?.tip}</td>
                            </tr>
                            <tr>
                              <th>Delivery Cost</th>
                              <td>₹{item.product?.deliveryCost}</td>
                            </tr>
                            <tr>
                              <th>Total Payment</th>
                              <td>
                                ₹
                                {item.product?.deliveryCost +
                                  item.product?.tip +
                                  item.product?.productData.subtotal}
                              </td>
                            </tr>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>No items found.</p>
            )}

            <div style={{ textAlign: "center" }}>
              {hasMore && (
                <button
                  onClick={fetchMoreItems}
                  style={{ textAlign: "center", marginTop: "2rem" }}
                >
                  Load More
                </button>
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
    maxWidth: "1200px",
    margin: "auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
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

  subTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    padding: "10px 15px",
    background:
      "linear-gradient(90deg, #ff7e5f, #feb47b)" /* Gradient background */,
    borderRadius: "8px",
    display: "inline-block",
    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
  },
};
