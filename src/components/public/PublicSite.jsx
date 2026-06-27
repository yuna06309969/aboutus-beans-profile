import { useState } from 'react';
import BeanListView from './BeanListView';
import BeanDetailView from './BeanDetailView';
import ListSimpleView from './ListSimpleView';
import CountryDetailView from './CountryDetailView';
import FarmDetailView from './FarmDetailView';
import ProcessDetailView from './ProcessDetailView';
import TermDetailView from './TermDetailView';
import ProjectDetailView from './ProjectDetailView';

const TABS = [
  { key: 'beans', label: '豆一覧' },
  { key: 'countries', label: '産地' },
  { key: 'farms', label: '農園' },
  { key: 'processes', label: '精製方法' },
  { key: 'terms', label: '用語集' },
];

export default function PublicSite({ data, onOpenAdmin }) {
  const [tab, setTab] = useState('beans');
  const [detail, setDetail] = useState(null);

  const navigateToDetail = (type, id) => {
    setTab(type);
    setDetail({ type, id });
  };
  const goTab = (t) => {
    setTab(t);
    setDetail(null);
  };

  let content;
  if (detail) {
    if (detail.type === 'beans') {
      const bean = data.beans.find((b) => String(b.id) === String(detail.id));
      content = bean
        ? <BeanDetailView bean={bean} onBack={() => setDetail(null)} onNavigate={navigateToDetail} />
        : <p>見つかりません</p>;
    } else if (detail.type === 'countries') {
      const c = data.countries.find((c) => c.slug === detail.id);
      content = c
        ? <CountryDetailView country={c} beans={data.beans} onBack={() => setDetail(null)} onSelectBean={(id) => navigateToDetail('beans', id)} />
        : <p>見つかりません</p>;
    } else if (detail.type === 'farms') {
      const f = data.farms.find((f) => f.slug === detail.id);
      content = f
        ? <FarmDetailView farm={f} beans={data.beans} onBack={() => setDetail(null)} onSelectBean={(id) => navigateToDetail('beans', id)} onNavigate={navigateToDetail} />
        : <p>見つかりません</p>;
    } else if (detail.type === 'processes') {
      const p = data.processes.find((p) => p.slug === detail.id);
      content = p
        ? <ProcessDetailView process={p} beans={data.beans} onBack={() => setDetail(null)} onSelectBean={(id) => navigateToDetail('beans', id)} onNavigate={navigateToDetail} />
        : <p>見つかりません</p>;
    } else if (detail.type === 'terms') {
      const t = data.terms.find((t) => t.slug === detail.id);
      content = t
        ? <TermDetailView term={t} beans={data.beans} onBack={() => setDetail(null)} onSelectBean={(id) => navigateToDetail('beans', id)} onNavigate={navigateToDetail} />
        : <p>見つかりません</p>;
    } else if (detail.type === 'projects') {
      const proj = (data.projects ?? []).find((p) => p.slug === detail.id);
      content = proj
        ? <ProjectDetailView project={proj} beans={data.beans} farms={data.farms} onBack={() => setDetail(null)} onSelectBean={(id) => navigateToDetail('beans', id)} onNavigate={navigateToDetail} />
        : <p>見つかりません</p>;
    }
  } else if (tab === 'beans') {
    content = <BeanListView beans={data.beans} onSelectBean={(id) => navigateToDetail('beans', id)} />;
  } else if (tab === 'countries') {
    content = (
      <ListSimpleView
        items={data.countries}
        onSelect={(slug) => navigateToDetail('countries', slug)}
        renderItem={(c) => (
          <>
            <div className="font-serif-jp text-base">{c.flag} {c.name}</div>
            <div className="text-xs text-stone-500 mt-1">{c.region}</div>
          </>
        )}
      />
    );
  } else if (tab === 'farms') {
    content = (
      <ListSimpleView
        items={data.farms}
        onSelect={(slug) => navigateToDetail('farms', slug)}
        renderItem={(f) => (
          <>
            <div className="font-serif-jp text-base">{f.name}</div>
            <div className="text-xs text-stone-500 mt-1">{f.country_name} / {f.location}</div>
          </>
        )}
      />
    );
  } else if (tab === 'processes') {
    content = (
      <ListSimpleView
        items={data.processes}
        onSelect={(slug) => navigateToDetail('processes', slug)}
        renderItem={(p) => (
          <>
            <div className="font-serif-jp text-base">{p.name}</div>
            <div className="text-xs text-stone-500 mt-1">{p.category}</div>
          </>
        )}
      />
    );
  } else if (tab === 'terms') {
    content = (
      <ListSimpleView
        items={data.terms}
        onSelect={(slug) => navigateToDetail('terms', slug)}
        renderItem={(t) => (
          <>
            <div className="font-serif-jp text-base">{t.name}</div>
            <div className="text-xs text-stone-500 mt-1">{t.category}</div>
          </>
        )}
      />
    );
  }

  return (
    <div style={{ backgroundColor: '#f4efe9', color: '#2a2220', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-6 font-sans-jp">
        <header className="pt-10 pb-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={onOpenAdmin}
              type="button"
              className="text-[11px] tracking-widest text-stone-500 bg-white border border-stone-300 px-3 py-1.5 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              管理画面
            </button>
          </div>
          <div className="text-center">
            <h1 className="font-serif-jp text-3xl font-light tracking-wide">Bean Profile</h1>
            <p className="text-[11px] text-stone-400 mt-2 tracking-[0.2em]">About Us Coffee 内部豆プロファイル集</p>
          </div>
        </header>
        <nav className="flex justify-center gap-6 border-b border-stone-300 pb-3 mb-10 text-[11px] tracking-[0.2em] overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => goTab(t.key)}
              type="button"
              className={`pb-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${
                tab === t.key ? 'border-b border-stone-800 text-stone-900' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <main className="pb-24">{content}</main>
      </div>
    </div>
  );
}
