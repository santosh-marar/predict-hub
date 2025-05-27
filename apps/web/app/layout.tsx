import { Work_Sans} from "next/font/google"

import "@repo/ui/globals.css"
import { Providers } from "@/components/providers"
import Header from "@/components/custom/header"
import Footer from "@/components/custom/footer"

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
      <body
        className={`${fontSans.variable} font-sans antialiased `}
      >
        <Providers>
          <Header/>
          {children}
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}
