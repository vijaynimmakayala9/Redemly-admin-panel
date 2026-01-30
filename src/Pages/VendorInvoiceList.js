import { useState, useEffect } from "react";
import axios from "axios";
import { utils, writeFile } from "xlsx";
import { FaPaperPlane, FaFileDownload, FaSearch, FaFileExport, FaCalendarAlt, FaSync } from "react-icons/fa";
import { MdOutlinePayment, MdPendingActions, MdOutlineLocationCity, MdAttachMoney, MdCheckCircle, MdOutlineCancel } from "react-icons/md";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { RiRefund2Line } from "react-icons/ri";

const API_BASE = "https://api.redemly.com/api";

export default function VendorInvoiceList() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadLimit, setDownloadLimit] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [loading, setLoading] = useState(false);
  
  // API Data States
  const [pendingPayments, setPendingPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [vendorSummary, setVendorSummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [allMonths, setAllMonths] = useState([]);

  // Modal States
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [amountVerified, setAmountVerified] = useState("");
  const [showModal, setShowModal] = useState(false);

  const vendorsPerPage = 10;

  /* ---------------- Fetch Pending Payments ---------------- */
  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/payment/pending`);
      
      if (res.data.success) {
        const data = res.data.data;
        setPendingPayments(data.pendingPayments || []);
        setSummary(data.summary);
        setVendorSummary(data.vendorSummary || []);
        setMonthlySummary(data.monthlySummary || []);
        
        // Extract unique vendors
        const uniqueVendors = [...new Set(data.pendingPayments
          .filter(p => p.vendorId)
          .map(p => ({
            id: p.vendorId._id,
            name: p.vendorId.businessName || p.vendorName || "Unknown Vendor"
          })))];
        setAllVendors(uniqueVendors);

        // Extract unique months
        const uniqueMonths = [...new Set(data.pendingPayments.map(p => p.month))];
        setAllMonths(uniqueMonths);
      }
    } catch (err) {
      console.error("Error fetching pending payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  /* ---------------- Filter Logic ---------------- */
  const filteredPayments = pendingPayments.filter((payment) => {
    // Search filter
    const matchesSearch = 
      (payment.vendorId?.businessName || payment.vendorName || "").toLowerCase().includes(search.toLowerCase()) ||
      (payment.userId?.name || payment.userName || "").toLowerCase().includes(search.toLowerCase()) ||
      (payment.couponId?.couponCode || payment.couponCode || "").toLowerCase().includes(search.toLowerCase());

    // Month filter
    const matchesMonth = selectedMonth === "all" || payment.month === selectedMonth;

    // Vendor filter
    const matchesVendor = selectedVendor === "all" || payment.vendorId?._id === selectedVendor;

    return matchesSearch && matchesMonth && matchesVendor;
  });

  /* ---------------- Pagination Logic ---------------- */
  const indexOfLastInvoice = currentPage * vendorsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - vendorsPerPage;
  const currentInvoices = filteredPayments.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(filteredPayments.length / vendorsPerPage);

  /* ---------------- Statistics Calculation ---------------- */
  const totalInvoices = pendingPayments.length;
  const totalAmount = pendingPayments.reduce((sum, payment) => sum + (payment.pricePerCoupon || 0), 0);
  const uniqueVendorsCount = [...new Set(pendingPayments
    .filter(p => p.vendorId)
    .map(p => p.vendorId?._id))].length;

  /* ---------------- Export Function ---------------- */
  const handleDownloadCSV = () => {
    if (filteredPayments.length === 0) {
      alert("No pending payments available to export!");
      return;
    }

    const exportData = filteredPayments
      .slice(0, downloadLimit)
      .map((payment) => ({
        PaymentID: payment._id,
        VendorName: payment.vendorId?.businessName || payment.vendorName || "Unknown Vendor",
        VendorEmail: payment.vendorId?.email || "N/A",
        VendorPhone: payment.vendorId?.phone || "N/A",
        CustomerName: payment.userId?.name || payment.userName || "N/A",
        CustomerEmail: payment.userId?.email || "N/A",
        CouponCode: payment.couponId?.couponCode || payment.couponCode || "N/A",
        DiscountPercentage: payment.couponId?.discountPercentage || "N/A",
        Amount: "$" + (payment.pricePerCoupon || 0).toFixed(2),
        Month: payment.month,
        Status: payment.paymentStatus,
        ClaimedDate: payment.claimedAt ? new Date(payment.claimedAt).toLocaleDateString() : "N/A",
        PaymentMethod: payment.paymentMethod || "pending",
      }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "PendingPayments");
    writeFile(wb, `pending_payments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  /* ---------------- Open Update Modal ---------------- */
  const openEditModal = (payment) => {
    setSelectedPayment(payment);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setNotes("");
    setVerifiedBy("Admin");
    setAmountVerified(payment.pricePerCoupon || "");
    setShowModal(true);
  };

  /* ---------------- Update Payment Status ---------------- */
  const updatePaymentStatus = async () => {
    if (!selectedPayment) return;

    const payload = {
      action: "verify_cash",
      paymentDate: new Date(paymentDate).toISOString(),
      notes: notes || "Payment verified by admin",
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
      fetchPendingPayments();
      alert("✅ Payment verified successfully!");
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
          color: "bg-green-100 text-green-800",
          icon: <MdCheckCircle className="inline mr-1" />
        },
        pending: { 
          color: "bg-yellow-100 text-yellow-800",
          icon: <MdPendingActions className="inline mr-1" />
        },
        refunded: { 
          color: "bg-red-100 text-red-800",
          icon: <RiRefund2Line className="inline mr-1" />
        },
        cancelled: { 
          color: "bg-gray-100 text-gray-800",
          icon: <MdOutlineCancel className="inline mr-1" />
        },
      };
      return configs[status] || { 
        color: "bg-gray-100 text-gray-800",
        icon: null 
      };
    };

    const config = getStatusConfig(status);
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${config.color} flex items-center justify-center gap-1`}>
        {config.icon} {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  /* ---------------- Reset Filters ---------------- */
  const resetFilters = () => {
    setSearch("");
    setSelectedMonth("all");
    setSelectedStatus("all");
    setSelectedVendor("all");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Vendor Pending Payments
              </h1>
              <p className="text-gray-600">
                Manage and verify pending vendor payments for coupon redemptions
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <FaSearch className="text-gray-600" />
                <span className="font-medium">Clear Filters</span>
              </button>
              
              <button
                onClick={fetchPendingPayments}
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
                  <p className="text-blue-100 text-sm font-medium">Total Pending Amount</p>
                  <p className="text-3xl font-bold mt-2">${summary.totalPending?.toFixed(2) || "0.00"}</p>
                  <p className="text-blue-100 text-sm mt-2">{summary.vendorCount || 0} vendors</p>
                </div>
                <div className="bg-blue-400/20 p-3 rounded-xl">
                  <MdAttachMoney className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Pending Payments</p>
                  <p className="text-3xl font-bold mt-2">{summary.totalRecords || 0}</p>
                  <p className="text-amber-100 text-sm mt-2">Awaiting verification</p>
                </div>
                <div className="bg-amber-400/20 p-3 rounded-xl">
                  <MdPendingActions className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Active Vendors</p>
                  <p className="text-3xl font-bold mt-2">{uniqueVendorsCount}</p>
                  <p className="text-emerald-100 text-sm mt-2">With pending payments</p>
                </div>
                <div className="bg-emerald-400/20 p-3 rounded-xl">
                  <HiBuildingOffice2 className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Filtered Results</p>
                  <p className="text-3xl font-bold mt-2">{filteredPayments.length}</p>
                  <p className="text-purple-100 text-sm mt-2">Current view</p>
                </div>
                <div className="bg-purple-400/20 p-3 rounded-xl">
                  <FaSearch className="text-2xl" />
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
                <h2 className="text-xl font-bold text-gray-900">Pending Payment Transactions</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {Math.min(indexOfFirstInvoice + 1, filteredPayments.length)}-{Math.min(indexOfLastInvoice, filteredPayments.length)} of {filteredPayments.length} pending payments
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <select
                    value={downloadLimit}
                    onChange={(e) => setDownloadLimit(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10 records</option>
                    <option value={50}>50 records</option>
                    <option value={100}>100 records</option>
                    <option value={200}>All records</option>
                  </select>
                  
                  <button
                    onClick={handleDownloadCSV}
                    disabled={filteredPayments.length === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      filteredPayments.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <FaFileExport /> Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendor, customer, coupon..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Months</option>
                  {allMonths.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Vendor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Vendors</option>
                  {allVendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vendor Details
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Coupon
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
                    <td colSpan="7" className="p-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading pending payments...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FaSearch className="text-gray-400 text-2xl" />
                        </div>
                        <p className="text-gray-900 font-medium mb-2">No pending payments found</p>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentInvoices.map((payment, index) => (
                    <tr 
                      key={payment._id} 
                      className="hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.vendorId?.businessName || payment.vendorName || "Unknown Vendor"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{payment.vendorId?.email || "No email"}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {payment.vendorId?.phone || "No phone"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.userId?.name || payment.userName || "Unknown Customer"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {payment.userId?.email || "No email"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.couponId?.couponCode || payment.couponCode}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {payment.couponId?.discountPercentage || 0}% discount
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${(payment.pricePerCoupon || 0).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span className="text-gray-700">{payment.month}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {payment.claimedAt ? new Date(payment.claimedAt).toLocaleDateString() : "No date"}
                        </p>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={payment.paymentStatus} />
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(payment)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <FaPaperPlane /> Update Payment
                          </button>
                          {/* <button
                            onClick={() => alert(`Payment details for ${payment._id}`)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                          >
                            <FaFileDownload /> Details
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

      {/* Update Modal */}
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
                    <h3 className="text-xl font-bold text-gray-900">Verify Payment</h3>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      Vendor: {selectedPayment.vendorId?.businessName || selectedPayment.vendorName || "N/A"}
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
                      <p className="text-lg font-bold text-gray-900">
                        ${(selectedPayment.pricePerCoupon || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Status</p>
                      <div className="mt-1">
                        <StatusBadge status={selectedPayment.paymentStatus} />
                      </div>
                    </div>
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
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}