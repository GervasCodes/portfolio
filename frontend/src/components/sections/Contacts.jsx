import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import Field, { Input, Textarea } from '@/components/ui/Field';
import { PortfolioAPI } from '@/services/api';

const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function Contacts({ profile }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const { error } = await PortfolioAPI.sendContactMessage(form);
    if (error) {
      setStatus('error');
      setErrorMsg(error);
      return;
    }
    setStatus('success');
    setForm(EMPTY);
  };

  return (
    <section id="contact">
      <div className="container-page grid gap-12 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="section-label">Contact</p>
          <h1 className="font-display text-4xl md:text-5xl font-normal leading-tight tracking-tight">
            Let&apos;s talk
          </h1>
          <p className="mt-5 text-muted max-w-prose">
            Tell me what you are working on and what you need. I will reply with how I would approach it.
          </p>
          <dl className="mt-8 space-y-2 text-sm">
            {profile?.email && (
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="m-0"><a href={`mailto:${profile.email}`} className="underline underline-offset-4">{profile.email}</a></dd>
              </div>
            )}
            {profile?.location && (
              <div>
                <dt className="text-muted">Based in</dt>
                <dd className="m-0">{profile.location}</dd>
              </div>
            )}
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Name" required><Input name="name" value={form.name} onChange={handleChange} autoComplete="name" /></Field>
            <Field label="Email" required><Input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" /></Field>
          </div>
          <Field label="Subject"><Input name="subject" value={form.subject} onChange={handleChange} /></Field>
          <Field label="Message" required><Textarea name="message" value={form.message} onChange={handleChange} rows={6} /></Field>

          <Button type="submit" disabled={status === 'loading'} icon={<Send size={16} />}>
            {status === 'loading' ? 'Sending…' : 'Send message'}
          </Button>

          {status === 'success' && (
            <p role="status" className="text-sm text-success">Message sent. Thank you, I will reply soon.</p>
          )}
          {status === 'error' && (
            <p role="alert" className="text-sm text-danger">{errorMsg || 'Something went wrong. Please try again.'}</p>
          )}
        </form>
      </div>
    </section>
  );
}
