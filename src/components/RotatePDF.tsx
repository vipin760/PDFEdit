import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiUpload, FiDownload, FiRotateCw, FiRotateCcw, FiRefreshCw } from "react-icons/fi";
import { PDFDocument, degrees } from "pdf-lib";

// ---- IMPORTANT: Set PDF.js worker (for React-PDF preview) ----
// Adjust this import for your bundler (Vite/Webpack supports ?url)
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const RotatePDF: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [rotations, setRotations] = useState<Record<number, number>>({});
    const [processing, setProcessing] = useState<boolean>(false);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f && f.type === "application/pdf") {
            setFile(f);
            setNumPages(null);
            setRotations({});
        } else if (f) {
            alert("Please select a valid PDF file.");
        }
    };

    // Rotate single page left/right
    const rotatePage = (pageNum: number, direction: "left" | "right") => {
        setRotations(prev => {
            const current = prev[pageNum] || 0;
            const next =
                direction === "right"
                    ? (current + 90) % 360
                    : (current + 270) % 360; // -90 mod 360
            return { ...prev, [pageNum]: next };
        });
    };

    // Rotate all pages left/right
    const rotateAll = (direction: "left" | "right") => {
        if (!numPages) return;

        const newRotations: Record<number, number> = {};

        for (let i = 1; i <= numPages; i++) {
            const current = rotations[i] || 0;
            newRotations[i] =
                direction === "right"
                    ? (current + 90) % 360
                    : (current + 270) % 360;
        }

        setRotations(newRotations);
    };

    // Reset all pages
    const resetAll = () => setRotations({});

    // Download rotated PDF
    const downloadRotated = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const buf = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buf);
            const pages = pdfDoc.getPages();

            pages.forEach((page, index) => {
                const pageNum = index + 1;
                const rotation = rotations[pageNum] || 0;
                page.setRotation(degrees(rotation));
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([Uint8Array.from(pdfBytes)], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `rotated_${file.name}`;
            link.click();
            URL.revokeObjectURL(url);

            alert("PDF downloaded with rotations!");
        } catch (err) {
            console.error(err);
            alert("Failed to rotate PDF.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-5">
            <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-5xl">
                <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    Rotate PDF Pages
                </h2>

                {/* Upload area */}
                <label className="block mb-8">
                    <div className="border-4 border-dashed border-green-200 rounded-xl p-12 text-center hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer">
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={onFileChange}
                            className="hidden"
                            id="pdfInput"
                        />

                        <label htmlFor="pdfInput" className="cursor-pointer">
                            {file ? (
                                <div className="text-green-600 font-semibold text-xl flex items-center justify-center gap-3">
                                    <FiUpload className="w-6 h-6" />
                                    {file.name}
                                </div>
                            ) : (
                                <div>
                                    <FiRotateCcw className="w-16 h-16 mx-auto mb-4 text-green-500" />
                                    <p className="text-xl text-gray-600">
                                        Drag & drop or <span className="text-green-600 underline">browse</span>
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>
                </label>

                {/* PDF Preview */}
                {file && (
                    <Document
                        file={file}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        loading="Loading PDF..."
                    >
                        <div className="mb-6 flex gap-4">
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                onClick={() => rotateAll("left")}
                            >
                                <FiRotateCcw /> Rotate All Left
                            </button>

                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                onClick={() => rotateAll("right")}
                            >
                                <FiRotateCw /> Rotate All Right
                            </button>

                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                onClick={resetAll}
                            >
                                <FiRefreshCw /> Reset All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto bg-gray-50 p-4 rounded-xl">
                            {Array.from({ length: numPages || 0 }, (_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-xl shadow p-4 text-center"
                                >
                                    <div
                                        style={{
                                            transform: `rotate(${rotations[i + 1] || 0}deg)`,
                                            transition: "0.3s ease",
                                        }}
                                    >
                                        <Page
                                            pageNumber={i + 1}
                                            width={240}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </div>

                                    <div className="flex gap-3 justify-center mt-3">
                                        <button
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                                            onClick={() => rotatePage(i + 1, "left")}
                                        >
                                            <FiRotateCcw /> Left
                                        </button>

                                        <button
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                                            onClick={() => rotatePage(i + 1, "right")}
                                        >
                                            <FiRotateCw /> Right
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-600 mt-2">
                                        Rotation: {rotations[i + 1] || 0}°
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Document>
                )}

                {/* Download button */}
                {file && numPages && (
                    <button
                        onClick={downloadRotated}
                        disabled={processing}
                        className={`w-full mt-8 py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-3 shadow-lg transition-all ${processing
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                            }`}
                    >
                        <FiDownload className="w-6 h-6" />
                        {processing ? "Processing..." : "Download Rotated PDF"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default RotatePDF;
