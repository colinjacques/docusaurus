import React, { useEffect, useRef } from 'react';
import { useDocusaurusContext } from '@docusaurus/core';

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
  const { siteConfig } = useDocusaurusContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Get Meilisearch config from customFields
  const meilisearchConfig = (siteConfig.customFields?.meilisearch as {
    host: string;
    apiKey?: string;
    indexUid: string;
  }) || {
    host: 'https://search.rossvideo.app',
    indexUid: 'docs',
  };

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
          const searchConfig: {
            container: HTMLElement;
            host: string;
            apiKey?: string;
            indexUid: string;
          } = {
            container: containerRef.current,
            host: meilisearchConfig.host,
            indexUid: meilisearchConfig.indexUid,
          };

          // Only add API key if it's provided
          if (meilisearchConfig.apiKey) {
            searchConfig.apiKey = meilisearchConfig.apiKey;
          }

          window.docsearch(searchConfig);
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
  }, [meilisearchConfig]);

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

