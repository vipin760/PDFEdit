import React from "react";
import { PDFDocument } from "pdf-lib-plus-encrypt";

const ProtectedPDF = () => {
    const [files, setFiles] = React.useState<File[]>([]);
    const [password, setPassword] = React.useState("");
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleProtect = async () => {
        if (files.length === 0) {
            alert("Please select at least one PDF file.");
            return;
        }
        if (!password.trim()) {
            alert("Please enter a password.");
            return;
        }

        setIsProcessing(true);

        try {
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);

                // This WORKS — real AES encryption + permissions
                pdfDoc.encrypt({
                    userPassword: password,
                    ownerPassword: password, // can be different from userPassword if needed
                    permissions: {
                        printing: "lowResolution",    // Allows degraded printing only
                        modifying: false,
                        copying: false,
                        annotating: false,
                        fillingForms: false,
                        contentAccessibility: false,  // Blocks screen readers
                        documentAssembly: false,
                    },
                });

                const protectedBytes = await pdfDoc.save();

                // Trigger download
                const blob = new Blob([Uint8Array.from(protectedBytes)], { type: "application/pdf" }); 
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `protected_${file.name}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }

            alert(`Successfully protected ${files.length} PDF(s)!`);
            setFiles([]);
            setPassword("");
        } catch (err) {
            console.error("Encryption error:", err);
            alert("Failed to protect one or more PDFs. Try simpler files or shorter password.");
        } finally {
            setIsProcessing(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
                    Protect PDF with Password
                </h2>

                <label className="block">
                    <span className="text-gray-600 font-medium">Upload PDF Files</span>
                    <div className="mt-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                        <input
                            type="file"
                            accept="application/pdf"
                            multiple
                            onChange={(e) => setFiles(Array.from(e.target.files || []))}
                            className="hidden"
                            id="pdfUpload"
                        />
                        <label htmlFor="pdfUpload" className="cursor-pointer text-gray-500">
                            Drag & drop or <span className="text-blue-600 underline">browse files</span>
                        </label>
                    </div>
                </label>

                {files.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <strong>Selected ({files.length}):</strong>
                        <ul className="mt-1 list-disc pl-5 max-h-32 overflow-y-auto">
                            {files.map((f, i) => (
                                <li key={i}>{f.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <input
                    type="password"
                    placeholder="Enter strong password"
                    className="w-full mt-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isProcessing}
                />

                <button
                    onClick={handleProtect}
                    disabled={isProcessing || files.length === 0 || !password}
                    className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${isProcessing || files.length === 0 || !password
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    {isProcessing ? "Processing..." : "Protect PDFs"}
                </button>
            </div>
        </div>
    );
};

export default ProtectedPDF;