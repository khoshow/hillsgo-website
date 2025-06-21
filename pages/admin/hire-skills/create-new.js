import React, { useState, useEffect, useRef } from "react";

import { db } from "../../../firebase/firebase";
import { addDoc, collection } from "firebase/firestore";

import AdminLayout from "@/components/layout/AdminLayout";
import Admin from "@/components/auth/Admin";
import Header from "@/components/Header";
import Calendar from "react-calendar";
import { useUser } from "../../../contexts/UserContext";
import { colors } from "@/data/colors";

const WorkerAppointmentForm = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userId, setUserId] = useState();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useUser();
  const flatListRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");

        if (userData) {
          let userInfo = JSON.parse(userData);
          setUserDetails(userData);
          setUserId(userInfo.id);
          setIsSignedIn(true); // Update the state to reflect that the user is signed in
        } else {
          setIsSignedIn(false); // No user data found
        }
      } catch (error) {
        console.log("Error fetching stored user data: ", error);
      }
    };

    checkUser(); // Call the async function inside useEffect
  }, []);

  const sections = [
    { id: "1", title: "Personal Details" },
    { id: "2", title: "Service Details" },
    { id: "3", title: "Appointment" },
  ];

  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const validateDataFirst = () => {
    const validateData = () => {
      if (
        !name ||
        !phone ||
        !selectedDate ||
        !description ||
        !location ||
        !service
      ) {
        return false;
      }
      return true;
    };

    if (validateData()) {
      setModalVisible(true);
    } else {
      window.alert("Please fill all fields to make an appointment!");
    }
  };

  const handleConfirmSubmit = async () => {
    // setModalVisible(false);
    setSubmitting(true);
    const skills = {
      userId: isSignedIn ? userId : "",
      name,
      phone,
      date: formatDate(selectedDate),
      description,
      location,
      service,
    };
    const userData = {
      userInfo: userDetails ? userDetails : "N/A",
    };

    try {
      await addDoc(collection(db, "hireSkillsOngoing"), {
        userId: isSignedIn ? userId : "",
        name,
        phone,
        date: formatDate(selectedDate),
        description,
        location,
        service,
        createdBy: "Admin",
        adminEmail: user.email,
        createdAt: new Date(),
      });
      await sendWorkerAppointmentEmail(userData, skills);
      window.alert(
        "Success!",
        `We'll start looking for your skilled worker right away!`
      );
      setName("");
      setPhone("");
      setSelectedDate("");
      setDescription("");
      setLocation("");
      setService("");
    } catch (error) {
      console.error("Error adding document: ", error);
      window.alert("Error", "Could not save appointment. Please try again.");
    } finally {
      setSubmitting(false);
      setModalVisible(false);
    }
  };

  const sendWorkerAppointmentEmail = async (userData, skills) => {
    const item = {
      userData,
      skills,
    };
    let placeOrderUrl;
    // ="https://seahorse-app-pir2f.ondigitalocean.app/api/emails/send-worker-appointment-notification";
    if (process.env.NODE_ENV === "development") {
      placeOrderUrl =
        "http://localhost:8000/api/emails/send-worker-appointment-notification";
    } else {
      placeOrderUrl =
        "https://seahorse-app-pir2f.ondigitalocean.app/api/emails/send-worker-appointment-notification";
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }); // Converts to "dd/mm/yyyy"
  };

  const handleSubmit = () => {
    if (!name || !phone || !selectedDate) {
      window.alert("Error", "Please fill in all fields");
      return;
    }
    setModalVisible(true); // Open confirmation modal
  };

  return (
    <div>
      <Admin>
        <AdminLayout>
          <Header />
          <div style={styles.container} className="container">
            <div style={styles.sectionContainer}>
              {/* Section 1: Personal Details */}
              {currentIndex === 0 && (
                <>
                  <h1>Hire Skills</h1>

                  {/* <Icon name="account-hard-hat" style={styles.icon} size={40} />
                   */}
                  <h3 style={styles.label}>
                    Please fill the customer form to create a new appointment
                  </h3>

                  <p style={styles.label}>Customer Name</p>
                  <input
                    style={styles.input}
                    placeholder="Enter customer name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p style={styles.label}>Phone Number</p>
                  <input
                    style={styles.input}
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </>
              )}

              {/* Section 2: Service Details */}
              {currentIndex === 1 && (
                <>
                  <p style={styles.label}>Service Type</p>
                  <input
                    style={styles.input}
                    placeholder="e.g. Plumber, Electrician"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  />
                  <p style={styles.label}>Location</p>
                  <input
                    style={styles.input}
                    placeholder="Enter work Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <p style={styles.label}>Description</p>
                  <input
                    style={styles.textArea}
                    placeholder="Describe what the customer wants to get done"
                    multiline
                    numberOfLines={5}
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    required
                  />
                </>
              )}

              {/* Section 3: Appointment */}
              {currentIndex === 2 && (
                <>
                  {/* <p style={styles.label}>Select an appointment Date</p> */}
                  <p style={styles.label}>
                    {selectedDate
                      ? `Selected Date: ${formatDate(selectedDate)}`
                      : "When does the customer wants it? Please select a date."}
                  </p>
                  <div style={styles.calendar}>
                    <Calendar
                      onChange={(selectedDate) => setSelectedDate(selectedDate)}
                      value={selectedDate}
                      className="calendar"
                    />
                  </div>

                  {/* <button
                  style={styles.submitButton1}
                  onClick={() => setModalVisible(true)}
                >
                  <p style={styles.submitText}>Make an appointment</p>
                </button> */}
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
                    <p style={styles.modalTitle}>Confirm Appointment</p>
                    <p style={styles.modalText}>
                      Are you sure you want to schedule a worker appointment for{" "}
                      {formatDate(selectedDate)}?
                    </p>
                    <div style={styles.buttonContainer}>
                      <button
                        style={styles.backButton}
                        onClick={() => setModalVisible(false)}
                      >
                        <p style={styles.buttonText}>Cancel</p>
                      </button>
                      <button
                        style={styles.submitButton1}
                        onClick={() => {
                          handleConfirmSubmit();
                        }}
                        disabled={submitting ? true : false}
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
    </div>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: "#fff" },
  sectionContainer: { padding: 20 },
  card: { alignItems: "center", marginBottom: 20 },
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
  cardText: {
    fontSize: 14,
    color: "black",

    textAlign: "left", // Justification workaround
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
  buttonText2: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
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
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

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
    color: "white",
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
    textAlign: "center",
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
  p: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
    fontWeight: "500",
    lineHeight: 24,
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

  calendar: {
    marginTop: "2rem",
  },
};

export default WorkerAppointmentForm;
