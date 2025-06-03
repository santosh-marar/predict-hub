import { Work_Sans} from "next/font/google"

import "@repo/ui/globals.css"
import { Providers } from "@/components/providers"
import Header from "@/components/custom/header"
import Footer from "@/components/custom/footer"
import { ReactQueryProvider } from "./provider/query-provider";
import { Toaster } from "@repo/ui/components/sonner";


const fontSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans antialiased `}>
        <Providers>
          <ReactQueryProvider>
            <Header />
            {children}
            <Toaster richColors position="top-right" />
            <Footer />
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  );
}
