import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import PdfMerge from "../components/PdfMerge";
import CompressPDF from "../components/CompressPDF";
// import EditPDF from "../components/EditPDF";
import SplitPdf from "../components/Splitpdf";
import EditPDF from "../components/EditPDF";
// (You can add other tools later)

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge-pdf" element={<PdfMerge />} />
        <Route path="/split-pdf" element={<SplitPdf />} />
        <Route path="/compress-pdf" element={<CompressPDF />} />
        <Route path="/edit-pdf" element={<EditPDF />} />
        

        {/* Add more routes here */}
        {/* <Route path="/compress-pdf" element={<CompressPdf />} /> */}
        {/* <Route path="/split-pdf" element={<SplitPdf />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
