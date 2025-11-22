import React, { useState } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { pdfjs } from "react-pdf";
import { FiUpload, FiDownload, FiFileText } from "react-icons/fi";

import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const PDFtoWord: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        if (f.type !== "application/pdf") {
            alert("Please upload a PDF file.");
            return;
        }
        setFile(f);
    };

    const convertToWord = async () => {
        if (!file) return;

        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            const numPages = pdf.numPages;

            const paragraphs: Paragraph[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();

                // Extract all text from the page
                const rawText = content.items.map((item: any) => item.str).join(" ");

                // 🔥 Improved text segmentation
                const lines = rawText
                    .split(/(?<=[.!?])\s+|\n+/) // split by sentence or line breaks
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0);

                // Convert each line to a Word paragraph
                lines.forEach((line) => {
                    paragraphs.push(
                        new Paragraph({
                            children: [new TextRun(line)],
                            spacing: { after: 200 }, // add space between lines
                        })
                    );
                });

                paragraphs.push(new Paragraph("")); // empty paragraph spacing
            }

            // Build the Word document
            const doc = new Document({
                sections: [
                    {
                        children: paragraphs,
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);

            // Download
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = file.name.replace(/\.pdf/i, "") + ".docx";
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error(err);
            alert("Failed to convert PDF to Word.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
            <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-4xl">
                <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    PDF to Word Converter
                </h2>

                <label className="block mb-8">
                    <div className="border-4 border-dashed border-blue-200 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={onFileChange}
                            className="hidden"
                            id="pdfInput"
                        />

                        <label htmlFor="pdfInput" className="cursor-pointer">
                            {file ? (
                                <div className="text-blue-600 font-semibold text-xl flex items-center justify-center gap-3">
                                    <FiUpload className="w-8 h-8" />
                                    {file.name}
                                </div>
                            ) : (
                                <div>
                                    <FiFileText className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                                    <p className="text-xl text-gray-600">
                                        Drag & drop or <span className="text-blue-600 underline">browse</span>
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>
                </label>

                {file && (
                    <button
                        onClick={convertToWord}
                        disabled={processing}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                            processing
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        }`}
                    >
                        <FiDownload className="w-6 h-6" />
                        {processing ? "Converting..." : "Download Word (.docx)"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PDFtoWord;
