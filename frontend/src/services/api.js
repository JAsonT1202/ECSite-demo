// src/services/api.js
import axios from 'axios';

export const API_BASE_URL = "/api"
// 获取商品列表，返回的商品对象包含 id, name, price, category, stock, addedBy 等字段
export const getProducts = () => {
  return axios.get(`${API_BASE_URL}/products`);
};

// 添加商品（仅商家调用），需要传递 { name, price, category, stock, addedBy }
export const addProduct = (product) => {
  return axios.post(`${API_BASE_URL}/products`, product);
};

// 删除商品（仅允许删除自己添加的商品），接口假设 DELETE 请求传递 { username } 作为请求体数据
export const deleteProduct = (productId, username) => {
  return axios.delete(`${API_BASE_URL}/products/${productId}`, { data: { username } });
};

// 修改商品（仅允许修改自己添加的商品）
// productData 包含要更新的字段，例如：{ name, price, category, stock }
// username 用于后端校验当前用户是否有权限修改该商品
export const updateProduct = (productId, productData, username) => {
    return axios.put(`${API_BASE_URL}/products/${productId}`, { ...productData, username });
  };

// 用户登录
export const login = (credentials) => {
  return axios.post(`${API_BASE_URL}/login`, credentials);
};

// 用户注册
export const register = (userData) => {
  return axios.post(`${API_BASE_URL}/register`, userData);
};

// 购物车相关接口

// 获取购物车列表（根据用户名查询购物车中的商品），返回的每个项包含 id, productId, name, price, quantity 等字段
export const getCartItems = (username) => {
  return axios.get(`${API_BASE_URL}/cart`, { params: { username } });
};

// 添加商品到购物车，cartItem 格式: { username, productId, quantity }
export const addToCart = (cartItem) => {
  return axios.post(`${API_BASE_URL}/cart`, cartItem);
};

// 从购物车中删除商品，接口假设 DELETE 请求传递 { username } 作为请求体数据
export const deleteCartItem = (cartItemId, username) => {
  return axios.delete(`${API_BASE_URL}/cart/${cartItemId}`, { data: { username } });
};

// 下单接口，orderData 格式: { username, items: [ { productId, quantity } ] }
export const placeOrder = (orderData) => {
  return axios.post(`${API_BASE_URL}/orders`, orderData);
};
