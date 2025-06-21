import React, { useState, useEffect, useRef } from "react";

import { db } from "../../../firebase/firebase";
import { addDoc, collection } from "firebase/firestore";

import AdminLayout from "@/components/layout/AdminLayout";
import Admin from "@/components/auth/Admin";
import Header from "@/components/Header";
import { useUser } from "../../../contexts/UserContext";

const PickDropRequestForm = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userId, setUserId] = useState();

  const [modalVisible, setModalVisible] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderLocation, setSenderLocation] = useState("");
  const [itemDetail, setItemDetail] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverLocation, setReceiverLocation] = useState("");

  const [itemSize, setItemSize] = useState("");
  const [itemWeight, setItemWeight] = useState("");
  const [instruction, setInstruction] = useState("");

  const flatListRef = useRef(null);
  const { user } = useUser();

  const [currentIndex, setCurrentIndex] = useState(0);

  const sections = [
    { id: "1", title: "Pick From" },
    { id: "2", title: "Drop At" },
    { id: "3", title: "Item Details" },
  ];

  const handleNext = () => {
    console.log("current Index", currentIndex);

    if (currentIndex < sections.length - 1) {
      //   flatListRef.current.scrollToIndex({ currentIndex: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      //   flatListRef.current.scrollToIndex({ currentIndex: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const validateDataFirst = () => {
    const validateData = () => {
      if (
        !receiverName ||
        !receiverPhone ||
        !receiverLocation ||
        !senderLocation
      ) {
        return false;
      }
      return true;
    };

    if (validateData()) {
      setModalVisible(true);
    } else {
      window.alert("Fill all (*) fields to place your Pick & Drop order");
    }
  };

  const handleConfirmSubmit = async () => {
    // setModalVisible(false);
    setSubmitting(true);
    const pickDrop = {
      userId: isSignedIn ? userId : "",
      senderName,
      senderPhone,
      senderLocation,

      receiverName,
      receiverPhone,
      receiverLocation,
      itemSize,
      itemWeight,
      itemDetail,
      instruction,
    };
    const userData = {
      userInfo: userDetails ? userDetails : "N/A",
    };

    try {
      await addDoc(collection(db, "pickDropOngoing"), {
        userId: isSignedIn ? userId : "",
        senderName,
        senderPhone,
        senderLocation,
        itemDetail,
        receiverName,
        receiverPhone,
        receiverLocation,
        itemSize,
        itemWeight,
        instruction,
        createdBy: "Admin",
        adminEmail: user.email,
        createdAt: new Date(),
      });
      await sendPickDropRequestEmail(userData, pickDrop);
      window.alert(
        "Success!",
        `Our driver is on the way to pick up your order.`
      );
      setSenderName("");
      setSenderPhone("");
      setSenderLocation("");

      setReceiverName("");
      setReceiverPhone("");
      setReceiverLocation("");

      setItemSize("");
      setItemWeight("");
      setInstruction("");
      setItemDetail("");
    } catch (error) {
      console.error("Error adding document: ", error);
      window.alert("Error", "Could not save appointment. Please try again.");
    } finally {
      setSubmitting(false);
      setModalVisible(false);
    }
  };

  const sendPickDropRequestEmail = async (userData, pickDrop) => {
    const item = {
      userData,
      pickDrop,
    };
    let placeOrderUrl;
    console.log("env", process.env.NODE_ENV);

    // ="https://seahorse-app-pir2f.ondigitalocean.app/api/emails/send-pick-drop-request-notification";
    if (process.env.NODE_ENV === "development") {
      placeOrderUrl =
        "http://localhost:8000/api/emails/send-pick-drop-request-notification";
    } else {
      placeOrderUrl =
        "https://seahorse-app-pir2f.ondigitalocean.app/api/emails/send-pick-drop-request-notification";
    }

    try {
      const response = await fetch(
        placeOrderUrl,

        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item }), // Send all results to the server
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error sending notification:", error);

      window.alert("Error sending notification. Please try again.");
      throw error; // Optionally propagate the error for further handling
    }
  };

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div className="container">
          {/* Gradient Banner */}
          <div colors={["#8360c3", "#2ebf91"]}>
            {/* <p style={styles.title}>Hire Skills</p> */}
            
            {/* <Lottiediv
          source={require("../../assets/animations/pickdrop.json")}
          autoPlay
          loop
          style={styles.lottie}
        /> */}
          </div>

          {/* Lottie Animation */}

          <div className="container">
           
            {/* Section 1: Personal Details */}
            {currentIndex === 0 && (
              <div className="section">
                 <h1 >New Pick & Drop</h1>
                <p style={styles.label}>From whom should we pick?</p>
                <input
                  style={styles.input}
                  placeholder="Enter the person name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
                <p style={styles.label}>Pick up contact</p>
                <input
                  style={styles.input}
                  type="tel"
                  placeholder="Enter phone number"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                />
                <p style={styles.label}>Pick up location *</p>
                <input
                  style={styles.input}
                  placeholder="Enter address"
                  value={senderLocation}
                  onChange={(e) => setSenderLocation(e.target.value)}
                />
              </div>
            )}

            {/* Section 2: Service Details */}
            {currentIndex === 1 && (
              <div>
                <p style={styles.label}>Who will be receiving it? *</p>
                <input
                  style={styles.input}
                  placeholder="Enter the person name"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
                <p style={styles.label}>Receiver&apos;s contact *</p>
                <input
                  style={styles.input}
                  placeholder="Enter receiver's phone number"
                  keyboardType="phone-pad"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                />
                <p style={styles.label}>Receiver&apos;s location *</p>
                <input
                  style={styles.input}
                  placeholder="Enter receiver's address"
                  value={receiverLocation}
                  onChange={(e) => setReceiverLocation(e.target.value)}
                />
              </div>
            )}

            {/* Section 3: Appointment */}
            {currentIndex === 2 && (
              <>
                {/* <p style={styles.label}>Select an appointment Date</p> */}
                <p style={styles.label}>
                  What may be the approx size of the item?
                </p>
                <input
                  style={styles.input}
                  placeholder="Enter dimensions"
                  value={itemSize}
                  onChange={(e) => setItemSize(e.target.value)}
                />
                <p style={styles.label}>Approx Weight(In kgs)</p>
                <input
                  style={styles.input}
                  placeholder="Enter weight (In Kgs)"
                  value={itemWeight}
                  onChange={(e) => setItemWeight(e.target.value)}
                />
                <p style={styles.label}>Please specify the item detail</p>
                <input
                  style={styles.input}
                  placeholder="Enter item details"
                  value={itemDetail}
                  onChange={(e) => setItemDetail(e.target.value)}
                />
                <p style={styles.label}>Any instructions?</p>
                <input
                  style={styles.textArea}
                  placeholder="Enter instructions (include time & date if needed, or it'll be immediate by default)."
                  multiline
                  numberOfLines={5}
                  onChange={(e) => setInstruction(e.target.value)}
                  value={instruction}
                  required
                />
              </>
            )}

            {/* Navigation Buttons */}
            <div style={styles.buttonRow}>
              {currentIndex > 0 && (
                <button style={styles.backButton} onClick={handleBack}>
                  <p style={styles.buttonText}>Back</p>
                </button>
              )}

              {currentIndex < sections.length - 1 && (
                <button style={styles.nextButton} onClick={handleNext}>
                  <p style={styles.buttonText}>Next</p>
                </button>
              )}
              {currentIndex == sections.length - 1 && (
                <button
                  style={styles.nextButton}
                  onClick={() => validateDataFirst()}
                >
                  <p style={styles.buttonText}>Submit</p>
                </button>
              )}
            </div>
          </div>

          {/* Confirmation Modal */}
          {modalVisible && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalContainer}>
                <div style={styles.modalContent}>
                  <p style={styles.modalTitle}>Confirm</p>
                  <p style={styles.modalText}>
                    Are you sure you want to order a Pick & Drop?
                  </p>
                  <div style={styles.buttonContainer}>
                    <button
                      style={styles.backButton}
                      onClick={() => setModalVisible(false)}
                    >
                      <p style={styles.buttonText}> Cancel</p>
                    </button>
                    <button
                      style={styles.submitButton1}
                      onClick={handleConfirmSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <span className="loader" style={styles.loader}>
                          Please wait...
                        </span>
                      ) : (
                        <p style={styles.buttonText2}> Confirm</p>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </Admin>
  );
};

const styles = {
  card: { alignItems: "center", marginBottom: 20 },
  sectionContainer: { textAlign: "center" },
  icon: { color: "#555" },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: "2rem",
  },
  label2: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },
  label3: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    minWidth: "50%",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5, // For Android shadow
    margin: 10,
    borderWidth: 1,
    borderColor: "black",
  },
  card2: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5, // For Android shadow
    margin: 10,
  },

  textArea: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    height: 80,
    borderColor: "#ccc",
    minWidth: "50%",
  },

  nextButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
    width: "250px",
  },
  submitButton1: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
    width: "250px",
  },
  backButton: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
    width: "250px",
  },
  submitButton: { backgroundColor: "#28a745", padding: 15, borderRadius: 5 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16 },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    maxWidth: 400,
    width: "90%",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  modalText: {
    fontSize: "1rem",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },

  loader: {
    width: "250px",
    height: 16,
    border: "2px solid #fff",

    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  //   buttonContainer: {
  //     flexDirection: "row",
  //     justifyContent: "space-between",
  //     width: "100%",
  //   },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonText2: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton1: {
    borderWidth: 2,
    borderColor: "black",
    alignSelf: "flex-start", // Makes it take only p width
    paddingVertical: 10,
    paddingHorizontal: 10, // Adjust spacing to fit the p
    borderRadius: 5,
    backgroundColor: "black",
    color: "white",
    top: 10,
    marginLeft: 20,
  },
  lottie: {
    width: 100,
    height: 100, // Adjust size for the Lottie animation
    marginRight: 10, // Space between Lottie and p
  },

  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 15, // Instead of "padding: '10px 15px'"
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
    alignSelf: "center", // React Native doesn't support "inlineBlock"

    // Background Gradient (Requires react-native-linear-gradient)
    overflow: "hidden", // Ensures borderRadius works with gradients
    shadowColor: "#000", // Shadow equivalent for box-shadow
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5, // For Android shadow
  },

  // backButton: {
  //   position: "absolute",
  //   left: 15,
  //   top: 10,
  //   backgroundColor: "#333",
  //   borderRadius: 25,
  //   padding: 8, // Bigger tap area
  //   elevation: 5, // Shadow effect
  //   zIndex: 10,
  // },
  textContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "bold",

    color: "black",
    // color: "#fff",
  },
  lottie: {
    width: 250,
    height: 250,
    marginTop: 20,
  },

  // backButton: {
  //   position: "absolute",
  //   top: 10,
  //   left: 20,
  //   zIndex: 10,
  //   backgroundColor: "rgba(0,0,0,0.4)",
  //   borderRadius: 20,
  //   padding: 8,
  // },
  gradient: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 15,
    paddingTop: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  title: {
    fontSize: 28,
    color: "black",

    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: "5rem",
    fontWeight: "500",

    // letterSpacing: 0.6,
  },
  highlight: {
    fontWeight: "bold",
    color: "black", // Gold highlight
  },
  lottie: {
    width: "90%",
    height: 80,
    alignSelf: "center",
  },
};

export default PickDropRequestForm;
