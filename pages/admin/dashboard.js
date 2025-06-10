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

import {
  ordersHistoryPickDrop,
  ordersHistoryPickDropCount,
  ongoingOrdersPickDrop,
  ordersOngoingPickDropCount,
} from "../../lib/actions/admins/pickDrop/general";

import {
  ordersHistoryEstores,
  ordersHistoryEstoresCount,
  ongoingOrdersEstore,
  ordersOngoingEstoresCount,
} from "../../lib/actions/admins/estores/general";

import {
  ordersHistoryHireSkills,
  ordersHistoryHireSkillsCount,
  ongoingOrdersHireSkills,
  ordersOngoingHireSkillsCount,
} from "../../lib/actions/admins/hireSkills/general";

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

  const [pickDropDataHistory, setPickDropDataHistory] = useState([]);
  const [pickDropDataHistoryCount, setPickDropDataHistoryCount] = useState(0);
  const [pickDropDataOngoingCount, setPickDropDataOngoingCount] = useState(0);
  const [pickDropDataOngoing, setPickDropDataOngoing] = useState(0);

  const [estoresDataHistory, setEstoresDataHistory] = useState([]);
  const [estoresDataHistoryCount, setEstoresDataHistoryCount] = useState(0);
  const [estoresDataOngoingCount, setEstoresDataOngoingCount] = useState(0);
  const [estoresDataOngoing, setEstoresDataOngoing] = useState(0);

  const [hireSkillsDataHistory, setHireSkillsDataHistory] = useState([]);
  const [hireSkillsDataHistoryCount, setHireSkillsDataHistoryCount] =
    useState(0);
  const [hireSkillsDataOngoingCount, setHireSkillsDataOngoingCount] =
    useState(0);
  const [hireSkillsDataOngoing, setHireSkillsDataOngoing] = useState(0);

  const [activeTab, setActiveTab] = useState("eStore");

  const tabs = [
    { id: "eStore", label: "E-Store", color: "#2196F3" }, // Green
    { id: "hireSkills", label: "Hire Skills", color: "#2196F3" }, // Blue
    { id: "pickDrop", label: "Pick & Drop", color: "#2196F3" }, // Red
  ];

  const [
    ordersHistoryPickDropLast7loading,
    setOrdersHistoryPickDropLast7loading,
  ] = useState();

  useEffect(() => {
    fetchDataEstoresHistory();
    fetchDataEstoresCountHistory();
  }, []);

  //

  const fetchDataEstoresHistory = async () => {
    try {
      setLoading(true);
      const valueHistory = await ordersHistoryEstores();
      const valueOngoing = await ongoingOrdersEstore();
      console.log("estore history", valueHistory);

      setEstoresDataHistory(valueHistory);
      setEstoresDataOngoing(valueOngoing);
    } catch (error) {
      console.error("Error fetching estores history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataEstoresCountHistory = async () => {
    try {
      setLoading(true);
      const valueHistory = await ordersHistoryEstoresCount();
      const valueOngoing = await ordersOngoingEstoresCount();
      setEstoresDataHistoryCount(valueHistory);
      setEstoresDataOngoingCount(valueOngoing);
    } catch (error) {
      console.error("Error fetching estores history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataPickDropHistory = async () => {
    try {
      setOrdersHistoryPickDropLast7loading(true); // optional
      const valueHistory = await ordersHistoryPickDrop();
      const valueOngoing = await ongoingOrdersPickDrop();

      setPickDropDataHistory(valueHistory);
      setPickDropDataOngoing(valueOngoing);
    } catch (error) {
      console.error("Error fetching pick/drop history:", error);
    } finally {
      setOrdersHistoryPickDropLast7loading(false); // optional
    }
  };

  const fetchDataPickDropCountHistory = async () => {
    try {
      setLoading(true);
      const valueHistory = await ordersHistoryPickDropCount();
      const valueOngoing = await ordersOngoingPickDropCount();
      setPickDropDataHistoryCount(valueHistory);
      setPickDropDataOngoingCount(valueOngoing);
    } catch (error) {
      console.error("Error fetching pick/drop history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataHireSkillsHistory = async () => {
    try {
      setLoading(true);
      const valueHistory = await ordersHistoryHireSkills();
      const valueOngoing = await ongoingOrdersHireSkills();

      setHireSkillsDataHistory(valueHistory);
      setHireSkillsDataOngoing(valueOngoing);
    } catch (error) {
      console.error("Error fetching Hire Skills history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataHireSkillsCountHistory = async () => {
    try {
      setLoading(true);
      const valueHistory = await ordersHistoryHireSkillsCount();
      const valueOngoing = await ordersOngoingHireSkillsCount();
      setHireSkillsDataHistoryCount(valueHistory);

      setHireSkillsDataOngoingCount(valueOngoing);
    } catch (error) {
      console.error("Error fetching Hire Skills history:", error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload; // all fields in the hovered data point

      return (
        <div
          style={{
            background: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p>
            <strong>{label} days ago</strong>
          </p>
          <p>Orders: {data.order}</p>
          <p>Amount: ₹{data.amt}</p>
          <p>Date: {data.date}</p>
        </div>
      );
    }
    return null;
  };
  const CustomTooltipSkillsOngoing = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload; // all fields in the hovered data point

      return (
        <div
          style={{
            background: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p>
            <strong>{label} days ago</strong>
          </p>
          <p>Request: {data.request}</p>
          <p>Requested on: {data.date}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipSkills = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload; // all fields in the hovered data point

      return (
        <div
          style={{
            background: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p>
            <strong>{label} days ago</strong>
          </p>
          <p>Completed: {data.completed}</p>
          <p>Completed on: {data.date}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPickDropOngoing = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload; // all fields in the hovered data point

      return (
        <div
          style={{
            background: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p>
            <strong>{label} days ago</strong>
          </p>
          <p>Total: {data.request}</p>
          <p>Requested on: {data.date}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPickDropCompleted = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload; // all fields in the hovered data point

      return (
        <div
          style={{
            background: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p>
            <strong>{label} days ago</strong>
          </p>
          <p>Completed: {data.completed}</p>
          <p>Completed on: {data.date}</p>
        </div>
      );
    }
    return null;
  };

  const tabChange = (id) => {
    setActiveTab(id);
    if (id == "eStores") {
    } else if (id == "hireSkills") {
      fetchDataHireSkillsHistory();
      fetchDataHireSkillsCountHistory();
    } else if ((id = "pickDrop")) {
      fetchDataPickDropHistory();
      fetchDataPickDropCountHistory();
    } else {
      return windows.alert("Please select a tab");
    }
  };

  return (
    <Admin>
      <AdminLayout>
        <Header />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => tabChange(tab.id)}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius:
                  index === 0
                    ? "8px 0 0 8px"
                    : index === tabs.length - 1
                    ? "0 8px 8px 0"
                    : "0",
                backgroundColor: tab.color,
                color: "white",
                fontWeight: activeTab === tab.id ? "bold" : "normal",
                opacity: activeTab === tab.id ? 1 : 0.6,
                cursor: "pointer",
                margin: 0, // ensure no spacing
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="container " style={styles.container}>
          {activeTab === "eStore" ? (
            <div>
              <div className="text-center">
                <h2 className="subTitle text-center">E-Stores</h2>
              </div>

              <h4 className="">Ongoing Orders</h4>
              <div className="d-flex">
                <div>
                  <LineChart
                    width={1000}
                    height={300}
                    data={estoresDataOngoing}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="order"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>

                <div>
                  <p>
                    Orders today: <b>{estoresDataOngoing[30]?.order}</b>
                  </p>
                  <br />
                  <p>
                    Orders in last 30 days: <b>{estoresDataOngoingCount}</b>
                  </p>
                </div>
              </div>

              <h4 className="">Delivered Orders</h4>
              <div className="d-flex">
                <div>
                  <LineChart
                    width={1000}
                    height={300}
                    data={estoresDataHistory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="order"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>

                <div>
                  <p>
                    Orders delivered today:{" "}
                    <b>{estoresDataHistory[30]?.order}</b>
                  </p>
                  <br />
                  <p>
                    Successful deliveries in last 30 days:{" "}
                    <b>{estoresDataHistoryCount}</b>
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === "hireSkills" ? (
            <div>
              <div className="text-center">
                <h2 className="subTitle text-center">Hire Skills</h2>
              </div>

              <h4 className="">Ongoing Requests</h4>
              <div className="d-flex">
                <div>
                  <LineChart
                    width={1000}
                    height={300}
                    data={hireSkillsDataOngoing}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltipSkillsOngoing />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="request"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>

                <div>
                  <p>
                    Requests today: <b>{hireSkillsDataOngoing[30]?.request}</b>
                  </p>
                  {/* <p>
                    Earning from today&apos;s Hire Skills:{" "}
                    <b>₹{hireSkillsData[6]?.request * 50}</b>
                  </p> */}
                  <br />
                  <p>
                    Requests in last 30 days:{" "}
                    <b>{hireSkillsDataOngoingCount}</b>
                  </p>
                  {/* <p>
                    Total Earning from hire skills in last 30 days:{" "}
                    <b>₹{hireSkillsLast30DaysCount * 50}</b>
                  </p> */}
                </div>
              </div>
              <h4 className="">Completed Orders</h4>
              <div className="d-flex">
                <div>
                  <LineChart
                    width={1000}
                    height={250}
                    data={hireSkillsDataHistory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltipSkills />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>

                <div>
                  <p>
                    Projects completed today:{" "}
                    <b>{hireSkillsDataHistory[30]?.completed}</b>
                  </p>
                  <br />
                  <p>
                    Project completed in last 30 days:{" "}
                    <b>{hireSkillsDataHistoryCount}</b>
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === "pickDrop" ? (
            <div>
              <div className="text-center">
                <h2 className="subTitle text-center">Pick Drop</h2>
              </div>

              <h4 className="">Ongoing Requests</h4>
              <div className="d-flex">
                <div>
                  <LineChart
                    width={1000}
                    height={300}
                    data={pickDropDataOngoing}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltipPickDropOngoing />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="request"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>

                <div>
                  <p>
                    Requests today: <b>{pickDropDataOngoing[30]?.request}</b>
                  </p>
                  {/* <p>
                    Earning from today&apos;s Hire Skills:{" "}
                    <b>₹{hireSkillsData[6]?.request * 50}</b>
                  </p> */}
                  <br />
                  <p>
                    Requests in last 30 days: <b>{pickDropDataOngoingCount}</b>
                  </p>
                  {/* <p>
                    Total Earning from hire skills in last 30 days:{" "}
                    <b>₹{hireSkillsLast30DaysCount * 50}</b>
                  </p> */}
                </div>
              </div>

              <h4 className="">Completed Orders</h4>
              <div className="d-flex">
                <div>
                  <LineChart
                    width={1000}
                    height={250}
                    data={pickDropDataHistory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltipPickDropCompleted />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>

                <div>
                  <p>
                    Orders completed today:{" "}
                    <b>{pickDropDataHistory[30]?.completed}</b>
                  </p>
                  <br />
                  <p>
                    Successful in last 30 days:{" "}
                    <b>{pickDropDataHistoryCount}</b>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
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
