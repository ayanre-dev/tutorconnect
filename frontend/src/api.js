// api.js
import { BACKEND_URL } from "./config";

const API_URL = `${BACKEND_URL}/api`;

export const request = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
};