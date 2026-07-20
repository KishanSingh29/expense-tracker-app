import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_BASE_URL = "http://172.19.147.129:9898";
const USER_BASE_URL = "http://172.19.147.129:9810";
const EXPENSE_BASE_URL = "http://172.19.147.129:9820";
const DS_BASE_URL = "http://172.19.147.129:8000";  // ✅ Yeh bhi same IP

export const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const userClient = axios.create({
  baseURL: USER_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const expenseClient = axios.create({
  baseURL: EXPENSE_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const dsClient = axios.create({
  baseURL: DS_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ✅ UserService — JWT token auto attach
userClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ ExpenseService — JWT token auto attach
expenseClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ DSService — JWT token auto attach
dsClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== AUTH APIs ==========
export const signupApi = async (data: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: number;
}) => {
  const response = await authClient.post("/auth/v1/signup", data);
  return response.data;
};

export const loginApi = async (data: {
  username: string;
  password: string;
}) => {
  const response = await authClient.post("/auth/v1/login", data);
  return response.data;
};

// ========== USER APIs ==========
export const getProfileApi = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("userId not found in storage");
  const response = await userClient.get(`/user/v1/me?userId=${userId}`);
  return response.data;
};

export const updateProfileApi = async (data: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: number;
}) => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("userId not found in storage");
  const response = await userClient.put(
    `/user/v1/update?userId=${userId}`,
    data
  );
  return response.data;
};

// ========== EXPENSE APIs ==========
export const getExpensesApi = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("userId not found");
  const response = await expenseClient.get("/expense/v1/getExpense", {
    headers: { "X-User-Id": userId },
  });
  return response.data;
};

// Backend DTOs are annotated with SnakeCaseStrategy, but responses have been observed
// coming through as camelCase too (proxy/serialization inconsistencies). Read either.
const pick = (obj: any, snakeKey: string, camelKey: string) => {
  if (!obj) return undefined;
  return obj[snakeKey] !== undefined ? obj[snakeKey] : obj[camelKey];
};

export const addExpenseApi = async (data: {
  amount: number;
  merchant: string;
  currency?: string;
  transactionType?: string;
}) => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("userId not found");
  // ExpenseDto is deserialized with SnakeCaseStrategy — send transaction_type, not transactionType
  const response = await expenseClient.post(
    "/expense/v1/addExpense",
    {
      amount: data.amount,
      merchant: data.merchant,
      currency: data.currency,
      transaction_type: data.transactionType,
    },
    { headers: { "X-User-Id": userId } }
  );
  const raw = response.data;
  console.log("addExpense response:", JSON.stringify(raw));
  return {
    success: raw?.success,
    limit_exceeded: pick(raw, "limit_exceeded", "limitExceeded") ?? false,
    warning: raw?.warning,
    total_spent: Number(pick(raw, "total_spent", "totalSpent") ?? 0),
    remaining_limit: Number(pick(raw, "remaining_limit", "remainingLimit") ?? 0),
  };
};

// ========== SUMMARY API ==========
export const getSummaryApi = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("userId not found");
  const response = await expenseClient.get("/expense/v1/summary", {
    headers: { "X-User-Id": userId },
  });
  const raw = response.data;
  console.log("Summary response:", JSON.stringify(raw));

  const recentTransactions = (pick(raw, "recent_transactions", "recentTransactions") ?? []).map(
    (t: any) => ({
      amount: Number(t.amount ?? 0),
      merchant: t.merchant,
      currency: t.currency,
      transaction_type: pick(t, "transaction_type", "transactionType"),
      created_at: pick(t, "created_at", "createdAt"),
    })
  );

  const categoryBreakdown = (pick(raw, "category_breakdown", "categoryBreakdown") ?? []).map(
    (c: any) => ({
      category: c.category,
      total_amount: Number(pick(c, "total_amount", "totalAmount") ?? 0),
    })
  );

  const monthlyData = (pick(raw, "monthly_data", "monthlyData") ?? []).map((m: any) => ({
    month: m.month,
    income: Number(m.income ?? 0),
    expense: Number(m.expense ?? 0),
  }));

  return {
    total_income: Number(pick(raw, "total_income", "totalIncome") ?? 0),
    total_expense: Number(pick(raw, "total_expense", "totalExpense") ?? 0),
    savings: Number(raw?.savings ?? 0),
    recent_transactions: recentTransactions,
    category_breakdown: categoryBreakdown,
    monthly_data: monthlyData,
  };
};

// ========== SPENDING LIMIT APIs ==========
export const getLimitApi = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("userId not found");
  const response = await expenseClient.get("/expense/v1/getLimit", {
    headers: { "X-User-Id": userId },
  });
  const raw = response.data;
  console.log("getLimit response:", JSON.stringify(raw));
  return {
    success: raw?.success,
    amount: Number(raw?.amount ?? 0),
    days: Number(raw?.days ?? 0),
    start_date: pick(raw, "start_date", "startDate"),
    end_date: pick(raw, "end_date", "endDate"),
    total_spent: Number(pick(raw, "total_spent", "totalSpent") ?? 0),
    remaining_limit: Number(pick(raw, "remaining_limit", "remainingLimit") ?? 0),
    days_left: Number(pick(raw, "days_left", "daysLeft") ?? 0),
  };
};

export const setLimitApi = async (data: { amount: number; days: number }) => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("userId not found");
  const response = await expenseClient.post("/expense/v1/setLimit", data, {
    headers: { "X-User-Id": userId },
  });
  console.log("setLimit response:", JSON.stringify(response.data));
  return response.data;
};

// amount: 0 tells the backend to delete the spending_limit row for this user
// (no expenses are touched) — getLimit then 404s and the UI shows "No active budget".
export const resetLimitApi = async () => {
  return setLimitApi({ amount: 0, days: 0 });
};

// ========== DS (AI) API ==========
export const parseSmsApi = async (message: string) => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("userId not found");
  const response = await dsClient.post(
    "/v1/ds/message",
    { message },
    { headers: { "x-user-id": userId } }
  );
  return response.data;
};

// ========== TOKEN HELPERS ==========
export const saveTokens = async (
  accessToken: string,
  refreshToken: string,
  userId?: string
) => {
  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("refreshToken", refreshToken);
  if (userId) await AsyncStorage.setItem("userId", userId);
};

export const clearTokens = async () => {
  await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userId"]);
};