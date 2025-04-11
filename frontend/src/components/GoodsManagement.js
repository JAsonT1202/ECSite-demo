// src/components/GoodsManagement.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function GoodsManagement({ user }) {
  const [products, setProducts] = useState([]);
  const API_BASE_URL = "/api";

  const navigate = useNavigate();

  const loadProducts = () => {
    axios.get(`${API_BASE_URL}/products`)
      .then(res => {
        setProducts(res.data.filter(p => p.addedBy === user.username));
      })
      .catch(err => console.error("Failed to load products", err));
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  const handleDeleteProduct = (id) => {
    axios.delete(`${API_BASE_URL}/products/${id}`, { data: { username: user.username } })
      .then(() => loadProducts())
      .catch(err => alert(err.response?.data?.detail || "Failed to delete product"));
  };

  const handleUpdateProduct = (product) => {
    navigate(`/edit-product/${product.id}`);
  };

  return (
    <div className="bg-white min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <button
            onClick={() => navigate('/add-product')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md shadow"
          >
            Add New Product
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">You haven't added any products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-gray-50 border rounded-lg shadow-sm p-4 flex flex-col">
                {product.imageUrl && (
                  <img
                    src={`/api/${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  <p className="text-sm text-gray-500">¥{product.price}</p>
                  {product.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                  )}
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleUpdateProduct(product)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GoodsManagement;
