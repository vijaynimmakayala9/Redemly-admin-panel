import { useState, useEffect, useMemo } from "react";

const API_URL = "https://api.redemly.com/api/admin/userusage-couponhistory";

const CouponHistoryTable = () => {
  const [couponHistory, setCouponHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error("Failed to fetch coupon history");
        }

        setCouponHistory(data.history);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // ✅ FILTER + SEARCH (Memoized for performance)
  const filteredData = useMemo(() => {
    return couponHistory.filter((coupon) => {
      const matchesSearch =
        coupon.Customer_Name?.toLowerCase().includes(search.toLowerCase()) ||
        coupon.Coupon_Name?.toLowerCase().includes(search.toLowerCase()) ||
        coupon.Vendor_Name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || coupon.Status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [couponHistory, search, statusFilter]);

  // ✅ PAGINATION
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Expired":
        return "bg-red-100 text-red-600";
      case "Used":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-xl font-semibold text-gray-600">
          Loading Coupon History...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-xl font-semibold">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-md p-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Coupon Usage History
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search customer, vendor, coupon..."
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />

            {/* STATUS FILTER */}
            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
            >
              <option>All</option>
              <option>Active</option>
              <option>Expired</option>
              <option>Used</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr className="text-gray-600">
                <th className="p-3 text-left">S NO</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Coupon</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Coins</th>
                <th className="p-3">Downloaded</th>
                <th className="p-3">Validity</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((coupon, index) => (
                <tr
                  key={coupon.SI_No}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">{(page - 1) * rowsPerPage + index + 1}</td>
                  {/* CUSTOMER */}
                  <td className="p-3">
                    <div className="font-semibold">
                      {coupon.Customer_Name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {coupon.Customer_Email}
                    </div>
                  </td>

                  {/* VENDOR */}
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <img
                        src={coupon.Image}
                        alt="vendor"
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <span className="text-xs">
                        {coupon.Vendor_Name || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* COUPON */}
                  <td className="p-3 text-center">
                    <div className="font-semibold">
                      {coupon.Coupon_Name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {coupon.Coupon_ID}
                    </div>
                  </td>

                  <td className="p-3 text-center font-semibold text-indigo-600">
                    {coupon.Discount}
                  </td>

                  <td className="p-3 text-center">
                    {coupon.Coins_Cost}
                  </td>

                  <td className="p-3 text-center">
                    {coupon.Download_Date || "N/A"}
                  </td>

                  <td className="p-3 text-center">
                    {coupon.Validity_Date}
                  </td>

                  {/* STATUS BADGE */}
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        coupon.Status
                      )}`}
                    >
                      {coupon.Status}
                    </span>
                  </td>
                </tr>
              ))}

              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    No coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-600">
            Showing {(page - 1) * rowsPerPage + 1} -
            {" "}
            {Math.min(page * rowsPerPage, filteredData.length)}
            {" "}of {filteredData.length}
          </span>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 border rounded-lg disabled:opacity-40"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>

            <button
              className="px-4 py-2 border rounded-lg disabled:opacity-40"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CouponHistoryTable;
