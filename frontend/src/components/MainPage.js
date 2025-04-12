// src/components/MainPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ShoppingCartDrawer from './ShoppingCartDrawer';

function MainPage({ user, searchKeyword, setSearchKeyword }) {
  const [products, setProducts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const API_BASE_URL = "http://13.230.72.70/api";

  const navigate = useNavigate();

  // Fetch products on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);

  // Handle Buy Now
  const handleBuyNow = (product) => {
    const quantity = 1;
    axios.post(`${API_BASE_URL}/orders`, {
      username: user.username,
      items: [{ productId: product.id, quantity }]
    })
      .then(() => {
        alert("Purchase successful!");
        return axios.get(`${API_BASE_URL}/products`);
      })
      .then(res => setProducts(res.data))
      .catch(err => {
        alert(err.response?.data?.detail || "Purchase failed");
      });
  };

  // Handle Add to Cart
  const handleAddToCart = (product) => {
    const quantity = 1;
    axios.post(`${API_BASE_URL}/cart`, {
      username: user.username,
      productId: product.id,
      quantity
    })
      .then(() => {
        setCartOpen(true);
      })
      .catch(err => alert(err.response?.data?.detail || "Failed to add to cart"));
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Product Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative border rounded-lg p-3 shadow hover:shadow-lg transition"
            >
              {/* Product Image or PDF */}
              {product.imageUrl && product.imageUrl.endsWith('.pdf') ? (
                <a
                  href={`http://13.230.72.70/api/${product.imageUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 underline text-center py-10"
                >
                  View PDF
                </a>
              ) : (
                <img
                  alt={product.name}
                  src={`http://13.230.72.70/api/${product.imageUrl}`}
                  className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75"
                />
              )}

              {/* Info */}
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">Category: {product.category}</p>
                  <p className="mt-1 text-sm text-gray-500">Stock: {product.stock}</p>
                  {product.description && (
                    <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">¥{product.price}</p>
              </div>

              {/* Action Buttons */}
              {user?.role !== 'merchant' && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => user ? handleAddToCart(product) : navigate('/login')}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-2 px-3 rounded"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => user ? handleBuyNow(product) : navigate('/login')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded"
                  >
                    Buy Now
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shopping Cart Drawer */}
      {user?.role === 'customer' && (
        <ShoppingCartDrawer
          username={user.username}
          open={cartOpen}
          setOpen={setCartOpen}
        />
      )}
    </div>
  );
}

export default MainPage;
