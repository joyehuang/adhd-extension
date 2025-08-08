"use client";
import AuthGate from '../../components/AuthGate';
import React from 'react';

export default function SettingsPage() {
  return (
    <AuthGate>
      <SettingsInner />
    </AuthGate>
  );
}

function SettingsInner() {
  const [focus, setFocus] = React.useState(25);
  const [breakMins, setBreakMins] = React.useState(5);
  const [whitelist, setWhitelist] = React.useState('');

  return (
    <main className="space-y-6">
      <h2 className="text-lg font-semibold">设置</h2>
      <section className="space-y-3">
        <h3 className="font-medium">默认番茄配置</h3>
        <div className="flex gap-4 items-end">
          <label className="text-sm">Focus (mins)
            <input type="number" className="ml-2 border px-2 py-1 rounded w-24" value={focus} onChange={(e) => setFocus(parseInt(e.target.value || '0', 10))} />
          </label>
          <label className="text-sm">Break (mins)
            <input type="number" className="ml-2 border px-2 py-1 rounded w-24" value={breakMins} onChange={(e) => setBreakMins(parseInt(e.target.value || '0', 10))} />
          </label>
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="font-medium">白名单域</h3>
        <textarea className="w-full border rounded p-2" rows={3} value={whitelist} onChange={(e) => setWhitelist(e.target.value)} placeholder="每行一个 URL" />
      </section>
      <section className="space-y-3">
        <h3 className="font-medium">数据操作</h3>
        <div className="flex gap-3">
          <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={() => alert('调用 /exportData（占位）')}>导出（JSON/CSV）</button>
          <button className="bg-red-600 text-white px-3 py-2 rounded" onClick={() => confirm('确认删除所有数据？（占位）') && alert('调用 /deleteAll（占位）')}>一键删除</button>
        </div>
      </section>
    </main>
  );
}


