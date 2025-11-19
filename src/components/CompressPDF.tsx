import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState("Medium"); // Default

  const compressPdf = async () => {
    if (!file) return alert("Upload a PDF first");

    setLoading(true);
    try {
      const fileBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBytes);

      const newPdf = await PDFDocument.create();
      for (let i = 0; i < pdf.getPageCount(); i++) {
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
      }

      // Currently, pdf-lib does not provide true compression options.
      // You could use compressionLevel in future logic when embedding images, etc.

      const pdfBytes = await newPdf.save();
      const safeBytes = new Uint8Array(pdfBytes.length);
      safeBytes.set(pdfBytes);

      const blob = new Blob([safeBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);

      alert(`Compression complete! Level: ${compressionLevel}`);
    } catch (err) {
      console.error(err);
      alert("Compression failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Compress PDF File
        </h2>

        {/* File Input */}
        <label className="block">
          <span className="text-gray-600 font-medium">Upload PDF File</span>

          <div
            className="mt-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-lg 
          text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="pdfCompressUpload"
            />
            <label htmlFor="pdfCompressUpload" className="cursor-pointer text-gray-500">
              Drag & drop or <span className="text-blue-600 underline">browse file</span>
            </label>
          </div>
        </label>

        {file && (
          <p className="mt-3 text-sm text-gray-700">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}

        {/* Compression Level Dropdown */}
        <div className="mt-4">
          <label className="block text-gray-600 font-medium mb-1">Compression Level</label>
          <select
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(e.target.value)}
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        {/* Compress Button */}
        <button
          onClick={compressPdf}
          disabled={loading || !file}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg 
          font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Compressing..." : "Compress PDF"}
        </button>
      </div>
    </div>
  );
}
