import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiUpload, FiDownload, FiImage } from "react-icons/fi";

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';

// Then set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PDFtoJPG: React.FC = () => {
    const [file, setFile] = React.useState<File | null>(null);
    const [numPages, setNumPages] = React.useState<number | null>(null);
    const [converting, setConverting] = React.useState(false);
    const [pageRenderComplete, setPageRenderComplete] = React.useState<boolean[]>([]);

    // Track when each page has fully rendered
    const onRenderSuccess = (pageIndex: number) => {
        
        setPageRenderComplete((prev: any) => {
            const next = [...prev];
            next[pageIndex] = true;
            return next;
        });
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f && f.type === "application/pdf") {
            setFile(f);
            setNumPages(null);
            setPageRenderComplete([]);
        } else if (f) {
            alert("Please select a valid PDF file");
        }
    };

const convertToJPG = async () => {
    if (!file || !numPages || converting) return;

    setConverting(true);

    // Wait a tick to ensure all pages are rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvases = document.querySelectorAll<HTMLCanvasElement>('.react-pdf__Page__canvas');
    const baseName = file.name.replace(/\.pdf$/i, "");

    // Set higher quality and resolution
    const scale = 2; // Increase scale for better quality
    const quality = 1; // Max quality (0 to 1)

    for (let i = 0; i < numPages; i++) {
        const canvas = canvases[i];
        if (!canvas) continue;

        // Create a new canvas with higher resolution
        const newCanvas = document.createElement('canvas');
        const ctx = newCanvas.getContext('2d');
        if (!ctx) continue;

        // Set higher DPI (e.g., 300 DPI)
        const dpi = 300;
        const scaleFactor = dpi / 96; // 96 is the standard screen DPI

        newCanvas.width = canvas.width * scale * scaleFactor;
        newCanvas.height = canvas.height * scale * scaleFactor;

        // Scale and render with better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);

        // Convert to JPG with higher quality
        const imageData = newCanvas.toDataURL('image/jpeg', quality);
        
        // Create download link
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `${baseName}_page_${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setConverting(false);
    alert(`Successfully converted ${numPages} page(s) to high-quality JPG!`);
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
            <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-4xl">
                <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    PDF to JPG Converter
                </h2>

                <label className="block mb-8">
                    <div className="border-4 border-dashed border-indigo-200 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
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
                                    <FiUpload className="w-8 h-8" />
                                    {file.name}
                                </div>
                            ) : (
                                <div>
                                    <FiImage className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
                                    <p className="text-xl text-gray-600">
                                        Drag & drop or <span className="text-indigo-600 underline">browse</span>
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>
                </label>

                {file && (
                    <Document
                        file={file}
                        onLoadSuccess={({ numPages }) => {
                            setNumPages(numPages);
                            setPageRenderComplete(new Array(numPages).fill(false));
                        }}
                        loading="Loading PDF..."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-xl mb-8">
                            {Array.from({ length: numPages || 0 }, (_, i) => (
                                <div key={i} className="text-center bg-white rounded-lg shadow p-4">
                                    <p className="text-sm font-medium text-gray-600 mb-2">
                                        Page {i + 1} {pageRenderComplete[i] ? "✓" : "..."}
                                    </p>
                                    <Page
                                        key={i}
                                        pageNumber={i + 1}
                                        width={300}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        onRenderSuccess={() => onRenderSuccess(i)}
                                        className="border border-gray-200 rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    </Document>
                )}

                {numPages && (
                    <button
                        onClick={convertToJPG}
                        disabled={converting || !pageRenderComplete.every(Boolean)}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${converting || !pageRenderComplete.every(Boolean)
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            }`}
                    >
                        <FiDownload className="w-6 h-6" />
                        {converting
                            ? "Converting..."
                            : `Download All ${numPages} Pages as JPG`}
                    </button>
                )}

                {numPages && pageRenderComplete.length === numPages && !pageRenderComplete.every(Boolean) && (
                    <p className="text-center text-sm text-orange-600 mt-4">
                        Waiting for all pages to render... ({pageRenderComplete.filter(Boolean).length}/{numPages})
                    </p>
                )}
            </div>
        </div>
    );
};

export default PDFtoJPG;