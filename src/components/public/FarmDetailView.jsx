import Field from '../common/Field';
import SectionBlock from '../common/SectionBlock';
import WikiText from '../common/WikiText';
import LinkedText from '../common/LinkedText';
import EsmeraldaMap from './EsmeraldaMap';

export default function FarmDetailView({ farm, beans, onBack, onSelectBean, onNavigate, backLabel }) {
  const related = beans.filter((b) => b.region && b.region.includes(`farm:${farm.slug}`));
  return (
    <div>
      <div onClick={onBack} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
        ← {backLabel ?? '農園一覧へ戻る'}
      </div>
      <div className="border-l-2 border-l-stone-300 pl-6">
        <h2 className="font-serif-jp text-2xl mb-5">{farm.name}</h2>
        <dl className="space-y-2 mb-6">
          <Field label="産地" value={farm.country_name} />
          <Field label="場所" value={farm.location} />
          <Field label="生産者" value={farm.owner} />
          <Field label="標高" value={farm.altitude} />
        </dl>
        <SectionBlock title="概要"><p><WikiText text={farm.overview} onNavigate={onNavigate} /></p></SectionBlock>
        {farm.slug === 'esmeralda' && <SectionBlock title="エリアマップ"><EsmeraldaMap /></SectionBlock>}
        {farm.areas?.length > 0 && (
          <SectionBlock title="詳細情報">
            <div className="space-y-3">
              {farm.areas.map((a) => (
                <div key={a.name} className="border-l-2 border-l-stone-200 pl-4 py-1">
                  <div className="text-[10px] font-medium tracking-widest text-stone-400 mb-1 uppercase">{a.name}</div>
                  <p className="text-stone-600 leading-relaxed"><LinkedText text={a.description} /></p>
                </div>
              ))}
            </div>
          </SectionBlock>
        )}
        {farm.ranks?.length > 0 && (
          <SectionBlock title="ロット分類・表記">
            <div className="space-y-3">
              {farm.ranks.map((r) => (
                <div key={r.name} className="border-l-2 border-l-stone-200 pl-4 py-1">
                  <div className="text-[10px] font-medium tracking-widest text-stone-400 mb-1 uppercase">{r.name}</div>
                  <p className="text-stone-600 whitespace-pre-line">{r.description}</p>
                </div>
              ))}
            </div>
          </SectionBlock>
        )}
        {farm.awards && (
          <SectionBlock title="主な実績">
            <div className="border-l-2 border-l-amber-300 pl-4 py-1">
              <p className="whitespace-pre-line text-stone-600">{farm.awards}</p>
            </div>
          </SectionBlock>
        )}
        {related.length > 0 && (
          <SectionBlock title="関連する豆">
            <ul className="space-y-1">
              {related.map((b) => (
                <li key={b.id}>
                  <span onClick={() => onSelectBean(b.id)} className="underline decoration-dotted cursor-pointer">{b.name}</span>
                </li>
              ))}
            </ul>
          </SectionBlock>
        )}
      </div>
    </div>
  );
}
