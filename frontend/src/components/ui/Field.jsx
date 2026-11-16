import { Children, cloneElement, forwardRef, isValidElement, useId } from 'react';

/**
 * Label + control + hint + error, wired together for assistive tech:
 * the label points at the control, and hint/error are announced with it.
 * Wrap exactly one Input, Textarea or Select.
 */
export function Field({ label, hint, error, required = false, className = '', children }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const child = Children.only(children);
  const control = isValidElement(child)
    ? cloneElement(child, {
      id,
      required: required || child.props.required,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': describedBy,
    })
    : child;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      {control}
      {hint && <p id={hintId} className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

// 16px+ text on touch avoids iOS zoom-on-focus; 44px minimum height for touch targets.
const CONTROL = 'input-field w-full px-4 py-2.5 text-base min-h-11';

export const Input = forwardRef(function Input({ className = '', ...rest }, ref) {
  return <input ref={ref} className={`${CONTROL} ${className}`} {...rest} />;
});

export const Textarea = forwardRef(function Textarea({ className = '', rows = 5, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={`${CONTROL} form-scroll ${className}`} {...rest} />;
});

export const Select = forwardRef(function Select({ className = '', children, ...rest }, ref) {
  return <select ref={ref} className={`${CONTROL} ${className}`} {...rest}>{children}</select>;
});

export default Field;
