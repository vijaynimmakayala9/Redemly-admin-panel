import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaDollarSign,
  FaRupeeSign,
  FaUsers,
  FaChartLine,
  FaCreditCard,
  FaUniversity,
  FaWallet,
} from "react-icons/fa";
import { MdPayments } from "react-icons/md";

const API_BASE = "http://31.97.206.144:6091/api";

export default function AdminRedemlyRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/revenue`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center py-20 text-gray-500">Loading revenue data…</p>;
  }

  if (!data) {
    return <p className="text-center py-20 text-gray-500">No revenue data available</p>;
  }

  const { summary, breakdown, pending, trends, topVendors, recentPayments, period } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Revenue Analytics</h2>
          <p className="text-gray-500">
            {period.label} • {period.type.toUpperCase()}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPI title="Total Revenue (USD)" value={`$${summary.totalRevenue.USD}`} icon={<FaDollarSign />} color="bg-blue-600" />
          <KPI title="Total Revenue (INR)" value={`₹${summary.totalRevenue.INR}`} icon={<FaRupeeSign />} color="bg-emerald-600" />
          <KPI title="Transactions" value={summary.totalTransactions} icon={<MdPayments />} color="bg-purple-600" />
          <KPI title="Unique Vendors" value={summary.uniqueVendors} icon={<FaUsers />} color="bg-orange-600" />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPI title="Avg Transaction" value={`$${summary.averageTransaction}`} icon={<FaChartLine />} color="bg-indigo-600" />
          <KPI title="Avg / Vendor" value={`$${summary.averagePerVendor}`} icon={<FaUsers />} color="bg-teal-600" />
          <KPI title="Conversion Rate" value={summary.conversionRate} icon={<FaChartLine />} color="bg-pink-600" />
          <KPI title="Growth Rate" value={`${trends.growthRate}%`} icon={<FaChartLine />} color="bg-cyan-600" />
        </div>

        {/* Revenue Breakdown */}
        <Section title="Revenue Breakdown">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BreakdownCard label="Online Revenue" value={`$${breakdown.onlineRevenue}`} icon={<FaCreditCard />} color="bg-blue-500" />
            <BreakdownCard label="Cash Revenue" value={`$${breakdown.cashRevenue}`} icon={<FaWallet />} color="bg-green-500" />
            <BreakdownCard label="Bank Revenue" value={`$${breakdown.bankRevenue}`} icon={<FaUniversity />} color="bg-indigo-500" />
          </div>
        </Section>

        {/* Pending Collection */}
        <Section title="Pending Collections">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Pending USD" value={`$${pending.totalPending.USD}`} color="bg-red-500" />
            <Stat label="Pending INR" value={`₹${pending.totalPending.INR}`} color="bg-rose-500" />
            <Stat label="Pending Txns" value={pending.pendingTransactions} color="bg-yellow-500" />
            <Stat label="Collection Rate" value={`${pending.collectionRate}%`} color="bg-emerald-500" />
          </div>
        </Section>

        {/* Monthly Trends */}
        <Section title="Monthly Trends">
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg bg-white">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-3 text-left">Month</th>
                  <th className="p-3">Revenue</th>
                  <th className="p-3">Transactions</th>
                  <th className="p-3">Vendors</th>
                </tr>
              </thead>
              <tbody>
                {trends.monthly.map((m) => (
                  <tr key={m.month} className="border-t hover:bg-slate-50">
                    <td className="p-3">{m.monthName}</td>
                    <td className="p-3">${m.revenue}</td>
                    <td className="p-3">{m.transactions}</td>
                    <td className="p-3">{m.vendors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Top Vendors */}
        <Section title="Top Vendors">
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg bg-white">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-3 text-left">Vendor</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">Transactions</th>
                  <th className="p-3">Online</th>
                  <th className="p-3">Cash</th>
                </tr>
              </thead>
              <tbody>
                {topVendors.map((v) => (
                  <tr key={v.vendorId} className="border-t hover:bg-slate-50">
                    <td className="p-3">{v.vendorName}</td>
                    <td className="p-3">${v.totalPaid}</td>
                    <td className="p-3">{v.transactions}</td>
                    <td className="p-3">{v.onlinePayments}</td>
                    <td className="p-3">{v.cashPayments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Recent Payments */}
        <Section title="Recent Payments">
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg bg-white">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left">Vendor</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Month</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-slate-50">
                    <td className="p-3">{p.vendorName}</td>
                    <td className="p-3">${p.amount}</td>
                    <td className="p-3 capitalize">{p.method}</td>
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3">{p.month}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

      </div>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function KPI({ title, value, icon, color }) {
  return (
    <div className={`p-5 rounded-2xl ${color} text-white shadow-lg hover:shadow-xl transition flex justify-between`}>
      <div>
        <p className="text-xs uppercase opacity-90">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="text-3xl opacity-90">{icon}</div>
    </div>
  );
}

function BreakdownCard({ label, value, icon, color }) {
  return (
    <div className={`p-5 rounded-xl ${color} text-white shadow-md flex justify-between`}>
      <div>
        <p className="text-sm opacity-90">{label}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className={`p-4 rounded-xl ${color} text-white text-center shadow-md`}>
      <p className="text-xs uppercase opacity-90">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}
