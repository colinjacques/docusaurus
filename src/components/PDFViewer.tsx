import React, { useState } from 'react';

interface PDFViewerProps {
  file: string;
  title?: string;
}

export default function PDFViewer({ file, title }: PDFViewerProps): JSX.Element {
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
        .pdf-iframe-container {
          width: 100%;
          max-width: 900px;
          height: 800px;
          background: white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          border-radius: 4px;
          overflow: hidden;
        }
        .pdf-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .pdf-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #333;
          text-align: center;
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
          .pdf-iframe-container {
            height: 600px;
          }
        }
      `}</style>
      
      {title && <div className="pdf-title">{title}</div>}

      <div className="pdf-iframe-container">
        <iframe
          src={`${file}#view=FitH`}
          className="pdf-iframe"
          title={title || 'PDF Document'}
        />
      </div>

      <div className="pdf-download-link">
        <a href={file} download target="_blank" rel="noopener noreferrer">
          📥 Download PDF
        </a>
      </div>
    </div>
  );
}
