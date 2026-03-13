import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://api.redemly.com/api/users/bulk-upload";

const sampleJson = {
  news: [
    {
      category: "US Immigration",
      category_emoji: "🛂",
      catchy_headline: "USCIS Announces New H1B Visa Rules for 2024",
      tldr:
        "USCIS unveils major changes to H1B visa lottery and application process starting March 2024",
      summary:
        "The U.S. Citizenship and Immigration Services (USCIS) has announced significant changes.",
      what_it_means_for_you:
        "Applicants now have equal chances regardless of number of registrations.",
      disclaimer: "Verify details with legal counsel.",
      source_name: "USCIS",
      source_url:
        "https://www.uscis.gov/newsroom/alerts/uscis-announces-changes-to-h1b-registration-process",
      url_large:
        "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1200",
      url:
        "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800",
      published_at: "2024-01-15T10:30:00Z"
    }
  ]
};

const BulkNewsUpload = () => {
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setJsonData(parsed);
      } catch {
        alert("Invalid JSON file");
      }
    };

    reader.readAsText(file);
  };

  const uploadNews = async () => {
    if (!jsonData) {
      alert("Upload JSON file first");
      return;
    }

    try {
      setLoading(true);

      await axios.post(API_URL, jsonData, {
        headers: { "Content-Type": "application/json" }
      });

      alert("News uploaded successfully");
      setJsonData(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Bulk News Upload
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Upload a JSON file to bulk import news articles.
          </p>
        </div>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition">

          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="block mx-auto text-sm"
          />

          <p className="text-gray-500 text-xs mt-2">
            Upload a valid JSON file containing news data
          </p>

        </div>

        {/* JSON Preview */}
        {jsonData && (
          <div className="mt-6">

            <h4 className="font-semibold text-gray-700 mb-2">
              JSON Preview
            </h4>

            <div className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg max-h-72 overflow-auto">
              <pre>{JSON.stringify(jsonData, null, 2)}</pre>
            </div>

          </div>
        )}

        {/* Upload Button */}
        <div className="mt-6 flex justify-center md:justify-end">

          <button
            onClick={uploadNews}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white font-medium transition
            ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? "Uploading..." : "Upload News"}
          </button>

        </div>

        {/* Sample JSON */}
        <div className="mt-10">

          <h3 className="font-semibold text-gray-800 mb-3">
            Sample JSON Format
          </h3>

          <div className="bg-gray-900 text-blue-300 text-xs p-4 rounded-lg max-h-72 overflow-auto">
            <pre>{JSON.stringify(sampleJson, null, 2)}</pre>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BulkNewsUpload;