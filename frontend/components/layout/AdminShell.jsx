import Sidebar from './Sidebar';

/** Shared dashboard shell (Sidebar + content area) for every admin page except /admin/login. */
export default function AdminShell({ title, description, children }) {
  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col md:flex-row gap-6 bg-grid">
      <Sidebar />
      <div className="flex-1 min-w-0">
        {(title || description) && (
          <div className="mb-6 pb-5 border-b border-white/5">
            {title && <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>}
            {description && <p className="text-sm text-white/50 mt-1.5">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
