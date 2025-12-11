import React, { useState, useEffect } from "react";
import axios from "axios";

const CATEGORIES = [
  "Indian Food", "Cricket", "Culture", "Tech", "Success Stories", "Accidental Inventions",
  "U.S. vs. Indian Pop Culture", "Navigating Life in the U.S.", "Global Tech & Startups",
  "World History & Geography", "Famous Indian-Americans", "Food Fusion",
];

const FunFactsGenerator = () => {
    const [category, setCategory] = useState("");
    const [generatedFacts, setGeneratedFacts] = useState([]);
    const [storedFacts, setStoredFacts] = useState([]);
    const [filteredStoredFacts, setFilteredStoredFacts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [storedLoading, setStoredLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [storedCategory, setStoredCategory] = useState(""); // Alag category for stored facts

    const FACTS_PER_PAGE = 10;

    // Stored facts ke liye alag category filter
    useEffect(() => {
        const fetchStoredFacts = async () => {
            setStoredLoading(true);
            try {
                const res = await axios.get("http://31.97.206.144:6098/api/users/funfacts", {
                    params: storedCategory ? { category: storedCategory } : {},
                });

                if (res.data.success) {
                    setStoredFacts(res.data.funFacts);
                    setFilteredStoredFacts(res.data.funFacts);
                    setCurrentPage(1); // Reset to page 1 on new fetch
                } else {
                    setStoredFacts([]);
                    setFilteredStoredFacts([]);
                }
            } catch (error) {
                console.error("Error fetching stored facts:", error);
                setStoredFacts([]);
                setFilteredStoredFacts([]);
                setErrorMsg("Failed to fetch stored facts.");
            } finally {
                setStoredLoading(false);
            }
        };

        fetchStoredFacts();
    }, [storedCategory]); // Sirf storedCategory change par hi fetch hoga

    // Filter stored facts based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredStoredFacts(storedFacts);
        } else {
            const filtered = storedFacts.filter(fact => 
                fact.fact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (fact.description && fact.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (fact.source && fact.source.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredStoredFacts(filtered);
        }
        setCurrentPage(1); // Reset to first page when search changes
    }, [searchTerm, storedFacts]);

    const handleGenerate = async () => {
        if (!category) {
            setErrorMsg("Please select a category.");
            return;
        }

        setLoading(true);
        setGeneratedFacts([]);
        setErrorMsg("");

        try {
            const res = await axios.get("http://31.97.206.144:6098/api/users/generate-facts", {
                params: { category },
            });

            console.log("Backend Response:", res.data); // Debug ke liye

            if (res.data.success) {
                setGeneratedFacts(res.data.funFacts);
            } else {
                // Backend se specific error message ko acche se display karo
                if (res.data.message && res.data.message.includes("No valid facts with images found")) {
                    setErrorMsg("noFactsFound");
                } else {
                    setErrorMsg(res.data.message || "No facts generated.");
                }
            }
        } catch (error) {
            console.error("Error generating facts:", error);
            // Network error ya server error ke liye
            if (error.response && error.response.data && error.response.data.message) {
                if (error.response.data.message.includes("No valid facts with images found")) {
                    setErrorMsg("noFactsFound");
                } else {
                    setErrorMsg(error.response.data.message || "Something went wrong while generating facts.");
                }
            } else {
                setErrorMsg("Something went wrong while generating facts.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Manually refresh stored facts ka option agar chahiye
    const handleRefreshStoredFacts = async () => {
        setStoredLoading(true);
        try {
            const res = await axios.get("http://31.97.206.144:6098/api/users/funfacts", {
                params: storedCategory ? { category: storedCategory } : {},
            });

            if (res.data.success) {
                setStoredFacts(res.data.funFacts);
                setFilteredStoredFacts(res.data.funFacts);
                setCurrentPage(1);
                setErrorMsg("");
            } else {
                setStoredFacts([]);
                setFilteredStoredFacts([]);
            }
        } catch (error) {
            console.error("Error fetching stored facts:", error);
            setErrorMsg("Failed to fetch stored facts.");
        } finally {
            setStoredLoading(false);
        }
    };

    const FactCard = ({ fact }) => (
        <div className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <img
                src={fact.image}
                alt={fact.fact}
                className="w-full h-48 object-cover"
                loading="lazy"
                onError={(e) => {
                    e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/800px-Microsoft_logo.svg.png";
                }}
            />
            <div className="p-4">
                <h3 className="font-semibold text-lg text-blue-900 mb-2">{fact.fact}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{fact.description}</p>
                {fact.source && (
                    <a
                        href={fact.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:underline text-sm font-medium"
                    >
                        Source: {fact.source}
                    </a>
                )}
                <p className="text-xs text-gray-400 mt-2">
                    Published: {new Date(fact.pubDate).toLocaleDateString()}
                </p>
            </div>
        </div>
    );

    const paginatedFacts = filteredStoredFacts.slice(
        (currentPage - 1) * FACTS_PER_PAGE,
        currentPage * FACTS_PER_PAGE
    );

    const totalPages = Math.ceil(filteredStoredFacts.length / FACTS_PER_PAGE);

    // Smart pagination numbers generator
    const getPaginationNumbers = () => {
        const totalNumbers = 5;
        const totalBlocks = totalNumbers + 2;
        
        if (totalPages <= totalBlocks) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);
        
        let pages = [1];

        if (startPage > 2) {
            pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages - 1) {
            pages.push('...');
        }

        pages.push(totalPages);
        return pages;
    };

    // Error messages ko acche se display karne ke liye
    const renderErrorMessage = () => {
        if (errorMsg === "noFactsFound") {
            return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="text-yellow-500 text-4xl">🔍</div>
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-800 text-center mb-2">
                        No Facts Found Right Now
                    </h3>
                    <p className="text-yellow-700 text-center mb-4">
                        We couldn't find any facts with images for <span className="font-semibold">{category}</span> at the moment.
                    </p>
                    <div className="text-center">
                        <p className="text-yellow-600 text-sm mb-3">
                            Don't worry! Try again in a little while or try a different category.
                        </p>
                        <button
                            onClick={() => setErrorMsg("")}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                            Try Again Later
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errorMsg}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">🎉 Fun Facts Generator</h1>
            <p className="text-gray-600 mb-6">Generate and explore interesting facts from various categories</p>

            {/* Category selector and Generate button - SIRF GENERATE KE LIYE */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Category for Generation
                    </label>
                    <select
                        className="p-3 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Select a category to generate</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-auto mt-4 md:mt-6">
                    <button
                        className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed w-full md:w-auto"
                        onClick={handleGenerate}
                        disabled={loading || !category}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </span>
                        ) : "Generate Facts"}
                    </button>
                </div>
            </div>

            {errorMsg && renderErrorMessage()}

            {/* Newly Generated Facts - Separate Section */}
            {generatedFacts.length > 0 && (
                <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-green-700 flex items-center">
                            <span className="bg-green-100 text-green-800 p-2 rounded-full mr-2">🆕</span>
                            Newly Generated Facts - {category}
                        </h2>
                        <span className="text-sm text-gray-500 bg-green-50 px-3 py-1 rounded-full">
                            {generatedFacts.length} new facts
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generatedFacts.map((fact, index) => (
                            <FactCard key={`generated-${fact.id || fact._id || index}`} fact={fact} />
                        ))}
                    </div>
                </div>
            )}

            {/* Stored Facts Section - Separate Section with its own filter */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                <span className="bg-blue-100 text-blue-800 p-2 rounded-full mr-2">📦</span>
                                Stored Fun Facts
                            </h2>
                            {/* Refresh button for stored facts */}
                            <button
                                onClick={handleRefreshStoredFacts}
                                disabled={storedLoading}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                title="Refresh stored facts"
                            >
                                <svg className={`h-4 w-4 ${storedLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                        
                        {/* Stored Facts ke liye alag filter section */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            {/* Category filter for stored facts */}
                            <div className="w-full sm:w-48">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Filter by Category
                                </label>
                                <select
                                    className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={storedCategory}
                                    onChange={(e) => setStoredCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Search Input */}
                            <div className="w-full sm:w-64">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Facts
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search facts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        Showing {filteredStoredFacts.length} facts
                        {storedCategory && ` in ${storedCategory}`}
                        {searchTerm && ` matching "${searchTerm}"`}
                    </div>
                </div>

                {storedLoading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                        <p className="mt-2 text-gray-600">Loading facts...</p>
                    </div>
                ) : filteredStoredFacts.length > 0 ? (
                    <div className="p-6">
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Source
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedFacts.map((fact) => (
                                        <tr key={fact._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <img
                                                    src={fact.image}
                                                    alt="Fact"
                                                    className="h-12 w-16 object-cover rounded border"
                                                    onError={(e) => {
                                                        e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/800px-Microsoft_logo.svg.png";
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 max-w-xs">{fact.fact}</div>
                                                {fact.description && (
                                                    <div className="text-sm text-gray-600 mt-1 max-w-md line-clamp-2">
                                                        {fact.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {fact.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {fact.source && (
                                                    <a
                                                        href={fact.link}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {fact.source}
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(fact.pubDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Enhanced Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * FACTS_PER_PAGE + 1}</span> to{" "}
                                    <span className="font-medium">
                                        {Math.min(currentPage * FACTS_PER_PAGE, filteredStoredFacts.length)}
                                    </span> of{" "}
                                    <span className="font-medium">{filteredStoredFacts.length}</span> facts
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    
                                    {getPaginationNumbers().map((pageNum, index) => (
                                        <button
                                            key={index}
                                            onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                                            disabled={pageNum === '...'}
                                            className={`px-3 py-2 border rounded-md text-sm font-medium min-w-[40px] ${
                                                pageNum === '...' 
                                                    ? 'bg-transparent cursor-default' 
                                                    : currentPage === pageNum 
                                                    ? 'bg-blue-700 text-white border-blue-700' 
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                            } transition-colors`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📝</div>
                        <p className="text-gray-500 text-lg">
                            {searchTerm 
                                ? `No facts found matching "${searchTerm}"${storedCategory ? ` in ${storedCategory}` : ""}.`
                                : `No stored facts found${storedCategory ? ` for ${storedCategory}` : ""}.`
                            }
                        </p>
                        <p className="text-gray-400 mt-2">
                            {searchTerm 
                                ? "Try a different search term or clear the search."
                                : "Try generating some facts or select a different category."
                            }
                        </p>
                        {(searchTerm || storedCategory) && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setStoredCategory("");
                                }}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FunFactsGenerator;