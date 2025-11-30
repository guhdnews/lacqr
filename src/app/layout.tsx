import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
    title: "Lacqr | Nail Tech Co-Pilot",
    description: "The AI-powered assistant for modern nail technicians.",
    icons: {
        icon: "/favicon.png?v=2",
        apple: "/favicon.png?v=2",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${playfair.variable} font-sans`}>
                <GlobalErrorBoundary>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </GlobalErrorBoundary>
            </body>
        </html>
    );
}
