import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import { PortfolioAPI } from '@/services/api';

export default function Contacts({ profile }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
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
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section id="contact" className="py-24">
      <div className="container-page grid md:grid-cols-5 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2"
        >
          <p className="section-label">Get In Touch</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Let&apos;s build something <span className="text-gradient">great together</span>
          </h2>
          <p className="text-white/60 mb-8">
            Have a project in mind or just want to say hi? My inbox is always open.
          </p>

          <div className="space-y-4 text-sm">
            {profile?.email && (
              <div className="flex items-center gap-3 text-white/70">
                <Mail size={16} className="text-accent-light" /> {profile.email}
              </div>
            )}
            {profile?.location && (
              <div className="flex items-center gap-3 text-white/70">
                <MapPin size={16} className="text-accent-light" /> {profile.location}
              </div>
            )}
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="md:col-span-3 glass rounded-2xl p-6 md:p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className="input-field px-4 py-3 text-sm"
            />
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your email"
              className="input-field px-4 py-3 text-sm"
            />
          </div>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="w-full input-field px-4 py-3 text-sm"
          />
          <textarea
            required
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your message"
            rows={5}
            className="w-full input-field px-4 py-3 text-sm resize-none"
          />

          <Button type="submit" disabled={status === 'loading'} icon={<Send size={16} />}>
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </Button>

          {status === 'success' && (
            <p className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 size={16} /> Message sent — thank you for reaching out!
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-400">{errorMsg || 'Something went wrong. Please try again.'}</p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
