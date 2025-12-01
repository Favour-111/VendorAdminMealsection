import { useEffect } from 'react';

/**
 * StructuredData Component - Adds JSON-LD structured data for SEO
 * @param {Object} props - Structured data properties
 * @param {string} props.type - Type of structured data (Organization, WebApplication, etc.)
 * @param {Object} props.data - The structured data object
 */
const StructuredData = ({ type = 'WebApplication', data }) => {
  useEffect(() => {
    const defaultData = {
      '@context': 'https://schema.org',
      '@type': type,
      name: 'MealSection Vendor Dashboard',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150'
      },
      description: 'Restaurant and food vendor management dashboard for managing orders, tracking sales, and handling business operations.',
      url: 'https://vendor.mealsection.com',
      provider: {
        '@type': 'Organization',
        name: 'MealSection',
        url: 'https://mealsection.com'
      }
    };

    const structuredData = data || defaultData;

    // Create script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = 'structured-data';

    // Remove existing structured data if present
    const existing = document.getElementById('structured-data');
    if (existing) {
      existing.remove();
    }

    // Append new structured data
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById('structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
};

export default StructuredData;
