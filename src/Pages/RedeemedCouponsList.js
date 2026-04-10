import React, { useState, useEffect, useMemo } from "react";

const ITEMS_PER_PAGE = 10;

const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
  if (currentPage >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

const escapeCSV = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

const exportToCSV = (data) => {
  if (!data.length) return;
  const headers = [
    "SI No", "Customer ID", "Customer Name", "Vendor Name", "Vendor Category",
    "Product Name", "Coupon Name", "Coupon Code", "Discount (%)",
    "Download Date", "Redeemed Date", "Redeemed Time", "Order Details",
    "Order Value", "Feedback",
  ];
  const rows = data.map((c) => [
    c.SI_No, c.Customer_ID, c.Customer_Name, c.Vendor_Name, c.Vendor_Category,
    c.Product_Name, c.Coupon_Name, c.Coupon_Code, c["Discount (%)"],
    c.Download_Date, c.Redeemed_Date, c.Redeemed_Time, c.Order_Details,
    c.Order_Value, c.Feedback,
  ].map(escapeCSV));
  const csv = [headers.map(escapeCSV).join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "redeemed_coupons.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const Badge = ({ children, color = "blue" }) => {
  const styles = {
    blue: { background: "#dbeafe", color: "#1d4ed8" },
    gray: { background: "#f3f4f6", color: "#374151" },
  };
  return (
    <span
      style={{
        ...styles[color],
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 7px",
        borderRadius: 999,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
};

const Skeleton = () => (
  <div style={{ padding: "1.5rem" }}>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        style={{
          height: 40,
          background: "#f3f4f6",
          borderRadius: 8,
          marginBottom: 10,
          animation: "pulse 1.5s infinite",
        }}
      />
    ))}
    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
  </div>
);

const RedeemedCouponsList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch("https://api.redemly.com/api/admin/userredeemedcouponhistory");
        const data = await res.json();
        if (data.success) setCoupons(data.data);
        else setError("Failed to fetch data");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return coupons;
    return coupons.filter(
      (c) =>
        c.Customer_Name?.toLowerCase().includes(q) ||
        c.Vendor_Name?.toLowerCase().includes(q) ||
        c.Coupon_Code?.toLowerCase().includes(q) ||
        c.Product_Name?.toLowerCase().includes(q)
    );
  }, [coupons, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const formatTime = (date, time) => {
    try {
      return new Date(`${date} ${time} GMT+0530`).toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return time || "—";
    }
  };

  if (loading) return <Skeleton />;
  if (error)
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
        ⚠ {error}
      </div>
    );

  return (
    <div style={{ padding: "1rem", maxWidth: 1200, margin: "0 auto", fontFamily: "sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1d4ed8", margin: "0 0 4px" }}>
          Redeemed Coupons
        </h2>
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          {search ? ` matching "${search}"` : ""}
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: "1rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search by name, vendor, code…"
          value={search}
          onChange={handleSearch}
          style={{
            flex: "1 1 220px",
            padding: "7px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: 13,
            outline: "none",
            minWidth: 0,
          }}
        />
        <button
          onClick={() => exportToCSV(filtered)}
          style={{
            padding: "7px 14px",
            background: "#1d4ed8",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Desktop Table */}
      <div
        className="desktop-table"
        style={{ overflowX: "auto", display: "none" }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
            minWidth: 900,
          }}
        >
          <thead>
            <tr style={{ background: "#1d4ed8", color: "#fff" }}>
              {[
                "#", "Cust ID", "Customer", "Vendor", "Category",
                "Product", "Coupon", "Code", "Disc%",
                "Downloaded", "Redeemed", "Time (ET)", "Order", "Value", "Feedback",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 6px",
                    textAlign: "left",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    borderBottom: "2px solid #1e40af",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={15} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
                  No records found
                </td>
              </tr>
            ) : (
              currentData.map((c, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f9fafb")}
                >
                  <td style={{ padding: "7px 6px", color: "#9ca3af" }}>{c.SI_No}</td>
                  <td style={{ padding: "7px 6px" }}>{c.Customer_ID}</td>
                  <td style={{ padding: "7px 6px", fontWeight: 500 }}>{c.Customer_Name}</td>
                  <td style={{ padding: "7px 6px" }}>{c.Vendor_Name}</td>
                  <td style={{ padding: "7px 6px" }}>
                    <Badge color="gray">{c.Vendor_Category}</Badge>
                  </td>
                  <td style={{ padding: "7px 6px" }}>{c.Product_Name}</td>
                  <td style={{ padding: "7px 6px" }}>{c.Coupon_Name}</td>
                  <td style={{ padding: "7px 6px", fontFamily: "monospace", fontSize: 11, color: "#4f46e5" }}>
                    {c.Coupon_Code}
                  </td>
                  <td style={{ padding: "7px 6px", textAlign: "center" }}>
                    <Badge color="blue">{c["Discount (%)"]}</Badge>
                  </td>
                  <td style={{ padding: "7px 6px", whiteSpace: "nowrap", color: "#6b7280" }}>{c.Download_Date}</td>
                  <td style={{ padding: "7px 6px", whiteSpace: "nowrap" }}>{c.Redeemed_Date}</td>
                  <td style={{ padding: "7px 6px", whiteSpace: "nowrap" }}>
                    {formatTime(c.Redeemed_Date, c.Redeemed_Time)}
                  </td>
                  <td style={{ padding: "7px 6px", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.Order_Details}
                  </td>
                  <td style={{ padding: "7px 6px", fontWeight: 500 }}>{c.Order_Value}</td>
                  <td style={{ padding: "7px 6px", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#6b7280" }}>
                    {c.Feedback}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-cards" style={{ display: "none" }}>
        {currentData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>No records found</div>
        ) : (
          currentData.map((c, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "14px",
                marginBottom: 12,
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {/* Card Header */}
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{c.Customer_Name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>ID: {c.Customer_ID}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Badge color="blue">{c["Discount (%)"]}%</Badge>
                  <Badge color="gray">#{c.SI_No}</Badge>
                </div>
              </div>

              {/* Coupon Code prominent */}
              <div
                style={{
                  background: "#f5f3ff",
                  border: "1px dashed #a78bfa",
                  borderRadius: 6,
                  padding: "6px 10px",
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 500 }}>Coupon Code</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#4f46e5", fontSize: 13 }}>
                  {c.Coupon_Code}
                </span>
              </div>

              {/* Grid fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", fontSize: 12 }}>
                {[
                  ["Vendor", c.Vendor_Name],
                  ["Category", c.Vendor_Category],
                  ["Product", c.Product_Name],
                  ["Coupon", c.Coupon_Name],
                  ["Downloaded", c.Download_Date],
                  ["Redeemed", c.Redeemed_Date],
                  ["Time (ET)", formatTime(c.Redeemed_Date, c.Redeemed_Time)],
                  ["Value", c.Order_Value],
                ].map(([label, val]) => (
                  <div key={label}>
                    <span style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                    <div style={{ color: "#111827", fontWeight: 500, marginTop: 1 }}>{val || "—"}</div>
                  </div>
                ))}
              </div>

              {/* Order & Feedback expandable */}
              {(c.Order_Details || c.Feedback) && (
                <div style={{ marginTop: 10, borderTop: "1px solid #f3f4f6", paddingTop: 8 }}>
                  <button
                    onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 12,
                      color: "#1d4ed8",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {expandedRow === i ? "▲ Hide details" : "▼ Order & feedback"}
                  </button>
                  {expandedRow === i && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#374151" }}>
                      {c.Order_Details && (
                        <div style={{ marginBottom: 6 }}>
                          <span style={{ fontWeight: 500 }}>Order: </span>{c.Order_Details}
                        </div>
                      )}
                      {c.Feedback && (
                        <div>
                          <span style={{ fontWeight: 500 }}>Feedback: </span>{c.Feedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Responsive visibility */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-table { display: block !important; }
          .mobile-cards { display: none !important; }
        }
        @media (max-width: 767px) {
          .mobile-cards { display: block !important; }
          .desktop-table { display: none !important; }
        }
      `}</style>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
            marginTop: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: currentPage === 1 ? "#f9fafb" : "#fff",
              color: currentPage === 1 ? "#9ca3af" : "#374151",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
          >
            ← Prev
          </button>

          {pageNumbers.map((p, idx) =>
            p === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                style={{ padding: "5px 4px", color: "#9ca3af", fontSize: 13, userSelect: "none" }}
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: currentPage === p ? "1px solid #1d4ed8" : "1px solid #d1d5db",
                  background: currentPage === p ? "#1d4ed8" : "#fff",
                  color: currentPage === p ? "#fff" : "#374151",
                  cursor: "pointer",
                  fontWeight: currentPage === p ? 600 : 400,
                  fontSize: 13,
                  minWidth: 32,
                }}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: currentPage === totalPages ? "#f9fafb" : "#fff",
              color: currentPage === totalPages ? "#9ca3af" : "#374151",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Page info */}
      {totalPages > 1 && (
        <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
          Page {currentPage} of {totalPages} · Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
          {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
        </div>
      )}
    </div>
  );
};

export default RedeemedCouponsList;