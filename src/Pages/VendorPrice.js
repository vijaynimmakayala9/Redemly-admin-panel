import React, { useEffect, useState } from "react";
import axios from "axios";

const VendorPrice = () => {
  const [priceData, setPriceData] = useState(null);
  const [pricePerCoupon, setPricePerCoupon] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ================= FETCH PRICE (GET) ================= */
  useEffect(() => {
    fetchPrice();
  }, []);

  const fetchPrice = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://api.redemly.com/api/admin/price"
      );

      if (res.data.success) {
        setPriceData(res.data.data);
      }
    } catch (err) {
      setError("Failed to fetch vendor price");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE PRICE (POST) ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!pricePerCoupon) {
      setError("Price per coupon is required");
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post(
        "https://api.redemly.com/api/admin/price",
        {
          pricePerCoupon: Number(pricePerCoupon),
          note,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.success) {
        setSuccess("Price updated successfully");
        setPricePerCoupon("");
        setNote("");
        fetchPrice();
      }
    } catch (err) {
      setError("Failed to update vendor price");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow border p-6 sm:p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Vendor Coupon Pricing
          </h1>
          <p className="text-gray-500">
            View current pricing and update coupon cost
          </p>
        </div>

        {/* STATUS MESSAGES */}
        {loading && <p className="text-blue-600 mb-4">Loading...</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        {/* ================= TABLE (GET DATA) ================= */}
        {priceData && (
          <div className="overflow-x-auto mb-10">
            <table className="min-w-full border rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Price / Coupon
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Currency
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Valid From
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Note
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    {priceData.pricePerCoupon}
                  </td>
                  <td className="px-4 py-3">
                    {priceData.currency}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                        ${
                          priceData.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {priceData.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(priceData.validFrom).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {priceData.note || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ================= FORM (POST DATA) ================= */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* PRICE */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Price Per Coupon
            </label>
            <input
              type="number"
              step="0.01"
              value={pricePerCoupon}
              onChange={(e) => setPricePerCoupon(e.target.value)}
              placeholder="Enter price"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* NOTE */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* ACTION */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2 rounded-full bg-indigo-600 text-white font-semibold
                hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Price"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default VendorPrice;
