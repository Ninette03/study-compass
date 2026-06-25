import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Bell, MessageSquare, ThumbsUp, CheckCircle, Zap, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { notificationApi } from '../api';

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  questionId?: string;
  timeAgo?: string;
  createdAt?: string;
}

type FilterTab = 'All' | 'Unread' | 'Mentions' | 'Responses' | 'System';

const typeIcons: Record<string, React.ReactNode> = {
  response: <MessageSquare size={16} style={{ color: '#2C2C6E' }} />,
  upvote: <ThumbsUp size={16} style={{ color: '#0F6E56' }} />,
  verified: <CheckCircle size={16} style={{ color: '#0F6E56' }} />,
  match: <Zap size={16} style={{ color: '#B45309' }} />,
  system: <AlertCircle size={16} style={{ color: '#888780' }} />,
};

function NotificationItem({ notif, isRead }: { notif: Notification; isRead: boolean }) {
  const icon = typeIcons[notif.type] ?? <Bell size={16} />;

  return (
    <div className={`flex items-start gap-3 px-5 py-4 border-b last:border-0 transition-colors ${!isRead ? 'bg-[#EEEDFE]/20' : ''}`} style={{ borderColor: '#DEDEDE' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: !isRead ? '#EEEDFE' : '#F7F7FA' }}>
        {icon}
      </div>
      {!isRead && <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#2C2C6E' }} />}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] leading-relaxed ${!isRead ? 'font-medium' : ''}`} style={{ color: '#1A1A1A' }}>
          {notif.message}
        </p>
        {notif.questionId && (
          <Link to={`/questions/${notif.questionId}`} className="text-[12px] hover:underline mt-0.5 inline-block" style={{ color: '#2C2C6E' }}>
            View question →
          </Link>
        )}
      </div>
      <span className="text-[12px] flex-shrink-0 mt-0.5" style={{ color: '#888780' }}>{notif.timeAgo}</span>
    </div>
  );
}

export default function NotificationsPage() {
  const { isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    notificationApi.getUnreadNotifications().then(res => {
      const notifs: Notification[] = res.data.data.notifications ?? [];
      setNotifications(notifs);
      setReadIds(notifs.filter(n => n.isRead).map(n => n.id));
    }).catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[15px]" style={{ color: '#5F5E5A' }}>You need to be logged in to view notifications.</p>
        <Link to="/login" className="px-5 py-2.5 rounded-lg font-medium text-white text-[13px]" style={{ backgroundColor: '#2C2C6E' }}>Log in</Link>
      </div>
    );
  }

  const tabs: FilterTab[] = ['All', 'Unread', 'Mentions', 'Responses', 'System'];

  const filtered = notifications.filter(n => {
    if (activeTab === 'Unread') return !readIds.includes(n.id);
    if (activeTab === 'Responses') return n.type === 'response';
    if (activeTab === 'System') return n.type === 'system' || n.type === 'verified';
    return true;
  });

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const markAllRead = () => {
    notificationApi.markAllAsRead().catch(() => {});
    setReadIds(notifications.map(n => n.id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="flex items-center gap-2" style={{ fontSize: '24px', fontWeight: 500, color: '#1A1A1A' }}>
          Notifications
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[12px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[13px] hover:underline" style={{ color: '#2C2C6E' }}>Mark all as read</button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl border p-1" style={{ borderColor: '#DEDEDE' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-[12px] transition-colors"
            style={{
              backgroundColor: activeTab === tab ? '#2C2C6E' : 'transparent',
              color: activeTab === tab ? '#fff' : '#5F5E5A',
              fontWeight: activeTab === tab ? 500 : 400,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DEDEDE' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#EEEDFE' }}>
              <Bell size={24} style={{ color: '#2C2C6E' }} />
            </div>
            <p className="text-[14px] font-medium mb-1" style={{ color: '#1A1A1A' }}>You're all caught up.</p>
            <p className="text-[13px]" style={{ color: '#888780' }}>No notifications in this category.</p>
          </div>
        ) : (
          filtered.map(n => (
            <NotificationItem
              key={n.id}
              notif={n}
              isRead={readIds.includes(n.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
