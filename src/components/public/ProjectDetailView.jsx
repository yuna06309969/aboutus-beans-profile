import SectionBlock from '../common/SectionBlock';
import WikiText from '../common/WikiText';
import Field from '../common/Field';

export default function ProjectDetailView({ project, beans, farms, onBack, onSelectBean, onNavigate, backLabel }) {
  const relatedBeans = beans.filter(
    (b) => b.description_ja?.includes(`project:${project.slug}`) ||
           b.region?.includes(`project:${project.slug}`)
  );
  const relatedFarms = farms.filter(
    (f) => f.overview?.includes(`project:${project.slug}`) ||
           f.areas?.some((a) => a.description?.includes(`project:${project.slug}`))
  );

  return (
    <div>
      <div onClick={onBack} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
        ← {backLabel ?? '一覧へ戻る'}
      </div>
      <div className="border-l-2 border-l-stone-300 pl-6">
        {project.category && (
          <div className="text-[10px] tracking-widest text-stone-400 mb-1 uppercase">{project.category}</div>
        )}
        <h2 className="font-serif-jp text-2xl mb-6">{project.name}</h2>

        {project.links && (
          <dl className="space-y-2 mb-6">
            <Field label="公式サイト" value={project.links} />
          </dl>
        )}

        {project.overview && (
          <SectionBlock title="概要">
            <p><WikiText text={project.overview} onNavigate={onNavigate} /></p>
          </SectionBlock>
        )}

        {project.areas?.length > 0 && (
          <SectionBlock title="詳細情報">
            <div className="space-y-3">
              {project.areas.map((a) => (
                <div key={a.name} className="border-l-2 border-l-stone-200 pl-4 py-1">
                  <div className="text-[10px] font-medium tracking-widest text-stone-400 mb-1 uppercase">{a.name}</div>
                  <p className="text-stone-600 leading-relaxed"><WikiText text={a.description} onNavigate={onNavigate} /></p>
                </div>
              ))}
            </div>
          </SectionBlock>
        )}

        {relatedFarms.length > 0 && (
          <SectionBlock title="関連する農園">
            <ul className="space-y-1">
              {relatedFarms.map((f) => (
                <li key={f.slug}>
                  <span onClick={() => onNavigate('farms', f.slug)} className="underline decoration-dotted cursor-pointer text-sm">
                    {f.name}
                  </span>
                </li>
              ))}
            </ul>
          </SectionBlock>
        )}

        {relatedBeans.length > 0 && (
          <SectionBlock title="関連する豆">
            <ul className="space-y-1">
              {relatedBeans.map((b) => (
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
