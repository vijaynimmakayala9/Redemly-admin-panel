import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaDollarSign, FaRupeeSign, FaUsers, FaChartLine,
  FaWallet, FaCreditCard, FaSearch, FaFileExport,
  FaChevronLeft, FaChevronRight, FaCalendarAlt,
  FaMoneyBillWave, FaExchangeAlt, FaStore, FaClock,
  FaChartPie, FaArrowUp, FaArrowDown, FaBoxOpen
} from "react-icons/fa";

const API = "https://api.redemly.com/api/admin/revenue";
const PAGE_SIZE = 5;

/* 🔥 Tailwind Hover Card Style with gradient backgrounds */
const cardBase =
  "relative bg-white border rounded-2xl shadow-md p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:scale-y-0 before:origin-top before:transition-transform before:duration-300 hover:before:scale-y-100";

export default function AdminRedemlyRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  /* FETCH API */
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  /* SAFE DATA */
  const summary = data?.summary || {};
  const breakdown = data?.breakdown || {};
  const pending = data?.pending || {};
  const monthly = data?.trends?.monthly || [];

  /* SEARCH */
  const filtered = useMemo(() => {
    return monthly.filter(m =>
      m.month?.toLowerCase().includes(search.toLowerCase())
    );
  }, [monthly, search]);

  /* PAGINATION */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  /* EXPORT CSV */
  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ["Month", "Revenue (USD)", "Revenue (INR)", "Transactions", "Vendors"];
    const rows = filtered.map(m => [m.month, m.revenue, m.revenueINR || m.revenue * 83, m.txns, m.vendors]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "revenue-trends.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER with colorful gradient */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <FaChartLine className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Revenue Dashboard
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
                  Real-time revenue analytics and insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Updates</span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading revenue data...</p>
          </div>
        </div>
      )}
      
      {!loading && !data && (
        <div className="text-center py-20">
          <div className="inline-block p-8 bg-white rounded-2xl shadow-xl">
            <FaBoxOpen className="text-5xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No revenue data available</p>
          </div>
        </div>
      )}

      {!loading && data && (
        <>
          {/* KPI CARDS with colorful icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KPI 
              title="Revenue USD" 
              value={`$${summary?.totalRevenue?.USD?.toLocaleString() ?? 0}`} 
              icon={<FaDollarSign/>}
              gradient="from-green-500 to-emerald-600"
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <KPI 
              title="Revenue INR" 
              value={`₹${summary?.totalRevenue?.INR?.toLocaleString() ?? 0}`} 
              icon={<FaRupeeSign/>}
              gradient="from-blue-500 to-cyan-600"
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <KPI 
              title="Transactions" 
              value={summary.totalTransactions?.toLocaleString() ?? 0} 
              icon={<FaChartLine/>}
              gradient="from-purple-500 to-pink-600"
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />
            <KPI 
              title="Vendors" 
              value={summary.uniqueVendors ?? 0} 
              icon={<FaStore/>}
              gradient="from-orange-500 to-red-600"
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>

          {/* SECONDARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <KPI 
              title="Avg Transaction" 
              value={`$${summary.averageTransaction?.toLocaleString() ?? 0}`} 
              icon={<FaMoneyBillWave/>}
              gradient="from-teal-500 to-cyan-600"
              iconBg="bg-teal-100"
              iconColor="text-teal-600"
            />
            <KPI 
              title="Online Revenue" 
              value={`$${breakdown.onlineRevenue?.toLocaleString() ?? 0}`} 
              icon={<FaCreditCard/>}
              gradient="from-indigo-500 to-blue-600"
              iconBg="bg-indigo-100"
              iconColor="text-indigo-600"
            />
            <KPI 
              title="Cash Revenue" 
              value={`$${breakdown.cashRevenue?.toLocaleString() ?? 0}`} 
              icon={<FaWallet/>}
              gradient="from-yellow-500 to-amber-600"
              iconBg="bg-yellow-100"
              iconColor="text-yellow-600"
            />
          </div>

          {/* PENDING COLLECTIONS CARD */}
          <Card title="Pending Collections" gradient="from-red-500 to-pink-600">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Stat 
                label="Pending Amount" 
                value={`$${pending.totalPending?.toLocaleString() ?? 0}`}
                icon={<FaClock/>}
                color="text-red-600"
              />
              <Stat 
                label="Pending Transactions" 
                value={pending.pendingTransactions ?? 0}
                icon={<FaExchangeAlt/>}
                color="text-orange-600"
              />
              <Stat 
                label="Pending Vendors" 
                value={pending.pendingVendors ?? 0}
                icon={<FaUsers/>}
                color="text-yellow-600"
              />
            </div>
          </Card>

          {/* MONTHLY TRENDS TABLE */}
          <Card title="Monthly Revenue Trends" gradient="from-blue-500 to-purple-600">
            <div className="flex flex-col md:flex-row gap-3 justify-between mb-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400"/>
                <input
                  placeholder="Search month..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button onClick={exportCSV}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <FaFileExport/> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full bg-white">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <tr>
                    <th className="p-4 text-left">Month</th>
                    <th className="p-4 text-right">Revenue (USD)</th>
                    <th className="p-4 text-right">Revenue (INR)</th>
                    <th className="p-4 text-right">Transactions</th>
                    <th className="p-4 text-right">Vendors</th>
                    <th className="p-4 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((m, idx) => (
                    <tr key={m.month} className={`border-t hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-blue-500" />
                          {m.month}
                        </div>
                      </td>
                      <td className="p-4 text-right font-semibold text-green-600">
                        ${m.revenue?.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold text-blue-600">
                        ₹{(m.revenueINR || m.revenue * 83)?.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">{m.txns?.toLocaleString()}</td>
                      <td className="p-4 text-right">{m.vendors}</td>
                      <td className="p-4 text-center">
                        {idx < paginated.length - 1 && paginated[idx + 1]?.revenue < m.revenue ? (
                          <span className="inline-flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                            <FaArrowUp/> +{((m.revenue - paginated[idx + 1].revenue) / paginated[idx + 1].revenue * 100).toFixed(1)}%
                          </span>
                        ) : idx < paginated.length - 1 ? (
                          <span className="inline-flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
                            <FaArrowDown/> -{((paginated[idx + 1].revenue - m.revenue) / paginated[idx + 1].revenue * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Showing page {page} of {totalPages} • {filtered.length} total records
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  <FaChevronLeft/>
                </button>
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  <FaChevronRight/>
                </button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

/* UI COMPONENTS with colorful icons */
const KPI = ({ title, value, icon, gradient = "from-blue-500 to-purple-600", iconBg = "bg-blue-100", iconColor = "text-blue-600" }) => (
  <div className={`${cardBase} flex justify-between items-start group`}>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
    <div className={`p-3 ${iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
      <div className={`text-2xl ${iconColor}`}>{icon}</div>
    </div>
    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
  </div>
);

const Stat = ({ label, value, icon, color = "text-blue-600" }) => (
  <div className={`${cardBase} text-center group`}>
    <div className="flex items-center justify-center gap-2 mb-2">
      <div className={`p-2 bg-opacity-20 rounded-lg ${color.replace('text', 'bg')}`}>
        <div className={`text-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
  </div>
);

const Card = ({ title, children, gradient = "from-blue-500 to-purple-600" }) => (
  <div className={`${cardBase} p-6`}>
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-1 h-8 bg-gradient-to-b ${gradient} rounded-full`} />
      <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        {title}
      </h3>
    </div>
    {children}
  </div>
);