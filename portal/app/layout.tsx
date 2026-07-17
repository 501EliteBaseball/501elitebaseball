import type { Metadata, Viewport } from "next";
import ServiceWorkerRegistration from "@/components/app/ServiceWorkerRegistration";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "501 Elite OS",
  description: "A modern parent portal for 501 Elite Baseball.",
  applicationName:"501 Elite OS",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,statusBarStyle:"black-translucent",title:"501 Elite"},icons:{apple:"/app-icons/apple-touch-icon.png"},
};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#071D39"};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><ServiceWorkerRegistration/>{children}</body>
    </html>
  );
}
