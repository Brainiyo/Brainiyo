import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'Brainiyo Admin',
  description: 'Manage questions and content for Brainiyo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
