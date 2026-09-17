import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, LifeBuoy, Send } from 'lucide-react';
import { api } from '../../api.js';

function timeOf(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function dayOf(value) {
  const d = new Date(value);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long' });
}

export default function SupportPage() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const data = await api('/api/support/messages');
      setMessages(data.messages || []);
      if (!loadedRef.current) {
        loadedRef.current = true;
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 0);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (loadedRef.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    try {
      const { message } = await api('/api/support/messages', { method: 'POST', body: { body } });
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  let lastDay = '';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-softer text-primary-strong">
          <LifeBuoy size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Soporte</h1>
          <p className="text-sm text-ink-muted">Escribinos y te respondemos a la brevedad.</p>
        </div>
      </div>

      <div className="card flex h-[62vh] flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center text-ink-muted">
              <Loader2 className="animate-spin" size={22} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-ink-muted">
              <LifeBuoy size={30} />
              <p className="text-sm">Todavía no hay mensajes. Contanos en qué te podemos ayudar.</p>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.sender_role === 'admin';
              const day = dayOf(m.created_at);
              const showDay = day !== lastDay;
              lastDay = day;
              return (
                <div key={m.id}>
                  {showDay && (
                    <p className="my-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {day}
                    </p>
                  )}
                  <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        mine
                          ? 'rounded-br-md bg-gradient-to-br from-primary to-primary-strong text-primary-contrast'
                          : 'rounded-bl-md bg-surface-alt text-ink'
                      }`}
                    >
                      {!mine && <p className="mb-0.5 text-xs font-bold text-ink-muted">{m.sender_name || 'Equipo PERKS'}</p>}
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={`mt-1 text-right text-[11px] ${mine ? 'text-primary-contrast/70' : 'text-ink-muted'}`}>
                        {timeOf(m.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="px-4 pb-1 text-sm font-medium text-red-500">{error}</p>}

        <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
          <input
            className="input flex-1"
            placeholder="Escribí un mensaje..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
          />
          <button className="btn-primary !px-4" disabled={sending || !text.trim()} aria-label="Enviar">
            {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
          </button>
        </form>
      </div>
    </div>
  );
}
