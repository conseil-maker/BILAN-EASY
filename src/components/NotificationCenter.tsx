import React, { useState, useEffect, useRef } from 'react';
import { notificationService, Notification, Reminder } from '../services/notificationService';

interface NotificationCenterProps {
  userId: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'reminders'>('notifications');
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    
    // Écouter les nouvelles notifications
    const handleNewNotification = () => {
      loadData();
    };
    window.addEventListener('notification:new', handleNewNotification);
    
    return () => {
      window.removeEventListener('notification:new', handleNewNotification);
    };
  }, [userId]);

  useEffect(() => {
    // Fermer le dropdown quand on clique à l'extérieur
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = () => {
    const notifs = notificationService.getLocalNotifications(userId);
    const rems = notificationService.getUpcomingReminders(userId);
    setNotifications(notifs);
    setReminders(rems);
    setUnreadCount(notificationService.getUnreadCount(userId));
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(userId, notificationId);
    loadData();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(userId);
    loadData();
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(userId, notificationId);
    loadData();
  };

  const handleCompleteReminder = (reminderId: string) => {
    notificationService.completeReminder(userId, reminderId);
    loadData();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <span className="text-green-500">✓</span>;
      case 'warning':
        return <span className="text-orange-500">⚠</span>;
      case 'reminder':
        return <span className="text-blue-500">🔔</span>;
      default:
        return <span className="text-indigo-500">ℹ</span>;
    }
  };

  const getReminderIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'follow_up':
        return '🔄';
      case 'document':
        return '📄';
      case 'deadline':
        return '⏰';
      default:
        return '📌';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);

    if (days < 0) return 'En retard';
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Demain';
    if (days < 7) return `Dans ${days} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'reminders'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Rappels
                {reminders.length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                    {reminders.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'notifications' && (
              <>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          !notification.read ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm ${!notification.read ? 'font-semibold' : ''} text-slate-900 dark:text-white`}>
                                {notification.title}
                              </p>
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-slate-400 hover:text-red-500 flex-shrink-0"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-400">
                                {formatDate(notification.createdAt)}
                              </span>
                              <div className="flex gap-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                  >
                                    Marquer comme lu
                                  </button>
                                )}
                                {notification.actionUrl && (
                                  <a
                                    href={notification.actionUrl}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                                  >
                                    {notification.actionLabel || 'Voir'}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'reminders' && (
              <>
                {reminders.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Aucun rappel à venir</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {reminders.map(reminder => (
                      <div
                        key={reminder.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                            <span>{getReminderIcon(reminder.type)}</span>
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {reminder.title}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                new Date(reminder.dueDate) < new Date()
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              }`}>
                                {formatDueDate(reminder.dueDate)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {reminder.description}
                            </p>
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => handleCompleteReminder(reminder.id)}
                                className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 font-medium flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Marquer comme fait
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <a
              href="#/notifications"
              className="block text-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
            >
              Voir toutes les notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
