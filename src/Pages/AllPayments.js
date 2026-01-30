import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { utils, writeFile } from "xlsx";
import {
  FaEdit,
  FaSearch,
  FaFileExport,
  FaFilter,
  FaSync,
  FaCalendarAlt,
  FaDollarSign,
  FaUserTie,
} from "react-icons/fa";
import {
  MdPayment,
  MdPendingActions,
  MdCheckCircle,
  MdOutlineCancel,
} from "react-icons/md";
import { RiRefund2Line, RiFileExcelLine } from "react-icons/ri";
import { FiDownload, FiTrendingUp } from "react-icons/fi";
import { HiOutlineDocumentReport } from "react-icons/hi";

const API_BASE = "https://api.redemly.com/api";
const PAGE_SIZE = 10;

export default function AllPayments() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  /* Filters */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);

  /* Export */
  const [exportLimit, setExportLimit] = useState(100);
  const [exportFormat, setExportFormat] = useState("xlsx");

  /* Update Modal */
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [newStatus, setNewStatus] = useState("paid");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [amountVerified, setAmountVerified] = useState("");
  const [showModal, setShowModal] = useState(false);

  /* ---------------- Fetch Payments ---------------- */
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/payments`);
      setPayments(res.data.data.payments || []);
      setSummary(res.data.data.summary);
    } catch (err) {
      console.error(err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Get Unique Values ---------------- */
  const getUniqueMonths = () => {
    const months = payments.map(p => p.month).filter(Boolean);
    return [...new Set(months)].sort();
  };

  /* ---------------- Search + Filters ---------------- */
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const vendorName = p.vendorId?.businessName || "";

      const matchSearch =
        vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.paymentStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.vendorId?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "all" || p.paymentStatus === statusFilter;

      const matchMonth =
        monthFilter === "all" || p.month === monthFilter;

      let matchAmount = true;
      if (amountFilter !== "all" && p.pricePerCoupon) {
        const amount = parseFloat(p.pricePerCoupon);
        switch(amountFilter) {
          case "0-100": matchAmount = amount <= 100; break;
          case "100-500": matchAmount = amount > 100 && amount <= 500; break;
          case "500-1000": matchAmount = amount > 500 && amount <= 1000; break;
          case "1000+": matchAmount = amount > 1000; break;
          default: matchAmount = true;
        }
      }

      return matchSearch && matchStatus && matchMonth && matchAmount;
    });
  }, [payments, searchTerm, statusFilter, monthFilter, amountFilter]);

  /* Reset page on filter change */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, monthFilter, amountFilter]);

  /* ---------------- Pagination ---------------- */
  const totalPages = Math.ceil(filteredPayments.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentPayments = filteredPayments.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  /* ---------------- Reset Filters ---------------- */
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMonthFilter("all");
    setAmountFilter("all");
    setCurrentPage(1);
  };

  /* ---------------- Advanced Export ---------------- */
  const exportData = async () => {
    try {
      const data = filteredPayments.slice(0, exportLimit).map((p) => ({
        PaymentID: p._id,
        VendorName: p.vendorId?.businessName || "N/A",
        VendorEmail: p.vendorId?.email || "N/A",
        Amount: p.pricePerCoupon,
        Status: p.paymentStatus,
        Month: p.month,
        ClaimedDate: p.claimedAt ? new Date(p.claimedAt).toLocaleDateString() : "N/A",
        PaymentDate: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "N/A",
        VerifiedBy: p.verifiedBy || "N/A",
        Notes: p.notes || "",
      }));

      if (exportFormat === "xlsx") {
        const ws = utils.json_to_sheet(data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Payments");
        writeFile(wb, `payments_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else if (exportFormat === "csv") {
        const ws = utils.json_to_sheet(data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Payments");
        writeFile(wb, `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
      }

      alert(`Exported ${data.length} payments successfully!`);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data");
    }
  };

  /* ---------------- Open Update Modal ---------------- */
  const openEditModal = (payment) => {
    setSelectedPayment(payment);
    setNewStatus(payment.paymentStatus);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setNotes(payment.notes || "");
    setVerifiedBy(payment.verifiedBy || "Admin");
    setAmountVerified(payment.pricePerCoupon || "");
    setShowModal(true);
  };

  /* ---------------- UPDATE PAYMENT ---------------- */
  const updatePaymentStatus = async () => {
    if (!selectedPayment) return;

    let action = "mark_pending";
    if (newStatus === "paid") action = "verify_cash";
    if (newStatus === "refunded") action = "refund";

    const payload = {
      action,
      paymentDate: new Date(paymentDate).toISOString(),
      notes: notes || "Updated by admin",
      verifiedBy: verifiedBy || "Admin",
      amountVerified: parseFloat(amountVerified) || selectedPayment.pricePerCoupon,
    };

    try {
      await axios.put(
        `${API_BASE}/admin/payments/${selectedPayment._id}/update`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setShowModal(false);
      fetchPayments();
      alert("✅ Payment updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update payment");
    }
  };

  /* ---------------- Status Badge Component ---------------- */
  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      const configs = {
        paid: { 
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <MdCheckCircle className="inline mr-1" />
        },
        pending: { 
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <MdPendingActions className="inline mr-1" />
        },
        refunded: { 
          color: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <RiRefund2Line className="inline mr-1" />
        },
        cancelled: { 
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: <MdOutlineCancel className="inline mr-1" />
        },
      };
      return configs[status] || { 
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: null 
      };
    };

    const config = getStatusConfig(status);
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${config.color} flex items-center justify-center gap-1`}>
        {config.icon} {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Payment Management
              </h1>
              <p className="text-gray-600">
                Monitor, verify, and manage vendor payments in real-time
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <FaFilter className="text-gray-600" />
                <span className="font-medium">Filters</span>
              </button>
              
              <button
                onClick={fetchPayments}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                <span className="font-medium">{loading ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Payments</p>
                  <p className="text-3xl font-bold mt-2">${summary.totalAmount || "0.00"}</p>
                  <p className="text-blue-100 text-sm mt-2">{payments.length} transactions</p>
                </div>
                <div className="bg-blue-400/20 p-3 rounded-xl">
                  <MdPayment className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Paid</p>
                  <p className="text-3xl font-bold mt-2">${summary.paidAmount || "0.00"}</p>
                  <p className="text-emerald-100 text-sm mt-2">Verified payments</p>
                </div>
                <div className="bg-emerald-400/20 p-3 rounded-xl">
                  <MdCheckCircle className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold mt-2">${summary.pendingAmount || "0.00"}</p>
                  <p className="text-amber-100 text-sm mt-2">Awaiting verification</p>
                </div>
                <div className="bg-amber-400/20 p-3 rounded-xl">
                  <MdPendingActions className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Processed</p>
                  <p className="text-3xl font-bold mt-2">{filteredPayments.length}</p>
                  <p className="text-purple-100 text-sm mt-2">Filtered results</p>
                </div>
                <div className="bg-purple-400/20 p-3 rounded-xl">
                  <FiTrendingUp className="text-2xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Transactions</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {Math.min(startIndex + 1, filteredPayments.length)}-{Math.min(startIndex + PAGE_SIZE, filteredPayments.length)} of {filteredPayments.length} payments
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
                
                <div className="flex gap-2">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="xlsx">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                  
                  <button
                    onClick={exportData}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <RiFileExcelLine /> Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendor, status, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {/* Month Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Months</option>
                    {getUniqueMonths().map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Amount Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                  <select
                    value={amountFilter}
                    onChange={(e) => setAmountFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Amounts</option>
                    <option value="0-100">$0 - $100</option>
                    <option value="100-500">$100 - $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000+">$1,000+</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading payments...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentPayments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FaSearch className="text-gray-400 text-2xl" />
                        </div>
                        <p className="text-gray-900 font-medium mb-2">No payments found</p>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPayments.map((p, idx) => (
                    <tr 
                      key={p._id} 
                      className="hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{p.vendorId?.businessName || "Unknown Vendor"}</p>
                          <p className="text-sm text-gray-500 mt-1">{p.vendorId?.email || "No email"}</p>
                          <p className="text-xs text-gray-400 mt-1">ID: {p._id.substring(0, 10)}...</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${parseFloat(p.pricePerCoupon).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span className="text-gray-700">{p.month}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {p.claimedAt ? new Date(p.claimedAt).toLocaleDateString() : "No date"}
                        </p>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={p.paymentStatus} />
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <FaEdit /> Edit
                          </button>
                          {/* <button
                            onClick={() => alert(`View details for ${p._id}`)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                          >
                            <FiDownload /> Details
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • {filteredPayments.length} total payments
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-gray-300 hover:bg-gray-50"
                        } transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border border-gray-300 hover:bg-gray-50 ${
                          currentPage === totalPages ? "bg-blue-600 text-white" : ""
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Modal - Fixed overflow issue */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal Container */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Update Payment Status</h3>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      Vendor: {selectedPayment.vendorId?.businessName || "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500">Current Amount</p>
                      <p className="text-lg font-bold text-gray-900">${selectedPayment.pricePerCoupon}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Status</p>
                      <div className="mt-1">
                        <StatusBadge status={selectedPayment.paymentStatus} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verified Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={amountVerified}
                          onChange={(e) => setAmountVerified(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verified By
                    </label>
                    <input
                      type="text"
                      value={verifiedBy}
                      onChange={(e) => setVerifiedBy(e.target.value)}
                      placeholder="Enter verifier name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes..."
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={updatePaymentStatus}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Update Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}