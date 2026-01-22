import { useState } from "react";
import { utils, writeFile } from "xlsx";
import { FaFileDownload, FaSearch, FaFileExport, FaMoneyCheckAlt, FaCalendarCheck } from "react-icons/fa";
import { MdOutlinePayment, MdOutlinePendingActions, MdOutlineAttachMoney } from "react-icons/md";
import { RiRefundLine } from "react-icons/ri";

export default function ReceivedPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [exportLimit, setExportLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("all");
  const vendorsPerPage = 8;

  // Empty payments array (no dummy data)
  const payments = [];

  // Filter payments based on search and date filter
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id?.toString().includes(searchTerm);
    
    const matchesDate = dateFilter === "all" || 
                       (dateFilter === "thisMonth" && isThisMonth(payment.date)) ||
                       (dateFilter === "lastMonth" && isLastMonth(payment.date)) ||
                       (dateFilter === "thisYear" && isThisYear(payment.date));
    
    return matchesSearch && matchesDate;
  });

  // Helper functions for date filtering
  function isThisMonth(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  function isLastMonth(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
  }

  function isThisYear(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return date.getFullYear() === now.getFullYear();
  }

  // Calculate statistics
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalBillAmount = payments.reduce((sum, payment) => sum + (payment.billAmount || 0), 0);
  const totalCouponAmount = payments.reduce((sum, payment) => sum + (payment.couponAmount || 0), 0);
  const paidPayments = payments.filter(payment => payment.status === "Paid").length;

  const indexOfLastPayment = currentPage * vendorsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - vendorsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / vendorsPerPage);

  const exportCSV = () => {
    if (filteredPayments.length === 0) {
      alert("No payments available to export!");
      return;
    }

    const exportData = filteredPayments
      .slice(0, exportLimit)
      .map(({ id, vendorName, amount, couponAmount, billAmount, date, status }) => ({
        ID: id,
        "Vendor Name": vendorName,
        Amount: `$${amount}`,
        "Coupon Amount": `$${couponAmount}`,
        "Bill Amount": `$${billAmount}`,
        Date: date,
        Status: status,
      }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "ReceivedPayments");
    writeFile(wb, `received_payments_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDownloadInvoice = (id) => {
    alert(`Downloading invoice for payment ID: ${id}`);
    // Ideally, trigger invoice download logic here
  };

  return (
    <div className="p-4 md:p-6 rounded-xl bg-white shadow-lg border border-gray-100">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Received Payments</h2>
            <p className="text-gray-600 text-sm">Track and manage all received payments from vendors</p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold text-blue-700">{totalPayments}</p>
            </div>
            <button 
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition flex items-center gap-2"
              onClick={() => alert("Manual payment entry will be implemented")}
            >
              <FaMoneyCheckAlt /> Record Payment
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-700">${totalAmount.toFixed(2)}</p>
              </div>
              <MdOutlineAttachMoney className="text-3xl text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bill Amount</p>
                <p className="text-2xl font-bold text-green-700">${totalBillAmount.toFixed(2)}</p>
              </div>
              <FaMoneyCheckAlt className="text-3xl text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coupon Discount</p>
                <p className="text-2xl font-bold text-yellow-700">${totalCouponAmount.toFixed(2)}</p>
              </div>
              <RiRefundLine className="text-3xl text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Payments</p>
                <p className="text-2xl font-bold text-purple-700">{paidPayments}</p>
              </div>
              <MdOutlinePayment className="text-3xl text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vendor, status, or ID..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Export Limit</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={exportLimit}
              onChange={(e) => setExportLimit(Number(e.target.value))}
            >
              <option value={10}>10 records</option>
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
              <option value={200}>200 records</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={exportCSV}
              disabled={payments.length === 0}
              className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium transition ${
                payments.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <FaFileExport /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        {payments.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
              <MdOutlinePayment className="text-3xl text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Payments Received Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              No payment transactions have been recorded yet. Received payments will appear here once vendors make their payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                onClick={() => alert("Payment tracking setup will be implemented")}
              >
                <FaCalendarCheck /> Setup Payment Tracking
              </button>
              <button 
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                onClick={() => alert("Manual payment entry will be implemented")}
              >
                <FaMoneyCheckAlt /> Record Manual Payment
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="p-4 text-left font-semibold">Sl No</th>
                    <th className="p-4 text-left font-semibold">Vendor Name</th>
                    <th className="p-4 text-left font-semibold">Amount ($)</th>
                    <th className="p-4 text-left font-semibold">Coupon Amount</th>
                    <th className="p-4 text-left font-semibold">Bill Amount</th>
                    <th className="p-4 text-left font-semibold">Date</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentPayments.map((payment, index) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-700">{index + 1 + indexOfFirstPayment}</td>
                      <td className="p-4 font-medium">{payment.vendorName}</td>
                      <td className="p-4 font-bold text-green-600">${payment.amount}</td>
                      <td className="p-4 text-gray-600">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                          -${payment.couponAmount}
                        </span>
                      </td>
                      <td className="p-4 font-bold">${payment.billAmount}</td>
                      <td className="p-4 text-gray-600">{payment.date}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDownloadInvoice(payment.id)}
                          className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition"
                        >
                          <FaFileDownload /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredPayments.length > vendorsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstPayment + 1} to {Math.min(indexOfLastPayment, filteredPayments.length)} of {filteredPayments.length} payments
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}