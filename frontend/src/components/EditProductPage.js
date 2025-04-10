// src/components/EditProductPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditProductPage({ user }) {
  const [product, setProduct] = useState(null);
  const [file, setFile] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '', price: '', category: '', stock: '', description: ''
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = "/api";


  useEffect(() => {
    axios.get(`${API_BASE_URL}/products`)
      .then(res => {
        const target = res.data.find(p => p.id === parseInt(id));
        if (!target) {
          alert('Product not found');
          navigate('/goods');
          return;
        }
        setProduct(target);
        setFormValues({
          name: target.name,
          price: target.price,
          category: target.category,
          stock: target.stock,
          description: target.description || ''
        });
      })
      .catch(err => alert('Failed to load product'));
  }, [id]);

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = null;

      // 1. Upload file if provided
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axios.post(`${API_BASE_URL}/upload-file`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = res.data.imageUrl;
      }

      // 2. Update product info
      const updatePayload = {
        ...formValues,
        username: user.username,
      };
      if (imageUrl) {
        updatePayload.imageUrl = imageUrl;
      }

      await axios.put(`${API_BASE_URL}/products/${id}`, updatePayload);
      alert("Product updated successfully");
      navigate("/goods");
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Edit Product</h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              name="name"
              value={formValues.name}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (¥)</label>
            <input
              name="price"
              type="number"
              value={formValues.price}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              name="category"
              value={formValues.category}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              name="stock"
              type="number"
              value={formValues.stock}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formValues.description}
              onChange={handleChange}
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Replace Image or PDF (optional)</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={e => setFile(e.target.files[0])}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-50"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate('/goods')}
              className="w-full ml-4 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
