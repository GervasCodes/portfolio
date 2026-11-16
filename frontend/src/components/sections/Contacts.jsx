import { useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, MessageCircle, Send } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import Card from '@/components/ui/Card';
import Field, { Input, Textarea } from '@/components/ui/Field';
import SectionHeader from '@/components/ui/SectionHeader';
import { PortfolioAPI } from '@/services/api';
import { useLocalTime } from '@/hooks/useLocalTime';
import { validateContact, whatsappDigits } from '@/utils/blogContent';
import { isRealUrl } from '@/utils/projectContent';

const EMPTY = { name: '', email: '', subject: '', message: '' };
const MAX_MESSAGE = 5000;
const CHANNEL = 'inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-muted transition-colors duration-fast hover:border-control hover:text-ink';

function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy my email address', email);
    }
  }
  return (
    <>
      <button type="button" onClick={copy} className={CHANNEL}>
        {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy email'}
      </button>
      <span className="sr-only" role="status">{copied ? 'Email address copied' : ''}</span>
    </>
  );
}

/**
 * Contact: a friendly form plus the direct ways to reach the owner.
 * Everything in the side column comes from the profile and is left out when
 * empty. The form posts the same four fields as before ({ name, email,
 * subject, message }); spam protection is the server's rate limit, untouched.
 * Validation mirrors the backend limits and runs on submit (and on blur once
 * a field has been left), with the first problem focused.
 */
export default function Contacts({ profile }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [sent, setSent] = useState(null); // what was sent, for the thank-you message
  const successRef = useRef(null);
  const formRef = useRef(null);
  const time = useLocalTime();

  const email = profile?.email;
  const wa = whatsappDigits(profile?.whatsapp_number);
  const socials = [
    ['GitHub', profile?.github_url],
    ['LinkedIn', profile?.linkedin_url],
    ['X', profile?.twitter_url],
    ['Instagram', profile?.instagram_url],
  ].filter(([, url]) => isRealUrl(url));

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    // Once a field has shown an error (or been left), keep it honest as the visitor types.
    if (touched[name] || errors[name]) {
      const all = validateContact(next);
      setErrors((prev) => ({ ...prev, [name]: all[name] }));
    }
  };
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateContact(form)[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'loading') return;
    const found = validateContact(form);
    setErrors(found);
    setTouched({ name: true, email: true, subject: true, message: true });
    const firstBad = ['name', 'email', 'subject', 'message'].find((k) => found[k]);
    if (firstBad) {
      formRef.current?.elements[firstBad]?.focus();
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    const payload = {
      name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim(), message: form.message.trim(),
    };
    const { error } = await PortfolioAPI.sendContactMessage(payload);
    if (error) {
      setStatus('error');
      setErrorMsg(error);
      return;
    }
    setSent({ name: payload.name, email: payload.email });
    setStatus('success');
    setForm(EMPTY);
    setErrors({});
    setTouched({});
    window.setTimeout(() => successRef.current?.focus(), 0);
  };

  const remaining = MAX_MESSAGE - form.message.length;

  return (
    <section id="contact" aria-labelledby="contact-title">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeader
            as="h1"
            eyebrow="Contact"
            title={<span id="contact-title">Let’s <em>talk</em></span>}
            description="Tell me what you are working on and what you need. I will reply with how I would approach it."
            className="md:mb-8"
          />

          {profile?.available_for_work && (
            <p className="mb-8 text-sm text-ink">Available for new projects</p>
          )}

          <div className="flex flex-wrap gap-2">
            {email && (
              <>
                <a href={`mailto:${email}`} className={CHANNEL}>
                  <Send size={15} aria-hidden="true" /> {email}
                </a>
                <CopyEmail email={email} />
              </>
            )}
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className={CHANNEL} aria-label="Message me on WhatsApp (opens in a new tab)">
                <MessageCircle size={15} aria-hidden="true" /> WhatsApp
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
              {socials.map(([label, url]) => (
                <li key={label}>
                  <a href={url} target="_blank" rel="noreferrer" className={CHANNEL} aria-label={`${label} (opens in a new tab)`}>
                    {label} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {profile?.location && (
            <p className="mt-8 text-sm text-muted">
              Based in {profile.location}{time ? ` · ${time} EAT` : ''}
            </p>
          )}
        </div>

        <div className="lg:col-span-7">
          <Card spotlight={false} raised className="p-6 md:p-10">
            {status === 'success' ? (
              <div role="status" className="py-6 text-center md:py-10">
                <span aria-hidden="true" className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check size={28} />
                </span>
                <h2 ref={successRef} tabIndex={-1} className="font-display text-3xl font-normal leading-tight tracking-tight outline-none md:text-4xl">
                  Message sent{sent?.name ? `, thank you ${sent.name.split(' ')[0]}` : ''}
                </h2>
                <p className="mx-auto mt-4 max-w-md text-muted">
                  I will reply to <span className="text-ink">{sent?.email}</span>. If you do not see my answer, check your spam folder.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button variant="secondary" onClick={() => { setStatus('idle'); setSent(null); }}>Send another message</Button>
                  <Button href="/projects" variant="ghost">See the work</Button>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5" aria-describedby={status === 'error' ? 'contact-error' : undefined}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" required error={errors.name}>
                    <Input name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} autoComplete="name" maxLength={120} />
                  </Field>
                  <Field label="Email" required error={errors.email}>
                    <Input type="email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur} autoComplete="email" inputMode="email" />
                  </Field>
                </div>
                <Field label="Subject (optional)" error={errors.subject}>
                  <Input name="subject" value={form.subject} onChange={handleChange} onBlur={handleBlur} maxLength={220} />
                </Field>
                <Field
                  label="Message"
                  required
                  error={errors.message}
                  hint={remaining < 500 ? `${remaining.toLocaleString('en-US')} characters left` : 'What are you building, and what would a good result look like?'}
                >
                  <Textarea name="message" value={form.message} onChange={handleChange} onBlur={handleBlur} rows={7} />
                </Field>

                <div className="flex flex-wrap items-center gap-4">
                  <Button type="submit" size="lg" loading={status === 'loading'} icon={<Send size={16} aria-hidden="true" />}>
                    {status === 'loading' ? 'Sending…' : 'Send message'}
                  </Button>
                  <p className="m-0 text-xs text-muted"><span aria-hidden="true">*</span> Required</p>
                </div>

                {status === 'error' && (
                  <p id="contact-error" role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                    {errorMsg || 'Something went wrong. Please try again.'}
                    {email && (
                      <>
                        {' '}Your message is still here. You can also email me at{' '}
                        <a href={`mailto:${email}`} className="underline underline-offset-4">{email}</a>.
                      </>
                    )}
                  </p>
                )}
              </form>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
