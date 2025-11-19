import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiUpload, FiDownload, FiImage } from "react-icons/fi";

// THE ONE THAT ACTUALLY WORKS EVERY TIME — NO CONFIG NEEDED
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
).toString();

const PDFtoJPG: React.FC = () => {
    const [file, setFile] = React.useState<File | null>(null);
    const [numPages, setNumPages] = React.useState<number | null>(null);
    const [converting, setConverting] = React.useState(false);
    const [pageRenderComplete, setPageRenderComplete] = React.useState<boolean[]>([]);

    // Track when each page has fully rendered
    const onRenderSuccess = (pageIndex: number) => {
        console.log("pageIndex",pageIndex);
        
        setPageRenderComplete((prev: any) => {
            const next = [...prev];
            next[pageIndex] = true;
            return next;
        });
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
         console.log("start....");
        if (f && f.type === "application/pdf") {
            setFile(f);
            setNumPages(null);
            setPageRenderComplete([]);
        } else if (f) {
            alert("Please select a valid PDF file");
        }
    };

    const convertToJPG = async () => {
        console.log("file",file);
        console.log("numPages",numPages);
        console.log("converting",converting);
        
        
        
        if (!file || !numPages || converting) return;

        // Wait a tick to ensure all pages are rendered
        setConverting(true);        

        // Force a small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvases = document.querySelectorAll<HTMLCanvasElement>(
            '.react-pdf__Page__canvas'
        );

        if (canvases.length !== numPages) {
            alert(`Only ${canvases.length}/${numPages} pages rendered. Please wait a moment and try again.`);
            setConverting(false);
            return;
        }

        const baseName = file.name.replace(/\.pdf$/i, "");

        canvases.forEach((canvas, i) => {
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${baseName}_page_${i + 1}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, "image/jpeg", 0.95);
        });

        setConverting(false);
        alert(`Successfully converted ${numPages} page(s) to JPG!`);
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