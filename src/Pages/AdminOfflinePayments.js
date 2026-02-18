import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Papa from "papaparse";

const API_BASE = "https://api.redemly.com/api/admin";

const PAGE_SIZE = 5;

const OfflinePayments = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState({});

  /* Filters */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= FETCH ================= */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/payments/offline-requests`);
      setRequests(res.data.data.requests);
      setStats(res.data.data.stats);
    } catch (err) {
      alert("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ================= SEARCH + FILTER ================= */
  const filteredData = useMemo(() => {
    return requests.filter((item) => {
      const matchesSearch =
        item.vendor.businessName.toLowerCase().includes(search.toLowerCase()) ||
        item.vendor.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesPeriod =
        periodFilter === "all" || item.period.type === periodFilter;

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [requests, search, statusFilter, periodFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    const csvData = filteredData.map((item) => ({
      Vendor: item.vendor.businessName,
      Email: item.vendor.email,
      USD: item.amount.USD,
      INR: item.amount.INR,
      Period: item.period.label,
      Status: item.status,
      Submitted: new Date(item.submittedAt).toLocaleString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv]);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "offline-payments.csv";
    a.click();
  };

  /* ================= REVIEW ================= */
  const handleReview = async (id, action) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/offline/${id}/review`,
        { action, adminNotes: adminNotes[id] || "" }
      );

      const approval = res.data.approval;

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: approval.status,
                adminNotes: approval.adminNotes,
                reviewedAt: approval.reviewedAt,
              }
            : req
        )
      );
    } catch {
      alert("Failed to update");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">Offline Payments</h1>

      {/* 🔎 SEARCH + FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search vendor..."
          className="border p-2 rounded w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          className="border p-2 rounded"
          onChange={(e) => setPeriodFilter(e.target.value)}
        >
          <option value="all">All Periods</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </select>

        <button
          onClick={exportCSV}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Vendor</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Period</th>
              <th className="p-4">Status</th>
              <th className="p-4">Proof</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center">Loading...</td></tr>
            ) : paginatedData.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">
                  <p className="font-semibold">{item.vendor.businessName}</p>
                  <p className="text-xs text-gray-500">{item.vendor.email}</p>
                </td>

                <td className="p-4">${item.amount.USD}</td>
                <td className="p-4">{item.period.label}</td>
                <td className="p-4 capitalize">{item.status}</td>

                <td className="p-4">
                  <a href={item.paymentProof} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    View
                  </a>
                </td>

                <td className="p-4">
                  {item.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(item.id, "approve")}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(item.id, "reject")}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">Reviewed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📄 PAGINATION */}
      <div className="flex justify-center mt-6 gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OfflinePayments;
