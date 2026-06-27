import Field from '../common/Field';
import SectionBlock from '../common/SectionBlock';

export default function TermDetailView({ term, beans, onBack, onSelectBean, backLabel }) {
  const related = beans.filter((b) => b.variety && b.variety.includes(`term:${term.slug}`));
  return (
    <div>
      <div onClick={onBack} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
        ← {backLabel ?? '用語集へ戻る'}
      </div>
      <div className="border-l-2 border-l-stone-300 pl-6">
        <h2 className="font-serif-jp text-2xl mb-5">{term.name}</h2>
        <dl className="space-y-2 mb-6"><Field label="カテゴリ" value={term.category} /></dl>
        <SectionBlock title="説明"><p>{term.body}</p></SectionBlock>
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
