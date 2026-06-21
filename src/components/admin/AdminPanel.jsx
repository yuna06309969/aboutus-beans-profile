import { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminBeans from './AdminBeans';
import AdminSimpleEditor from './AdminSimpleEditor';

const FARM_FIELDS = [
  { key: 'slug', label: 'スラッグ (例: esmeralda)' },
  { key: 'name', label: '農園名 *' },
  { key: 'country_slug', label: '産地スラッグ' },
  { key: 'country_name', label: '産地名' },
  { key: 'location', label: '場所' },
  { key: 'owner', label: '生産者' },
  { key: 'altitude', label: '標高' },
  { key: 'overview', label: '概要', type: 'textarea', rows: 5 },
  { key: 'awards', label: '主な実績', type: 'textarea', rows: 3 },
];

const COUNTRY_FIELDS = [
  { key: 'slug', label: 'スラッグ (例: panama)' },
  { key: 'name', label: '国名 *' },
  { key: 'flag', label: '国旗絵文字' },
  { key: 'region', label: '主な産地地域' },
  { key: 'altitude', label: '標高帯' },
  { key: 'climate', label: '気候' },
  { key: 'overview', label: '概要', type: 'textarea', rows: 3 },
];

const PROCESS_FIELDS = [
  { key: 'slug', label: 'スラッグ (例: washed)' },
  { key: 'name', label: 'プロセス名 *' },
  { key: 'category', label: 'カテゴリ' },
  { key: 'body', label: '説明', type: 'textarea', rows: 4 },
];

const TERM_FIELDS = [
  { key: 'slug', label: 'スラッグ (例: geisha)' },
  { key: 'name', label: '用語名 *' },
  { key: 'category', label: 'カテゴリ' },
  { key: 'body', label: '説明', type: 'textarea', rows: 4 },
];

const TABS = ['ダッシュボード', '豆管理', '農園管理', '産地管理', '精製方法管理', '用語集管理'];

export default function AdminPanel({ data, updateBeans, updateFarms, updateCountries, updateProcesses, updateTerms, onLogout }) {
  const [tab, setTab] = useState('ダッシュボード');

  return (
    <div style={{ backgroundColor: '#f0ebe4', minHeight: '100vh' }}>
      <header className="bg-stone-800 text-white px-6 py-3 flex items-center justify-between font-sans-jp">
        <span className="font-serif-jp text-sm tracking-wide">Bean Profile 管理画面</span>
        <button type="button" onClick={onLogout} className="text-[11px] text-stone-300 hover:text-white tracking-widest cursor-pointer">
          閲覧サイトへ戻る
        </button>
      </header>
      <nav className="bg-stone-100 border-b border-stone-200 px-4 overflow-x-auto font-sans-jp">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-[11px] tracking-widest whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                tab === t ? 'border-stone-800 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-8 font-sans-jp">
        {tab === 'ダッシュボード' && <AdminDashboard data={data} />}
        {tab === '豆管理' && <AdminBeans beans={data.beans} updateBeans={updateBeans} />}
        {tab === '農園管理' && <AdminSimpleEditor title="農園" items={data.farms} updateItems={updateFarms} fields={FARM_FIELDS} />}
        {tab === '産地管理' && <AdminSimpleEditor title="産地" items={data.countries} updateItems={updateCountries} fields={COUNTRY_FIELDS} />}
        {tab === '精製方法管理' && <AdminSimpleEditor title="精製方法" items={data.processes} updateItems={updateProcesses} fields={PROCESS_FIELDS} />}
        {tab === '用語集管理' && <AdminSimpleEditor title="用語" items={data.terms} updateItems={updateTerms} fields={TERM_FIELDS} />}
      </main>
    </div>
  );
}
