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

export const onGoingOrdersEstoresLast30 = async () => {};

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

export const ongoingOrdersEstore = async () => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 31);

  const q = query(
    collection(db, "orders"),
    where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))
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
  const estoresResultArray = dateKeys.map((entry, index) => ({
    id: index + 1,
    date: formatDateToWords(entry.key),
    count: entry.count,
  }));

  const dataEstore = [
    {
      name: "30 days ago",
      order: estoresResultArray[30].count,
      amt: estoresResultArray[30].count * 50,
      date: estoresResultArray[30].date,
    },
    {
      name: "29",
      order: estoresResultArray[29].count,
      amt: estoresResultArray[29].count * 50,
      date: estoresResultArray[29].date,
    },
    {
      name: "28",
      order: estoresResultArray[28].count,
      amt: estoresResultArray[28].count * 50,
      date: estoresResultArray[28].date,
    },
    {
      name: "27",
      order: estoresResultArray[27].count,
      amt: estoresResultArray[27].count * 50,
      date: estoresResultArray[27].date,
    },
    {
      name: "26",
      order: estoresResultArray[26].count,
      amt: estoresResultArray[26].count * 50,
      date: estoresResultArray[26].date,
    },
    {
      name: "25",
      order: estoresResultArray[25].count,
      amt: estoresResultArray[25].count * 50,
      date: estoresResultArray[25].date,
    },
    {
      name: "24",
      order: estoresResultArray[24].count,
      amt: estoresResultArray[24].count * 50,
      date: estoresResultArray[24].date,
    },
    {
      name: "23",
      order: estoresResultArray[23].count,
      amt: estoresResultArray[23].count * 50,
      date: estoresResultArray[23].date,
    },
    {
      name: "22",
      order: estoresResultArray[22].count,
      amt: estoresResultArray[22].count * 50,
      date: estoresResultArray[22].date,
    },
    {
      name: "21",
      order: estoresResultArray[21].count,
      amt: estoresResultArray[21].count * 50,
      date: estoresResultArray[21].date,
    },
    {
      name: "20",
      order: estoresResultArray[20].count,
      amt: estoresResultArray[20].count * 50,
      date: estoresResultArray[20].date,
    },
    {
      name: "19",
      order: estoresResultArray[19].count,
      amt: estoresResultArray[19].count * 50,
      date: estoresResultArray[19].date,
    },
    {
      name: "18",
      order: estoresResultArray[18].count,
      amt: estoresResultArray[18].count * 50,
      date: estoresResultArray[18].date,
    },
    {
      name: "17",
      order: estoresResultArray[17].count,
      amt: estoresResultArray[17].count * 50,
      date: estoresResultArray[17].date,
    },
    {
      name: "16",
      order: estoresResultArray[16].count,
      amt: estoresResultArray[16].count * 50,
      date: estoresResultArray[16].date,
    },

    {
      name: "15",
      order: estoresResultArray[15].count,
      amt: estoresResultArray[15].count * 50,
      date: estoresResultArray[15].date,
    },
    {
      name: "14",
      order: estoresResultArray[14].count,
      amt: estoresResultArray[14].count * 50,
      date: estoresResultArray[14].date,
    },
    {
      name: "13",
      order: estoresResultArray[13].count,
      amt: estoresResultArray[13].count * 50,
      date: estoresResultArray[13].date,
    },
    {
      name: "12",
      order: estoresResultArray[12].count,
      amt: estoresResultArray[12].count * 50,
      date: estoresResultArray[12].date,
    },
    {
      name: "11",
      order: estoresResultArray[11].count,
      amt: estoresResultArray[11].count * 50,
      date: estoresResultArray[11].date,
    },
    {
      name: "10",
      order: estoresResultArray[10].count,
      amt: estoresResultArray[10].count * 50,
      date: estoresResultArray[10].date,
    },
    {
      name: "9",
      order: estoresResultArray[9].count,
      amt: estoresResultArray[9].count * 50,
      date: estoresResultArray[9].date,
    },
    {
      name: "8",
      order: estoresResultArray[8].count,
      amt: estoresResultArray[8].count * 50,
      date: estoresResultArray[8].date,
    },
    {
      name: "7",
      order: estoresResultArray[7].count,
      amt: estoresResultArray[7].count * 50,
      date: estoresResultArray[7].date,
    },
    {
      name: "6",
      order: estoresResultArray[6].count,
      amt: estoresResultArray[6].count * 50,
      date: estoresResultArray[6].date,
    },
    {
      name: "5",
      order: estoresResultArray[5].count,
      amt: estoresResultArray[5].count * 50,
      date: estoresResultArray[5].date,
    },
    {
      name: "4",
      order: estoresResultArray[4].count,
      amt: estoresResultArray[4].count * 50,
      date: estoresResultArray[4].date,
    },
    {
      name: "3",
      order: estoresResultArray[3].count,
      amt: estoresResultArray[3].count * 50,
      date: estoresResultArray[3].date,
    },
    {
      name: "2",
      order: estoresResultArray[2].count,
      amt: estoresResultArray[2].count * 50,
      date: estoresResultArray[2].date,
    },
    {
      name: "1",
      order: estoresResultArray[1].count,
      amt: estoresResultArray[1].count * 50,
      date: estoresResultArray[1].date,
    },
    {
      name: "Today",
      order: estoresResultArray[0].count,
      amt: estoresResultArray[0].count * 50,
      date: estoresResultArray[0].date,
    },
  ];

  return dataEstore;
};

export const ordersOngoingEstoresCount = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const q = query(
    collection(db, "orders"),
    where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );

  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return results.length;
};

export const ordersHistoryEstores = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 31);

  const q = query(
    collection(db, "ordersHistory"),
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
  const estoresResultArray = dateKeys.map((entry, index) => ({
    id: index + 1,
    date: formatDateToWords(entry.key),
    count: entry.count,
  }));

  const dataEstore = [
    {
      name: "30 days ago",
      order: estoresResultArray[30].count,
      amt: estoresResultArray[30].count * 50,
      date: estoresResultArray[30].date,
    },
    {
      name: "29",
      order: estoresResultArray[29].count,
      amt: estoresResultArray[29].count * 50,
      date: estoresResultArray[29].date,
    },
    {
      name: "28",
      order: estoresResultArray[28].count,
      amt: estoresResultArray[28].count * 50,
      date: estoresResultArray[28].date,
    },
    {
      name: "27",
      order: estoresResultArray[27].count,
      amt: estoresResultArray[27].count * 50,
      date: estoresResultArray[27].date,
    },
    {
      name: "26",
      order: estoresResultArray[26].count,
      amt: estoresResultArray[26].count * 50,
      date: estoresResultArray[26].date,
    },
    {
      name: "25",
      order: estoresResultArray[25].count,
      amt: estoresResultArray[25].count * 50,
      date: estoresResultArray[25].date,
    },
    {
      name: "24",
      order: estoresResultArray[24].count,
      amt: estoresResultArray[24].count * 50,
      date: estoresResultArray[24].date,
    },
    {
      name: "23",
      order: estoresResultArray[23].count,
      amt: estoresResultArray[23].count * 50,
      date: estoresResultArray[23].date,
    },
    {
      name: "22",
      order: estoresResultArray[22].count,
      amt: estoresResultArray[22].count * 50,
      date: estoresResultArray[22].date,
    },
    {
      name: "21",
      order: estoresResultArray[21].count,
      amt: estoresResultArray[21].count * 50,
      date: estoresResultArray[21].date,
    },
    {
      name: "20",
      order: estoresResultArray[20].count,
      amt: estoresResultArray[20].count * 50,
      date: estoresResultArray[20].date,
    },
    {
      name: "19",
      order: estoresResultArray[19].count,
      amt: estoresResultArray[19].count * 50,
      date: estoresResultArray[19].date,
    },
    {
      name: "18",
      order: estoresResultArray[18].count,
      amt: estoresResultArray[18].count * 50,
      date: estoresResultArray[18].date,
    },
    {
      name: "17",
      order: estoresResultArray[17].count,
      amt: estoresResultArray[17].count * 50,
      date: estoresResultArray[17].date,
    },
    {
      name: "16",
      order: estoresResultArray[16].count,
      amt: estoresResultArray[16].count * 50,
      date: estoresResultArray[16].date,
    },

    {
      name: "15",
      order: estoresResultArray[15].count,
      amt: estoresResultArray[15].count * 50,
      date: estoresResultArray[15].date,
    },
    {
      name: "14",
      order: estoresResultArray[14].count,
      amt: estoresResultArray[14].count * 50,
      date: estoresResultArray[14].date,
    },
    {
      name: "13",
      order: estoresResultArray[13].count,
      amt: estoresResultArray[13].count * 50,
      date: estoresResultArray[13].date,
    },
    {
      name: "12",
      order: estoresResultArray[12].count,
      amt: estoresResultArray[12].count * 50,
      date: estoresResultArray[12].date,
    },
    {
      name: "11",
      order: estoresResultArray[11].count,
      amt: estoresResultArray[11].count * 50,
      date: estoresResultArray[11].date,
    },
    {
      name: "10",
      order: estoresResultArray[10].count,
      amt: estoresResultArray[10].count * 50,
      date: estoresResultArray[10].date,
    },
    {
      name: "9",
      order: estoresResultArray[9].count,
      amt: estoresResultArray[9].count * 50,
      date: estoresResultArray[9].date,
    },
    {
      name: "8",
      order: estoresResultArray[8].count,
      amt: estoresResultArray[8].count * 50,
      date: estoresResultArray[8].date,
    },
    {
      name: "7",
      order: estoresResultArray[7].count,
      amt: estoresResultArray[7].count * 50,
      date: estoresResultArray[7].date,
    },
    {
      name: "6",
      order: estoresResultArray[6].count,
      amt: estoresResultArray[6].count * 50,
      date: estoresResultArray[6].date,
    },
    {
      name: "5",
      order: estoresResultArray[5].count,
      amt: estoresResultArray[5].count * 50,
      date: estoresResultArray[5].date,
    },
    {
      name: "4",
      order: estoresResultArray[4].count,
      amt: estoresResultArray[4].count * 50,
      date: estoresResultArray[4].date,
    },
    {
      name: "3",
      order: estoresResultArray[3].count,
      amt: estoresResultArray[3].count * 50,
      date: estoresResultArray[3].date,
    },
    {
      name: "2",
      order: estoresResultArray[2].count,
      amt: estoresResultArray[2].count * 50,
      date: estoresResultArray[2].date,
    },
    {
      name: "1",
      order: estoresResultArray[1].count,
      amt: estoresResultArray[1].count * 50,
      date: estoresResultArray[1].date,
    },
    {
      name: "Today",
      order: estoresResultArray[0].count,
      amt: estoresResultArray[0].count * 50,
      date: estoresResultArray[0].date,
    },
  ];

  return dataEstore;
};

export const ordersHistoryEstoresCount = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 31);

  const q = query(
    collection(db, "ordersHistory"),
    where("deliveredAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );

  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return results.length;
};
