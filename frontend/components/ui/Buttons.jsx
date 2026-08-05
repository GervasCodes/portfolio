'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const BASE = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none';

const VARIANTS = {
  primary: 'bg-gradient-to-r from-accent to-cyan-accent text-white shadow-glow hover:shadow-[0_0_50px_-8px_rgba(139,92,246,0.7)]',
  secondary: 'glass glass-hover text-white',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
};

const SIZES = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export function Button({
  children, variant = 'primary', size = 'md', href, type = 'button',
  onClick, disabled, className = '', icon,
}) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <motion.span
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={classes}
    >
      {icon}
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className="inline-block">
      {content}
    </button>
  );
}

export function IconButton({ icon, onClick, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`glass glass-hover w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white ${className}`}
    >
      {icon}
    </button>
  );
}

export default Button;
