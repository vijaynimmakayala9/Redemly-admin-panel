import { useState, useEffect } from "react";
import { utils, writeFile } from "xlsx";
import { FaPaperPlane, FaFileDownload, FaSearch, FaFileExport, FaCalendarAlt } from "react-icons/fa";
import { MdOutlinePayment, MdPendingActions, MdOutlineLocationCity, MdAttachMoney } from "react-icons/md";
import { HiBuildingOffice2 } from "react-icons/hi2";

export default function VendorInvoiceList() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadLimit, setDownloadLimit] = useState(10);
  const [invoiceStatus, setInvoiceStatus] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const vendorsPerPage = 10;

  // Empty invoices array (no dummy data)
  const invoices = [];

  // Filter invoices based on multiple criteria
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.city?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.state?.toLowerCase().includes(search.toLowerCase());
    
    const matchesMonth = selectedMonth === "all" || invoice.month === selectedMonth;
    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus;
    
    return matchesSearch && matchesMonth && matchesStatus;
  });

  // Get unique months from invoices (if any)
  const uniqueMonths = [...new Set(invoices.map(invoice => invoice.month))];

  const indexOfLastInvoice = currentPage * vendorsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - vendorsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(filteredInvoices.length / vendorsPerPage);

  // Calculate statistics
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const pendingInvoices = invoices.filter(invoice => invoice.status === "Pending").length;
  const paidInvoices = invoices.filter(invoice => invoice.status === "Paid").length;

  const handleSendInvoice = (id) => {
    if (!invoiceStatus[id]) {
      setInvoiceStatus((prev) => ({ ...prev, [id]: "Sent" }));
      alert(`Invoice sent to vendor ID: ${id}`);
    } else {
      alert(`Invoice already sent to vendor ID: ${id}`);
    }
  };

  const handleDownloadCSV = () => {
    if (filteredInvoices.length === 0) {
      alert("No invoices available to export!");
      return;
    }

    const exportData = filteredInvoices
      .slice(0, downloadLimit)
      .map(({ id, vendorName, month, redeemedCoupons, salePercentage, amount, status, city, state }) => ({
        ID: id,
        "Vendor Name": vendorName,
        Month: month,
        "Redeemed Coupons": redeemedCoupons,
        "Sale Percentage": salePercentage + "%",
        Amount: "$" + amount,
        Status: status,
        City: city,
        State: state
      }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "VendorInvoices");
    writeFile(wb, `vendor_invoices_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDownloadInvoice = (id) => {
    alert(`Downloading invoice for vendor ID: ${id}`);
    // Implement actual download logic here
  };

  return (
    <div className="p-4 md:p-6 rounded-xl bg-white shadow-lg border border-gray-100">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Vendor Monthly Invoices</h2>
            <p className="text-gray-600 text-sm">Manage and send invoices to vendors for coupon redemptions</p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-blue-700">{totalInvoices}</p>
            </div>
            <button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2"
              onClick={() => alert("Generate new invoices feature will be implemented")}
            >
              <FaCalendarAlt /> Generate Monthly Invoices
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
              <MdAttachMoney className="text-3xl text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-700">{paidInvoices}</p>
              </div>
              <MdOutlinePayment className="text-3xl text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-yellow-700">{pendingInvoices}</p>
              </div>
              <MdPendingActions className="text-3xl text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold text-purple-700">{[...new Set(invoices.map(inv => inv.vendorName))].length}</p>
              </div>
              <HiBuildingOffice2 className="text-3xl text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendor, city, state..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Month</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Export Limit</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={downloadLimit}
                onChange={(e) => setDownloadLimit(Number(e.target.value))}
              >
                <option value={10}>10 records</option>
                <option value={50}>50 records</option>
                <option value={100}>100 records</option>
                <option value={200}>200 records</option>
              </select>
            </div>
            
            <button
              onClick={handleDownloadCSV}
              disabled={invoices.length === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition ${
                invoices.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <FaFileExport /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
              <FaPaperPlane className="text-3xl text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices Found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              No vendor invoices have been generated yet. Invoices will appear here once generated for coupon redemptions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                onClick={() => alert("Generate invoices feature will be implemented")}
              >
                <FaCalendarAlt /> Generate Invoices
              </button>
              <button 
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                onClick={() => alert("Manual invoice creation will be implemented")}
              >
                <FaPaperPlane /> Create Manual Invoice
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
                    <th className="p-4 text-left font-semibold">Month</th>
                    <th className="p-4 text-left font-semibold">Coupons Redeemed</th>
                    <th className="p-4 text-left font-semibold">Sale %</th>
                    <th className="p-4 text-left font-semibold">Amount</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-left font-semibold">City</th>
                    <th className="p-4 text-left font-semibold">State</th>
                    <th className="p-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentInvoices.map((invoice, index) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-700">{index + 1 + indexOfFirstInvoice}</td>
                      <td className="p-4 font-medium">{invoice.vendorName}</td>
                      <td className="p-4 text-gray-600">{invoice.month}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
                          {invoice.redeemedCoupons}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{invoice.salePercentage}%</td>
                      <td className="p-4 font-bold text-green-600">${invoice.amount}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 flex items-center gap-2">
                        <MdOutlineLocationCity className="text-gray-400" />
                        {invoice.city}
                      </td>
                      <td className="p-4 text-gray-600">{invoice.state}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          {invoice.status === "Paid" && (
                            <button
                              onClick={() => handleDownloadInvoice(invoice.id)}
                              className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition"
                            >
                              <FaFileDownload /> Download
                            </button>
                          )}
                          {invoice.status === "Pending" && (
                            invoiceStatus[invoice.id] !== "Sent" ? (
                              <button
                                onClick={() => handleSendInvoice(invoice.id)}
                                className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-lg text-sm font-medium transition"
                              >
                                <FaPaperPlane /> Send Invoice
                              </button>
                            ) : (
                              <button
                                className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                                disabled
                              >
                                <FaPaperPlane /> Invoice Sent
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredInvoices.length > vendorsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstInvoice + 1} to {Math.min(indexOfLastInvoice, filteredInvoices.length)} of {filteredInvoices.length} invoices
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