import { useEffect } from 'react';

/**
 * SEO Component - Dynamically updates page meta tags
 * @param {Object} props - SEO properties
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - Page keywords
 * @param {string} props.canonical - Canonical URL
 * @param {string} props.ogImage - Open Graph image URL
 */
const SEO = ({ 
  title = 'MealSection Vendor - Restaurant Management Dashboard',
  description = 'Manage your restaurant orders, track sales, handle promotions, and withdraw earnings with MealSection Vendor Dashboard',
  keywords = 'vendor dashboard, restaurant management, food vendor, order management',
  canonical = '',
  ogImage = 'https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true'
}) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    if (canonical) {
      updateMetaTag('og:url', canonical, true);
    }

    // Twitter tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Update canonical link
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (linkElement) {
        linkElement.setAttribute('href', canonical);
      } else {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        linkElement.setAttribute('href', canonical);
        document.head.appendChild(linkElement);
      }
    }
  }, [title, description, keywords, canonical, ogImage]);

  return null;
};

export default SEO;
