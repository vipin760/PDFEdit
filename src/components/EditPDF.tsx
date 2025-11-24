import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, StandardFonts } from "pdf-lib";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  page: number;
  fontSize: number;
}

const EditPDF = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [history, setHistory] = useState<TextItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorLayerRef = useRef<HTMLDivElement>(null);

  // --------------------------------------------------
  // SAVE HISTORY FOR UNDO / REDO
  // --------------------------------------------------
  const pushToHistory = (newState: TextItem[]) => {
    const copy = JSON.parse(JSON.stringify(newState));
    const updatedHistory = [...history.slice(0, historyIndex + 1), copy];

    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTextItems(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTextItems(history[historyIndex + 1]);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") undo();
      if (e.ctrlKey && e.key === "y") redo();
    };
    window.addEventListener("keydown", handleKeys);

    return () => window.removeEventListener("keydown", handleKeys);
  }, [historyIndex, history]);

  // --------------------------------------------------
  // 1. Upload PDF
  // --------------------------------------------------
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    setPdfFile(file);
    extractPdfText(file);
  };

  // --------------------------------------------------
  // 2. Extract text positions
  // --------------------------------------------------
  const extractPdfText = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    const allItems: TextItem[] = [];
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    textContent.items.forEach((item: any, index: number) => {
      allItems.push({
        id: String(index),
        text: item.str,
        x: item.transform[4] * 1.5,
        y: canvas.height - item.transform[5] * 1.5,
        page: 1,
        fontSize: item.height * 1.5,
      });
    });

    setTextItems(allItems);
    pushToHistory(allItems);
  };

  // --------------------------------------------------
  // 3. Render editable layers
  // --------------------------------------------------
  useEffect(() => {
    const layer = editorLayerRef.current!;
    layer.innerHTML = "";

    textItems.forEach((item, index) => {
      const el = document.createElement("div");

      el.contentEditable = "true";
      el.innerText = item.text;

      el.style.position = "absolute";
      el.style.left = item.x + "px";
      el.style.top = item.y + "px";
      el.style.fontSize = item.fontSize + "px";
      el.style.padding = "2px 4px";
      el.style.background = "rgba(255,255,255,0.4)";
      el.style.cursor = "move";

      // Update only on blur (typing smooth!)
      el.onblur = () => {
        const updated = [...textItems];
        updated[index].text = el.innerText;
        setTextItems(updated);
        pushToHistory(updated);
      };

      enableDrag(el, index);

      layer.appendChild(el);
    });
  }, [textItems]);

  // --------------------------------------------------
  // 4. Drag Behavior
  // --------------------------------------------------
  const enableDrag = (el: HTMLElement, index: number) => {
    el.onmousedown = (e) => {
      if (e.target !== el) return;

      const startX = e.clientX - el.offsetLeft;
      const startY = e.clientY - el.offsetTop;

      const move = (e: any) => {
        el.style.left = e.clientX - startX + "px";
        el.style.top = e.clientY - startY + "px";

        const updated = [...textItems];
        updated[index].x = e.clientX - startX;
        updated[index].y = e.clientY - startY;
        setTextItems(updated);
      };

      const stop = () => {
        pushToHistory(textItems);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", stop);
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", stop);
    };
  };

  // --------------------------------------------------
  // ADD NEW SENTENCE
  // --------------------------------------------------
  const addSentence = () => {
    const newItem: TextItem = {
      id: Date.now().toString(),
      text: "New Sentence",
      x: 50,
      y: 50,
      page: 1,
      fontSize: 16,
    };

    const updated = [...textItems, newItem];
    setTextItems(updated);
    pushToHistory(updated);
  };

  // --------------------------------------------------
  // 5. Download Edited PDF
  // --------------------------------------------------
  const downloadPDF = async () => {
    if (!pdfFile) return;

    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    textItems.forEach((item) => {
      page.drawText(item.text, {
        x: item.x,
        y: item.y,
        size: item.fontSize,
        font: helvetica,
      });
    });

    const finalPdf = await pdfDoc.save();
    const blob = new Blob([finalPdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "edited.pdf";
    a.click();
  };

  return (
    <div className="p-4">
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />

      <div className="flex gap-2 mt-3">
        <button onClick={undo} className="px-4 py-2 bg-gray-600 text-white rounded">
          Undo (Ctrl+Z)
        </button>

        <button onClick={redo} className="px-4 py-2 bg-gray-600 text-white rounded">
          Redo (Ctrl+Y)
        </button>

        <button onClick={addSentence} className="px-4 py-2 bg-green-600 text-white rounded">
          Add Sentence
        </button>
      </div>

      <div className="relative border mt-4 inline-block">
        <canvas ref={canvasRef} />
        <div
          ref={editorLayerRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      <button
        onClick={downloadPDF}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Download Edited PDF
      </button>
    </div>
  );
};

export default EditPDF;
