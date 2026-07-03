import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { messageApi } from '../api';
import { AvatarCircle } from '../components/shared/AvatarCircle (1).tsx';
import { EmptyState } from '../components/shared/EmptyState (1)';

interface Conversation {
  id: string;
  question: { id: string; title: string };
  student: { id: string; fullName: string; profilePhoto?: string };
  advisor: { id: string; fullName: string; profilePhoto?: string };
  messages: { body: string; createdAt: string }[];
  unreadCount: number;
  updatedAt: string;
}

export default function MessagesPage() {
  const { currentUser, isAuthenticated } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    messageApi.listConversations()
      .then(r => setConversations(r.data.data.conversations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin" style={{ color: '#2C2C6E' }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-[22px] font-semibold mb-6" style={{ color: '#1A1A1A' }}>Messages</h1>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={32} style={{ color: '#888780' }} />}
          heading="No conversations yet"
          message="When you message an advisor after they respond to your question, it will appear here."
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const other = currentUser?.id === c.student.id ? c.advisor : c.student;
            const lastMessage = c.messages[0];
            const hasUnread = c.unreadCount > 0;

            return (
              <Link
                key={c.id}
                to={`/messages/${c.id}`}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border transition-colors hover:border-[#2C2C6E]/30"
                style={{ borderColor: hasUnread ? '#2C2C6E' : '#DEDEDE', backgroundColor: hasUnread ? '#FAFAFE' : '#fff' }}
              >
                <AvatarCircle name={other.fullName} size="card" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-[14px] ${hasUnread ? 'font-semibold' : 'font-medium'}`} style={{ color: '#1A1A1A' }}>
                      {other.fullName}
                    </span>
                    <span className="text-[11px] flex-shrink-0" style={{ color: '#888780' }}>
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[12px] truncate mb-1" style={{ color: '#888780' }}>
                    Re: {c.question.title}
                  </p>
                  {lastMessage && (
                    <p className={`text-[13px] truncate ${hasUnread ? 'font-medium' : ''}`} style={{ color: hasUnread ? '#1A1A1A' : '#5F5E5A' }}>
                      {lastMessage.body}
                    </p>
                  )}
                </div>
                {hasUnread && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#2C2C6E' }}>
                    {c.unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
