import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastProvider';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/authService';

interface Note {
  id: string;
  content: string;
  created_at: string;
  consultant_id: string;
}

interface ConsultantNotesProps {
  assessmentId: string;
}

export const ConsultantNotes: React.FC<ConsultantNotesProps> = ({ assessmentId }) => {
  const { t } = useTranslation('consultant');
  const { showError } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [assessmentId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      
      // Récupérer les notes depuis le champ consultant_notes de l'assessment
      const { data, error } = await supabase
        .from('assessments')
        .select('consultant_notes')
        .eq('id', assessmentId)
        .single();
      
      if (error) throw error;
      
      // Les notes sont stockées comme un tableau JSON
      setNotes(data.consultant_notes || []);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setSaving(true);
      const user = await authService.getCurrentUser();
      
      if (!user) throw new Error('Utilisateur non connecté');

      const note: Note = {
        id: new Date().toISOString(),
        content: newNote.trim(),
        created_at: new Date().toISOString(),
        consultant_id: user.id
      };

      const updatedNotes = [note, ...notes];

      // Mettre à jour les notes dans Supabase
      const { error } = await supabase
        .from('assessments')
        .update({ consultant_notes: updatedNotes })
        .eq('id', assessmentId);
      
      if (error) throw error;

      setNotes(updatedNotes);
      setNewNote('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error);
      showError('Erreur lors de l\'ajout de la note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    try {
      const updatedNotes = notes.filter(n => n.id !== noteId);

      const { error } = await supabase
        .from('assessments')
        .update({ consultant_notes: updatedNotes })
        .eq('id', assessmentId);
      
      if (error) throw error;

      setNotes(updatedNotes);
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
      showError('Erreur lors de la suppression de la note');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4">{t('notes.title')}</h3>
      
      {/* Formulaire d'ajout de note */}
      <div className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={t('notes.placeholder')}
          className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
          rows={4}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || saving}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {saving ? t('notes.saving') : t('notes.addNote')}
          </button>
        </div>
      </div>

      {/* Liste des notes */}
      {notes.length === 0 ? (
        <p className="text-slate-500 text-center py-4">{t('notes.noNotes')}</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-slate-500">
                  {new Date(note.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  {t('notes.delete')}
                </button>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
