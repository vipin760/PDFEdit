import { useState } from "react";
import { FiUpload, FiDownload, FiFileText } from "react-icons/fi";
import jsPDF from "jspdf";
import imageCompression from "browser-image-compression";

const JPGtoPDF = () => {
    const [images, setImages] = useState<File[]>([]);
    const [converting, setConverting] = useState(false);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const jpgFiles = files.filter((f: File) => f.type.startsWith("image/"));
        if (!jpgFiles.length) {
            alert("Please upload valid JPG or PNG images.");
            return;
        }
        setImages(jpgFiles);
    };

    const readImage = (file: File): Promise<{ src: string; width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Use naturalWidth/naturalHeight for actual file resolution
                    resolve({
                        src: e.target?.result as string,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                    });
                };
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });
    };

    const convertToPDF = async () => {
        if (!images.length || converting) return;

        setConverting(true);

        try {
            const pdf = new jsPDF({
                unit: "mm",
                format: "a4",
                compress: false
            });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const imgData = await readImage(img);

                // Calculate aspect ratio from actual image dimensions
                const ratio = imgData.width / imgData.height;

                // Fit to page with margins (10mm each side = 20mm total)
                let renderWidth = pageWidth - 20;
                let renderHeight = renderWidth / ratio;

                if (renderHeight > pageHeight - 20) {
                    renderHeight = pageHeight - 20;
                    renderWidth = renderHeight * ratio;
                }

                const x = (pageWidth - renderWidth) / 2;
                const y = (pageHeight - renderHeight) / 2;

                if (i !== 0) pdf.addPage();
                
                // Use FAST quality for better clarity
                pdf.addImage(imgData.src, "JPEG", x, y, renderWidth, renderHeight, undefined, "FAST");
            }

            pdf.save("images_to_pdf.pdf");
            setConverting(false);
            alert("PDF created successfully!");
            setImages([]);
        } catch (err) {
            console.error(err);
            alert("Failed to convert images to PDF");
            setConverting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 p-5">
            <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-4xl">
                <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                    JPG to PDF Converter
                </h2>

                <label className="block mb-8">
                    <div className="border-4 border-dashed border-red-200 rounded-xl p-12 text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onFileChange}
                            className="hidden"
                            id="jpgInput"
                        />
                        <label htmlFor="jpgInput" className="cursor-pointer">
                            {images.length > 0 ? (
                                <div className="text-green-600 font-semibold text-xl flex items-center justify-center gap-3">
                                    <FiUpload className="w-8 h-8" />
                                    {images.length} image(s) selected
                                </div>
                            ) : (
                                <div>
                                    <FiFileText className="w-16 h-16 mx-auto mb-4 text-red-500" />
                                    <p className="text-xl text-gray-600">
                                        Drag & drop or <span className="text-red-600 underline">browse</span>
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>
                </label>

                {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-xl mb-8">
                        {images.map((img, i) => (
                            <div key={i} className="bg-white p-2 rounded shadow text-center text-sm">
                                <img
                                    src={URL.createObjectURL(img)}
                                    alt="preview"
                                    className="w-full h-32 object-cover rounded"
                                />
                                <p className="mt-2 text-gray-600 truncate">{img.name}</p>
                            </div>
                        ))}
                    </div>
                )}

                {images.length > 0 && (
                    <button
                        onClick={convertToPDF}
                        disabled={converting}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${converting
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
                            }`}
                    >
                        <FiDownload className="w-6 h-6" />
                        {converting ? "Converting..." : "Download PDF"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default JPGtoPDF;