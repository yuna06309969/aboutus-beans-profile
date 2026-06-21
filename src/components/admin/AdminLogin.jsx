import { useState } from 'react';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'aboutus2024';

export default function AdminLogin({ onLogin, onCancel }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);

  const submit = () => {
    if (pw === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setErr(true);
      setPw('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4efe9' }}>
      <div className="w-full max-w-sm px-8 font-sans-jp">
        <h1 className="font-serif-jp text-2xl font-light text-center mb-8">管理画面ログイン</h1>
        <div className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setErr(false); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="パスワード"
            className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-sm"
            autoFocus
          />
          {err && <p className="text-xs text-red-500">パスワードが正しくありません</p>}
          <button onClick={submit} type="button" className="w-full text-xs tracking-widest border border-stone-700 py-2.5 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer">
            ログイン
          </button>
          <button onClick={onCancel} type="button" className="w-full text-xs tracking-widest border border-stone-300 py-2.5 hover:border-stone-600 transition-colors cursor-pointer">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
