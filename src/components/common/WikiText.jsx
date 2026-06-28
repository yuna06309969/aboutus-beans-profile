import { TYPE_PATH } from '../../constants';

function parseInline(text, onNavigate, keyOffset = 0) {
  const regex = /\[\[([^\|\]]+)\|(\w+):([\w-]+)\]\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = keyOffset;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    const [, label, type, slug] = match;
    parts.push(
      <span
        key={key++}
        onClick={() => onNavigate(TYPE_PATH[type], slug)}
        className="underline decoration-dotted underline-offset-2 cursor-pointer"
      >
        {label}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts;
}

export default function WikiText({ text, onNavigate }) {
  if (!text) return null;

  const paragraphs = text.split(/\n+/);
  if (paragraphs.length === 1) {
    return <span>{parseInline(text, onNavigate)}</span>;
  }

  let key = 0;
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} className={i > 0 ? 'mt-3' : ''}>
          {parseInline(para, onNavigate, key += 100)}
        </p>
      ))}
    </>
  );
}
