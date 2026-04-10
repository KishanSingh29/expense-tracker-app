import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ Apna local IP daalo — localhost nahi chalega device pe
// CMD mein ipconfig run karo → IPv4 Address copy karo
//const BASE_URL = "http://192.168.4.54:9898"; // ← apna IP daalo

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Signup
export const signupApi = async (data: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: number;
}) => {
  const response = await apiClient.post("/auth/v1/signup", data);
  return response.data; // { accessToken, token, userId }
};

// ✅ Login
export const loginApi = async (data: {
  username: string;
  password: string;
}) => {
  const response = await apiClient.post("/auth/v1/login", data);
  return response.data; // { accessToken, token }
};

// ✅ Token save karo
export const saveTokens = async (accessToken: string, refreshToken: string, userId?: string) => {
  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("refreshToken", refreshToken);
  if (userId) await AsyncStorage.setItem("userId", userId);
};

// ✅ Token get karo
export const getAccessToken = async () => {
  return await AsyncStorage.getItem("accessToken");
};