import './globals.css';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
    title: 'Evertree.in - Legal Verified Real Estate Portal',
    description: 'Connect, Buy, Sell and Rent properties directly with legally verified sellers, RERA registered brokers, and clear title documentation.',
    keywords: 'real estate, buy property, sell property, rent, verified listings, rera, home loan, legal property services'
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
            </head>
            <body suppressHydrationWarning>
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
