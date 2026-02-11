import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PACKAGES } from '../constants';
import { getPackagePrice, getPackageDuration } from '../config/organization';

export interface UserPackageInfo {
  packageId: string;
  packageName: string;
  packageDuration: number;
  packagePrice: number;
  startDate: string;
  endDate?: string;
  isCompleted: boolean;
  summary: any | null;
  answers: any[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer les informations du forfait de l'utilisateur
 * depuis Supabase (session active + dernier bilan complété)
 * 
 * Logique :
 * 1. Chercher un assessment complété (prioritaire pour les documents)
 * 2. Si pas de bilan complété, chercher la session active
 * 3. Combiner les deux sources pour avoir toutes les infos
 * 
 * IMPORTANT: La table assessments utilise `client_id` (pas `user_id`)
 * IMPORTANT: La table user_sessions utilise `current_answers` (pas `session_data`)
 */
export const useUserPackage = (userId: string | undefined): UserPackageInfo => {
  const [packageInfo, setPackageInfo] = useState<UserPackageInfo>({
    packageId: 'test',
    packageName: 'Forfait Test',
    packageDuration: 2,
    packagePrice: 0,
    startDate: new Date().toLocaleDateString('fr-FR'),
    isCompleted: false,
    summary: null,
    answers: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setPackageInfo(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchPackageInfo = async () => {
      try {
        // 1. D'abord chercher le dernier assessment complété (pour les documents)
        const { data: completedAssessment, error: assessmentError } = await supabase
          .from('assessments')
          .select('id, package_name, status, created_at, completed_at, summary, answers')
          .eq('client_id', userId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('[useUserPackage] Assessment complété:', completedAssessment ? { 
          id: completedAssessment.id, 
          status: completedAssessment.status, 
          package: completedAssessment.package_name, 
          hasSummary: !!completedAssessment.summary, 
          hasAnswers: !!completedAssessment.answers,
          answersCount: Array.isArray(completedAssessment.answers) ? completedAssessment.answers.length : 0
        } : 'AUCUN', 'Error:', assessmentError);

        // 2. Chercher aussi la session active (pour le forfait en cours et les answers)
        const { data: sessionData, error: sessionError } = await supabase
          .from('user_sessions')
          .select('selected_package_id, start_date, updated_at, current_answers, app_state, current_phase, progress')
          .eq('user_id', userId)
          .maybeSingle();

        console.log('[useUserPackage] Session active:', sessionData ? { 
          packageId: sessionData.selected_package_id, 
          startDate: sessionData.start_date,
          appState: sessionData.app_state,
          phase: sessionData.current_phase,
          progress: sessionData.progress,
          hasAnswers: !!sessionData.current_answers,
          answersCount: Array.isArray(sessionData.current_answers) ? sessionData.current_answers.length : 0
        } : 'AUCUNE', 'Error:', sessionError);

        // 3. Si on a un assessment complété, l'utiliser en priorité
        if (completedAssessment && completedAssessment.status === 'completed') {
          const pkg = PACKAGES.find(p => 
            p.name.toLowerCase().includes((completedAssessment.package_name || '').toLowerCase()) ||
            (completedAssessment.package_name || '').toLowerCase().includes(p.id)
          );

          // Récupérer les answers depuis l'assessment ou la session
          let assessmentAnswers = completedAssessment.answers || [];
          let assessmentSummary = completedAssessment.summary || null;
          
          // Si les answers ne sont pas dans l'assessment, essayer depuis la session
          if ((!Array.isArray(assessmentAnswers) || assessmentAnswers.length === 0) && sessionData?.current_answers) {
            if (Array.isArray(sessionData.current_answers)) {
              assessmentAnswers = sessionData.current_answers;
            }
          }

          console.log('[useUserPackage] → Bilan COMPLÉTÉ trouvé, isCompleted=true, answers:', assessmentAnswers.length);

          setPackageInfo({
            packageId: pkg?.id || 'test',
            packageName: completedAssessment.package_name || pkg?.name || 'Bilan',
            packageDuration: pkg?.totalHours || getPackageDuration(completedAssessment.package_name || ''),
            packagePrice: getPackagePrice(completedAssessment.package_name || pkg?.name || ''),
            startDate: completedAssessment.created_at
              ? new Date(completedAssessment.created_at).toLocaleDateString('fr-FR')
              : new Date().toLocaleDateString('fr-FR'),
            endDate: completedAssessment.completed_at
              ? new Date(completedAssessment.completed_at).toLocaleDateString('fr-FR')
              : new Date().toLocaleDateString('fr-FR'),
            isCompleted: true,
            summary: assessmentSummary,
            answers: assessmentAnswers,
            loading: false,
            error: null,
          });
          return;
        }

        // 4. Si pas de bilan complété mais session en état 'completion' ou 'summary'
        // → Le bilan est terminé côté UI mais l'assessment n'a pas été sauvegardé correctement
        if (sessionData?.app_state === 'completion' || sessionData?.app_state === 'summary') {
          const pkg = PACKAGES.find(p => p.id === sessionData.selected_package_id);
          
          // Récupérer les answers depuis la session
          let sessionAnswers: any[] = [];
          if (sessionData.current_answers && Array.isArray(sessionData.current_answers)) {
            sessionAnswers = sessionData.current_answers;
          }

          console.log('[useUserPackage] → Session en état completion/summary, isCompleted=true (fallback), answers:', sessionAnswers.length);

          setPackageInfo({
            packageId: pkg?.id || sessionData.selected_package_id || 'test',
            packageName: pkg?.name || 'Bilan',
            packageDuration: pkg?.totalHours || 2,
            packagePrice: getPackagePrice(pkg?.name || ''),
            startDate: sessionData.start_date 
              ? (sessionData.start_date.includes('/') ? sessionData.start_date : new Date(sessionData.start_date).toLocaleDateString('fr-FR'))
              : new Date().toLocaleDateString('fr-FR'),
            isCompleted: true,
            summary: null, // La synthèse n'est pas dans la session, elle sera régénérée
            answers: sessionAnswers,
            loading: false,
            error: null,
          });
          return;
        }

        // 5. Utiliser la session active si disponible (bilan en cours)
        if (sessionData?.selected_package_id) {
          const pkg = PACKAGES.find(p => p.id === sessionData.selected_package_id);
          if (pkg) {
            let sessionAnswers: any[] = [];
            if (sessionData.current_answers && Array.isArray(sessionData.current_answers)) {
              sessionAnswers = sessionData.current_answers;
            }

            console.log('[useUserPackage] → Session active en cours, isCompleted=false, answers:', sessionAnswers.length);

            setPackageInfo({
              packageId: pkg.id,
              packageName: pkg.name,
              packageDuration: pkg.totalHours,
              packagePrice: getPackagePrice(pkg.name),
              startDate: sessionData.start_date 
                ? (sessionData.start_date.includes('/') ? sessionData.start_date : new Date(sessionData.start_date).toLocaleDateString('fr-FR'))
                : new Date().toLocaleDateString('fr-FR'),
              isCompleted: false,
              summary: null,
              answers: sessionAnswers,
              loading: false,
              error: null,
            });
            return;
          }
        }

        // 6. Valeurs par défaut si rien trouvé
        console.log('[useUserPackage] → Rien trouvé, valeurs par défaut');
        setPackageInfo({
          packageId: 'test',
          packageName: 'Forfait Test',
          packageDuration: 2,
          packagePrice: 0,
          startDate: new Date().toLocaleDateString('fr-FR'),
          isCompleted: false,
          summary: null,
          answers: [],
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('[useUserPackage] Error:', error);
        setPackageInfo(prev => ({
          ...prev,
          loading: false,
          error: 'Erreur lors de la récupération du forfait',
        }));
      }
    };

    fetchPackageInfo();
  }, [userId]);

  return packageInfo;
};

export default useUserPackage;
