import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://api.redemly.com/api/users/feedback/all";

export default function AdminFeedbackForApp() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState({});
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get(`${API}?page=${page}&limit=${limit}`);

            setFeedbacks(res.data.feedbacks);
            setStats(res.data.stats);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [page]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className="text-yellow-400 text-sm">
                {i < rating ? "★" : "☆"}
            </span>
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">

            {/* HEADER */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                        App Feedback Dashboard
                    </h1>

                    <p className="text-gray-500 text-sm mt-1">
                        Monitor user feedback, ratings and experience
                    </p>
                </div>
            </div>

            {/* STATS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

                <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
                    <p className="text-sm text-gray-500">Total Feedback</p>
                    <h2 className="text-3xl font-semibold text-gray-800 mt-1">
                        {stats.totalFeedbacks || 0}
                    </h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
                    <p className="text-sm text-gray-500">Average Rating</p>

                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-3xl font-semibold text-gray-800">
                            {stats.averageRating || 0}
                        </span>

                        <div>{renderStars(Math.round(stats.averageRating || 0))}</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
                    <p className="text-sm text-gray-500">Total Pages</p>
                    <h2 className="text-3xl font-semibold text-gray-800 mt-1">
                        {pagination.pages || 1}
                    </h2>
                </div>

            </div>

            {/* RATING DISTRIBUTION */}

            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-5">
                    Rating Distribution
                </h2>

                {stats.ratingDistribution &&
                    Object.entries(stats.ratingDistribution)
                        .reverse()
                        .map(([star, count]) => (
                            <div key={star} className="mb-4">

                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>{star} Star</span>
                                    <span>{count}</span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{
                                            width: `${(count / stats.totalFeedbacks) * 100}%`,
                                        }}
                                    ></div>
                                </div>

                            </div>
                        ))}
            </div>

            {/* TOPIC BREAKDOWN */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                {stats.topicBreakdown?.map((topic, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition"
                    >
                        <h3 className="font-semibold text-gray-800 text-sm mb-2">
                            {topic._id || "General"}
                        </h3>

                        <p className="text-sm text-gray-500">
                            Feedbacks: <span className="font-medium text-gray-700">{topic.count}</span>
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Avg Rating:{" "}
                            <span className="font-medium text-gray-700">
                                {topic.averageRating
                                    ? topic.averageRating.toFixed(1)
                                    : "-"}
                            </span>
                        </p>
                    </div>
                ))}

            </div>

            {/* FEEDBACK TABLE */}

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

                <div className="p-5 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">
                        User Feedback
                    </h2>
                </div>

                <div className="overflow-x-auto">

                    <table className="min-w-full text-sm">

                        <thead className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-4 text-left">S NO</th>
                                <th className="px-6 py-4 text-left">User</th>
                                <th className="px-6 py-4 text-left">Topic</th>
                                <th className="px-6 py-4 text-left">Rating</th>
                                <th className="px-6 py-4 text-left">Experience</th>
                                <th className="px-6 py-4 text-left">Date</th>
                            </tr>
                        </thead>

                        <tbody>

                            {feedbacks.map((fb, index) => (
                                <tr
                                    key={fb._id}
                                    className="border-t hover:bg-gray-50 transition"
                                >

                                    <td className="px-6 py-4">
                                        {(page - 1)*pagination.pages + index + 1 }
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800">
                                                {fb.user?.name}
                                            </span>

                                            <span className="text-xs text-gray-500">
                                                {fb.user?.email || "No Email"}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                                            {fb.topic || "General"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        {renderStars(fb.rating)}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                        {fb.experience}
                                    </td>

                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {new Date(fb.createdAt).toLocaleDateString()}
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>

                {/* PAGINATION */}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 border-t bg-gray-50">

                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-sm text-gray-600">
                        Page {pagination.page || 1} of {pagination.pages || 1}
                    </span>

                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.pages}
                        className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                        Next
                    </button>

                </div>

            </div>

        </div>
    );
}