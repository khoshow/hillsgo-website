import { auth, db } from "../../../../firebase/firebase";
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

export const ongoingOrdersPickDrop = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const q = query(
    collection(db, "pickDropOngoing"),
    where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  //   // Step 1: Prepare last 7 days

  const dateKeys = [];

  for (let i = 0; i < 31; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
    dateKeys.push({ key, count: 0 });
  }

  //   // Step 2: Count entries per day
  results.forEach((item) => {
    if (!item.createdAt) return;

    const dateStr = getDateString(item.createdAt);
    const match = dateKeys.find((entry) => entry.key === dateStr);
    if (match) {
      match.count++;
    }
  });

  // Step 3: Convert to desired array format
  const pickDropResultArray = dateKeys.map((entry, index) => ({
    id: index + 1,
    date: formatDateToWords(entry.key),
    count: entry.count,
  }));

  const dataPickDrop = [
    {
      name: "30",
      request: pickDropResultArray[30].count,
      date: pickDropResultArray[30].date,
    },
    {
      name: "29",
      request: pickDropResultArray[29].count,
      date: pickDropResultArray[29].date,
    },
    {
      name: "28",
      request: pickDropResultArray[28].count,
      date: pickDropResultArray[28].date,
    },
    {
      name: "27",
      request: pickDropResultArray[27].count,
      date: pickDropResultArray[27].date,
    },
    {
      name: "26",
      request: pickDropResultArray[26].count,
      date: pickDropResultArray[26].date,
    },
    {
      name: "25",
      request: pickDropResultArray[25].count,
      date: pickDropResultArray[25].date,
    },
    {
      name: "24",
      request: pickDropResultArray[24].count,
      date: pickDropResultArray[24].date,
    },
    {
      name: "23",
      request: pickDropResultArray[23].count,
      date: pickDropResultArray[23].date,
    },
    {
      name: "22",
      request: pickDropResultArray[22].count,
      date: pickDropResultArray[22].date,
    },
    {
      name: "21",
      request: pickDropResultArray[21].count,
      date: pickDropResultArray[21].date,
    },
    {
      name: "20",
      request: pickDropResultArray[20].count,
      date: pickDropResultArray[20].date,
    },
    {
      name: "19",
      request: pickDropResultArray[19].count,
      amt: pickDropResultArray[19].date,
    },
    {
      name: "18",
      request: pickDropResultArray[18].count,
      date: pickDropResultArray[18].date,
    },
    {
      name: "17",
      request: pickDropResultArray[17].count,
      date: pickDropResultArray[17].date,
    },
    {
      name: "16",
      request: pickDropResultArray[16].count,
      date: pickDropResultArray[16].date,
    },
    {
      name: "15",
      request: pickDropResultArray[15].count,
      date: pickDropResultArray[15].date,
    },
    {
      name: "14",
      request: pickDropResultArray[14].count,
      date: pickDropResultArray[14].date,
    },
    {
      name: "13",
      request: pickDropResultArray[13].count,
      date: pickDropResultArray[13].date,
    },
    {
      name: "12",
      request: pickDropResultArray[12].count,
      date: pickDropResultArray[12].date,
    },
    {
      name: "11",
      request: pickDropResultArray[11].count,
      date: pickDropResultArray[11].date,
    },
    {
      name: "10",
      request: pickDropResultArray[10].count,
      date: pickDropResultArray[10].date,
    },
    {
      name: "9",
      request: pickDropResultArray[9].count,
      date: pickDropResultArray[9].date,
    },
    {
      name: "8",
      request: pickDropResultArray[8].count,
      date: pickDropResultArray[8].date,
    },
    {
      name: "7",
      request: pickDropResultArray[7].count,
      date: pickDropResultArray[7].date,
    },

    {
      name: "6",
      request: pickDropResultArray[6].count,
      date: pickDropResultArray[6].date,
    },
    {
      name: "5",
      request: pickDropResultArray[5].count,
      date: pickDropResultArray[5].date,
    },
    {
      name: "4",
      request: pickDropResultArray[4].count,
      date: pickDropResultArray[4].date,
    },
    {
      name: "3",
      request: pickDropResultArray[3].count,
      date: pickDropResultArray[3].date,
    },
    {
      name: "2",
      request: pickDropResultArray[2].count,
      date: pickDropResultArray[2].date,
    },
    {
      name: "1",
      request: pickDropResultArray[1].count,
      date: pickDropResultArray[1].date,
    },
    {
      name: "Today",
      request: pickDropResultArray[0].count,
      date: pickDropResultArray[0].date,
    },
  ];
  console.log("dataPickDrop", dataPickDrop);

  return dataPickDrop;
};

export const ordersOngoingPickDropCount = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const q = query(
    collection(db, "pickDropOngoing"),
    where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );

  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return results.length;
};

export const ordersHistoryPickDrop = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const q = query(
    collection(db, "pickDropHistory"),
    where("deliveredAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  //   // Step 1: Prepare last 7 days

  const dateKeys = [];

  for (let i = 0; i < 31; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
    dateKeys.push({ key, count: 0 });
  }

  //   // Step 2: Count entries per day
  results.forEach((item) => {
    if (!item.deliveredAt) return;

    const dateStr = getDateString(item.deliveredAt);
    const match = dateKeys.find((entry) => entry.key === dateStr);
    if (match) {
      match.count++;
    }
  });

  // Step 3: Convert to desired array format
  const pickDropResultArray = dateKeys.map((entry, index) => ({
    id: index + 1,
    date: formatDateToWords(entry.key),
    count: entry.count,
  }));

  const dataPickDrop = [
    {
      name: "30",
      completed: pickDropResultArray[30].count,
      date: pickDropResultArray[30].date,
    },
    {
      name: "29",
      completed: pickDropResultArray[29].count,
      date: pickDropResultArray[29].date,
    },
    {
      name: "28",
      completed: pickDropResultArray[28].count,
      date: pickDropResultArray[28].date,
    },
    {
      name: "27",
      completed: pickDropResultArray[27].count,
      date: pickDropResultArray[27].date,
    },
    {
      name: "26",
      completed: pickDropResultArray[26].count,
      date: pickDropResultArray[26].date,
    },
    {
      name: "25",
      completed: pickDropResultArray[25].count,
      date: pickDropResultArray[25].date,
    },
    {
      name: "24",
      completed: pickDropResultArray[24].count,
      date: pickDropResultArray[24].date,
    },
    {
      name: "23",
      completed: pickDropResultArray[23].count,
      date: pickDropResultArray[23].date,
    },
    {
      name: "22",
      completed: pickDropResultArray[22].count,
      date: pickDropResultArray[22].date,
    },
    {
      name: "21",
      completed: pickDropResultArray[21].count,
      date: pickDropResultArray[21].date,
    },
    {
      name: "20",
      completed: pickDropResultArray[20].count,
      date: pickDropResultArray[20].date,
    },
    {
      name: "19",
      completed: pickDropResultArray[19].count,
      amt: pickDropResultArray[19].date,
    },
    {
      name: "18",
      completed: pickDropResultArray[18].count,
      date: pickDropResultArray[18].date,
    },
    {
      name: "17",
      completed: pickDropResultArray[17].count,
      date: pickDropResultArray[17].date,
    },
    {
      name: "16",
      completed: pickDropResultArray[16].count,
      date: pickDropResultArray[16].date,
    },
    {
      name: "15",
      completed: pickDropResultArray[15].count,
      date: pickDropResultArray[15].date,
    },
    {
      name: "14",
      completed: pickDropResultArray[14].count,
      date: pickDropResultArray[14].date,
    },
    {
      name: "13",
      completed: pickDropResultArray[13].count,
      date: pickDropResultArray[13].date,
    },
    {
      name: "12",
      completed: pickDropResultArray[12].count,
      date: pickDropResultArray[12].date,
    },
    {
      name: "11",
      completed: pickDropResultArray[11].count,
      date: pickDropResultArray[11].date,
    },
    {
      name: "10",
      completed: pickDropResultArray[10].count,
      date: pickDropResultArray[10].date,
    },
    {
      name: "9",
      completed: pickDropResultArray[9].count,
      date: pickDropResultArray[9].date,
    },
    {
      name: "8",
      completed: pickDropResultArray[8].count,
      date: pickDropResultArray[8].date,
    },
    {
      name: "7",
      completed: pickDropResultArray[7].count,
      date: pickDropResultArray[7].date,
    },

    {
      name: "6",
      completed: pickDropResultArray[6].count,
      date: pickDropResultArray[6].date,
    },
    {
      name: "5",
      completed: pickDropResultArray[5].count,
      date: pickDropResultArray[5].date,
    },
    {
      name: "4",
      completed: pickDropResultArray[4].count,
      date: pickDropResultArray[4].date,
    },
    {
      name: "3",
      completed: pickDropResultArray[3].count,
      date: pickDropResultArray[3].date,
    },
    {
      name: "2",
      completed: pickDropResultArray[2].count,
      date: pickDropResultArray[2].date,
    },
    {
      name: "1",
      completed: pickDropResultArray[1].count,
      date: pickDropResultArray[1].date,
    },
    {
      name: "Today",
      completed: pickDropResultArray[0].count,
      date: pickDropResultArray[0].date,
    },
  ];
  console.log("dataPickDrop hisotyr", dataPickDrop);

  return dataPickDrop;
};

export const ordersHistoryPickDropCount = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const q = query(
    collection(db, "pickDropHistory"),
    where("deliveredAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );

  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return results.length;
};
