"use client";
import React from 'react';
import { getFirebaseAuth } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = getFirebaseAuth();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<null | { email: string }>(null);

  React.useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u ? { email: u.email || '' } : null);
      setLoading(false);
    });
  }, [auth]);

  if (loading) return <p>加载中...</p>;

  if (!user) return <LoginForm />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
        <span>已登录：{user.email}</span>
        <button
          className="text-blue-600 hover:underline"
          onClick={() => signOut(auth)}
        >退出登录</button>
      </div>
      {children}
    </div>
  );
}

function LoginForm() {
  const auth = getFirebaseAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
      <h2 className="text-lg font-medium">登录</h2>
      <div>
        <label className="block text-sm mb-1">邮箱</label>
        <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">密码</label>
        <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading} type="submit">
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}


