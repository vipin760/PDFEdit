// // src/pdf-worker.ts
// import { pdfjs } from "react-pdf";

// // This is the ONLY way that works reliably with Vite + ESM + React 19 in 2025
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url
// ).toString();