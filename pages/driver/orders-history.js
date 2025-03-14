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
  limit,
  startAfter,
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
import ImageSlider from "../../components/sliders/ImageSliders";
import { useUser } from "../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import DriverLayout from "@/components/layout/DriverLayout"; // Assuming you have a layout for Estore
import Driver from "@/components/auth/Driver";

export default function MyItems() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();
  const storage = getStorage();

  // useEffect(() => {
  //   if (userLoading) return;
  //   const fetchItems = async () => {
  //     if (!user) {
  //       router.push("/"); // Redirect if not logged in
  //       return;
  //     }

  //     try {
  //       const itemsQuery = query(
  //         collection(db, "ordersHistory"),
  //         where("driver.driverId", "==", user.uid) // Fetch products created by the logged-in user
  //       );

  //       const querySnapshot = await getDocs(itemsQuery);
  //       const itemsList = querySnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));

  //       setItems(itemsList); // Update state with fetched products
  //     } catch (error) {
  //       console.error("Error fetching items:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchItems();
  // }, [user, router]);

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
          where("driver.driverId", "==", user.uid),
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
  if (loading)
    return (
      <Driver>
        <DriverLayout>
          <Header />
          <p>Loading...</p>
        </DriverLayout>
      </Driver>
    );

  const groupedItems = items.reduce((acc, item) => {
    const orderDate = outputDateTime(item.createdAt).split(",")[0]; // Extract just the date (without time)

    if (!acc[orderDate]) {
      acc[orderDate] = [];
    }

    acc[orderDate].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedItems).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  

  return (
    <Driver>
      <DriverLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.heading}>My Delivered Items</h1>
          <div style={styles.productGrid}>
            {sortedDates.length > 0 ? (
              sortedDates.map((date) => (
                <div key={date}>
                  <h2
                    style={{
                      textAlign: "center",
                      margin: "20px 0",
                      color: "#333",
                    }}
                  >
                    {date} {/* Display Date Heading */}
                  </h2>
                  {groupedItems[date].map((item, index) => (
                    <div key={item.id} style={styles.productCard}>
                      <h3 style={{ textAlign: "center" }}>{index + 1}</h3>

                      <div key={item.id} style={styles.productCard}>
                        <div
                          style={{
                            backgroundColor: "#fff",
                            padding: "16px",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            borderLeft: "5px solid #4CAF50",
                            marginBottom: "10px",
                            maxWidth: "400px",
                          }}
                        >
                          <h3 style={{ color: "#333", marginBottom: "10px" }}>
                            Order Details
                          </h3>
                          <p>
                            <strong>Order ID:</strong> {item.orderId}
                          </p>
                          <p>
                            <strong>Delivery Address:</strong>{" "}
                            {item.userData.deliveryAddress}
                          </p>
                          <p>
                            <strong>Contact Name:</strong>{" "}
                            {item.product.userName}
                          </p>
                          <p>
                            <strong>Contact:</strong> {item.product.userContact}
                          </p>
                          <p>
                            <strong>Ordered Date:</strong>{" "}
                            {item.createdAt
                              ? new Date(
                                  item.createdAt.seconds * 1000
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Date of Delivery:</strong>{" "}
                            {item.deliveredAt
                              ? new Date(
                                  item.deliveredAt.seconds * 1000
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>No items found.</p>
            )}
          </div>
          <div>
            {hasMore && (
              <button onClick={fetchMoreItems} style={{ textAlign: "center" }}>
                Load More
              </button>
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
    borderRadius: "8px",
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
