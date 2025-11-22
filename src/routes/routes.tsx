import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import PdfMerge from "../components/PdfMerge";
import CompressPDF from "../components/CompressPDF";
// import EditPDF from "../components/EditPDF";
import SplitPdf from "../components/Splitpdf";
import ProtectedPDF from "../components/ProtectedPDF";
import UnlockPDF from "../components/UnlockPDF";
import PDFtoJPG from "../components/PDFtoJPG";
import JPGtoPDF from "../components/JPGtoPDF";
import RotatePDF from "../components/RotatePDF";
// import PdfTextEditor from "../components/EditPDF";
// (You can add other tools later)

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge-pdf" element={<PdfMerge />} />
        <Route path="/split-pdf" element={<SplitPdf />} />
        <Route path="/compress-pdf" element={<CompressPDF />} />
        <Route path="/protect-pdf" element={<ProtectedPDF />} />
        <Route path="/unlock-pdf" element={<UnlockPDF />} />
        <Route path="/pdf-to-jpg" element={<PDFtoJPG />} />
        <Route path="/jpg-to-pdf" element={<JPGtoPDF />} />
        <Route path="/rotate-pdf" element={<RotatePDF />} />
        {/* <Route path="/edit-pdf" element={<PdfTextEditor />} /> */}
        

        {/* Add more routes here */}
        {/* <Route path="/compress-pdf" element={<CompressPdf />} /> */}
        {/* <Route path="/split-pdf" element={<SplitPdf />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
