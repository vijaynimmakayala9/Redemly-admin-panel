import { useState, useEffect } from "react";
import axios from "axios";
import { utils, writeFile } from "xlsx";
import { FaFileDownload, FaSearch, FaFileExport, FaMoneyCheckAlt, FaCalendarCheck, FaSync, FaFilter } from "react-icons/fa";
import { MdOutlinePayment, MdPendingActions, MdOutlineAttachMoney, MdCheckCircle, MdOutlineCalendarMonth } from "react-icons/md";
import { RiRefundLine, RiFileExcelLine } from "react-icons/ri";
import { FiTrendingUp } from "react-icons/fi";

const API_BASE = "https://api.redemly.com/api";

export default function ReceivedPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [exportLimit, setExportLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // API Data States
  // API: /api/admin/paid
  // Returns: { success, data: { paidPayments[], pagination, summary, monthlyBreakdown[] } }
  const [paidPayments, setPaidPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  // methodSummary is NOT returned by the API — derived client-side from paidPayments
  const [methodSummary, setMethodSummary] = useState([]);
  // API returns monthlyBreakdown (not monthlyPaidSummary)
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [allMonths, setAllMonths] = useState([]);

  const vendorsPerPage = 5;

  /* ---------------- Derive method summary from paidPayments ---------------- */
  const deriveMethodSummary = (payments) => {
    const methodMap = {};
    const totalAmt = payments.reduce((sum, p) => sum + (p.pricePerCoupon || 0), 0);

    payments.forEach((p) => {
      const method = p.paymentMethod || "unknown";
      if (!methodMap[method]) {
        methodMap[method] = { method, count: 0, amount: 0 };
      }
      methodMap[method].count += 1;
      methodMap[method].amount += p.pricePerCoupon || 0;
    });

    return Object.values(methodMap).map((m) => ({
      ...m,
      percentage: totalAmt > 0 ? (m.amount / totalAmt) * 100 : 0,
    }));
  };

  /* ---------------- Fetch Paid Payments ---------------- */
  // Correct endpoint: /api/admin/paid
  const fetchPaidPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/paid`);

      if (res.data.success) {
        const data = res.data.data;

        // API: data.paidPayments[]
        const payments = data.paidPayments || [];
        setPaidPayments(payments);

        // API: data.summary { totalAmount, totalRecords, cashRevenue, onlineRevenue, averagePayment }
        setSummary(data.summary || null);

        // API: data.monthlyBreakdown[] { month, totalAmount, totalRecords, vendorsCount }
        setMonthlyBreakdown(data.monthlyBreakdown || []);

        // Derive method summary client-side (not returned by API)
        setMethodSummary(deriveMethodSummary(payments));

        // Extract unique months from paidPayments for the filter dropdown
        const uniqueMonths = [...new Set(payments.map((p) => p.month))].sort();
        setAllMonths(uniqueMonths);
      }
    } catch (err) {
      console.error("Error fetching paid payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaidPayments();
  }, []);

  /* ---------------- Filter Logic ---------------- */
  const filteredPayments = paidPayments.filter((payment) => {
    // Search filter — vendorId.businessName or vendorId.name, userId.name, couponId.couponCode, _id
    const matchesSearch =
      (payment.vendorId?.businessName || payment.vendorId?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (payment.userId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.couponId?.couponCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment._id || "").toLowerCase().includes(searchTerm.toLowerCase());

    // Month filter — payment.month is "YYYY-MM" format
    const matchesMonth = selectedMonth === "all" || payment.month === selectedMonth;

    // Payment method filter — payment.paymentMethod e.g. "offline"
    const matchesMethod = selectedMethod === "all" || payment.paymentMethod === selectedMethod;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== "all") {
      const paymentDate = new Date(
        payment.paidAt || payment.claimedAt || payment.createdAt
      );
      const now = new Date();

      switch (dateFilter) {
        case "thisMonth":
          matchesDate =
            paymentDate.getMonth() === now.getMonth() &&
            paymentDate.getFullYear() === now.getFullYear();
          break;
        case "lastMonth": {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          matchesDate =
            paymentDate.getMonth() === lastMonth.getMonth() &&
            paymentDate.getFullYear() === lastMonth.getFullYear();
          break;
        }
        case "thisYear":
          matchesDate = paymentDate.getFullYear() === now.getFullYear();
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesMonth && matchesMethod && matchesDate;
  });

  /* ---------------- Calculate Statistics ---------------- */
  // API: summary.totalAmount (sum of pricePerCoupon per paid payment, approved by admin)
  const totalAmount = summary?.totalAmount || 0;
  const totalPayments = summary?.totalRecords || paidPayments.length;

  // Bill amount = sum of pricePerCoupon across all payments
  const totalBillAmount = paidPayments.reduce(
    (sum, payment) => sum + (payment.pricePerCoupon || 0),
    0
  );

  // Coupon discount = sum of (pricePerCoupon * discountPercentage / 100)
  const totalCouponAmount = paidPayments.reduce((sum, payment) => {
    const discount = payment.couponId?.discountPercentage || 0;
    const amount = payment.pricePerCoupon || 0;
    return sum + (amount * discount) / 100;
  }, 0);

  /* ---------------- Pagination Logic ---------------- */
  const indexOfLastPayment = currentPage * vendorsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - vendorsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / vendorsPerPage);

  /* ---------------- Export Function ---------------- */
  const exportCSV = () => {
    if (filteredPayments.length === 0) {
      alert("No paid payments available to export!");
      return;
    }

    const exportData = filteredPayments.slice(0, exportLimit).map((payment) => ({
      PaymentID: payment._id,
      VendorName: payment.vendorId?.businessName || payment.vendorId?.name || "Unknown Vendor",
      VendorEmail: payment.vendorId?.email || "N/A",
      VendorPhone: payment.vendorId?.phone || "N/A",
      CustomerName: payment.userId?.name || "N/A",
      CustomerEmail: payment.userId?.email || "N/A",
      CouponName: payment.couponId?.name || "N/A",
      CouponCode: payment.couponId?.couponCode || "N/A",
      DiscountPercentage: payment.couponId?.discountPercentage || "N/A",
      Amount: `$${(payment.pricePerCoupon || 0).toFixed(2)}`,
      // paymentDetails.amountUSD is the admin-verified total for the batch
      ApprovedAmountUSD: payment.paymentDetails?.amountUSD
        ? `$${payment.paymentDetails.amountUSD}`
        : "N/A",
      Month: payment.month,
      PaymentMethod: payment.paymentMethod || "N/A",
      Status: payment.paymentStatus,
      PeriodType: payment.paymentDetails?.periodType || "N/A",
      ClaimedDate: payment.claimedAt
        ? new Date(payment.claimedAt).toLocaleDateString()
        : "N/A",
      PaidDate: payment.paidAt
        ? new Date(payment.paidAt).toLocaleDateString()
        : "N/A",
      TransactionID:
        payment.transactionId ||
        payment.razorpayPaymentId ||
        payment.paymentDetails?.approvalId ||
        "N/A",
      AdminNotes: payment.paymentDetails?.adminNotes || "N/A",
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "ReceivedPayments");
    writeFile(wb, `received_payments_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  /* ---------------- Reset Filters ---------------- */
  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter("all");
    setSelectedMonth("all");
    setSelectedMethod("all");
    setCurrentPage(1);
  };

  /* ---------------- Unique payment methods for filter dropdown ---------------- */
  const uniqueMethods = [...new Set(paidPayments.map((p) => p.paymentMethod).filter(Boolean))];

  /* ---------------- Status Badge Component ---------------- */
  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      const configs = {
        paid: {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <MdCheckCircle className="inline mr-1" />,
        },
        pending: {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <MdPendingActions className="inline mr-1" />,
        },
      };
      return configs[status] || {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: null,
      };
    };

    const config = getStatusConfig(status);
    return (
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-medium border ${config.color} flex items-center justify-center gap-1`}
      >
        {config.icon} {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  /* ---------------- Period Badge Component ---------------- */
  const PeriodBadge = ({ periodType }) => {
    if (!periodType) return null;
    const colors = {
      weekly: "bg-blue-50 text-blue-700",
      monthly: "bg-purple-50 text-purple-700",
      daily: "bg-green-50 text-green-700",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
          colors[periodType] || "bg-gray-100 text-gray-600"
        }`}
      >
        {periodType}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Received Payments
              </h1>
              <p className="text-gray-600">
                Track and manage all received payments from vendors
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <FaFilter className="text-gray-600" />
                <span className="font-medium">
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </span>
              </button>

              <button
                onClick={fetchPaidPayments}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                <span className="font-medium">
                  {loading ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* API: summary.totalAmount */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Received</p>
                <p className="text-3xl font-bold mt-2">${totalAmount.toFixed(2)}</p>
                <p className="text-blue-100 text-sm mt-2">{totalPayments} transactions</p>
              </div>
              <div className="bg-blue-400/20 p-3 rounded-xl">
                <MdOutlineAttachMoney className="text-2xl" />
              </div>
            </div>
          </div>

          {/* sum of pricePerCoupon */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Bill Amount</p>
                <p className="text-3xl font-bold mt-2">${totalBillAmount.toFixed(2)}</p>
                <p className="text-emerald-100 text-sm mt-2">Total payments</p>
              </div>
              <div className="bg-emerald-400/20 p-3 rounded-xl">
                <FaMoneyCheckAlt className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Coupon discount derived from discountPercentage */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-amber-100 text-sm font-medium">Coupon Discount</p>
                <p className="text-3xl font-bold mt-2">${totalCouponAmount.toFixed(2)}</p>
                <p className="text-amber-100 text-sm mt-2">Total discount given</p>
              </div>
              <div className="bg-amber-400/20 p-3 rounded-xl">
                <RiRefundLine className="text-2xl" />
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
                <FiTrendingUp className="text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Paid Payment Transactions
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing{" "}
                  {Math.min(indexOfFirstPayment + 1, filteredPayments.length)}–
                  {Math.min(indexOfLastPayment, filteredPayments.length)} of{" "}
                  {filteredPayments.length} received payments
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
                    value={exportLimit}
                    onChange={(e) => setExportLimit(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10 records</option>
                    <option value={50}>50 records</option>
                    <option value={100}>100 records</option>
                    <option value={200}>All records</option>
                  </select>

                  <button
                    onClick={exportCSV}
                    disabled={filteredPayments.length === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      filteredPayments.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <FaSearch className="absolute left-3 top-2/3 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendor, customer, coupon..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Month Filter — values are "YYYY-MM" from payment.month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Months</option>
                    {allMonths.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method Filter — dynamically built from actual data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => {
                      setSelectedMethod(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Methods</option>
                    {uniqueMethods.map((method) => (
                      <option key={method} value={method}>
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="thisYear">This Year</option>
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
                    S NO
                  </th>
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
                    Payment Info
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading received payments...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentPayments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <MdOutlinePayment className="text-gray-400 text-2xl" />
                        </div>
                        <p className="text-gray-900 font-medium mb-2">
                          No Payments Found
                        </p>
                        <p className="text-gray-600">
                          No payment transactions match your current filters.
                        </p>
                        <button
                          onClick={resetFilters}
                          className="mt-4 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPayments.map((payment, index) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      <td className="p-4">
                        {(currentPage - 1)*vendorsPerPage + index + 1}
                      </td>
                      {/* Vendor — vendorId.businessName preferred, fallback to vendorId.name */}
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.vendorId?.businessName || payment.vendorId?.name || "Unknown Vendor"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {payment.vendorId?.email || "No email"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {payment.vendorId?.phone || "No phone"}
                          </p>
                        </div>
                      </td>

                      {/* Customer — userId.name, userId.email */}
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.userId?.name || "Unknown Customer"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {payment.userId?.email || "No email"}
                          </p>
                        </div>
                      </td>

                      {/* Coupon — couponId.name, couponCode, discountPercentage */}
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.couponId?.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            {payment.couponId?.couponCode || ""}
                          </p>
                          {payment.couponId?.discountPercentage && (
                            <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded mt-1 inline-block">
                              {payment.couponId.discountPercentage}% off
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Info — pricePerCoupon, paymentMethod, paymentDetails.amountUSD */}
                      <td className="p-4">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            ${(payment.pricePerCoupon || 0).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded capitalize">
                              {payment.paymentMethod || "N/A"}
                            </span>
                          </div>
                          {/* Admin-verified batch amount from paymentDetails */}
                          {payment.paymentDetails?.amountUSD && (
                            <p className="text-xs text-gray-500 mt-1">
                              Approved: ${payment.paymentDetails.amountUSD}
                            </p>
                          )}
                          {/* transactionId or paymentDetails.approvalId */}
                          {(payment.transactionId || payment.paymentDetails?.approvalId) && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-[160px]">
                              {(payment.transactionId || payment.paymentDetails?.approvalId)
                                .substring(0, 20)}...
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Period — month + paidAt date + periodType */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MdOutlineCalendarMonth className="text-gray-400" />
                          <span className="text-gray-700">{payment.month}</span>
                        </div>
                        {payment.paymentDetails?.periodType && (
                          <PeriodBadge periodType={payment.paymentDetails.periodType} />
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleDateString()
                            : payment.claimedAt
                            ? new Date(payment.claimedAt).toLocaleDateString()
                            : "No date"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <StatusBadge status={payment.paymentStatus} />
                        {payment.paymentDetails?.verifiedByAdmin && (
                          <p className="text-xs text-emerald-600 mt-1 text-center">
                            ✓ Admin verified
                          </p>
                        )}
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
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

        {/* Summary Section — Method Summary (derived) + Monthly Breakdown (from API) + Quick Stats */}
        {(methodSummary.length > 0 || monthlyBreakdown.length > 0) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Payment Methods — derived client-side since API doesn't return methodSummary */}
            {methodSummary.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h3>
                <div className="space-y-4">
                  {methodSummary.map((method) => (
                    <div key={method.method} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {method.method}
                        </p>
                        <p className="text-sm text-gray-500">{method.count} payments</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${method.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {method.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Breakdown — API: data.monthlyBreakdown[].{ month, totalAmount, totalRecords, vendorsCount } */}
            {monthlyBreakdown.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Breakdown</h3>
                <div className="space-y-4">
                  {monthlyBreakdown.map((month) => (
                    <div key={month.month} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{month.month}</p>
                        <p className="text-sm text-gray-500">
                          {month.vendorsCount} vendor{month.vendorsCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          ${month.totalAmount?.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {month.totalRecords} payments
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats — API: summary.{ totalAmount, totalRecords, averagePayment, cashRevenue, onlineRevenue } */}
            {summary && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Average Payment</p>
                      <p className="text-sm text-gray-500">Per transaction</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">
                        ${summary.averagePayment?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Total Transactions</p>
                      <p className="text-sm text-gray-500">Verified payments</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">
                        {summary.totalRecords || 0}
                      </p>
                    </div>
                  </div>
                  {/* API: summary.cashRevenue */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Cash Revenue</p>
                      <p className="text-sm text-gray-500">Offline payments</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">
                        ${(summary.cashRevenue || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {/* API: summary.onlineRevenue */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Online Revenue</p>
                      <p className="text-sm text-gray-500">Digital payments</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        ${(summary.onlineRevenue || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}