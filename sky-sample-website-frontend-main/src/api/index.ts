import axios, { AxiosRequestHeaders } from "axios";

axios.interceptors.request.use(
  function (config) {
    config.baseURL = getBaseUrl();

    try {
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }

      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers.Accept = "application/json";

      config.validateStatus = (status: number) => status >= 200 && status < 300;
    } catch (error) {
      console.error(
        "Error setting Authorization header or validateStatus:",
        error
      );
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

function getBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || "";
}

axios.interceptors.response.use(
  (response) => response,
  function (error) {
    if (error?.response?.status === 401) {
      const appRoot = import.meta.env.BASE_URL || '/';
      if (window.location.pathname !== appRoot) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = appRoot;
      }
    }
    return Promise.reject(error?.response ?? error);
  }
);
