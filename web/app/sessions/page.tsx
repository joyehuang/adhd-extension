"use client";
import AuthGate from '../../components/AuthGate';
import { getDb } from '../../lib/firebase';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import React from 'react';

export default function SessionsPage() {
  return (
    <AuthGate>
      <SessionsInner />
    </AuthGate>
  );
}

function SessionsInner() {
  const db = getDb();
  const [items, setItems] = React.useState<Array<{ id: string; title: string; startedAt?: string }>>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const uid = 'me'; // placeholder
        const snap = await getDocs(
          query(collection(db, `sessions/${uid}/items`), orderBy('startedAt', 'desc'), limit(20))
        );
        setItems(
          snap.docs.map((d) => ({
            id: d.id,
            title: (d.data() as any).title || '会话',
            startedAt: (d.data() as any).startedAt || '',
          }))
        );
      } catch {
        setItems([]);
      }
    })();
  }, [db]);

  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">学习会话</h2>
      <div className="rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">标题</th>
              <th className="text-left p-2">开始时间</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.title}</td>
                <td className="p-2">{s.startedAt || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}


