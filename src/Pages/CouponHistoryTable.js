import { useState, useEffect } from "react";

const CouponHistoryTable = () => {
  const [couponHistory, setCouponHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCouponHistory = async () => {
      try {
        const response = await fetch("http://31.97.206.144:6098/api/admin/userusage-couponhistory");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setCouponHistory(data.history);
        } else {
          setError("Failed to fetch coupon history");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCouponHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-r from-blue-100 to-green-100 min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading coupon history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-r from-blue-100 to-green-100 min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-100 to-green-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center">Coupon Usage History</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-green-100 text-gray-600">
              <tr>
                <th className="py-2 px-4 border">SI No</th>
                <th className="py-2 px-4 border">Customer ID</th>
                <th className="py-2 px-4 border">Coupon ID</th>
                <th className="py-2 px-4 border">Discount</th>
                <th className="py-2 px-4 border">Coupon Download Date</th>
                <th className="py-2 px-4 border">Coupon Redeemed Date</th>
                <th className="py-2 px-4 border">Coupon Redeemed Time</th>
                <th className="py-2 px-4 border">Coupon Order Details</th>
                <th className="py-2 px-4 border">Order Value</th>
                <th className="py-2 px-4 border">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {couponHistory.map((coupon, index) => (
                <tr key={coupon.Coupon_ID || index} className="text-center">
                  <td className="py-2 px-4 border">{coupon.SI_No}</td>
                  <td className="py-2 px-4 border">{coupon.Customer_ID}</td>
                  <td className="py-2 px-4 border">{coupon.Coupon_ID}</td>
                  <td className="py-2 px-4 border">{coupon.Discount}</td>
                  <td className="py-2 px-4 border">{coupon.Coupon_Download_Date}</td>
                  <td className="py-2 px-4 border">{coupon.Coupon_Redeemed_Date}</td>
                  <td className="py-2 px-4 border">{coupon.Coupon_Redeemed_Time}</td>
                  <td className="py-2 px-4 border">{coupon.Coupon_Order_Details}</td>
                  <td className="py-2 px-4 border">{coupon.Order_Value}</td>
                  <td className="py-2 px-4 border">{coupon.Feedback}</td>
                </tr>
              ))}
              {couponHistory.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-4 text-gray-500 text-center">
                    No coupon usage history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CouponHistoryTable;