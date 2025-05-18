import React, { useState } from 'react';
import axios from 'axios';

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName || !image) {
      setErrorMessage('All fields are required');
      return;
    }

    const formData = new FormData();
    formData.append('categoryName', categoryName);
    formData.append('image', image);

    try {
      const res = await axios.post('https://posterbnaobackend.onrender.com/api/category/create-cateogry', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Category created successfully!');
      setCategoryName('');
      setImage(null);
      setPreviewImage('');
      setErrorMessage('');
    } catch (err) {
      console.error('Error creating category:', err);
      setErrorMessage('Error creating category. Please try again.');
    }
  };

  return (
    <div className="container p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-center text-blue-900">Create New Category</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2">Category Name</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
          />
        </div>
        {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-900 text-white p-3 rounded-lg shadow-md hover:bg-blue-800 transition duration-300"
          >
            Create Category
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
