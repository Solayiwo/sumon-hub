import api from "./axios";

// Product Endpoints
export const getProducts = (category, q) =>
  api.get("/products", { params: { category, q } });

export const getProductById = (id) => 
  api.get(`/products/${id}`);

// Auth Endpoints
export const loginUser = (credentials) => 
  api.post("/auth/login", credentials);

export const registerUser = (userData) => 
  api.post("/auth/register", userData);

// Order Endpoint
export const submitOrder = (orderData) => 
  api.post("/orders", orderData);