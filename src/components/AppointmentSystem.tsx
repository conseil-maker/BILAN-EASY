import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { organizationConfig } from '../config/organization';

// Types
interface TimeSlot {
  id: string;
  date: string;
  time: string;
  duration: number; // en minutes
  isAvailable: boolean;
  consultantId?: string;
  consultantName?: string;
}

interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  duration: number;
  type: 'initial' | 'followup' | 'synthesis' | 'phone';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  consultantId: string;
  consultantName: string;
  notes?: string;
  createdAt: string;
}

interface AppointmentSystemProps {
  userId: string;
  userName: string;
  userEmail: string;
  mode: 'client' | 'consultant';
  onAppointmentBooked?: (appointment: Appointment) => void;
}

// Constantes
const APPOINTMENT_TYPES = [
  { id: 'initial', label: 'Entretien initial', duration: 60, description: 'Premier rendez-vous de découverte' },
  { id: 'followup', label: 'Suivi', duration: 45, description: 'Point d\'avancement du bilan' },
  { id: 'synthesis', label: 'Synthèse', duration: 90, description: 'Présentation du document de synthèse' },
  { id: 'phone', label: 'Appel téléphonique', duration: 30, description: 'Échange rapide par téléphone' },
];

const WORKING_HOURS = {
  start: 9,
  end: 18,
  lunchStart: 12,
  lunchEnd: 14,
};

// Génération des créneaux disponibles
const generateTimeSlots = (date: Date, existingAppointments: Appointment[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dateStr = date.toISOString().split('T')[0];
  
  // Vérifier si c'est un jour ouvré (lundi-vendredi)
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return slots;
  
  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    // Pause déjeuner
    if (hour >= WORKING_HOURS.lunchStart && hour < WORKING_HOURS.lunchEnd) continue;
    
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Vérifier si le créneau est déjà pris
      const isBooked = existingAppointments.some(
        apt => apt.date === dateStr && apt.time === timeStr && apt.status !== 'cancelled'
      );
      
      slots.push({
        id: `${dateStr}-${timeStr}`,
        date: dateStr,
        time: timeStr,
        duration: 30,
        isAvailable: !isBooked,
        consultantName: organizationConfig.defaultConsultant.name,
      });
    }
  }
  
  return slots;
};

// Composant Calendrier
const Calendar: React.FC<{
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  appointments: Appointment[];
}> = ({ selectedDate, onDateSelect, appointments }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Jours vides avant le premier jour du mois
  for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }
  
  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const isPast = date < today;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Compter les RDV ce jour
    const dateStr = date.toISOString().split('T')[0];
    const dayAppointments = appointments.filter(apt => apt.date === dateStr);
    
    days.push(
      <button
        key={day}
        onClick={() => !isPast && !isWeekend && onDateSelect(date)}
        disabled={isPast || isWeekend}
        className={`
          h-10 w-10 rounded-full flex items-center justify-center text-sm relative
          ${isSelected ? 'bg-indigo-600 text-white' : ''}
          ${isToday && !isSelected ? 'ring-2 ring-indigo-400' : ''}
          ${isPast || isWeekend ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-indigo-100'}
          ${!isSelected && !isPast && !isWeekend ? 'text-gray-700' : ''}
        `}
      >
        {day}
        {dayAppointments.length > 0 && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </button>
    );
  }
  
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          ←
        </button>
        <h3 className="font-semibold text-gray-800 dark:text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          →
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

// Composant principal
export const AppointmentSystem: React.FC<AppointmentSystemProps> = ({
  userId,
  userName,
  userEmail,
  mode,
  onAppointmentBooked
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedType, setSelectedType] = useState(APPOINTMENT_TYPES[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<'book' | 'upcoming' | 'history'>('book');

  // Charger les rendez-vous existants
  useEffect(() => {
    loadAppointments();
  }, [userId]);

  // Générer les créneaux quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate, appointments);
      setTimeSlots(slots);
    }
  }, [selectedDate, appointments]);

  const loadAppointments = async () => {
    // Simulation - à remplacer par appel Supabase
    const mockAppointments: Appointment[] = [];
    setAppointments(mockAppointments);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot) return;
    
    setIsLoading(true);
    
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      userId,
      userName,
      userEmail,
      date: selectedSlot.date,
      time: selectedSlot.time,
      duration: selectedType.duration,
      type: selectedType.id as Appointment['type'],
      status: 'pending',
      consultantId: 'consultant-1',
      consultantName: organizationConfig.defaultConsultant.name,
      notes,
      createdAt: new Date().toISOString(),
    };
    
    // Sauvegarder en base (simulation)
    setAppointments([...appointments, newAppointment]);
    setShowConfirmation(true);
    
    if (onAppointmentBooked) {
      onAppointmentBooked(newAppointment);
    }
    
    setIsLoading(false);
    setSelectedSlot(null);
    setNotes('');
  };

  const upcomingAppointments = appointments.filter(
    apt => new Date(`${apt.date}T${apt.time}`) >= new Date() && apt.status !== 'cancelled'
  );

  const pastAppointments = appointments.filter(
    apt => new Date(`${apt.date}T${apt.time}`) < new Date() || apt.status === 'completed'
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold mb-2">📅 Prendre rendez-vous</h1>
        <p className="opacity-90">
          Planifiez vos entretiens avec {organizationConfig.defaultConsultant.name}
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'book', label: 'Réserver', icon: '📅' },
          { id: 'upcoming', label: 'À venir', icon: '⏰', count: upcomingAppointments.length },
          { id: 'history', label: 'Historique', icon: '📋' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'book' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendrier */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
              1. Choisissez une date
            </h3>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              appointments={appointments}
            />
          </div>

          {/* Créneaux et type */}
          <div>
            {/* Type de rendez-vous */}
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
              2. Type de rendez-vous
            </h3>
            <div className="space-y-2 mb-6">
              {APPOINTMENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`
                    w-full p-3 rounded-lg border-2 text-left transition-all
                    ${selectedType.id === type.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-sm text-gray-500">{type.duration} min</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                </button>
              ))}
            </div>

            {/* Créneaux horaires */}
            {selectedDate && (
              <>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                  3. Choisissez un créneau
                </h3>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {timeSlots.filter(slot => slot.isAvailable).map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium transition-all
                        ${selectedSlot?.id === slot.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 hover:bg-indigo-100 text-gray-700'
                        }
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                  {timeSlots.filter(slot => slot.isAvailable).length === 0 && (
                    <p className="col-span-3 text-center text-gray-500 py-4">
                      Aucun créneau disponible ce jour
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Notes */}
            {selectedSlot && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Précisez l'objet de votre rendez-vous..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
            )}

            {/* Bouton de confirmation */}
            {selectedSlot && (
              <button
                onClick={handleBookAppointment}
                disabled={isLoading}
                className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Réservation en cours...' : 'Confirmer le rendez-vous'}
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <span className="text-4xl mb-4 block">📅</span>
              <p className="text-gray-500">Aucun rendez-vous à venir</p>
              <button
                onClick={() => setActiveTab('book')}
                className="mt-4 text-indigo-600 font-medium hover:underline"
              >
                Réserver un rendez-vous
              </button>
            </div>
          ) : (
            upcomingAppointments.map(apt => (
              <div key={apt.id} className="bg-white rounded-xl p-4 shadow-md border-l-4 border-indigo-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {APPOINTMENT_TYPES.find(t => t.id === apt.type)?.label}
                    </h4>
                    <p className="text-gray-600">
                      {new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {' à '}{apt.time}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Avec {apt.consultantName} • {apt.duration} min
                    </p>
                  </div>
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}
                  `}>
                    {apt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {pastAppointments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <span className="text-4xl mb-4 block">📋</span>
              <p className="text-gray-500">Aucun rendez-vous passé</p>
            </div>
          ) : (
            pastAppointments.map(apt => (
              <div key={apt.id} className="bg-gray-50 rounded-xl p-4 opacity-75">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-700">
                      {APPOINTMENT_TYPES.find(t => t.id === apt.type)?.label}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {new Date(apt.date).toLocaleDateString('fr-FR')} à {apt.time}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                    Terminé
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Rendez-vous réservé !
            </h2>
            <p className="text-gray-600 mb-4">
              Votre demande de rendez-vous a été envoyée. Vous recevrez une confirmation par email.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">
                <strong>Date :</strong> {selectedDate?.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Heure :</strong> {selectedSlot?.time}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Type :</strong> {selectedType.label}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Consultant :</strong> {organizationConfig.defaultConsultant.name}
              </p>
            </div>
            <button
              onClick={() => {
                setShowConfirmation(false);
                setSelectedDate(null);
              }}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentSystem;
