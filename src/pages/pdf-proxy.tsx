import React, { useEffect, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import Layout from '@theme/Layout';

export default function PDFProxy(): JSX.Element {
  const location = useLocation();
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url = params.get('url');
    
    if (url) {
      setPdfUrl(url);
    } else {
      setError('No PDF URL provided');
    }
  }, [location]);

  if (error) {
    return (
      <Layout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ 
        width: '100%', 
        height: 'calc(100vh - 60px)',
        overflow: 'hidden'
      }}>
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="PDF Viewer"
        />
      </div>
    </Layout>
  );
}

