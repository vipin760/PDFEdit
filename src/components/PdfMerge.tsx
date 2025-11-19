import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

const PdfMerge: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);

    const handleMerge = async () => {
        if (files.length < 2) {
            alert("Please upload at least 2 PDF files!");
            return;
        }

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                pages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([Uint8Array.from(mergedPdfBytes)], {
                type: "application/pdf",
            });

            saveAs(blob, "merged.pdf");
        } catch (error) {
            console.error("Error merging PDFs:", error);
            alert("Failed to merge PDFs. Check console.");
        }
    };

    return (
        // <div style={{ padding: "20px" }}>
        //     <h2>Merge PDF Files</h2>

        //     <input
        //         type="file"
        //         accept="application/pdf"
        //         multiple
        //         onChange={(e) => setFiles(Array.from(e.target.files || []))}
        //     />

        //     <br /><br />

        //     <button onClick={handleMerge} style={{ padding: "8px 15px" }}>
        //         Merge PDFs
        //     </button>
        // </div>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
                    Merge PDF Files
                </h2>

                <label className="block">
                    <span className="text-gray-600 font-medium">Upload PDF Files</span>

                    <div
                        className="mt-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-lg 
        text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                    >
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
                        <strong>Selected Files:</strong>
                        <ul className="mt-1 list-disc pl-5">
                            {files.map((f, i) => (
                                <li key={i}>{f.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    onClick={handleMerge}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                    Merge PDFs
                </button>
            </div>
        </div>

    );
};

export default PdfMerge;
