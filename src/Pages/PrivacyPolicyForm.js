import React, { useState } from "react";
import axios from "axios";

const PrivacyPolicyForm = () => {
  const [policyTitle, setPolicyTitle] = useState("");
  const [policyContent, setPolicyContent] = useState("");
  const [date, setDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: policyTitle,
        content: policyContent,
        date: formatDate(date), // Optional: format date as dd-mm-yyyy
      };

      const response = await axios.post("http://31.97.206.144:6098/api/admin/createprivacy-policy", payload);

      if (response.data.success) {
        setSuccessMessage("Privacy policy saved successfully!");
        setErrorMessage("");
        setPolicyTitle("");
        setPolicyContent("");
        setDate("");
      } else {
        setErrorMessage(response.data.message || "Something went wrong.");
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error saving policy:", error);
      setErrorMessage("An error occurred while saving the privacy policy.");
      setSuccessMessage("");
    }
  };

  // Format date to dd-mm-yyyy
  const formatDate = (isoDate) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Create Privacy Policy</h2>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {/* Privacy Policy Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="policyTitle" className="block text-sm font-medium text-gray-700">
            Policy Title
          </label>
          <input
            type="text"
            id="policyTitle"
            value={policyTitle}
            onChange={(e) => setPolicyTitle(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            placeholder="Enter the title of your privacy policy"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="policyContent" className="block text-sm font-medium text-gray-700">
            Policy Content
          </label>
          <textarea
            id="policyContent"
            value={policyContent}
            onChange={(e) => setPolicyContent(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            placeholder="Enter the content of your privacy policy"
            rows="8"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Privacy Policy
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrivacyPolicyForm;
