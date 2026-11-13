import Button from './Buttons';

/** Shown when a request fails. Always offers a retry when one is provided. */
export default function ErrorState({ title = 'Something went wrong', message, onRetry, className = '' }) {
  return (
    <div role="alert" className={`border border-danger/40 rounded-md px-6 py-10 text-center ${className}`}>
      <p className="font-display text-xl text-danger">{title}</p>
      {message && <p className="mt-2 text-muted max-w-md mx-auto">{message}</p>}
      {onRetry && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>
        </div>
      )}
    </div>
  );
}
