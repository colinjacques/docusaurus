import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    docsearch?: (config: {
      container: string | HTMLElement;
      host: string;
      apiKey?: string;
      indexUid: string;
    }) => void;
  }
}

export default function SearchBar(): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined' || initializedRef.current) {
      return;
    }

    if (!containerRef.current) {
      return;
    }

    // Wait for the global docsearch function to be available
    const initSearch = () => {
      if (window.docsearch && containerRef.current) {
        try {
          window.docsearch({
            container: containerRef.current,
            host: 'https://search.rossvideo.app',
            // API key is optional if using public search endpoint
            // apiKey: process.env.MEILISEARCH_API_KEY || '',
            // Index UID - update this with your actual index name
            indexUid: 'docs',
          });
          initializedRef.current = true;
        } catch (error) {
          console.error('Failed to initialize Meilisearch DocSearch:', error);
        }
      } else if (!initializedRef.current) {
        // Retry after a short delay if docsearch isn't loaded yet
        setTimeout(initSearch, 100);
      }
    };

    initSearch();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'inline-block',
        width: '100%',
        maxWidth: '300px',
      }}
    />
  );
}

