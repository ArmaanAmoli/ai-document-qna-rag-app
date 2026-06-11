
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MessageBox({ message }: { message: string }) {
    return (
        <div className="flex max-w-100 ml-auto border border-white/20 px-4 py-2 rounded-3xl">
            <p className="text-md">{message}</p>
        </div>
    )

}

export function MessageBoxBot({message}:{message:string}){
    return (
        <div className="flex w-full border border-white/10 px-4 py-2 rounded-xl">
            <Markdown remarkPlugins={[remarkGfm]}>{message}</Markdown>
        </div>
    )
}