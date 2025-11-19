// UnlockPDF.tsx
import React from "react";
import { PDFDocument } from "@cantoo/pdf-lib";   // ← This fork supports decryption!

const UnlockPDF = () => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [password, setPassword] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleUnlock = async () => {
    if (files.length === 0 || !password.trim()) {
      alert("Please select PDF(s) and enter the current password");
      return;
    }

    setIsProcessing(true);

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();

        // This fork supports password option directly – no TypeScript errors!
        const pdfDoc = await PDFDocument.load(arrayBuffer, {
          password: password,        // Works for both user & owner passwords
        });

        // Save without encryption → password completely removed
        const unlockedBytes = await pdfDoc.save();

         const blob = new Blob([Uint8Array.from(unlockedBytes)], { type: "application/pdf" }); 
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `unlocked_${file.name}`;
        a.click();
        URL.revokeObjectURL(url);
      }

      alert(`Successfully unlocked ${files.length} PDF(s)!`);
      setFiles([]);
      setPassword("");
    } catch (err: any) {
      console.error(err);
      alert(
        err.message.includes("password")
          ? "Wrong password – try again"
          : "Cannot unlock this PDF (may use certificate encryption or be damaged)"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Your JSX from before stays exactly the same (just change button color to red if you want)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
          Remove PDF Password (Unlock)
        </h2>

        {/* Same upload UI as your Protect component */}
        <label className="block">
          <span className="text-gray-600 font-medium">Upload Protected PDFs</span>
          <div className="mt-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="hidden"
              id="unlockUpload"
            />
            <label htmlFor="unlockUpload" className="cursor-pointer text-gray-500">
              Drag & drop or <span className="text-red-600 underline">browse files</span>
            </label>
          </div>
        </label>

        {files.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Selected ({files.length}):</strong>
            <ul className="mt-1 list-disc pl-5">
              {files.map((f, i) => <li key={i}>{f.name}</li>)}
            </ul>
          </div>
        )}

        <input
          type="password"
          placeholder="Enter current password"
          className="w-full mt-4 p-3 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isProcessing}
        />

        <button
          onClick={handleUnlock}
          disabled={isProcessing || files.length === 0 || !password}
          className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${isProcessing || files.length === 0 || !password
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
            }`}
        >
          {isProcessing ? "Unlocking..." : "Remove Password"}
        </button>
      </div>
    </div>
  );
};

export default UnlockPDF;