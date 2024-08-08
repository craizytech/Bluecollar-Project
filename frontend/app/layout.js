import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import { CategoryProvider } from "./context/CategoryContext";

const inter = Roboto({ subsets: ["latin"], weight: ['400', '700'] });

export const metadata = {
  title: "BlueCollar",
  description: " ",
};

export default function RootLayout({ children }) {
  return (
    <CategoryProvider>
    <html lang="en">
      <body className={inter.className}>
        <div className="mx-6 md:mx-16">
          <Header/>
            {children}
        </div>
        </body>
    </html>
    </CategoryProvider>
  );
}
