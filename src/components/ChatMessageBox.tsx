import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MessageBox({ message }: { message: string }) {
  return (
    <div className="mb-4 ml-auto flex max-w-100 rounded-3xl border border-white/20 px-4 py-2">
      <p className="text-md">{message}</p>
    </div>
  );
}

export function MessageBoxBot({ message }: { message: string }) {
  return (
    <div className="mb-4 flex w-full flex-col rounded-xl border border-white/10 px-4 py-2">
      <Markdown remarkPlugins={[remarkGfm]}>{message}</Markdown>
    </div>
  );
}
