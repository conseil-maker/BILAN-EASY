import { supabase } from '../lib/supabaseClient';

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface Reminder {
  id: string;
  userId: string;
  type: 'appointment' | 'follow_up' | 'document' | 'deadline';
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

// Types de notifications prédéfinis
export const NOTIFICATION_TYPES = {
  BILAN_STARTED: {
    type: 'info' as const,
    title: 'Bilan démarré',
    template: (userName: string) => `${userName} a commencé son bilan de compétences.`
  },
  BILAN_COMPLETED: {
    type: 'success' as const,
    title: 'Bilan terminé',
    template: (userName: string) => `${userName} a terminé son bilan de compétences.`
  },
  DOCUMENT_READY: {
    type: 'success' as const,
    title: 'Document disponible',
    template: (docType: string) => `Votre ${docType} est prêt à être téléchargé.`
  },
  APPOINTMENT_REMINDER: {
    type: 'reminder' as const,
    title: 'Rappel de rendez-vous',
    template: (date: string, time: string) => `N'oubliez pas votre rendez-vous le ${date} à ${time}.`
  },
  FOLLOW_UP_6_MONTHS: {
    type: 'reminder' as const,
    title: 'Suivi à 6 mois',
    template: (userName: string) => `Il est temps de planifier le suivi à 6 mois avec ${userName}.`
  },
  INACTIVITY_WARNING: {
    type: 'warning' as const,
    title: 'Client inactif',
    template: (userName: string, days: number) => `${userName} n'a pas eu d'activité depuis ${days} jours.`
  },
  NEW_CLIENT_ASSIGNED: {
    type: 'info' as const,
    title: 'Nouveau client',
    template: (userName: string) => `Un nouveau client vous a été assigné : ${userName}.`
  },
  SATISFACTION_RECEIVED: {
    type: 'success' as const,
    title: 'Avis reçu',
    template: (rating: number) => `Un client a laissé un avis de ${rating}/5.`
  }
};

class NotificationService {
  // Créer une notification
  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    actionUrl?: string,
    actionLabel?: string
  ): Promise<Notification | null> {
    try {
      // Pour l'instant, on stocke en localStorage car la table n'existe pas encore
      const notifications = this.getLocalNotifications(userId);
      const newNotification: Notification = {
        id: crypto.randomUUID(),
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl,
        actionLabel
      };
      
      notifications.unshift(newNotification);
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications.slice(0, 50)));
      
      // Déclencher un événement personnalisé pour mettre à jour l'UI
      window.dispatchEvent(new CustomEvent('notification:new', { detail: newNotification }));
      
      return newNotification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      return null;
    }
  }

  // Récupérer les notifications d'un utilisateur
  getLocalNotifications(userId: string): Notification[] {
    try {
      const stored = localStorage.getItem(`notifications_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Marquer une notification comme lue
  markAsRead(userId: string, notificationId: string): void {
    const notifications = this.getLocalNotifications(userId);
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications[index].read = true;
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
    }
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead(userId: string): void {
    const notifications = this.getLocalNotifications(userId);
    notifications.forEach(n => n.read = true);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  }

  // Supprimer une notification
  deleteNotification(userId: string, notificationId: string): void {
    const notifications = this.getLocalNotifications(userId);
    const filtered = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(filtered));
  }

  // Compter les notifications non lues
  getUnreadCount(userId: string): number {
    const notifications = this.getLocalNotifications(userId);
    return notifications.filter(n => !n.read).length;
  }

  // Créer un rappel
  async createReminder(
    userId: string,
    type: Reminder['type'],
    title: string,
    description: string,
    dueDate: string
  ): Promise<Reminder | null> {
    try {
      const reminders = this.getLocalReminders(userId);
      const newReminder: Reminder = {
        id: crypto.randomUUID(),
        userId,
        type,
        title,
        description,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      reminders.push(newReminder);
      localStorage.setItem(`reminders_${userId}`, JSON.stringify(reminders));
      
      return newReminder;
    } catch (error) {
      console.error('Erreur lors de la création du rappel:', error);
      return null;
    }
  }

  // Récupérer les rappels d'un utilisateur
  getLocalReminders(userId: string): Reminder[] {
    try {
      const stored = localStorage.getItem(`reminders_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Récupérer les rappels à venir
  getUpcomingReminders(userId: string, days: number = 7): Reminder[] {
    const reminders = this.getLocalReminders(userId);
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return reminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      return !r.completed && dueDate >= now && dueDate <= futureDate;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  // Marquer un rappel comme complété
  completeReminder(userId: string, reminderId: string): void {
    const reminders = this.getLocalReminders(userId);
    const index = reminders.findIndex(r => r.id === reminderId);
    if (index !== -1) {
      reminders[index].completed = true;
      localStorage.setItem(`reminders_${userId}`, JSON.stringify(reminders));
    }
  }

  // Vérifier et créer les rappels de suivi à 6 mois
  async checkFollowUpReminders(): Promise<void> {
    try {
      // Récupérer les bilans terminés il y a environ 6 mois
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*, profiles!assessments_user_id_fkey(full_name, email)')
        .eq('status', 'completed')
        .gte('completed_at', sixMonthsAgo.toISOString())
        .lte('completed_at', new Date(sixMonthsAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (assessments && assessments.length > 0) {
        // Créer des notifications pour les consultants
        for (const assessment of assessments) {
          const userName = assessment.profiles?.full_name || assessment.profiles?.email || 'Client';
          // Ici, on devrait récupérer le consultant assigné et lui envoyer une notification
          console.log(`Rappel de suivi à 6 mois pour ${userName}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des rappels:', error);
    }
  }

  // Envoyer une notification par email (placeholder)
  async sendEmailNotification(
    email: string,
    subject: string,
    body: string
  ): Promise<boolean> {
    // TODO: Intégrer avec un service d'email (SendGrid, Resend, etc.)
    console.log(`Email envoyé à ${email}: ${subject}`);
    return true;
  }

  // Notifications prédéfinies
  async notifyBilanStarted(consultantId: string, userName: string): Promise<void> {
    const { type, title, template } = NOTIFICATION_TYPES.BILAN_STARTED;
    await this.createNotification(consultantId, type, title, template(userName));
  }

  async notifyBilanCompleted(consultantId: string, userName: string): Promise<void> {
    const { type, title, template } = NOTIFICATION_TYPES.BILAN_COMPLETED;
    await this.createNotification(
      consultantId, 
      type, 
      title, 
      template(userName),
      '#/consultant/assessments',
      'Voir le bilan'
    );
  }

  async notifyDocumentReady(userId: string, docType: string): Promise<void> {
    const { type, title, template } = NOTIFICATION_TYPES.DOCUMENT_READY;
    await this.createNotification(
      userId, 
      type, 
      title, 
      template(docType),
      '#/mes-documents',
      'Télécharger'
    );
  }

  async notifyAppointmentReminder(userId: string, date: string, time: string): Promise<void> {
    const { type, title, template } = NOTIFICATION_TYPES.APPOINTMENT_REMINDER;
    await this.createNotification(userId, type, title, template(date, time));
  }

  async notifyInactivity(consultantId: string, userName: string, days: number): Promise<void> {
    const { type, title, template } = NOTIFICATION_TYPES.INACTIVITY_WARNING;
    await this.createNotification(consultantId, type, title, template(userName, days));
  }

  async notifyNewClientAssigned(consultantId: string, userName: string): Promise<void> {
    const { type, title, template } = NOTIFICATION_TYPES.NEW_CLIENT_ASSIGNED;
    await this.createNotification(consultantId, type, title, template(userName));
  }
}

export const notificationService = new NotificationService();
export default notificationService;
