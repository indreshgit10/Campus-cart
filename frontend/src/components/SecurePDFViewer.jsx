import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, AlertTriangle, Server, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from "lucide-react";

// Import styles for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker URL for react-pdf to handle parsing (must match installed version)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * 🛡️ Canvas Backend Proxy PDF Viewer Implementation
 * Renders the document purely as images to 100% prevent native downloading/printing.
 */
const SecurePDFViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [containerWidth, setContainerWidth] = useState(null);
  const [hasSetInitialScale, setHasSetInitialScale] = useState(false);
  const containerRef = React.useRef(null);

  // Apply absolute strict anti-download protections
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      // Prevent Ctrl+S, Cmd+S, Ctrl+P, Cmd+P, Ctrl+C, Cmd+C
      if ((e.ctrlKey || e.metaKey) && (
        e.key.toLowerCase() === 's' || 
        e.key.toLowerCase() === 'p' ||
        e.key.toLowerCase() === 'c'
      )) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Prevent text selection overall container
    document.body.style.userSelect = 'none';

    // Responsiveness: Resize Observer
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.userSelect = 'auto';
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // auto-set scale based on container width (initial only)
  useEffect(() => {
    if (containerWidth && !hasSetInitialScale) {
      if (containerWidth >= 768) {
        setScale(1.02); // Laptop/Desktop default
      } else {
        setScale(0.94); // Mobile default
      }
      setHasSetInitialScale(true);
    }
  }, [containerWidth, hasSetInitialScale]);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center p-20 glass-premium rounded-[3rem] border border-rose-500/20">
        <AlertTriangle size={48} className="text-rose-500 mb-4" />
        <p className="text-white font-black uppercase tracking-[0.2em] text-xs text-center">
          Document URL Missing
        </p>
      </div>
    );
  }

  // Reconstruct Full URL for Cloudinary if necessary
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  let finalUrl = url;
  if (url && !url.startsWith('http')) {
    finalUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${url}`;
  }

  // Use the backend proxy route with credentials if needed
  const backendUrl = import.meta.env.VITE_API_URL;
  if (!backendUrl && import.meta.env.PROD) {
    console.error("VITE_API_URL is missing in production!");
  }
  const proxyUrl = `${backendUrl || 'http://localhost:5000/api'}/pdf-proxy?url=${encodeURIComponent(finalUrl)}`;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error('PDF Load Error:', error);
    setIsLoading(false);
    setHasError(true);
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const changeScale = (offset) => {
    setScale(prevScale => Math.min(Math.max(0.5, prevScale + offset), 3.0));
  };

  return (
    <div className="relative flex flex-col items-center w-full h-full min-h-[600px] bg-neutral-950 overflow-hidden lg:rounded-[3rem] border border-white/5 shadow-2xl user-select-none">
      {/* PREMIUM HEADER */}
      <div className="absolute top-0 left-0 right-0 z-40 p-5 flex items-center justify-between bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          {/* Status message removed as requested */}
        </div>
        
        {/* Document Controls */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-2xl border border-white/10">
          {/* Page Navigation Beside Zoom */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
            <button 
              disabled={pageNumber <= 1}
              onClick={() => changePage(-1)}
              className="p-1.5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-white transition-colors"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-black text-white min-w-[45px] text-center">
              {pageNumber} / {numPages || 1}
            </span>
            <button 
              disabled={pageNumber >= numPages}
              onClick={() => changePage(1)}
              className="p-1.5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-white transition-colors"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button 
            onClick={() => changeScale(-0.2)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[10px] font-black w-8 text-center text-white">{Math.round(scale * 100)}%</span>
          <button 
            onClick={() => changeScale(0.2)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* VIEWER AREA */}
      <div ref={containerRef} className="w-full h-full pt-20 pb-24 relative bg-neutral-900 overflow-auto flex justify-center custom-scrollbar">
        {isLoading && !hasError && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/90 backdrop-blur-md gap-6 p-8">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
              <Loader2 size={64} className="animate-spin text-indigo-500 relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <span className="block font-black uppercase text-sm tracking-[0.3em] text-indigo-400 animate-pulse">
                Loading Document...
              </span>
            </div>
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center w-full h-full gap-6 text-center p-12 mt-12 bg-rose-500/5">
            <div className="p-6 bg-rose-500/10 rounded-full border border-rose-500/20">
              <AlertTriangle size={64} className="text-rose-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                Render Failure
              </h2>
              <p className="text-neutral-400 max-w-sm font-medium mx-auto text-sm">
                The secure viewer failed to render the document. This might be due to a corrupt file or a network stream disruption.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center p-4">
            <Document
              file={proxyUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="text-white/50 animate-pulse my-20 font-black uppercase tracking-widest">Processing Pages...</div>}
              className="shadow-2xl shadow-black/50"
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={false} 
                renderAnnotationLayer={false}
                loading={<div className="w-full max-w-[600px] aspect-[3/4] bg-white/5 animate-pulse rounded-xl" />}
                className="rounded-xl overflow-hidden pointer-events-none"
                width={containerWidth ? Math.min(containerWidth - 32, 800) : undefined}
              />
            </Document>
          </div>
        )}
      </div>

    </div>
  );
};

export default SecurePDFViewer;
