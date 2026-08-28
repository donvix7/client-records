import "./globals.css";

export const metadata = {
  title: "ClientHub",
  description: "Register for the corporate directory and receive future invitations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-mono text-primary bg-white">
        {children}
      </body>
    </html>
  );
}