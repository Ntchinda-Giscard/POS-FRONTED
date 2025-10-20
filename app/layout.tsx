import type React from "react";
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// const geistSans = Geist({
//   subsets: ["latin"],
//   variable: "--font-geist-sans",
// });

// const geistMono = Geist_Mono({
//   subsets: ["latin"],
//   variable: "--font-geist-mono",
// });

export const metadata: Metadata = {
  title: "POS System",
  description: "Modern Point of Sale System",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <TooltipProvider>
          <Toaster expand={true} richColors />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

// {
//   "name": "waza-pos",
//   "version": "1.0.0",
//   "main": "electron/main.js",
//   "description": "Your app description",
//   "author": "Your Name",
//   "license": "MIT",
//   "scripts": {
//     "dev": "cross-env NODE_ENV=development electron .",
//     "build": "npm run build:prepare && electron-builder",
//     "build:prepare": "npm run build:frontend && npm run copy:assets",
//     "build:frontend": "cd frontend && npm run build",
//     "copy:assets": "node scripts/copy-assets.js",
//     "dist": "npm run build",
//     "debug": "cross-env NODE_ENV=production electron .",
//     "clean": "rimraf dist resources"
//   },
//   "devDependencies": {
//     "cross-env": "^7.0.3",
//     "electron": "latest",
//     "electron-builder": "^24.0.0",
//     "rimraf": "^3.0.2",
//     "fs-extra": "^11.0.0"
//   },
//   "build": {
//     "appId": "com.wazasolutions.posapp",
//     "productName": "WAZA POS",
//     "directories": {
//       "output": "dist"
//     },
//     "files": [
//       "electron/**/*",
//       "frontend/out/**/*",
//       "package.json"
//     ],
//     "extraResources": [
//       {
//         "from": "resources/backend",
//         "to": "backend",
//         "filter": [
//           "**/*"
//         ]
//       }
//     ],
//     "asarUnpack": [
//       "frontend/out/**/*",
//       "backend/**/*"
//     ],
//     "win": {
//       "target": "nsis",
//       "icon": "assets/icon.ico"
//     },
//     "mac": {
//       "target": "dmg",
//       "icon": "assets/icon.icns"
//     },
//     "linux": {
//       "target": "AppImage",
//       "icon": "assets/icon.png"
//     },
//     "nsis": {
//       "oneClick": false,
//       "allowToChangeInstallationDirectory": true,
//       "createDesktopShortcut": true,
//       "createStartMenuShortcut": true
//     }
//   }
// }
