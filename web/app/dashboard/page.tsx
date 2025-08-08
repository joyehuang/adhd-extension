"use client";
import AuthGate from '../../components/AuthGate';
import { getDb } from '../../lib/firebase';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import React from 'react';

export default function DashboardPage() {
  return (
    <AuthGate>
      <DashboardInner />
    </AuthGate>
  );
}

function DashboardInner() {
  const db = getDb();
  const [stats, setStats] = React.useState<{ tomatoes: number; minutes: number; recent: Array<{ title: string }> }>({ tomatoes: 0, minutes: 0, recent: [] });

  React.useEffect(() => {
    // Placeholder: read recent videos and simple counters; in prod use Functions /stats/overview
    (async () => {
      try {
        const uid = 'me'; // placeholder; replace with auth uid when wiring Firestore rules
        const recentSnap = await getDocs(
          query(
            collection(db, `videos/${uid}/items`),
            orderBy('createdAt', 'desc'),
            limit(5)
          )
        );
        const recent = recentSnap.docs.map((d) => ({ title: (d.data() as any).title || '视频' }));
        setStats({ tomatoes: 0, minutes: 0, recent });
      } catch {
        setStats({ tomatoes: 0, minutes: 0, recent: [] });
      }
    })();
  }, [db]);

  return (
    <main className="space-y-6">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-600">番茄个数（本周）</div>
          <div className="text-2xl font-bold">{stats.tomatoes}</div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-600">专注分钟（本周）</div>
          <div className="text-2xl font-bold">{stats.minutes}</div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-600">近期学习视频</div>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {stats.recent.map((v, i) => (
              <li key={i}>{v.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}


