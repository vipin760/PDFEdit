import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

const SplitPdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<string>("");

    const handleSplit = async () => {
        if (!file) {
            alert("Please upload a PDF file!");
            return;
        }

        if (!pages.trim()) {
            alert("Please enter pages like: 1,3,5 or 2-4");
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const originalPdf = await PDFDocument.load(arrayBuffer);

            const totalPages = originalPdf.getPageCount();
            const mergedPdf = await PDFDocument.create();

            // Parse pages: supports "1,3,5" or "2-4"
            let pageNumbers: number[] = [];

            pages.split(",").forEach((part) => {
                if (part.includes("-")) {
                    const [start, end] = part.split("-").map(Number);
                    for (let i = start; i <= end; i++) {
                        if (i >= 1 && i <= totalPages) pageNumbers.push(i);
                    }
                } else {
                    const page = Number(part);
                    if (page >= 1 && page <= totalPages) pageNumbers.push(page);
                }
            });

            const copiedPages = await mergedPdf.copyPages(
                originalPdf,
                pageNumbers.map((p) => p - 1)
            );

            copiedPages.forEach((page) => mergedPdf.addPage(page));

            const bytes = await mergedPdf.save();
            const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });


            saveAs(blob, "split.pdf");
        } catch (error) {
            console.error("Split PDF error:", error);
            alert("Failed to split PDF. Check console.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
                    Split PDF File
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
                            id="pdfSplitUpload"
                        />
                        <label htmlFor="pdfSplitUpload" className="cursor-pointer text-gray-500">
                            Drag & drop or <span className="text-blue-600 underline">browse file</span>
                        </label>
                    </div>
                </label>

                {/* Pages Input */}
                <p className="mt-4 text-sm text-gray-600">
                    Enter pages (example): <strong>1,3,5</strong> or <strong>2-4</strong>
                </p>

                <input
                    type="text"
                    placeholder="Pages: e.g., 1,3,5 or 2-4"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="w-full mt-3 p-3 border rounded-lg outline-none focus:ring-2 
                       focus:ring-blue-400 transition"
                />

                {/* Button */}
                <button
                    onClick={handleSplit}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg 
                       font-semibold transition"
                >
                    Split PDF
                </button>
            </div>
        </div>

    );
};

export default SplitPdf;
