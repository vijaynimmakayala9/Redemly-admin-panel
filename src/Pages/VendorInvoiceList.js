import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaPaperPlane, FaSearch, FaFileExport, FaCalendarAlt,
  FaSync, FaTimes, FaCheck, FaBuilding, FaChevronLeft,
  FaChevronRight, FaInbox, FaChartBar,
} from "react-icons/fa";
import {
  MdAttachMoney, MdPendingActions, MdCheckCircle, MdOutlineCancel,
} from "react-icons/md";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { RiRefund2Line } from "react-icons/ri";
import { utils, writeFile } from "xlsx";

const API_BASE = "https://api.redemly.com/api";

// ─── Toast ─────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <>
    <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div
      className={`fixed bottom-6 right-6 z-[999] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold text-white
        ${type === "success" ? "bg-gradient-to-r from-blue-500 to-blue-700" : "bg-gradient-to-r from-red-500 to-red-600"}`}
      style={{ animation: "slideUp .25s ease" }}
    >
      {type === "success" ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
      {msg}
    </div>
  </>
);

// ─── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    paid:      { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", Icon: MdCheckCircle },
    pending:   { cls: "bg-amber-100 text-amber-700 border-amber-200",       Icon: MdPendingActions },
    refunded:  { cls: "bg-red-100 text-red-700 border-red-200",             Icon: RiRefund2Line },
    cancelled: { cls: "bg-gray-100 text-gray-500 border-gray-200",          Icon: MdOutlineCancel },
  };
  const cfg = map[status] || map.cancelled;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}>
      <cfg.Icon className="text-sm" />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
    </span>
  );
};

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => {
  const palette = {
    blue:    { wrap: "border-blue-100 hover:border-blue-200",    icon: "bg-blue-600",     val: "text-blue-700"    },
    amber:   { wrap: "border-amber-100 hover:border-amber-200",  icon: "bg-amber-500",    val: "text-amber-700"   },
    emerald: { wrap: "border-emerald-100 hover:border-emerald-200", icon: "bg-emerald-600", val: "text-emerald-700" },
    violet:  { wrap: "border-violet-100 hover:border-violet-200",icon: "bg-violet-600",   val: "text-violet-700"  },
  };
  const c = palette[color] || palette.blue;
  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${c.wrap}`}>
      <div className="mb-4">
        <div className={`inline-flex p-2.5 rounded-xl shadow ${c.icon}`}>
          <Icon className="text-white text-base" />
        </div>
      </div>
      <p className={`text-2xl font-extrabold tracking-tight ${c.val}`}>{value}</p>
      <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
};

// ─── Table Skeleton ─────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    {[20, 160, 100, 80, 60, 70, 80, 72].map((w, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3.5 rounded-full bg-gray-100" style={{ width: w }} />
        {i <= 1 && <div className="h-3 rounded-full bg-gray-100 mt-2" style={{ width: 60 }} />}
      </td>
    ))}
  </tr>
);

// ─── Verify Modal ───────────────────────────────────────────────────────────
const UpdateModal = ({ payment, onClose, onSuccess }) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("Admin");
  const [amountVerified, setAmountVerified] = useState(payment.pricePerCoupon || "");
  const [saving, setSaving] = useState(false);

  const field = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition";
  const lbl   = "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5";

  const submit = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/admin/payments/${payment._id}/update`, {
        action: "verify_cash",
        paymentDate: new Date(paymentDate).toISOString(),
        notes: notes || "Payment verified by admin",
        verifiedBy: verifiedBy || "Admin",
        amountVerified: parseFloat(amountVerified) || payment.pricePerCoupon,
      }, { headers: { "Content-Type": "application/json" } });
      onSuccess("Payment verified successfully");
      onClose();
    } catch {
      onSuccess("Failed to update payment", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 shadow">
              <FaPaperPlane className="text-white text-sm" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Verify Payment</p>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">
                {payment.vendorName || payment.vendorId?.businessName || "Unknown Vendor"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 transition hover:scale-110">
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div>
              <p className="text-xs text-blue-400">Amount</p>
              <p className="text-lg font-extrabold text-blue-700">${(payment.pricePerCoupon || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1">Status</p>
              <StatusBadge status={payment.paymentStatus} />
            </div>
            <div>
              <p className="text-xs text-blue-400">Coupon</p>
              <p className="text-sm font-bold text-blue-700">{payment.couponCode || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400">Month</p>
              <p className="text-sm font-bold text-blue-700">{payment.month}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Payment Date</label>
              <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className={field} />
            </div>
            <div>
              <label className={lbl}>Amount ($)</label>
              <input type="number" step="0.01" value={amountVerified} onChange={e => setAmountVerified(e.target.value)} className={field} />
            </div>
          </div>
          <div>
            <label className={lbl}>Verified By</label>
            <input type="text" value={verifiedBy} onChange={e => setVerifiedBy(e.target.value)} placeholder="Name" className={field} />
          </div>
          <div>
            <label className={lbl}>Notes</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" className={`${field} resize-none`} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition">
            Cancel
          </button>
          <button onClick={submit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition disabled:opacity-60">
            {saving ? <><FaSync className="animate-spin text-xs" />Saving…</> : <><FaCheck className="text-xs" />Verify</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Pagination Button ───────────────────────────────────────────────────────
const PBtn = ({ children, disabled, active, onClick, isEllipsis }) => {
  if (isEllipsis) return (
    <span className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none">…</span>
  );
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-9 h-9 rounded-xl text-sm font-semibold flex items-center justify-center transition
        ${active   ? "bg-blue-600 text-white shadow-md"
        : disabled ? "text-gray-200 cursor-not-allowed"
                   : "text-gray-500 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"}`}>
      {children}
    </button>
  );
};

// ─── Smart Ellipsis Pagination ───────────────────────────────────────────────
const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) return null;

  // Build page number list: 1 … c-1 c c+1 … last
  const buildPages = () => {
    const items = [];
    const addPage = (n) => items.push({ type: "page", n });
    const addEllipsis = () => items.push({ type: "ellipsis" });

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) addPage(i);
    } else {
      addPage(1);
      if (page > 3) addEllipsis();
      const start = Math.max(2, page - 1);
      const end   = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) addPage(i);
      if (page < totalPages - 2) addEllipsis();
      addPage(totalPages);
    }
    return items;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/60">
      <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        {/* First */}
        <PBtn onClick={() => setPage(1)} disabled={page === 1}>«</PBtn>
        {/* Prev */}
        <PBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          <FaChevronLeft style={{ fontSize: 10 }} />
        </PBtn>

        {/* Page numbers with ellipsis */}
        {buildPages().map((item, i) =>
          item.type === "ellipsis"
            ? <PBtn key={`e-${i}`} isEllipsis />
            : <PBtn key={item.n} active={item.n === page} onClick={() => setPage(item.n)}>{item.n}</PBtn>
        )}

        {/* Next */}
        <PBtn onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
          <FaChevronRight style={{ fontSize: 10 }} />
        </PBtn>
        {/* Last */}
        <PBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PBtn>
      </div>
    </div>
  );
};

// ─── Vendor Summary Modal ────────────────────────────────────────────────────
const SummaryModal = ({ vendor, summaryData, payments, onClose }) => {
  // Find all summary entries for this vendor
  const vendorId = vendor.vendorId?._id;
  const vendorSummaries = summaryData.filter(s => s._id?.vendorId === vendorId);

  // All payments for this vendor
  const vendorPayments = payments.filter(p => p.vendorId?._id === vendorId);
  const totalAmount    = vendorPayments.reduce((s, p) => s + (p.pricePerCoupon || 0), 0);
  const pendingCount   = vendorPayments.filter(p => p.paymentStatus === "pending").length;
  const paidCount      = vendorPayments.filter(p => p.paymentStatus === "paid").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {vendor.vendorId?.businessLogo ? (
              <img src={vendor.vendorId.businessLogo} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <FaBuilding className="text-blue-400" />
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900">{vendor.vendorId?.businessName || vendor.vendorName || "Unknown Vendor"}</p>
              <p className="text-xs text-gray-400">{vendor.vendorId?.email || "—"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 transition hover:scale-110">
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Amount", value: `$${totalAmount.toFixed(2)}`, cls: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
              { label: "Pending",      value: pendingCount,                  cls: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
              { label: "Paid",         value: paidCount,                     cls: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
            ].map(({ label, value, cls, bg }) => (
              <div key={label} className={`rounded-xl border p-3 text-center ${bg}`}>
                <p className={`text-xl font-extrabold ${cls}`}>{value}</p>
                <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Monthly breakdown */}
          {vendorSummaries.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Monthly Breakdown</p>
              <div className="space-y-2">
                {vendorSummaries.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <FaCalendarAlt className="text-xs text-blue-400" />
                      <span className="text-sm font-semibold text-gray-700">{s._id?.month}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Coupons</p>
                        <p className="text-sm font-bold text-blue-600">{s.couponCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Amount</p>
                        <p className="text-sm font-bold text-emerald-600">${s.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All transactions */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              All Transactions ({vendorPayments.length})
            </p>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {vendorPayments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No transactions found</p>
              ) : (
                vendorPayments.map((p) => (
                  <div key={p._id} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-100 hover:bg-blue-50/40 transition">
                    <div>
                      <p className="text-xs font-bold tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg inline-block">
                        {p.couponCode || "N/A"}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {p.claimedAt ? new Date(p.claimedAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : p.month}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={p.paymentStatus} />
                      <span className="text-sm font-extrabold text-emerald-600">${(p.pricePerCoupon || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ───────────────────────────────────────────────────────────────────
const VendorPendingPayments = () => {
  const [payments, setPayments]       = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [search, setSearch]           = useState("");
  const [selMonth, setSelMonth]       = useState("all");
  const [selVendor, setSelVendor]     = useState("all");
  const [selStatus, setSelStatus]     = useState("all");
  const [page, setPage]               = useState(1);
  const [dlLimit, setDlLimit]         = useState(50);
  const [editPay, setEditPay]         = useState(null);
  const [summaryVendor, setSummaryVendor] = useState(null);
  const PER = 10;

  const toast$ = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/pending`);
      if (res.data.success) {
        setPayments(res.data.payments || []);
        setSummaryData(res.data.summary || []);
      }
    } catch { toast$("Failed to fetch payments", "error"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, []);

  const months  = useMemo(() => [...new Set(payments.map(p => p.month))], [payments]);
  const vendors = useMemo(() =>
    [...new Map(payments.filter(p => p.vendorId).map(p =>
      [p.vendorId._id, { id: p.vendorId._id, name: p.vendorId.businessName || p.vendorName || "Unknown" }]
    )).values()], [payments]);

  const filtered = useMemo(() => payments.filter(p => {
    const q = search.toLowerCase();
    return (
      (!search ||
        (p.vendorId?.businessName || p.vendorName || "").toLowerCase().includes(q) ||
        (p.couponCode || "").toLowerCase().includes(q) ||
        (p.userId?.name || "").toLowerCase().includes(q) ||
        (p.vendorId?.email || "").toLowerCase().includes(q)) &&
      (selMonth  === "all" || p.month               === selMonth)  &&
      (selVendor === "all" || p.vendorId?._id        === selVendor) &&
      (selStatus === "all" || p.paymentStatus        === selStatus)
    );
  }), [payments, search, selMonth, selVendor, selStatus]);

  const totalPages = Math.ceil(filtered.length / PER);
  const rows       = filtered.slice((page - 1) * PER, page * PER);
  const totalAmt   = payments.reduce((s, p) => s + (p.pricePerCoupon || 0), 0);
  const uVendors   = new Set(payments.map(p => p.vendorId?._id).filter(Boolean)).size;
  const pendCount  = payments.filter(p => p.paymentStatus === "pending").length;

  const exportXLSX = () => {
    if (!filtered.length) return toast$("No data to export", "error");
    const data = filtered.slice(0, dlLimit).map(p => ({
      PaymentID: p._id,
      Vendor: p.vendorId?.businessName || p.vendorName || "N/A",
      VendorEmail: p.vendorId?.email || "N/A",
      VendorPhone: p.vendorId?.phone || "N/A",
      Customer: p.userId?.name || "N/A",
      CouponCode: p.couponCode || "N/A",
      Amount: `$${(p.pricePerCoupon || 0).toFixed(2)}`,
      Month: p.month,
      Status: p.paymentStatus,
      ClaimedAt: p.claimedAt ? new Date(p.claimedAt).toLocaleDateString() : "N/A",
    }));
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "PendingPayments");
    writeFile(wb, `pending_payments_${Date.now()}.xlsx`);
    toast$(`Exported ${data.length} records`);
  };

  // shared input / select class
  const ctrl = "px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition cursor-pointer";
  const th   = "px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400";

  return (
    <div className="min-h-screen bg-slate-50">
      {toast    && <Toast msg={toast.msg} type={toast.type} />}
      {editPay  && (
        <UpdateModal
          payment={editPay}
          onClose={() => setEditPay(null)}
          onSuccess={(msg, t) => { toast$(msg, t); fetchPayments(); }}
        />
      )}
      {summaryVendor && (
        <SummaryModal
          vendor={summaryVendor}
          summaryData={summaryData}
          payments={payments}
          onClose={() => setSummaryVendor(null)}
        />
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-blue-600 shadow-md">
                <MdAttachMoney className="text-white text-lg" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Pending <span className="text-blue-600">Payments</span>
              </h1>
            </div>
            <p className="text-sm text-gray-400 ml-[52px]">Manage and verify vendor coupon redemption payments</p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={() => { setSearch(""); setSelMonth("all"); setSelVendor("all"); setSelStatus("all"); setPage(1); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-800 transition hover:scale-105"
            >
              <FaTimes className="text-xs" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={fetchPayments}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95 transition disabled:opacity-60"
            >
              <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatCard icon={MdAttachMoney}   label="Total Pending Amount" value={`$${totalAmt.toFixed(2)}`}    sub={`${uVendors} vendors`}         color="blue"    />
          <StatCard icon={MdPendingActions} label="Pending Payments"     value={pendCount}                    sub="Awaiting verification"          color="amber"   />
          <StatCard icon={HiBuildingOffice2}label="Active Vendors"       value={uVendors}                     sub="With pending payments"          color="emerald" />
          <StatCard icon={FaSearch}         label="Filtered Results"     value={filtered.length}              sub="Current view"                   color="violet"  />
        </div>

        {/* ── Main Table Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Pending Transactions</h2>
              <p className="text-xs text-gray-400 mt-0.5">Showing {rows.length} of {filtered.length} payments</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={dlLimit} onChange={e => setDlLimit(Number(e.target.value))} className={ctrl}>
                <option value={10}>10 records</option>
                <option value={50}>50 records</option>
                <option value={100}>100 records</option>
                <option value={99999}>All records</option>
              </select>
              <button onClick={exportXLSX} disabled={!filtered.length}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 hover:scale-105 active:scale-95 transition disabled:opacity-40">
                <FaFileExport className="text-xs" /> Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 bg-slate-50/70">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold text-gray-500 mb-1">Search</p>
              <FaSearch className="absolute left-3.5 top-2/3 -translate-y-1/2 text-xs text-gray-400 pointer-events-none" />
              <input
                type="text" placeholder="Search vendor, coupon…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className={`${ctrl} pl-10 w-full`}
              />
            </div>
            {/* Month */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Month</p>
              <select value={selMonth} onChange={e => { setSelMonth(e.target.value); setPage(1); }} className={`${ctrl} w-full`}>
                <option value="all">All Months</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {/* Vendor */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Vendor</p>
              <select value={selVendor} onChange={e => { setSelVendor(e.target.value); setPage(1); }} className={`${ctrl} w-full`}>
                <option value="all">All Vendors</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            {/* Status */}
            {/* <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Status</p>
              <select value={selStatus} onChange={e => { setSelStatus(e.target.value); setPage(1); }} className={`${ctrl} w-full`}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div> */}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {["#","Vendor","Customer","Coupon","Amount","Period","Status","Action"].map(h => (
                    <th key={h} className={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                          <FaInbox className="text-2xl text-blue-300" />
                        </div>
                        <p className="font-bold text-sm text-gray-500">No payments found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((p, i) => (
                    <tr key={p._id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors duration-150">

                      {/* # */}
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-gray-300">{(page - 1) * PER + i + 1}</span>
                      </td>

                      {/* Vendor */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          {p.vendorId?.businessLogo ? (
                            <img src={p.vendorId.businessLogo} alt="" className="w-8 h-8 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                              <FaBuilding className="text-xs text-blue-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                              {p.vendorId?.businessName || p.vendorName || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[140px]">{p.vendorId?.email || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-700">{p.userId?.name || "Guest"}</p>
                        <p className="text-xs text-gray-400">{p.userId?.phone || "—"}</p>
                      </td>

                      {/* Coupon */}
                      <td className="px-4 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                          {p.couponCode || "N/A"}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{p.couponName || "—"}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <span className="text-base font-extrabold text-emerald-600">
                          ${(p.pricePerCoupon || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Period */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <FaCalendarAlt className="text-xs text-gray-400 flex-shrink-0" />
                          {p.month}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {p.claimedAt ? new Date(p.claimedAt).toLocaleDateString("en-US", { day: "2-digit", month: "short" }) : "—"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={p.paymentStatus} />
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSummaryVendor(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 active:scale-95 transition"
                            title="View vendor summary"
                          >
                            <FaChartBar style={{ fontSize: 10 }} /> Summary
                          </button>
                          <button
                            onClick={() => setEditPay(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow hover:bg-blue-700 hover:scale-105 active:scale-95 transition"
                          >
                            <FaPaperPlane style={{ fontSize: 10 }} /> Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/60">
              <p className="text-xs text-gray-400">Page {page} of {totalPages} · {filtered.length} total</p>
              <div className="flex items-center gap-1.5">
                <PBtn onClick={() => setPage(1)} disabled={page === 1}>«</PBtn>
                <PBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <FaChevronLeft style={{ fontSize: 10 }} />
                </PBtn>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const num   = start + i;
                  return num <= totalPages ? (
                    <PBtn key={num} active={num === page} onClick={() => setPage(num)}>{num}</PBtn>
                  ) : null;
                })}
                <PBtn onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  <FaChevronRight style={{ fontSize: 10 }} />
                </PBtn>
                <PBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PBtn>
              </div>
            </div>
          )}
        </div>

        {/* ── Vendor Summary ── */}
        {/* {summaryData.length > 0 && (
          <div className="mt-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-1 rounded-full bg-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Vendor Summary</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {summaryData.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                      <HiBuildingOffice2 className="text-blue-500 text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{s.vendorName || "Unknown Vendor"}</p>
                      <p className="text-xs text-gray-400">{s._id?.month}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Total</p>
                      <p className="text-xl font-extrabold text-emerald-600">${s.totalAmount?.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Coupons</p>
                      <p className="text-xl font-extrabold text-blue-600">{s.couponCount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        <p className="text-center text-xs text-gray-300 mt-8 pb-2">
          Data from Redemly API · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
};

export default VendorPendingPayments;