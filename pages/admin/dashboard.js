// pages/login.js
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { useUser } from "../../contexts/UserContext";
import { auth, db } from "../../firebase/firebase";
import Admin from "../../components/auth/Admin";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API = process.env.API_DOMAIN_SERVER;

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [roleOption, setRoleOption] = useState("");
  const [roleDisplay, setRoleDisplay] = useState(true);
  const [loading, setLoading] = useState(true);

  const { user, setUser } = useUser();
  const router = useRouter();

  const [pickDropData, setPickDropData] = useState([]);
  const [last30DaysCount, setPickDropLast30DaysCount] = useState(0);

  const [hireSkillsData, setHireSkillsData] = useState([]);
  const [hireSkillsLast30DaysCount, setHireSkillsLast30DaysCount] = useState(0);

  const [estoresData, setEstoresData] = useState([]);
  const [estoresLast30DaysCount, setEstoresLast30DaysCount] = useState(0);

  useEffect(() => {
    const fetchLast7DaysData = async () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      const q = query(
        collection(db, "pickDropHistory"),
        where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPickDropData(results);
    };

    fetchLast7DaysData();
  }, []);

  useEffect(() => {
    const fetchLast30DaysCount = async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const q = query(
        collection(db, "pickDropHistory"),
        where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
      );

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPickDropLast30DaysCount(results.length); // 👈 Only count
    };

    fetchLast30DaysCount();
  }, []);

  const formatDateToWords = (isoDateStr) => {
    const date = new Date(isoDateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getDateString = (timestamp) => {
    const date = timestamp.toDate();
    return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
  };

  // Step 1: Prepare last 7 days
  const today = new Date();
  const dateKeys = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
    dateKeys.push({ key, count: 0 });
  }

  // Step 2: Count entries per day
  pickDropData.forEach((item) => {
    if (!item.createdAt) return;

    const dateStr = getDateString(item.createdAt);
    const match = dateKeys.find((entry) => entry.key === dateStr);
    if (match) {
      match.count++;
    }
  });

  // Step 3: Convert to desired array format
  const resultArray = dateKeys.map((entry, index) => ({
    id: index + 1,
    date: formatDateToWords(entry.key),
    count: entry.count,
  }));

  // Hire Skills

  useEffect(() => {
    const fetchHireSkillsLast7DaysData = async () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      const q = query(
        collection(db, "hireSkillsHistory"),
        where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))
      );

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setHireSkillsData(results);
    };

    fetchHireSkillsLast7DaysData();
  }, []);

  useEffect(() => {
    const fetchHireSkillsLast30DaysCount = async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const q = query(
        collection(db, "pickDropHistory"),
        where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
      );

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setHireSkillsLast30DaysCount(results.length); // 👈 Only count
    };

    fetchHireSkillsLast30DaysCount();
  }, []);

  const hireSkillsFormatDateToWords = (isoDateStr) => {
    const date = new Date(isoDateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const hireSkillsGetDateString = (timestamp) => {
    const date = timestamp.toDate();
    return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
  };

  // Step 1: Prepare last 7 days

  const hireSkillsDateKeys = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
    hireSkillsDateKeys.push({ key, count: 0 });
  }

  // Step 2: Count entries per day
  hireSkillsData.forEach((item) => {
    if (!item.createdAt) return;

    const dateStr = hireSkillsGetDateString(item.createdAt);
    const match = hireSkillsDateKeys.find((entry) => entry.key === dateStr);
    if (match) {
      match.count++;
    }
  });

  // Step 3: Convert to desired array format
  const hireSkillsResultArray = hireSkillsDateKeys.map((entry, index) => ({
    id: index + 1,
    date: hireSkillsFormatDateToWords(entry.key),
    count: entry.count,
  }));

  // Hire Skills

  // Estores

  useEffect(() => {
    const fetchEstoresLast7DaysData = async () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      const q = query(
        collection(db, "estoresHistory"),
        where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))
      );

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEstoresData(results);
    };

    fetchEstoresLast7DaysData();
  }, []);

  useEffect(() => {
    const fetchEstoresLast30DaysCount = async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const q = query(
        collection(db, "ordersHistory"),
        where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
      );

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEstoresLast30DaysCount(results.length); // 👈 Only count
    };

    fetchEstoresLast30DaysCount();
  }, []);

  const estoresFormatDateToWords = (isoDateStr) => {
    const date = new Date(isoDateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const estoresGetDateString = (timestamp) => {
    const date = timestamp.toDate();
    return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
  };

  // Step 1: Prepare last 7 days

  const estoresDateKeys = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
    estoresDateKeys.push({ key, count: 0 });
  }

  // Step 2: Count entries per day
  estoresData.forEach((item) => {
    if (!item.createdAt) return;

    const dateStr = estoresGetDateString(item.createdAt);
    const match = estoresDateKeys.find((entry) => entry.key === dateStr);
    if (match) {
      match.count++;
    }
  });

  // Step 3: Convert to desired array format
  const estoresResultArray = estoresDateKeys.map((entry, index) => ({
    id: index + 1,
    date: estoresFormatDateToWords(entry.key),
    count: entry.count,
  }));

  // Estores

  const dataPickDrop = [
    {
      name: "6 days ago",
      trip: resultArray[6].count,
      amt: resultArray[6].count * 50,
    },
    {
      name: "5",
      trip: resultArray[5].count,
      amt: resultArray[5].count * 50,
    },
    {
      name: "4",
      trip: resultArray[4].count,
      amt: resultArray[4].count * 50,
    },
    {
      name: "3",
      trip: resultArray[3].count,
      amt: resultArray[3].count * 50,
    },
    {
      name: "2 Days Ago",
      trip: resultArray[2].count,
      amt: resultArray[2].count * 50,
    },
    {
      name: "Yesterday",
      trip: resultArray[1].count,
      amt: resultArray[1].count * 50,
    },
    {
      name: "Today",
      trip: resultArray[0].count,
      amt: resultArray[0].count * 50,
    },
  ];

  const dataHireSkills = [
    {
      name: "6 days ago",
      request: hireSkillsResultArray[6].count,
      amt: hireSkillsResultArray[6].count * 50,
    },
    {
      name: "5",
      request: hireSkillsResultArray[5].count,
      amt: hireSkillsResultArray[5].count * 50,
    },
    {
      name: "4",
      request: hireSkillsResultArray[4].count,
      amt: hireSkillsResultArray[4].count * 50,
    },
    {
      name: "3",
      request: hireSkillsResultArray[3].count,
      amt: hireSkillsResultArray[3].count * 50,
    },
    {
      name: "2 Days Ago",
      request: hireSkillsResultArray[2].count,
      amt: hireSkillsResultArray[2].count * 50,
    },
    {
      name: "Yesterday",
      request: hireSkillsResultArray[1].count,
      amt: hireSkillsResultArray[1].count * 50,
    },
    {
      name: "Today",
      request: hireSkillsResultArray[0].count,
      amt: hireSkillsResultArray[0].count * 50,
    },
  ];

  const dataEstores = [
    {
      name: "6 days ago",
      order: estoresResultArray[6].count,
      amt: estoresResultArray[6].count * 50,
    },
    {
      name: "5",
      order: estoresResultArray[5].count,
      amt: estoresResultArray[5].count * 50,
    },
    {
      name: "4",
      order: estoresResultArray[4].count,
      amt: estoresResultArray[4].count * 50,
    },
    {
      name: "3",
      order: estoresResultArray[3].count,
      amt: estoresResultArray[3].count * 50,
    },
    {
      name: "2 Days Ago",
      order: estoresResultArray[2].count,
      amt: estoresResultArray[2].count * 50,
    },
    {
      name: "Yesterday",
      order: estoresResultArray[1].count,
      amt: estoresResultArray[1].count * 50,
    },
    {
      name: "Today",
      order: estoresResultArray[0].count,
      amt: estoresResultArray[0].count * 50,
    },
  ];

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container} className="container">
          <h1 style={styles.heading}>Ongoing Orders Management</h1>
          <div style={styles.productGrid}>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => router.push(`/admin/orders/ongoing-orders`)}
              >
                Estores Orders
              </button>
            </div>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => router.push(`/admin/hire-skills/ongoing`)}
              >
                Hire Skills
              </button>
            </div>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => router.push(`/admin/pick-drop/ongoing`)}
              >
                Pick Drop
              </button>
            </div>
          </div>
        </div>
        <div className="container " style={styles.container}>
          <h2 className="subTitle">Visual Charts of Orders</h2>
        </div>
        <div className="container " style={styles.container}>
          <div>
            <h2 className="subTitle">Pick & Drop</h2>
            <div className=" d-flex">
              <div>
                <LineChart
                  width={600}
                  height={250}
                  data={dataPickDrop}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="trip"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
                </LineChart>
              </div>

              <div>
                <p>
                  Trips taken today: <b>{dataPickDrop[6].trip}</b>
                </p>
                <p>
                  Earning from today&apos;s Pick & Drop:{" "}
                  <b>₹{dataPickDrop[6].trip * 50}</b>
                </p>
                <br></br>
                <p>
                  Trips taken in last 30 days: <b>{last30DaysCount}</b>
                </p>
                <p>
                  Total Earning from last 30 days:{" "}
                  <b>₹{last30DaysCount * 50}</b>
                </p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="subTitle">Hire Skills</h2>
            <div className="d-flex">
              <div>
                <LineChart
                  width={600}
                  height={250}
                  data={dataHireSkills}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="request"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
                </LineChart>
              </div>

              <div>
                <p>
                  No. of requests today: <b>{dataHireSkills[6].request}</b>
                </p>
                <p>
                  Earning from today&apos;s Hire Skills:{" "}
                  <b>₹{dataHireSkills[6].request * 50}</b>
                </p>
                <br></br>
                <p>
                  Hire Skills requests in last 30 days:{" "}
                  <b>{hireSkillsLast30DaysCount}</b>
                </p>
                <p>
                  Total Earning from hire skilles in last 30 days:{" "}
                  <b>₹{hireSkillsLast30DaysCount * 50}</b>
                </p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="subTitle">E-Stores</h2>
            <div className="d-flex">
              <div>
                <LineChart
                  width={600}
                  height={250}
                  data={dataEstores}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="order"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
                </LineChart>
              </div>

              <div>
                <p>
                  No. of orders from estores today:{" "}
                  <b>{dataPickDrop[6].order}</b>
                </p>
                {/* <p>
                  Earning from today's estores sales:{" "}
                  <b>₹{dataPickDrop[6].trip * 50}</b>
                </p> */}
                <br></br>
                <p>
                  Total orders in last 30 days: <b>{estoresLast30DaysCount}</b>
                </p>
                {/* <p>
                  Total Earning from last 30 days:{" "}
                  <b>₹{estoresLast30DaysCount * 50}</b>
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </Admin>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    // textAlign: "center",
  },
  heading: {
    fontSize: "25px",
    marginBottom: "20px",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },

  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  productName: {
    fontSize: "1.5em",
    margin: "10px 0",
  },
  productPrice: {
    fontSize: "1.2em",
    color: "#e67e22",
  },
  productDescription: {
    fontSize: "0.9em",
    color: "#7f8c8d",
  },
  editButton: {
    marginRight: "10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
