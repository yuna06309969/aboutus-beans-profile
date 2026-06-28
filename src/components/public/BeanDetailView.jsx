import { STATUS_COLORS } from '../../constants';
import NewBadge from '../common/NewBadge';
import Field from '../common/Field';
import SectionBlock from '../common/SectionBlock';
import WikiText from '../common/WikiText';

export default function BeanDetailView({ bean, onBack, onNavigate, backLabel }) {
  return (
    <div>
      <div onClick={onBack} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
        ← {backLabel ?? '一覧へ戻る'}
      </div>
      <div className={`border-l-2 ${STATUS_COLORS[bean.status] || 'border-l-stone-300'} pl-6`}>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {bean.is_new && <NewBadge />}
          <span className="text-[10px] tracking-widest text-stone-400">{bean.status}</span>
        </div>
        <h2 className="font-serif-jp text-2xl mb-5">{bean.name}</h2>
        <dl className="space-y-2 mb-6">
          <Field label="産地" value={<WikiText text={bean.origin} onNavigate={onNavigate} />} />
          <Field label="地域・農園" value={<WikiText text={bean.region} onNavigate={onNavigate} />} />
          <Field label="品種" value={<WikiText text={bean.variety} onNavigate={onNavigate} />} />
          <Field label="標高" value={bean.altitude} />
          <Field label="精製方法" value={<WikiText text={bean.process} onNavigate={onNavigate} />} />
          <Field label="テロワール" value={bean.terroir ? <WikiText text={bean.terroir} onNavigate={onNavigate} /> : null} />
        </dl>
        <SectionBlock title="概要">
          <WikiText text={bean.description_ja} onNavigate={onNavigate} />
          {bean.description_en && (
            <div className="text-stone-500 mt-3 italic">
              {bean.description_en.split(/\n+/).map((p, i) => (
                <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
              ))}
            </div>
          )}
        </SectionBlock>
        <SectionBlock title="テイスト">
          {bean.taste_ja && bean.taste_ja.split(/\n+/).map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
          ))}
          {bean.taste_en && (
            <div className="text-stone-500 mt-3 italic">
              {bean.taste_en.split(/\n+/).map((p, i) => (
                <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
              ))}
            </div>
          )}
        </SectionBlock>
        <SectionBlock title="詳細">
          {bean.detail_ja && bean.detail_ja.split(/\n+/).map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
          ))}
          {bean.detail_en && (
            <div className="text-stone-500 mt-3 italic">
              {bean.detail_en.split(/\n+/).map((p, i) => (
                <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
              ))}
            </div>
          )}
        </SectionBlock>
      </div>
    </div>
  );
}
