import Link from 'next/link';

export default function Home() {
  return (
    <main className="space-y-4">
      <p>欢迎使用 ADHD 学习辅助用户空间。</p>
      <ul className="list-disc pl-6">
        <li><Link className="text-blue-600 hover:underline" href="/dashboard">Dashboard</Link></li>
        <li><Link className="text-blue-600 hover:underline" href="/sessions">Sessions</Link></li>
        <li><Link className="text-blue-600 hover:underline" href="/settings">Settings</Link></li>
      </ul>
    </main>
  );
}


