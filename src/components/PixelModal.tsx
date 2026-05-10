import PixelCard from './PixelCard';

export function PixelModal({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-40 grid place-items-end bg-black/50 p-0 sm:place-items-center sm:p-4"><PixelCard className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl sm:w-[calc(100vw-24px)] sm:max-w-md sm:rounded-none">{children}</PixelCard></div>;
}

export default PixelModal;
