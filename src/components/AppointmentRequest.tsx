/**
 * AppointmentRequest - Formulaire simple de demande de rendez-vous
 * 
 * Le client remplit un formulaire avec le motif et un message optionnel.
 * Le consultant voit la demande dans son dashboard et contacte le client.
 * Pas de calendrier, pas de créneaux automatiques.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Calendar, Send, Clock, CheckCircle, XCircle, MessageSquare, Loader2 } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface AppointmentRequestProps {
  user: User;
  userName: string;
}

interface AppointmentRequestData {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  reason: string;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  consultant_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// COMPOSANT
// ============================================

const AppointmentRequest: React.FC<AppointmentRequestProps> = ({ user, userName }) => {
  const { t } = useTranslation('appointments');
  
  // État du formulaire
  const [reason, setReason] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Demandes existantes
  const [myRequests, setMyRequests] = useState<AppointmentRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les demandes existantes du client
  useEffect(() => {
    loadMyRequests();
  }, [user.id]);

  const loadMyRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const { error } = await supabase
        .from('appointment_requests')
        .insert({
          client_id: user.id,
          client_name: userName || user.email?.split('@')[0] || 'Client',
          client_email: user.email || '',
          reason: reason.trim(),
          preferred_date: preferredDate || null,
          preferred_time: preferredTime || null,
          message: message.trim() || null,
        });

      if (error) throw error;

      setSubmitSuccess(true);
      setReason('');
      setPreferredDate('');
      setPreferredTime('');
      setMessage('');
      
      // Recharger les demandes
      await loadMyRequests();
      
      // Reset success après 3s
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error submitting request:', err);
      setSubmitError(err.message || t('form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock size={14} />, label: t('status.pending') },
      contacted: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <MessageSquare size={14} />, label: t('status.contacted') },
      scheduled: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <Calendar size={14} />, label: t('status.scheduled') },
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle size={14} />, label: t('status.completed') },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle size={14} />, label: t('status.cancelled') },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  const reasons = [
    { value: 'initial_meeting', label: t('reasons.initial_meeting') },
    { value: 'progress_review', label: t('reasons.progress_review') },
    { value: 'career_guidance', label: t('reasons.career_guidance') },
    { value: 'document_review', label: t('reasons.document_review') },
    { value: 'synthesis_discussion', label: t('reasons.synthesis_discussion') },
    { value: 'other', label: t('reasons.other') },
  ];

  return (
    <div className="space-y-6">
      {/* Formulaire de demande */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="text-indigo-600 dark:text-indigo-400" size={20} />
          {t('form.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('form.description')}
        </p>

        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">{t('form.success')}</span>
          </div>
        )}

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle size={18} />
            <span className="text-sm font-medium">{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('form.reason')} *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">{t('form.select_reason')}</option>
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Date et heure préférées (optionnel) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.preferred_date')}
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.preferred_time')}
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">{t('form.select_time')}</option>
                <option value="morning">{t('form.morning')}</option>
                <option value="afternoon">{t('form.afternoon')}</option>
                <option value="evening">{t('form.evening')}</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('form.message')}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={t('form.message_placeholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={isSubmitting || !reason}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> {t('form.submitting')}</>
            ) : (
              <><Send size={18} /> {t('form.submit')}</>
            )}
          </button>
        </form>
      </div>

      {/* Mes demandes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('my_requests.title')}
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
          </div>
        ) : myRequests.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            {t('my_requests.empty')}
          </p>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {reasons.find(r => r.value === req.reason)?.label || req.reason}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    {req.preferred_date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('my_requests.preferred')}: {new Date(req.preferred_date).toLocaleDateString()} 
                        {req.preferred_time && ` - ${t(`form.${req.preferred_time}`)}`}
                      </p>
                    )}
                    {req.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {req.message}
                      </p>
                    )}
                    {req.consultant_notes && (
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1 italic">
                        {t('my_requests.consultant_note')}: {req.consultant_notes}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentRequest;
