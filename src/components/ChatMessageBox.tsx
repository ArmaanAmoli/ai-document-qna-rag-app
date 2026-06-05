export function MessageBox({ message }: { message: string }) {
    return (
        <div className="flex ml-auto border border-white/20 px-4 py-2 rounded-3xl">
            <p className="text-md">{message}</p>
        </div>
    )

}