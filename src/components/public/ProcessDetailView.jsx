import SectionBlock from '../common/SectionBlock';
import WikiText from '../common/WikiText';

function StepsDiagram({ steps }) {
  if (!steps?.length) return null;
  return (
    <div className="relative pl-2">
      {steps.map((step, i) => (
        <div key={i} className="relative flex gap-3 pb-5">
          {i < steps.length - 1 && (
            <div className="absolute left-[9px] top-5 bottom-0 w-px bg-stone-200" />
          )}
          <div className="w-[18px] h-[18px] rounded-full bg-stone-700 flex items-center justify-center text-[9px] text-stone-100 font-medium flex-shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div>
            <div className="text-sm font-medium text-stone-700">{step.label}</div>
            {step.note && <div className="text-xs text-stone-400 mt-0.5 leading-relaxed">{step.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProcessDetailView({ process, beans, onBack, onSelectBean, onNavigate, backLabel }) {
  const related = beans.filter((b) => b.process && b.process.includes(`process:${process.slug}`));
  return (
    <div>
      <div onClick={onBack} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
        ← {backLabel ?? '精製方法一覧へ戻る'}
      </div>
      <div className="border-l-2 border-l-stone-300 pl-6">
        <div className="text-[10px] tracking-widest text-stone-400 mb-1 uppercase">{process.category}</div>
        <h2 className="font-serif-jp text-2xl mb-6">{process.name}</h2>

        {process.body && (
          <SectionBlock title="概要">
            <p><WikiText text={process.body} onNavigate={onNavigate} /></p>
          </SectionBlock>
        )}

        {process.steps?.length > 0 && (
          <SectionBlock title="精製フロー">
            <StepsDiagram steps={process.steps} />
          </SectionBlock>
        )}

        {process.areas?.length > 0 && (
          <SectionBlock title="詳細情報">
            <div className="space-y-3">
              {process.areas.map((a) => (
                <div key={a.name} className="border-l-2 border-l-stone-200 pl-4 py-1">
                  <div className="text-[10px] font-medium tracking-widest text-stone-400 mb-1 uppercase">{a.name}</div>
                  <p className="text-stone-600 leading-relaxed"><WikiText text={a.description} onNavigate={onNavigate} /></p>
                </div>
              ))}
            </div>
          </SectionBlock>
        )}

        {related.length > 0 && (
          <SectionBlock title="関連する豆">
            <ul className="space-y-1">
              {related.map((b) => (
                <li key={b.id}>
                  <span onClick={() => onSelectBean(b.id)} className="underline decoration-dotted cursor-pointer text-sm">
                    {b.name}
                  </span>
                </li>
              ))}
            </ul>
          </SectionBlock>
        )}
      </div>
    </div>
  );
}
