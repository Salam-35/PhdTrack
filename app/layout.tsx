// import type { Metadata, Viewport } from "next"
// import { Inter } from "next/font/google"
// import "./globals.css"
// import { Toaster } from "@/components/ui/toaster"
// import { UserProvider } from "@/components/UserProvider"

// const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "PhD Tracker Pro",
//   description: "Your comprehensive PhD application organizer",
//   manifest: "/manifest.json",
//   generator: "v0.dev",
// }

// export const viewport: Viewport = {
//   width: "device-width",
//   initialScale: 1,
//   maximumScale: 1,
//   userScalable: "no",
//   themeColor: "#0ea5e9",
// }

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <head>
//         <link rel="icon" href="/favicon.ico" />
//         <link rel="apple-touch-icon" href="/icon-192x192.png" />
//         <meta name="mobile-web-app-capable" content="yes" />
//         <meta name="apple-mobile-web-app-status-bar-style" content="default" />
//         <meta name="apple-mobile-web-app-title" content="PhD Tracker Pro" />
//       </head>
//       <body className={inter.className}>
//         <UserProvider>
//           {children}
//           <Toaster />
//         </UserProvider>
//       </body>
//     </html>
//   )
// }


import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from "@/components/UserProvider"
import AuthGuard from "@/components/AuthGuard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PhD Application Tracker ",
  description: "Your comprehensive PhD application organizer",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0ea5e9",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PhD Tracker Pro" />
      </head>
      <body className={inter.className}>
        <UserProvider>
          <AuthGuard>
            {children}
            <Toaster />
          </AuthGuard>
        </UserProvider>
      </body>
    </html>
  )
}