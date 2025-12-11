import React, { useState, useEffect } from 'react';

const RedeemedCouponsList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [downloadLimit, setDownloadLimit] = useState(10);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch('http://31.97.206.144:6098/api/admin/userredeemedcouponhistory');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setCoupons(data.data);
        } else {
          setError('Failed to fetch redeemed coupons');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const filterCoupons = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);

    switch (filter) {
      case 'today':
        return coupons.filter(c => c.Redeemed_Date === today);
      case 'yesterday':
        return coupons.filter(c => c.Redeemed_Date === yesterdayStr);
      case 'thisWeek':
        return coupons.filter(c => new Date(c.Redeemed_Date) >= startOfWeek);
      case 'lastWeek':
        return coupons.filter(c => {
          const date = new Date(c.Redeemed_Date);
          return date >= startOfLastWeek && date <= endOfLastWeek;
        });
      case 'custom':
        if (!customFrom || !customTo) return [];
        return coupons.filter(c => {
          const date = new Date(c.Redeemed_Date);
          return date >= new Date(customFrom) && date <= new Date(customTo);
        });
      default:
        return coupons;
    }
  };

  const redeemedCoupons = filterCoupons();

  const totalPages = Math.ceil(redeemedCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = redeemedCoupons.slice(startIndex, startIndex + itemsPerPage);

  const handleDownload = () => {
    const dataToDownload = redeemedCoupons.slice(0, downloadLimit);
    if (dataToDownload.length === 0) return;

    const headers = Object.keys(dataToDownload[0]);
    const csv = [
      headers.join(','),
      ...dataToDownload.map(row => headers.map(field => `"${row[field]}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'redeemed_coupons.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white shadow rounded flex items-center justify-center">
        <div className="text-lg font-semibold text-gray-700">Loading redeemed coupons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white shadow rounded flex items-center justify-center">
        <div className="text-lg font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow rounded mx-auto max-w-full overflow-x-auto">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <select
            className="border border-gray-300 p-1 rounded text-sm"
            value={filter}
            onChange={e => handleFilterChange(e.target.value)}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="thisWeek">This Week</option>
            <option value="lastWeek">Last Week</option>
            <option value="custom">Custom Date</option>
          </select>

          {filter === 'custom' && (
            <div className="flex items-center gap-1 text-sm">
              <input
                type="date"
                className="border border-gray-300 p-1 rounded"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
              />
              <span className="text-gray-600">to</span>
              <input
                type="date"
                className="border border-gray-300 p-1 rounded"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <select
            className="border border-gray-300 p-1 rounded text-sm"
            value={downloadLimit}
            onChange={e => setDownloadLimit(parseInt(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            disabled={redeemedCoupons.length === 0}
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-center mb-4 text-blue-800">Redeemed Coupons List</h2>

      {/* Table */}
      <div className="overflow-x-auto text-xs">
        <table className="w-full border border-gray-300">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-1 border">SI No</th>
              <th className="p-1 border">Cust ID</th>
              <th className="p-1 border">Vendor</th>
              <th className="p-1 border">Category</th>
              <th className="p-1 border">Product</th>
              <th className="p-1 border">Coupon ID</th>
              <th className="p-1 border">Coupon</th>
              <th className="p-1 border">Code</th>
              <th className="p-1 border">Discount</th>
              <th className="p-1 border">Download</th>
              <th className="p-1 border">Redeemed</th>
              <th className="p-1 border">Time</th>
              <th className="p-1 border">Order</th>
              <th className="p-1 border">Value</th>
              <th className="p-1 border">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item.Coupon_ID || index} className="text-center border-b">
                  <td className="p-1 border">{item.SI_No}</td>
                  <td className="p-1 border">{item.Customer_ID}</td>
                  <td className="p-1 border truncate max-w-xs">{item.Vendor_Name}</td>
                  <td className="p-1 border truncate max-w-xs">{item.Coupon_Category}</td>
                  <td className="p-1 border truncate max-w-xs">{item.Product_Name}</td>
                  <td className="p-1 border">{item.Coupon_ID}</td>
                  <td className="p-1 border truncate max-w-xs">{item.Coupon_Name}</td>
                  <td className="p-1 border font-mono">{item.Coupon_Code}</td>
                  <td className="p-1 border">{item['Discount (%)']}</td>
                  <td className="p-1 border">{item.Download_Date}</td>
                  <td className="p-1 border">{item.Redeemed_Date}</td>
                  <td className="p-1 border">{item.Redeemed_Time}</td>
                  <td className="p-1 border truncate max-w-xs">{item.Order_Details}</td>
                  <td className="p-1 border">{item.Order_Value}</td>
                  <td className="p-1 border text-left truncate max-w-xs">{item.Feedback}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" className="text-center p-3 text-gray-500">
                  {coupons.length === 0 ? 'No redeemed coupons available' : 'No data available for the selected filter'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {redeemedCoupons.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-1 mt-4 text-sm">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-2 py-1 rounded text-xs ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RedeemedCouponsList;