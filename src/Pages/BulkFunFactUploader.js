import { useState, useRef } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

const BulkFunFactUploader = () => {
  const [funFacts, setFunFacts] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      if (!jsonData.funFacts || !Array.isArray(jsonData.funFacts)) {
        alert("Invalid file format: Expected { funFacts: [...] }");
        return;
      }

      const res = await fetch("http://31.97.206.144:6098/api/admin/add-bulkfunfacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      const result = await res.json();

      if (res.ok) {
        setUploadResult({ success: true, message: "Fun facts uploaded successfully!" });
        setFunFacts(jsonData.funFacts);
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
      <h1 className="text-2xl font-bold mb-6 text-center text-purple-800">Bulk Fun Fact Uploader</h1>

      {/* Upload Button */}
      <div className="mb-6">
        <label className="font-semibold block mb-2">Upload .json File</label>
        <div
          className="border border-dashed border-gray-400 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition"
          onClick={triggerFileInput}
        >
          <FaCloudUploadAlt className="text-4xl text-purple-600 mb-2" />
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

      {/* Upload Result */}
      {uploadResult && (
        <p className={`text-sm mb-4 ${uploadResult.success ? "text-green-600" : "text-red-600"}`}>
          {uploadResult.message}
        </p>
      )}

      {/* Format Example */}
      <div className="mb-10 bg-gray-50 p-4 border rounded">
        <h2 className="font-semibold mb-2">📄 JSON Format Example:</h2>
        <pre className="bg-white p-3 text-xs rounded border overflow-auto">
          {`{
  "funFacts": [
    {
      "id": 1,
      "fact": "SYRUP Price Surges as Whales Capitalize on Dips, Maple Achieves Record AUM",
      "description": "SYRUP Price Surges as Whales Capitalize on Dips, Maple Achieves Record AUM In the dynamic world of decentralized finance (DeFi), few developments have garnered as much attention...",
      "source": "zephyrnet",
      "image": "https://zephyrnet.com/wp-content/uploads/img-XfIeWrV9lEkkurwTyInNFWDF.png",
    }
  ]
}`}
        </pre>
      </div>

      {/* Display Uploaded Fun Facts */}
      {funFacts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Uploaded Fun Facts:</h3>
          <table className="w-full border text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Fact</th>
                <th className="p-2 border">Source</th>
              </tr>
            </thead>
            <tbody>
              {funFacts.map((fact, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-100">
                  <td className="p-2 border">{idx + 1}</td>
                  <td className="p-2 border">{fact.fact}</td>
                  <td className="p-2 border">{fact.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BulkFunFactUploader;
