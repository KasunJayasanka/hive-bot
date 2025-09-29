// src/lib/http.ts
import axios, { AxiosError } from "axios";

/**
 * Single axios instance for your app (browser + server).
 * - Base URL is relative, so it works with Next API routes
 * - Adds sane defaults and uniform error normalization
 */
export const http = axios.create({
  baseURL: "/",         
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: response interceptor to unwrap and normalize errors
http.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const apiMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Request failed";
    return Promise.reject(new Error(apiMsg));
  }
);
