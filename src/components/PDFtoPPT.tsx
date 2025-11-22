import React, { useState } from "react";
import { pdfjs } from "react-pdf";
import PPTXGenJS from "pptxgenjs";
import { FiUpload, FiDownload, FiFileText } from "react-icons/fi";

// PDF worker
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const PDFtoPPT: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        if (f.type !== "application/pdf") {
            alert("Please upload a valid PDF file");
            return;
        }
        setFile(f);
    };

    const convertToPPT = async () => {
        if (!file) return;

        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            const numPages = pdf.numPages;

            const ppt = new PPTXGenJS();

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport }).promise;

                // Convert canvas to image
                const imgData = canvas.toDataURL("image/png");

                const slide = ppt.addSlide();
                slide.addImage({
                    data: imgData,
                    x: 0,
                    y: 0,
                    w: "100%",
                    h: "100%",
                });
            }

            await ppt.writeFile({ fileName: file.name.replace(".pdf", "") + ".pptx" });

        } catch (err) {
            console.error(err);
            alert("Failed to convert PDF to PPT.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-4xl">
                <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    PDF to PowerPoint Converter
                </h2>

                <label className="block mb-8">
                    <div className="border-4 border-dashed border-purple-200 rounded-xl p-12 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={onFileChange}
                            className="hidden"
                            id="pdfInput"
                        />

                        <label htmlFor="pdfInput" className="cursor-pointer">
                            {file ? (
                                <div className="text-purple-600 font-semibold text-xl flex items-center justify-center gap-3">
                                    <FiUpload className="w-8 h-8" />
                                    {file.name}
                                </div>
                            ) : (
                                <div>
                                    <FiFileText className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                                    <p className="text-xl text-gray-600">
                                        Drag & drop or{" "}
                                        <span className="text-purple-600 underline">browse</span>
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>
                </label>

                {file && (
                    <button
                        onClick={convertToPPT}
                        disabled={processing}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                            processing
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        }`}
                    >
                        <FiDownload className="w-6 h-6" />
                        {processing ? "Converting..." : "Download PPT (.pptx)"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PDFtoPPT;
