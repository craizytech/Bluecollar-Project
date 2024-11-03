import { Roboto } from "next/font/google";
import "./globals.css";
import ClientLayout from "./_components/ClientLayout";

const inter = Roboto({ subsets: ["latin"], weight: ['400', '700'] });

export const metadata = {
  title: "BlueCollar",
  description: " ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="mx-6 md:mx-16">
          <ClientLayout>
            {children}
          </ClientLayout>
        </div>
        </body>
    </html>
  );
}
