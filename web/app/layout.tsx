import './globals.css';
import React from 'react';

export const metadata = {
  title: 'ADHD 学习辅助 - 用户空间',
  description: 'Dashboard / Sessions / Settings',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-5xl mx-auto p-4">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold">ADHD 学习辅助 - 用户空间</h1>
            <nav className="space-x-4 text-sm">
              <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
              <a href="/sessions" className="text-blue-600 hover:underline">Sessions</a>
              <a href="/settings" className="text-blue-600 hover:underline">Settings</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}


