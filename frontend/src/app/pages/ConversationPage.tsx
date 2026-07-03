import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { messageApi } from '../api';
import { AvatarCircle } from '../components/shared/AvatarCircle (1).tsx';

interface Message {
  id: string;
  senderId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; fullName: string; profilePhoto?: string };
}

interface Conversation {
  id: string;
  question: { id: string; title: string };
  student: { id: string; fullName: string; profilePhoto?: string };
  advisor: { id: string; fullName: string; profilePhoto?: string };
  messages: Message[];
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useApp();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    messageApi.getConversation(id)
      .then(r => setConversation(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !id || sending) return;
    setSending(true);
    try {
      const res = await messageApi.sendMessage(id, input.trim());
      const newMsg: Message = res.data.data;
      setConversation(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev);
      setInput('');
    } catch {
      // toast handled silently
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin" style={{ color: '#2C2C6E' }} />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center" style={{ color: '#888780' }}>
        Conversation not found.
      </div>
    );
  }

  const other = currentUser?.id === conversation.student.id ? conversation.advisor : conversation.student;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link to="/messages" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#5F5E5A' }}>
          <ArrowLeft size={18} />
        </Link>
        <AvatarCircle name={other.fullName} size="card" />
        <div>
          <p className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>{other.fullName}</p>
          <Link
            to={`/questions/${conversation.question.id}`}
            className="text-[12px] hover:underline"
            style={{ color: '#2C2C6E' }}
          >
            Re: {conversation.question.title}
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 py-2">
        {conversation.messages.length === 0 && (
          <p className="text-center text-[13px] py-8" style={{ color: '#888780' }}>
            No messages yet. Send the first one!
          </p>
        )}
        {conversation.messages.map(m => {
          const isMine = m.senderId === currentUser?.id;
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                style={{
                  backgroundColor: isMine ? '#2C2C6E' : '#F1EFE8',
                  color: isMine ? '#fff' : '#1A1A1A',
                  borderBottomRightRadius: isMine ? 4 : undefined,
                  borderBottomLeftRadius: !isMine ? 4 : undefined,
                }}
              >
                {m.body}
                <p className="text-[10px] mt-1 opacity-60">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 pt-3 border-t" style={{ borderColor: '#DEDEDE' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder="Write a message… (Enter to send)"
          rows={2}
          className="flex-1 px-3 py-2.5 rounded-xl border text-[13px] resize-none outline-none focus:border-[#2C2C6E]"
          style={{ borderColor: '#DEDEDE' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="p-3 rounded-xl text-white disabled:opacity-40 flex-shrink-0"
          style={{ backgroundColor: '#2C2C6E' }}
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
