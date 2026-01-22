import { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaEye, FaCheck, FaTimes } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import { useNavigate } from "react-router-dom";

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadLimit, setDownloadLimit] = useState(50);
  const vendorsPerPage = 10;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editedVendor, setEditedVendor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'approved', 'pending'

  // Fetch vendors - reusable function
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("https://api.redemly.com/api/admin/getvendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch vendors: ${res.status}`);
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Filter vendors by search term and status
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(search.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(search.toLowerCase()) ||
                         vendor.businessName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ? true : 
                         statusFilter === "approved" ? vendor.isApproved : !vendor.isApproved;
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = filteredVendors.slice(
    indexOfFirstVendor,
    indexOfLastVendor
  );
  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);

  // Get primary address
  const getPrimaryAddress = (vendor) => {
    if (vendor.addresses && vendor.addresses.length > 0) {
      return vendor.addresses[0];
    }
    return { street: "", city: "", zipcode: "" };
  };

  // Export CSV or Excel
  const exportData = (type) => {
    const exportVendors = filteredVendors
      .slice(0, downloadLimit)
      .map((vendor) => {
        const address = getPrimaryAddress(vendor);
        return {
          id: vendor._id,
          name: vendor.name,
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          email: vendor.email,
          phone: vendor.phone,
          businessName: vendor.businessName,
          city: address.city,
          street: address.street,
          zipcode: address.zipcode,
          tillNumber: vendor.tillNumber,
          businessLogo: vendor.businessLogo,
          isApproved: vendor.isApproved ? "Yes" : "No",
          createdAt: new Date(vendor.createdAt).toLocaleDateString(),
        };
      });
    
    const ws = utils.json_to_sheet(exportVendors);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Vendors");
    writeFile(wb, `vendors_${new Date().toISOString().split('T')[0]}.${type}`);
  };

  // Navigate to vendor details page
  const viewVendor = (vendor) => {
    navigate(`/vendor/${vendor._id}`, { state: { vendor } });
  };

  // Edit modal input change handler
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setEditedVendor((prev) => ({
        ...prev,
        addresses: prev.addresses?.map((addr, index) => 
          index === 0 ? { ...addr, [field]: value } : addr
        ) || [{ [field]: value }]
      }));
    } else {
      setEditedVendor((prev) => ({ 
        ...prev, 
        [name]: type === "checkbox" ? checked : value 
      }));
    }
  };

  // Save updated vendor info (PUT API)
  const handleSave = async () => {
    if (!editedVendor?._id) return;
    setActionLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      
      // Prepare data for API
      const updateData = {
        firstName: editedVendor.firstName,
        lastName: editedVendor.lastName,
        email: editedVendor.email,
        phone: editedVendor.phone,
        tillNumber: editedVendor.tillNumber,
        businessName: editedVendor.businessName,
        note: editedVendor.note,
        isApproved: editedVendor.isApproved,
        addresses: editedVendor.addresses,
      };
      
      const res = await fetch(
        `https://api.redemly.com/api/admin/updatevendor/${editedVendor._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );
      
      if (!res.ok) throw new Error(`Failed to update vendor: ${res.status}`);
      await fetchVendors();
      setEditModal(false);
      setEditedVendor(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle approval status
  const toggleApproval = async (vendorId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? "disapprove" : "approve"} this vendor?`)) return;
    
    setActionLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `https://api.redemly.com/api/admin/toggle-vendor-approval/${vendorId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!res.ok) {
        // Fallback to using the updatevendor endpoint
        const updateRes = await fetch(
          `https://api.redemly.com/api/admin/updatevendor/${vendorId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isApproved: !currentStatus }),
          }
        );
        if (!updateRes.ok) throw new Error(`Failed to update vendor: ${updateRes.status}`);
      }
      
      await fetchVendors();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete vendor by ID (DELETE API)
  const handleDelete = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor? This action cannot be undone.")) return;
    
    setActionLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `https://api.redemly.com/api/admin/deletevendor/${vendorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error(`Failed to delete vendor: ${res.status}`);
      await fetchVendors();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading vendors...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-2">Manage all vendors and their details</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-gray-500 text-sm font-medium">Total Vendors</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{vendors.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-gray-500 text-sm font-medium">Approved Vendors</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {vendors.filter(v => v.isApproved).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-gray-500 text-sm font-medium">Pending Approval</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {vendors.filter(v => !v.isApproved).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-gray-500 text-sm font-medium">Showing</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {filteredVendors.length}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTimes className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name, email or business..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <div className="absolute left-3 top-2.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved Only</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>

            <div className="flex gap-3">
              <select
                value={downloadLimit}
                onChange={(e) => setDownloadLimit(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>Limit: 10</option>
                <option value={50}>Limit: 50</option>
                <option value={100}>Limit: 100</option>
                <option value={200}>Limit: 200</option>
                <option value={0}>All Records</option>
              </select>
              
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                onClick={() => exportData("csv")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                onClick={() => exportData("xlsx")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentVendors.map((vendor) => {
                  const address = getPrimaryAddress(vendor);
                  return (
                    <tr key={vendor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {vendor.businessLogo ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={vendor.businessLogo}
                                alt={vendor.businessName}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {vendor.businessName?.charAt(0) || vendor.name?.charAt(0) || 'V'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vendor.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {vendor._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vendor.email}</div>
                        <div className="text-sm text-gray-500">{vendor.phone}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vendor.businessName}</div>
                        <div className="text-sm text-gray-500">Till: {vendor.tillNumber || 'N/A'}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {address.city || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {address.zipcode || 'N/A'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vendor.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vendor.isApproved ? (
                            <>
                              <FaCheck className="mr-1" /> Approved
                            </>
                          ) : (
                            <>
                              <FaTimes className="mr-1" /> Pending
                            </>
                          )}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(vendor.createdAt)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewVendor(vendor)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>
                          
                          <button
                            onClick={() => {
                              setEditedVendor(vendor);
                              setEditModal(true);
                            }}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Vendor"
                          >
                            <FaEdit size={16} />
                          </button>
                          
                          <button
                            onClick={() => toggleApproval(vendor._id, vendor.isApproved)}
                            disabled={actionLoading}
                            className={`p-1 rounded ${
                              vendor.isApproved 
                                ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' 
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title={vendor.isApproved ? "Disapprove Vendor" : "Approve Vendor"}
                          >
                            {vendor.isApproved ? <FaTimes size={16} /> : <FaCheck size={16} />}
                          </button>
                          
                          <button
                            onClick={() => handleDelete(vendor._id)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Vendor"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {currentVendors.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No vendors found</h3>
                        <p className="mt-1 text-gray-500">
                          {search || statusFilter !== 'all' 
                            ? 'Try changing your search or filter criteria.' 
                            : 'No vendors have been registered yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstVendor + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastVendor, filteredVendors.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredVendors.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    // Show first, last, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    // Show ellipsis for skipped pages
                    if (
                      pageNum === 2 && currentPage > 3 ||
                      pageNum === totalPages - 1 && currentPage < totalPages - 2
                    ) {
                      return (
                        <span key={pageNum} className="px-3 py-1 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && editedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Edit Vendor - {editedVendor.name}
                </h3>
                <button
                  onClick={() => {
                    setEditModal(false);
                    setEditedVendor(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <p className="text-gray-600 mt-1">Update vendor information</p>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      name="firstName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedVendor.firstName || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      name="lastName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedVendor.lastName || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedVendor.email || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      name="phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedVendor.phone || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
                
                {/* Business Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Business Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      name="businessName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedVendor.businessName || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Till Number
                    </label>
                    <input
                      name="tillNumber"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedVendor.tillNumber || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  
                  {/* Address Fields */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Address</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street
                      </label>
                      <input
                        name="address.street"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editedVendor.addresses?.[0]?.street || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          name="address.city"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={editedVendor.addresses?.[0]?.city || ""}
                          onChange={handleEditChange}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zipcode
                        </label>
                        <input
                          name="address.zipcode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={editedVendor.addresses?.[0]?.zipcode || ""}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Fields */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-medium text-gray-900">Additional Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="note"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedVendor.note || ""}
                      onChange={handleEditChange}
                      placeholder="Add any notes about this vendor..."
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="isApproved"
                      name="isApproved"
                      type="checkbox"
                      checked={editedVendor.isApproved || false}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isApproved" className="ml-2 block text-sm text-gray-900">
                      Approved Vendor
                    </label>
                    <span className="ml-2 text-sm text-gray-500">
                      (Vendor can access the system)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditModal(false);
                    setEditedVendor(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}