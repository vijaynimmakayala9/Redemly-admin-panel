import { useState } from "react";
import { utils, writeFile } from "xlsx";
import { FaEdit, FaFileDownload, FaSearch, FaFileExport } from "react-icons/fa";
import { MdPayment, MdPendingActions } from "react-icons/md";
import { RiRefund2Line } from "react-icons/ri";

export default function AllPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [exportLimit, setExportLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const vendorsPerPage = 10;

  // Empty payments array (no dummy data)
  const payments = [];

  const filteredPayments = payments.filter((payment) =>
    payment.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id?.toString().includes(searchTerm)
  );

  const indexOfLastPayment = currentPage * vendorsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - vendorsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / vendorsPerPage);

  const exportCSV = () => {
    if (filteredPayments.length === 0) {
      alert("No data available to export!");
      return;
    }

    const exportData = filteredPayments
      .slice(0, exportLimit)
      .map(({ id, vendorName, amount, couponAmount, billAmount, date, status }) => ({
        ID: id,
        "Vendor Name": vendorName,
        Amount: amount,
        "Coupon Amount": couponAmount,
        "Bill Amount": billAmount,
        Date: date,
        Status: status,
      }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "ReceivedPayments");
    writeFile(wb, `received_payments_${exportLimit}.csv`);
  };

  const handleDownloadInvoice = (id) => {
    alert(`Downloading invoice for payment ID: ${id}`);
  };

  const handleEditStatus = (id, currentStatus) => {
    setSelectedPaymentId(id);
    setNewStatus(currentStatus);
    setShowModal(true);
  };

  const handleSaveStatus = () => {
    setShowModal(false);
    alert(`Status updated to ${newStatus} for payment ID: ${selectedPaymentId}`);
  };

  return (
    <div className="p-4 md:p-6 rounded-xl bg-white shadow-lg border border-gray-100">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">All Payments</h2>
            <p className="text-gray-600 text-sm">Manage and track all payment transactions</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:block">Total Payments:</span>
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
              {payments.length}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-700">$0</p>
              </div>
              <MdPayment className="text-3xl text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-blue-700">0</p>
              </div>
              <MdPayment className="text-3xl text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">0</p>
              </div>
              <MdPendingActions className="text-3xl text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Refunded</p>
                <p className="text-2xl font-bold text-red-700">0</p>
              </div>
              <RiRefund2Line className="text-3xl text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Export Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="relative w-full lg:w-2/5">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vendor, status, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Export:</span>
            <select
              value={exportLimit}
              onChange={(e) => setExportLimit(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value={10}>10 records</option>
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
              <option value={200}>200 records</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            disabled={payments.length === 0}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              payments.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FaFileExport /> Export CSV
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        {payments.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
              <MdPayment className="text-3xl text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Payments Found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              No payment transactions have been recorded yet. Payments will appear here once they are processed.
            </p>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
              <MdPayment /> Process New Payment
            </button>
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
                      <td className="p-4 text-gray-600">${payment.couponAmount}</td>
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadInvoice(payment.id)}
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <FaFileDownload /> Invoice
                          </button>
                          <button
                            onClick={() => handleEditStatus(payment.id, payment.status)}
                            className="flex items-center gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-3 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <FaEdit /> Edit
                          </button>
                        </div>
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
                    Showing {indexOfFirstPayment + 1} to {Math.min(indexOfLastPayment, filteredPayments.length)} of {filteredPayments.length} entries
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

      {/* Modal for editing status */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Edit Payment Status</h3>
              <p className="text-gray-600 mb-6">Update the status for payment ID: {selectedPaymentId}</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select New Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStatus}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}