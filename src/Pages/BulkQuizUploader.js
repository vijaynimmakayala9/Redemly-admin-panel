import { useState, useRef } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

const BulkQuizUploader = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    try {
      const jsonData = JSON.parse(text);
      if (!jsonData.quizzes || !Array.isArray(jsonData.quizzes)) {
        alert("Invalid file format: Expected { quizzes: [...] }");
        return;
      }

      const res = await fetch("http://31.97.206.144:6098/api/admin/add-bulkquizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      const result = await res.json();
      if (res.ok) {
        setUploadResult({ success: true, message: "Quizzes uploaded successfully!" });
        setQuizzes(jsonData.quizzes);
      } else {
        setUploadResult({ success: false, message: result.message || "Upload failed" });
      }
    } catch (error) {
      setUploadResult({ success: false, message: "Error parsing or uploading file" });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-800">Bulk Quiz Uploader</h1>

      {/* Cloud Upload Button */}
      <div className="mb-6">
        <label className="font-semibold block mb-2">Upload .json File</label>
        <div
          className="border border-dashed border-gray-400 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition"
          onClick={triggerFileInput}
        >
          <FaCloudUploadAlt className="text-4xl text-blue-600 mb-2" />
          <span className="text-sm text-gray-700">Click to upload your .json file</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {uploadResult && (
        <p className={`text-sm mb-4 ${uploadResult.success ? "text-green-600" : "text-red-600"}`}>
          {uploadResult.message}
        </p>
      )}

      {/* JSON Format Instruction */}
      <div className="mb-10 bg-gray-50 p-4 border rounded">
        <h2 className="font-semibold mb-2">📄 JSON Format Example:</h2>
        <pre className="bg-white p-3 text-xs rounded border overflow-auto">
{`{
  "quizzes": [
    {
      "topic": "Entertainment: Film",
      "question": "Actress Susan Sarandon caught pneumonia during filming of which movie?",
      "options": [
        "The Rocky Horror Picture Show",
        "Enchanted",
        "Dead Man Walking",
        "Thelma and Louise"
      ],
      "answer": "The Rocky Horror Picture Show",
      "explanation": "She filmed in freezing rain wearing only a corset and fishnets."
    },
    {
      "topic": "Telugu Cinema",
      "question": "Which actress starred opposite Krishna in 'Alluri Seetharama Raju'?",
      "options": [
        "Jayalalitha",
        "Vanisri",
        "Jayasudha",
        "Bhanumathi"
      ],
      "answer": "Vanisri",
      "explanation": "Vanisri's performance and dance made this film iconic."
    }
  ]
}`}
        </pre>
      </div>

      {/* Uploaded Quiz Table */}
      {quizzes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Uploaded Quizzes:</h3>
          <table className="w-full border text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Topic</th>
                <th className="p-2 border">Question</th>
                <th className="p-2 border">Answer</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-100">
                  <td className="p-2 border">{idx + 1}</td>
                  <td className="p-2 border">{quiz.topic}</td>
                  <td className="p-2 border">{quiz.question}</td>
                  <td className="p-2 border">{quiz.answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BulkQuizUploader;
