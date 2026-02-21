import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaDollarSign, FaRupeeSign, FaUsers, FaChartLine,
  FaWallet, FaCreditCard, FaSearch, FaFileExport,
  FaChevronLeft, FaChevronRight
} from "react-icons/fa";

const API = "https://api.redemly.com/api/admin/revenue";
const PAGE_SIZE = 5;

/* 🔥 Tailwind Hover Card Style */
const cardBase =
  "relative bg-white border rounded-2xl shadow-md p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-blue-500 before:scale-y-0 before:origin-top before:transition-transform before:duration-300 hover:before:scale-y-100";

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
    const headers = ["Month","Revenue","Transactions","Vendors"];
    const rows = filtered.map(m => [m.month, m.revenue, m.txns, m.vendors]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "revenue-trends.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-10 max-w-7xl mx-auto">

      {loading && <div className="text-center py-20 text-gray-500">Loading revenue…</div>}
      {!loading && !data && <div className="text-center py-20 text-gray-500">No revenue data available</div>}

      {!loading && data && (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KPI title="Revenue USD" value={`$${summary?.totalRevenue?.USD ?? 0}`} icon={<FaDollarSign/>}/>
            <KPI title="Revenue INR" value={`₹${summary?.totalRevenue?.INR ?? 0}`} icon={<FaRupeeSign/>}/>
            <KPI title="Transactions" value={summary.totalTransactions ?? 0} icon={<FaChartLine/>}/>
            <KPI title="Vendors" value={summary.uniqueVendors ?? 0} icon={<FaUsers/>}/>
          </div>

          {/* SECONDARY */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <KPI title="Avg Transaction" value={`$${summary.averageTransaction ?? 0}`} icon={<FaChartLine/>}/>
            <KPI title="Online Revenue" value={`$${breakdown.onlineRevenue ?? 0}`} icon={<FaCreditCard/>}/>
            <KPI title="Cash Revenue" value={`$${breakdown.cashRevenue ?? 0}`} icon={<FaWallet/>}/>
          </div>

          {/* PENDING */}
          <Card title="Pending Collections">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Stat label="Pending Amount" value={`$${pending.totalPending ?? 0}`}/>
              <Stat label="Pending Txns" value={pending.pendingTransactions ?? 0}/>
              <Stat label="Pending Vendors" value={pending.pendingVendors ?? 0}/>
            </div>
          </Card>

          {/* MONTHLY TABLE */}
          <Card title="Monthly Trends">
            <div className="flex flex-col md:flex-row gap-3 justify-between mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400"/>
                <input
                  placeholder="Search month..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>

              <button onClick={exportCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                <FaFileExport/> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white border rounded-lg">
                <thead className="bg-slate-800 text-center text-white">
                  <tr>
                    <th className="p-3">Month</th>
                    <th className="p-3">Revenue</th>
                    <th className="p-3">Transactions</th>
                    <th className="p-3">Vendors</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(m => (
                    <tr key={m.month} className="border-t text-center hover:bg-slate-50">
                      <td className="p-3">{m.month}</td>
                      <td className="p-3">${m.revenue}</td>
                      <td className="p-3">{m.txns}</td>
                      <td className="p-3">{m.vendors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-4">
              <p>Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page===1} onClick={()=>setPage(p=>p-1)}
                  className="px-4 py-2 border rounded disabled:opacity-40">
                  <FaChevronLeft/>
                </button>
                <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}
                  className="px-4 py-2 border rounded disabled:opacity-40">
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

/* UI COMPONENTS */
const KPI = ({title,value,icon}) => (
  <div className={`${cardBase} flex justify-between`}>
    <div>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className="text-3xl text-blue-600">{icon}</div>
  </div>
);

const Stat = ({label,value}) => (
  <div className={`${cardBase} text-center`}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const Card = ({title,children}) => (
  <div className={`${cardBase} p-6`}>
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    {children}
  </div>
);
