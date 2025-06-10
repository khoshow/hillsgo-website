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

export const ongoingOrdersHireSkills = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const q = query(
    collection(db, "hireSkillsOngoing"),
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
  const hireSkillsResultArray = dateKeys.map((entry, index) => ({
    id: index + 1,
    date: formatDateToWords(entry.key),
    count: entry.count,
  }));

  const dataHireSkills = [
    {
      name: "30",
      request: hireSkillsResultArray[30].count,
      date: hireSkillsResultArray[30].date,
    },
    {
      name: "29",
      request: hireSkillsResultArray[29].count,
      date: hireSkillsResultArray[29].date,
    },
    {
      name: "28",
      request: hireSkillsResultArray[28].count,
      date: hireSkillsResultArray[28].date,
    },
    {
      name: "27",
      request: hireSkillsResultArray[27].count,
      date: hireSkillsResultArray[27].date,
    },
    {
      name: "26",
      request: hireSkillsResultArray[26].count,
      date: hireSkillsResultArray[26].date,
    },
    {
      name: "25",
      request: hireSkillsResultArray[25].count,
      date: hireSkillsResultArray[25].date,
    },
    {
      name: "24",
      request: hireSkillsResultArray[24].count,
      date: hireSkillsResultArray[24].date,
    },
    {
      name: "23",
      request: hireSkillsResultArray[23].count,
      date: hireSkillsResultArray[23].date,
    },
    {
      name: "22",
      request: hireSkillsResultArray[22].count,
      date: hireSkillsResultArray[22].date,
    },
    {
      name: "21",
      request: hireSkillsResultArray[21].count,
      date: hireSkillsResultArray[21].date,
    },
    {
      name: "20",
      request: hireSkillsResultArray[20].count,
      date: hireSkillsResultArray[20].date,
    },
    {
      name: "19",
      request: hireSkillsResultArray[19].count,
      amt: hireSkillsResultArray[19].date,
    },
    {
      name: "18",
      request: hireSkillsResultArray[18].count,
      date: hireSkillsResultArray[18].date,
    },
    {
      name: "17",
      request: hireSkillsResultArray[17].count,
      date: hireSkillsResultArray[17].date,
    },
    {
      name: "16",
      request: hireSkillsResultArray[16].count,
      date: hireSkillsResultArray[16].date,
    },
    {
      name: "15",
      request: hireSkillsResultArray[15].count,
      date: hireSkillsResultArray[15].date,
    },
    {
      name: "14",
      request: hireSkillsResultArray[14].count,
      date: hireSkillsResultArray[14].date,
    },
    {
      name: "13",
      request: hireSkillsResultArray[13].count,
      date: hireSkillsResultArray[13].date,
    },
    {
      name: "12",
      request: hireSkillsResultArray[12].count,
      date: hireSkillsResultArray[12].date,
    },
    {
      name: "11",
      request: hireSkillsResultArray[11].count,
      date: hireSkillsResultArray[11].date,
    },
    {
      name: "10",
      request: hireSkillsResultArray[10].count,
      date: hireSkillsResultArray[10].date,
    },
    {
      name: "9",
      request: hireSkillsResultArray[9].count,
      date: hireSkillsResultArray[9].date,
    },
    {
      name: "8",
      request: hireSkillsResultArray[8].count,
      date: hireSkillsResultArray[8].date,
    },
    {
      name: "7",
      request: hireSkillsResultArray[7].count,
      date: hireSkillsResultArray[7].date,
    },

    {
      name: "6",
      request: hireSkillsResultArray[6].count,
      date: hireSkillsResultArray[6].date,
    },
    {
      name: "5",
      request: hireSkillsResultArray[5].count,
      date: hireSkillsResultArray[5].date,
    },
    {
      name: "4",
      request: hireSkillsResultArray[4].count,
      date: hireSkillsResultArray[4].date,
    },
    {
      name: "3",
      request: hireSkillsResultArray[3].count,
      date: hireSkillsResultArray[3].date,
    },
    {
      name: "2",
      request: hireSkillsResultArray[2].count,
      date: hireSkillsResultArray[2].date,
    },
    {
      name: "1",
      request: hireSkillsResultArray[1].count,
      date: hireSkillsResultArray[1].date,
    },
    {
      name: "Today",
      request: hireSkillsResultArray[0].count,
      date: hireSkillsResultArray[0].date,
    },
  ];
  console.log("dataHireSkills", dataHireSkills);

  return dataHireSkills;
};

export const ordersOngoingHireSkillsCount = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const q = query(
    collection(db, "hireSkillsOngoing"),
    where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );

  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return results.length;
};

export const ordersHistoryHireSkills = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const q = query(
    collection(db, "hireSkillsHistory"),
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
  const hireSkillsResultArray = dateKeys.map((entry, index) => ({
    id: index + 1,
    date: formatDateToWords(entry.key),
    count: entry.count,
  }));

  const dataHireSkills = [
    {
      name: "30",
      completed: hireSkillsResultArray[30].count,
      date: hireSkillsResultArray[30].date,
    },
    {
      name: "29",
      completed: hireSkillsResultArray[29].count,
      date: hireSkillsResultArray[29].date,
    },
    {
      name: "28",
      completed: hireSkillsResultArray[28].count,
      date: hireSkillsResultArray[28].date,
    },
    {
      name: "27",
      completed: hireSkillsResultArray[27].count,
      date: hireSkillsResultArray[27].date,
    },
    {
      name: "26",
      completed: hireSkillsResultArray[26].count,
      date: hireSkillsResultArray[26].date,
    },
    {
      name: "25",
      completed: hireSkillsResultArray[25].count,
      date: hireSkillsResultArray[25].date,
    },
    {
      name: "24",
      completed: hireSkillsResultArray[24].count,
      date: hireSkillsResultArray[24].date,
    },
    {
      name: "23",
      completed: hireSkillsResultArray[23].count,
      date: hireSkillsResultArray[23].date,
    },
    {
      name: "22",
      completed: hireSkillsResultArray[22].count,
      date: hireSkillsResultArray[22].date,
    },
    {
      name: "21",
      completed: hireSkillsResultArray[21].count,
      date: hireSkillsResultArray[21].date,
    },
    {
      name: "20",
      completed: hireSkillsResultArray[20].count,
      date: hireSkillsResultArray[20].date,
    },
    {
      name: "19",
      completed: hireSkillsResultArray[19].count,
      amt: hireSkillsResultArray[19].date,
    },
    {
      name: "18",
      completed: hireSkillsResultArray[18].count,
      date: hireSkillsResultArray[18].date,
    },
    {
      name: "17",
      completed: hireSkillsResultArray[17].count,
      date: hireSkillsResultArray[17].date,
    },
    {
      name: "16",
      completed: hireSkillsResultArray[16].count,
      date: hireSkillsResultArray[16].date,
    },
    {
      name: "15",
      completed: hireSkillsResultArray[15].count,
      date: hireSkillsResultArray[15].date,
    },
    {
      name: "14",
      completed: hireSkillsResultArray[14].count,
      date: hireSkillsResultArray[14].date,
    },
    {
      name: "13",
      completed: hireSkillsResultArray[13].count,
      date: hireSkillsResultArray[13].date,
    },
    {
      name: "12",
      completed: hireSkillsResultArray[12].count,
      date: hireSkillsResultArray[12].date,
    },
    {
      name: "11",
      completed: hireSkillsResultArray[11].count,
      date: hireSkillsResultArray[11].date,
    },
    {
      name: "10",
      completed: hireSkillsResultArray[10].count,
      date: hireSkillsResultArray[10].date,
    },
    {
      name: "9",
      completed: hireSkillsResultArray[9].count,
      date: hireSkillsResultArray[9].date,
    },
    {
      name: "8",
      completed: hireSkillsResultArray[8].count,
      date: hireSkillsResultArray[8].date,
    },
    {
      name: "7",
      completed: hireSkillsResultArray[7].count,
      date: hireSkillsResultArray[7].date,
    },

    {
      name: "6",
      completed: hireSkillsResultArray[6].count,
      date: hireSkillsResultArray[6].date,
    },
    {
      name: "5",
      completed: hireSkillsResultArray[5].count,
      date: hireSkillsResultArray[5].date,
    },
    {
      name: "4",
      completed: hireSkillsResultArray[4].count,
      date: hireSkillsResultArray[4].date,
    },
    {
      name: "3",
      completed: hireSkillsResultArray[3].count,
      date: hireSkillsResultArray[3].date,
    },
    {
      name: "2",
      completed: hireSkillsResultArray[2].count,
      date: hireSkillsResultArray[2].date,
    },
    {
      name: "1",
      completed: hireSkillsResultArray[1].count,
      date: hireSkillsResultArray[1].date,
    },
    {
      name: "Today",
      completed: hireSkillsResultArray[0].count,
      date: hireSkillsResultArray[0].date,
    },
  ];
  console.log("dataHireSkills hisotyr", dataHireSkills);

  return dataHireSkills;
};

export const ordersHistoryHireSkillsCount = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const q = query(
    collection(db, "hireSkillsHistory"),
    where("deliveredAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );

  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return results.length;
};
