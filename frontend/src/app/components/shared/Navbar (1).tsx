import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, Menu, X, BookOpen, ChevronDown, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AvatarCircle } from './AvatarCircle (1).tsx';
import { notificationApi, messageApi } from '../../api';

export function Navbar() {
  const { currentUser, isAuthenticated, logout } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: string; isRead: boolean; timeAgo: string; questionId?: string }[]>([]);
  const [unread, setUnread] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchNotifications = () => {
    if (!isAuthenticated) return;
    notificationApi.getUnreadNotifications().then(res => {
      setNotifications(res.data.data.notifications ?? []);
      setUnread(res.data.data.unreadCount ?? 0);
    }).catch(() => {});
    messageApi.unreadCount().then(res => setUnreadMessages(res.data.data.unreadCount ?? 0)).catch(() => {});
  };

  useEffect(() => { fetchNotifications(); }, [isAuthenticated]);

  const openBell = () => {
    setBellOpen(v => {
      if (!v) {
        // Mark all as read when opening the dropdown
        notificationApi.markAllAsRead().then(() => {
          setUnread(0);
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }).catch(() => {});
      }
      return !v;
    });
    setAvatarOpen(false);
  };

  const notifTypeLabel: Record<string, string> = {
    MATCHED_QUESTION: '📌 New question match',
    NEW_RESPONSE: '💬 New response',
    RESPONSE_UPVOTED: '👍 Upvote received',
    VERIFICATION_APPROVED: '✅ Verification approved',
    VERIFICATION_REJECTED: '❌ Verification rejected',
    AUTO_FLAG_RESOLVED: '🔍 Flag resolved',
    RESPONSE_HIDDEN: '🚫 Response hidden',
    PRIVATE_MESSAGE: '📩 New message',
  };

  const avatarMenuItems = currentUser?.role === 'admin'
    ? [
        { label: 'Admin Panel', path: '/admin' },
        { label: 'My Profile', path: `/profile/${currentUser.id}` },
      ]
    : currentUser?.role === 'advisor'
    ? [
        { label: 'My Profile', path: `/profile/${currentUser?.id}` },
        { label: 'Dashboard', path: '/dashboard' },
      ]
    : [
        { label: 'My Profile', path: `/profile/${currentUser?.id}` },
        { label: 'My Questions', path: '/dashboard' },
      ];

  return (
    <nav className="sticky top-0 z-50 w-full" style={{ backgroundColor: '#2C2C6E' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white flex-shrink-0">
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-medium text-[15px] tracking-tight">PeerGuide</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/questions" className="text-white/80 hover:text-white text-[13px] transition-colors">Browse questions</Link>
          <Link to="/institutions" className="text-white/80 hover:text-white text-[13px] transition-colors">Institutions</Link>
          {!isAuthenticated && (
            <Link to="/register" className="text-white/80 hover:text-white text-[13px] transition-colors">Become an advisor</Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && currentUser ? (
            <>
              {/* Messages icon */}
              <Link
                to="/messages"
                className="relative p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Messages"
                onClick={() => { setBellOpen(false); setAvatarOpen(false); }}
              >
                <MessageSquare size={18} />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-medium text-white" style={{ backgroundColor: '#D85A30' }}>
                    {unreadMessages}
                  </span>
                )}
              </Link>

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={openBell}
                  className="relative p-2 text-white/80 hover:text-white transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-medium text-white" style={{ backgroundColor: '#D85A30' }}>
                      {unread}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-50" style={{ borderColor: '#DEDEDE' }}>
                    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#DEDEDE' }}>
                      <span className="text-[13px] font-medium" style={{ color: '#1A1A1A' }}>Notifications</span>
                      <Link to="/notifications" onClick={() => setBellOpen(false)} className="text-[12px] hover:underline" style={{ color: '#2C2C6E' }}>See all</Link>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="px-4 py-6 text-center text-[12px]" style={{ color: '#888780' }}>No notifications yet</p>
                      )}
                      {notifications.slice(0, 5).map(n => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b last:border-0 ${!n.isRead ? 'bg-[#EEEDFE]/30' : ''}`}
                          style={{ borderColor: '#DEDEDE' }}
                        >
                          {notifTypeLabel[n.type] && (
                            <p className="text-[10px] mb-0.5 font-medium" style={{ color: '#888780' }}>
                              {notifTypeLabel[n.type]}
                            </p>
                          )}
                          <p className={`text-[12px] leading-relaxed ${!n.isRead ? 'font-medium' : ''}`} style={{ color: '#1A1A1A' }}>
                            {n.message}
                          </p>
                          {n.questionId && (
                            <Link
                              to={`/questions/${n.questionId}`}
                              onClick={() => setBellOpen(false)}
                              className="text-[11px] hover:underline mt-0.5 inline-block"
                              style={{ color: '#2C2C6E' }}
                            >
                              View question →
                            </Link>
                          )}
                          <span className="text-[11px] block mt-0.5" style={{ color: '#888780' }}>{n.timeAgo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setAvatarOpen(v => !v); setBellOpen(false); }}
                  className="flex items-center gap-1.5 p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <AvatarCircle name={currentUser.name} size="nav" />
                  <ChevronDown size={12} className="text-white/70 hidden sm:block" />
                </button>

                {avatarOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border overflow-hidden z-50" style={{ borderColor: '#DEDEDE' }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: '#DEDEDE' }}>
                      <p className="text-[13px] font-medium truncate" style={{ color: '#1A1A1A' }}>{currentUser.name}</p>
                      <p className="text-[11px] capitalize" style={{ color: '#888780' }}>{currentUser.role}</p>
                    </div>
                    {avatarMenuItems.map(item => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setAvatarOpen(false)}
                        className="block px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors"
                        style={{ color: '#1A1A1A' }}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t" style={{ borderColor: '#DEDEDE' }}>
                      <button
                        onClick={() => { logout(); setAvatarOpen(false); navigate('/'); }}
                        className="block w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors"
                        style={{ color: '#D85A30' }}
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 text-[13px] text-white border border-white/40 rounded hover:bg-white/10 transition-colors">
                Log in
              </Link>
              <Link to="/register" className="px-3 py-1.5 text-[13px] font-medium text-[#2C2C6E] bg-white rounded hover:bg-white/90 transition-colors">
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 text-white/80 hover:text-white">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1e1e52] border-t border-white/10">
          <div className="px-4 py-3 flex flex-col gap-1">
            <Link to="/questions" onClick={() => setMenuOpen(false)} className="text-white/80 text-[13px] py-2 border-b border-white/10">Browse questions</Link>
            <Link to="/institutions" onClick={() => setMenuOpen(false)} className="text-white/80 text-[13px] py-2 border-b border-white/10">Institutions</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-white/80 text-[13px] py-2 border-b border-white/10">Dashboard</Link>
                <Link to="/messages" onClick={() => setMenuOpen(false)} className="text-white/80 text-[13px] py-2 border-b border-white/10">Messages</Link>
                <Link to="/notifications" onClick={() => setMenuOpen(false)} className="text-white/80 text-[13px] py-2 border-b border-white/10">Notifications</Link>
                {currentUser?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-white/80 text-[13px] py-2 border-b border-white/10">Admin Panel</Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="text-left text-[13px] py-2" style={{ color: '#D85A30' }}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-white/80 text-[13px] py-2 border-b border-white/10">Log in</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="text-white/80 text-[13px] py-2">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

