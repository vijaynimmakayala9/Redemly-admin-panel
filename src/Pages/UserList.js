import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { utils, writeFile } from "xlsx";

export default function UserList() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5); // Default to 5
  const [downloadLimit, setDownloadLimit] = useState(50); // Export limit

  // ✅ Dummy data instead of API
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      mobile: "1234567890",
      age: 30,
      gender: "Male",
      dob: "1994-01-01",
      profileImage: "https://via.placeholder.com/40",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      mobile: "2345678901",
      age: 28,
      gender: "Female",
      dob: "1996-05-12",
      profileImage: "https://via.placeholder.com/40",
    },
    {
      id: 3,
      name: "Alice Johnson",
      email: "alice@example.com",
      mobile: "3456789012",
      age: 35,
      gender: "Female",
      dob: "1990-08-22",
      profileImage: "https://via.placeholder.com/40",
    },
    {
      id: 4,
      name: "Bob Brown",
      email: "bob@example.com",
      mobile: "4567890123",
      age: 40,
      gender: "Male",
      dob: "1985-11-03",
      profileImage: "https://via.placeholder.com/40",
    },
    {
      id: 5,
      name: "Chris Green",
      email: "chris@example.com",
      mobile: "5678901234",
      age: 32,
      gender: "Male",
      dob: "1992-03-15",
      profileImage: "https://via.placeholder.com/40",
    },
    // Add more as needed...
  ];

  const filteredUsers = users.filter((user) =>
    (user.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const exportData = (type) => {
    const exportUsers = filteredUsers.slice(0, downloadLimit).map(({ id, name, email, mobile, age, gender, dob }) => ({
      id,
      name: name || "N/A",
      email: email || "N/A",
      mobile: mobile || "N/A",
      age: age || "N/A",
      gender: gender || "N/A",
      dob: dob || "N/A",
    }));
    const ws = utils.json_to_sheet(exportUsers);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Users");
    writeFile(wb, `users.${type}`);
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Users</h2>
      </div>

      <div className="flex justify-between mb-4 gap-2">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <select
            value={downloadLimit}
            onChange={(e) => setDownloadLimit(Number(e.target.value))}
            className="p-2 border rounded"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => exportData("csv")}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-2 border">Sl</th>
              <th className="p-2 border">Profile</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Mobile</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Gender</th>
              <th className="p-2 border">DOB</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user.id}>
                <td className="p-2 border">{index + 1 + indexOfFirstUser}</td>
                <td className="p-2 border">
                  <img
                    src={user.profileImage}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) =>
                      (e.target.src = "/default-profile-image.jpg")
                    }
                  />
                </td>
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.mobile}</td>
                <td className="p-2 border">{user.age}</td>
                <td className="p-2 border">{user.gender}</td>
                <td className="p-2 border">{user.dob}</td>
                <td className="p-2 border flex gap-2">
                  <button className="bg-blue-500 text-white p-1 rounded">
                    <FaEdit />
                  </button>
                  <button className="bg-red-500 text-white p-1 rounded">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4 gap-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              prev < totalPages ? prev + 1 : prev
            )
          }
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
