import React, { useState, useEffect } from "react";
import { FaEye, FaFileExcel } from "react-icons/fa";
import { utils, writeFile } from "xlsx";

export default function VendorDocumentList() {
  const [vendorDocs, setVendorDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewUrl, setViewUrl] = useState(null); // For modal

  // Pagination & search state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const vendorsPerPage = 5;

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("http://31.97.206.144:6098/api/admin/allvendordocs");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setVendorDocs(json.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const filtered = vendorDocs.filter((v) =>
    v.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / vendorsPerPage);
  const start = (currentPage - 1) * vendorsPerPage;
  const current = filtered.slice(start, start + vendorsPerPage);

  const exportExcel = () => {
    const ws = utils.json_to_sheet(
      filtered.map((v) => ({
        vendorName: v.name,
        documents: v.documents.map((d) => `${d.type}: ${d.url}`).join("\n"),
      }))
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Vendor Documents");
    writeFile(wb, "vendor_documents.xlsx");
  };

  const handleView = (url) => {
    setViewUrl(url);
  };

  const closeModal = () => {
    setViewUrl(null);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 bg-white rounded shadow overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Vendor Documents</h2>
        <button
          onClick={exportExcel}
          className="flex items-center text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          <FaFileExcel className="mr-2" />
          Export to Excel
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by Vendor Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded text-sm"
        />
      </div>

      <table className="min-w-full text-sm border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Vendor Name</th>
            <th className="p-2 border">Documents</th>
          </tr>
        </thead>
        <tbody>
          {current.map((vendor, idx) => (
            <tr key={vendor._id} className="hover:bg-gray-50">
              <td className="p-2 border">{start + idx + 1}</td>
              <td className="p-2 border">{vendor.name}</td>
              <td className="p-2 border">
                <div className="flex flex-wrap gap-2">
                  {vendor.documents.map((doc) => (
                    <button
                      key={doc._id}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-100 px-2 py-1 rounded text-xs"
                      onClick={() => handleView(doc.url)}
                      title={`View ${doc.type}`}
                    >
                      <FaEye />
                      {doc.type}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              i + 1 === currentPage
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* View Modal */}
      {viewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl relative">
            <h3 className="text-lg font-semibold mb-4">Document Preview</h3>
            <iframe
              src={viewUrl}
              className="w-full h-[500px] border rounded"
              title="Document Viewer"
            ></iframe>
            <button
              className="absolute top-2 right-2 text-red-600 text-xl"
              onClick={closeModal}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
