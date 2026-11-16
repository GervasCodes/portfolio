import { useState } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import Reveal from '@/components/ui/Reveal';
import { copyText } from '@/utils/clipboard';

/** Closing call to action: email (mailto) + copy button. Falls back to /contact with no email. */
export default function ClosingCta({ profile }) {
  const email = profile?.email;
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (await copyText(email)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="py-section">
      <div className="container-page">
        <Reveal>
          <div className="card card-raised relative overflow-hidden rounded-3xl p-8 text-center md:p-16">
            <h2 className="mx-auto max-w-3xl text-balance font-display text-5xl font-normal leading-[0.98] tracking-tight md:text-7xl">
              Have a <em>project</em> in mind?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
              Tell me what you need and I will reply with how I would approach it.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <Button
                href={email ? `mailto:${email}` : '/contact'}
                size="lg"
                icon={<ArrowRight size={18} aria-hidden="true" />}
              >
                Start a project
              </Button>
              {email && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onCopy}
                  icon={copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                >
                  {copied ? 'Copied' : 'Copy email'}
                </Button>
              )}
            </div>
            {email && (
              <p className="mt-6 break-all text-sm text-muted">{email}</p>
            )}
            <span className="sr-only" role="status">{copied ? 'Email address copied to clipboard' : ''}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
