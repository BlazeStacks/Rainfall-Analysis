/** Loading spinner centered in its container. */
export function LoadingSpinner({ message = 'Loading data…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="spinner" />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

/** Error banner with message. */
export function ErrorBanner({ message }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex gap-3 items-start">
      <span className="text-red-500 text-lg">⚠</span>
      <div>
        <p className="text-sm font-medium text-red-700">Failed to load data</p>
        <p className="text-xs text-red-500 mt-0.5">{message}</p>
        <p className="text-xs text-red-400 mt-1">
          Make sure the Spring Boot backend is running on port 8080.
        </p>
      </div>
    </div>
  );
}

/** Empty state. */
export function EmptyState({ message = 'No data available for the selected filters.' }) {
  return (
    <div className="text-center py-16 text-slate-400">
      <p className="text-4xl mb-3">📭</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
