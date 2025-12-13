import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string[];
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    structuredData?: object;
}

export function SEO({
    title,
    description,
    keywords = [],
    canonical,
    ogTitle,
    ogDescription,
    ogImage = '/images/og-image.jpg',
    structuredData
}: SEOProps) {
    const fullTitle = `${title} | WSNAIL.COM`;
    const url = canonical || `https://www.wsnail.com${window.location.pathname}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords.length > 0 && (
                <meta name="keywords" content={keywords.join(', ')} />
            )}
            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:title" content={ogTitle || fullTitle} />
            <meta property="og:description" content={ogDescription || description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={`https://www.wsnail.com${ogImage}`} />
            <meta property="og:type" content="website" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={ogTitle || fullTitle} />
            <meta name="twitter:description" content={ogDescription || description} />
            <meta name="twitter:image" content={`https://www.wsnail.com${ogImage}`} />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
}
