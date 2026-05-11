export function ErrorFallback({ message }: { message: string }) {
  return <div className="pixel-border bg-white p-4 text-[10px] leading-relaxed">⚠️ {message}</div>;
}
