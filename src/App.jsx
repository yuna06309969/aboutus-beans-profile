import { useState, useEffect, useCallback } from 'react';
import { fetchAll, upsertBean, deleteBean, upsertItem, deleteItem } from './lib/db';
import PublicSite from './components/public/PublicSite';
import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';

export default function App() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [mode, setMode] = useState('public');

  // 初回データ取得
  const reload = useCallback(async () => {
    try {
      setData(await fetchAll());
    } catch (e) {
      setLoadError(e.message);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // --- beans ---
  const updateBeans = useCallback(async (next) => {
    const current = data?.beans ?? [];
    const ops = [];
    for (const bean of next) {
      const old = current.find((c) => String(c.id) === String(bean.id));
      if (!old || JSON.stringify(old) !== JSON.stringify(bean)) ops.push(upsertBean(bean));
    }
    for (const c of current) {
      if (!next.find((n) => String(n.id) === String(c.id))) ops.push(deleteBean(c.id));
    }
    try {
      await Promise.all(ops);
      setData((d) => ({ ...d, beans: next }));
    } catch (e) {
      alert(`保存エラー: ${e.message}`);
    }
  }, [data]);

  // --- slug ベーステーブル共通 ---
  const makeUpdater = useCallback((table, key) => async (next) => {
    const current = data?.[key] ?? [];
    const ops = [];
    for (const item of next) {
      const old = current.find((c) => c.slug === item.slug);
      if (!old || JSON.stringify(old) !== JSON.stringify(item)) ops.push(upsertItem(table, item));
    }
    for (const c of current) {
      if (!next.find((n) => n.slug === c.slug)) ops.push(deleteItem(table, c.slug));
    }
    try {
      await Promise.all(ops);
      setData((d) => ({ ...d, [key]: next }));
    } catch (e) {
      alert(`保存エラー: ${e.message}`);
    }
  }, [data]);

  const updateFarms     = useCallback(makeUpdater('farms',     'farms'),     [makeUpdater]);
  const updateCountries = useCallback(makeUpdater('countries', 'countries'), [makeUpdater]);
  const updateProcesses = useCallback(makeUpdater('processes', 'processes'), [makeUpdater]);
  const updateTerms     = useCallback(makeUpdater('terms',     'terms'),     [makeUpdater]);

  // --- レンダリング ---
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4efe9' }}>
        <p className="text-sm text-red-500">データの読み込みに失敗しました: {loadError}</p>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4efe9' }}>
        <p className="text-sm text-stone-400 tracking-widest">読み込み中...</p>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <AdminLogin
        onLogin={() => setMode('admin')}
        onCancel={() => setMode('public')}
      />
    );
  }

  if (mode === 'admin') {
    return (
      <AdminPanel
        data={data}
        updateBeans={updateBeans}
        updateFarms={updateFarms}
        updateCountries={updateCountries}
        updateProcesses={updateProcesses}
        updateTerms={updateTerms}
        onLogout={() => setMode('public')}
      />
    );
  }

  return <PublicSite data={data} onOpenAdmin={() => setMode('login')} />;
}
