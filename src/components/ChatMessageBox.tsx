
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MessageBox({ message }: { message: string }) {
    return (
        <div className="flex max-w-100 ml-auto border border-white/20 px-4 py-2 rounded-3xl mb-4">
            <p className="text-md">{message}</p>
        </div>
    )

}

export function MessageBoxBot({message}:{message:string}){
    return (
        <div className="flex flex-col w-full border border-white/10 px-4 py-2 rounded-xl mb-4">
            <Markdown remarkPlugins={[remarkGfm]}>{message}</Markdown>
        </div>
    )
}