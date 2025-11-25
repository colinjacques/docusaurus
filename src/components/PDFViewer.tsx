import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PDFViewerProps {
  file: string;
  title?: string;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function PDFViewer({ file, title }: PDFViewerProps): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderPage = useCallback(async (pdf: any, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const context = canvas.getContext('2d');
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
    } catch (err: any) {
      console.error('Error rendering page:', err);
      setError('Failed to render PDF page');
    }
  }, []);

  const loadPDF = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library not loaded');
      }

      const loadingTask = window.pdfjsLib.getDocument({
        url: file,
        withCredentials: false,
      });
      
      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages);
      setPdfDoc(pdf);
      await renderPage(pdf, 1);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      setError(err.message || 'Failed to load PDF. Please try the download link below.');
      setLoading(false);
    }
  }, [file, renderPage]);

  useEffect(() => {
    // Check if PDF.js is already loaded
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      loadPDF();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="pdf.min.js"]');
    if (existingScript) {
      const handleLoad = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          loadPDF();
        }
      };
      existingScript.addEventListener('load', handleLoad);
      // If already loaded, call immediately
      if (window.pdfjsLib) {
        handleLoad();
      }
      return;
    }

    // Load PDF.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    
    script.onload = () => {
      // Configure PDF.js worker
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        loadPDF();
      }
    };
    
    script.onerror = () => {
      setError('Failed to load PDF.js library');
      setLoading(false);
    };
    
    document.head.appendChild(script);
  }, [file, loadPDF]);

  useEffect(() => {
    if (pageNumber > 0 && pdfDoc && pageNumber !== 1) {
      renderPage(pdfDoc, pageNumber);
    }
  }, [pageNumber, pdfDoc, renderPage]);

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <div className="pdf-viewer-container">
      <style>{`
        .pdf-viewer-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
          margin: 20px 0;
        }
        .pdf-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #333;
          text-align: center;
        }
        .pdf-viewer-wrapper {
          width: 100%;
          max-width: 900px;
          background: white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        .pdf-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px;
          background: #f9f9f9;
          border-bottom: 1px solid #ddd;
          gap: 15px;
        }
        .pdf-controls button {
          padding: 8px 16px;
          background: #10a37f;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }
        .pdf-controls button:hover:not(:disabled) {
          background: #0d8968;
        }
        .pdf-controls button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .pdf-page-info {
          font-size: 14px;
          color: #666;
        }
        .pdf-canvas-container {
          width: 100%;
          overflow: auto;
          max-height: 800px;
          display: flex;
          justify-content: center;
          padding: 20px;
          background: #e5e5e5;
        }
        .pdf-canvas-container canvas {
          max-width: 100%;
          height: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .pdf-loading {
          padding: 40px;
          text-align: center;
          color: #666;
        }
        .pdf-error {
          padding: 40px;
          text-align: center;
          color: #d32f2f;
          background: #ffebee;
          margin: 20px;
          border-radius: 4px;
        }
        .pdf-download-link {
          margin-top: 15px;
        }
        .pdf-download-link a {
          padding: 10px 20px;
          background: #10a37f;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          transition: background 0.2s;
          display: inline-block;
        }
        .pdf-download-link a:hover {
          background: #0d8968;
        }
        @media (max-width: 768px) {
          .pdf-canvas-container {
            max-height: 600px;
          }
          .pdf-controls {
            flex-wrap: wrap;
            gap: 10px;
          }
        }
      `}</style>
      
      {title && <div className="pdf-title">{title}</div>}

      <div className="pdf-viewer-wrapper" ref={containerRef}>
        {loading && (
          <div className="pdf-loading">
            <p>Loading PDF...</p>
          </div>
        )}
        
        {error && (
          <div className="pdf-error">
            <p><strong>Error:</strong> {error}</p>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
              The PDF may be blocked by the server. Please use the download link below to view it.
            </p>
          </div>
        )}

        {!loading && !error && numPages > 0 && (
          <>
            <div className="pdf-controls">
              <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
                ← Previous
              </button>
              <span className="pdf-page-info">
                Page {pageNumber} of {numPages}
              </span>
              <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
                Next →
              </button>
            </div>
            <div className="pdf-canvas-container">
              <canvas ref={canvasRef}></canvas>
            </div>
          </>
        )}
      </div>

      <div className="pdf-download-link">
        <a href={file} download target="_blank" rel="noopener noreferrer">
          📥 Download PDF
        </a>
      </div>
    </div>
  );
}
