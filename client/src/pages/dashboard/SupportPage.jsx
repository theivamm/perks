import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, LifeBuoy, Loader2, Plus, Send, Ticket, X } from 'lucide-react';
import { api, formatDate } from '../../api.js';

function StatusBadge({ status }) {
  const styles = {
    nuevo: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    abierto: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    respondido: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    cerrado: 'bg-ink-muted/10 text-ink-muted',
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${styles[status] || styles.abierto}`}>{status}</span>;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      const data = await api('/api/support/tickets');
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTicket = useCallback(async (id) => {
    try {
      const data = await api(`/api/support/tickets/${id}`);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    const timer = setInterval(loadTickets, 10000);
    return () => clearInterval(timer);
  }, [loadTickets]);

  useEffect(() => {
    if (!selected) return undefined;
    loadTicket(selected);
    const timer = setInterval(() => loadTicket(selected), 10000);
    return () => clearInterval(timer);
  }, [selected, loadTicket]);

  const active = tickets.find((ticket) => ticket.id === selected);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Soporte</h1>
          <p className="mt-1 text-sm text-ink-muted">Creá un ticket y seguí la respuesta con su código.</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating((value) => !value)}>
          {creating ? <X size={16} /> : <Plus size={16} />}
          {creating ? 'Cancelar' : 'Nuevo ticket'}
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">{error}</p>}
      {creating && (
        <NewTicket
          onCreated={(ticket, message) => {
            setTickets((current) => [ticket, ...current]);
            setSelected(ticket.id);
            setMessages([message]);
            setCreating(false);
          }}
        />
      )}

      <div className="grid gap-4 md:grid-cols-[320px,1fr]">
        <div className={`card self-start overflow-hidden p-2 ${selected ? 'hidden md:block' : ''}`}>
          {tickets.length > 0 && (
            <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-muted">
              Tus tickets · {tickets.length}
            </p>
          )}
          {loading ? (
            <div className="flex justify-center py-16 text-ink-muted"><Loader2 className="animate-spin" size={22} /></div>
          ) : tickets.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-ink-muted">
              <Ticket className="mx-auto mb-2" size={28} />
              Todavía no creaste tickets.
            </div>
          ) : (
            <div className="space-y-1">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  className={`w-full rounded-2xl border-l-[3px] px-4 py-3.5 text-left transition ${
                    selected === ticket.id ? 'border-primary bg-primary-softer' : 'border-transparent hover:bg-surface-alt'
                  }`}
                  onClick={() => setSelected(ticket.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-extrabold text-ink">{ticket.subject}</p>
                    {ticket.unread > 0 && (
                      <span
                        aria-label={`${ticket.unread} mensajes sin leer`}
                        className="rounded-full bg-primary px-1.5 text-xs font-bold text-primary-contrast"
                      >
                        {ticket.unread}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-ink-muted">{ticket.code}</span>
                    <StatusBadge status={ticket.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`card min-h-[520px] overflow-hidden ${selected ? '' : 'hidden md:block'}`}>
          {!active ? (
            <div className="flex h-[520px] flex-col items-center justify-center gap-2 px-6 text-center">
              <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-softer text-primary-strong">
                <LifeBuoy size={26} />
              </span>
              <p className="font-heading text-lg font-bold text-ink">Elegí un ticket para ver su seguimiento</p>
              <p className="max-w-xs text-sm text-ink-muted">O creá uno nuevo: te respondemos por acá y te avisamos con una notificación.</p>
            </div>
          ) : (
            <TicketDetail
              ticket={active}
              messages={messages}
              onBack={() => setSelected(null)}
              onMessage={(message) => {
                setMessages((current) => [...current, message]);
                loadTickets();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function NewTicket({ onCreated }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      const data = await api('/api/support/tickets', { method: 'POST', body: { subject, body } });
      onCreated(data.ticket, data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="card animate-fade-up space-y-3 p-5">
      <p className="font-heading text-lg font-bold text-ink">Nuevo ticket</p>
      <div>
        <label className="label">Asunto</label>
        <input className="input" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} required placeholder="¿En qué necesitás ayuda?" />
      </div>
      <div>
        <label className="label">Descripción</label>
        <textarea className="input min-h-28 resize-y" value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} required placeholder="Contanos el problema o solicitud con el mayor detalle posible." />
      </div>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <button className="btn-primary" disabled={sending}>
        {sending ? <Loader2 className="animate-spin" size={16} /> : <Ticket size={16} />}
        Crear ticket
      </button>
    </form>
  );
}

function TicketDetail({ ticket, messages, onBack, onMessage }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const send = async (event) => {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError('');
    try {
      const data = await api(`/api/support/tickets/${ticket.id}/messages`, { method: 'POST', body: { body } });
      setText('');
      onMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[620px] flex-col">
      <div className="border-b border-line px-4 py-3">
        <button className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-ink-muted md:hidden" onClick={onBack}>
          <ChevronLeft size={14} /> Volver
        </button>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-heading text-lg font-bold text-ink">{ticket.subject}</p>
            <p className="font-mono text-xs text-ink-muted">{ticket.code}</p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-surface-page/60 p-4">
        {messages.map((message) => {
          const mine = message.sender_role === 'admin';
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${mine ? 'rounded-br-md bg-primary text-primary-contrast' : 'rounded-bl-md border border-line bg-surface text-ink'}`}>
                {!mine && <p className="mb-1 text-xs font-bold text-ink-muted">{message.sender_name || 'Equipo Wintuu'}</p>}
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <p className={`mt-1 text-right text-[11px] ${mine ? 'text-primary-contrast/70' : 'text-ink-muted'}`}>{formatDate(message.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {error && <p className="px-4 text-sm font-medium text-red-500">{error}</p>}
      {ticket.status === 'cerrado' && (
        <p className="border-t border-line px-4 py-3 text-center text-xs font-semibold text-ink-muted">
          Este ticket está cerrado. Si seguís con el problema, creá uno nuevo.
        </p>
      )}
      {ticket.status !== 'cerrado' && (
        <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
          <input className="input flex-1" value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} placeholder="Agregar un mensaje..." />
          <button className="btn-primary !px-4" disabled={sending || !text.trim()} aria-label="Enviar">
            {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
          </button>
        </form>
      )}
    </div>
  );
}
