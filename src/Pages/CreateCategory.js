import React, { useState } from 'react';
import axios from 'axios';

const CreateCategory = ({ onCategoryCreated }) => {
  const [categoryName, setCategoryName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setErrorMessage('Category name is required');
      return;
    }

    try {
      const res = await axios.post(
        'http://31.97.206.144:6098/api/admin/create-categories',
        { categoryName }
      );

      alert('Category created successfully!');
      setCategoryName('');
      setErrorMessage('');

      if (onCategoryCreated) onCategoryCreated();
    } catch (err) {
      console.error('Error creating category:', err);
      setErrorMessage('Error creating category. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-center text-blue-900">
        Create New Category
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter category name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}

        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition duration-300"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateCategory;
