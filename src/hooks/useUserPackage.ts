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
        const { data: completedAssessment } = await supabase
          .from('assessments')
          .select('id, package_name, status, created_at, completed_at, summary, answers')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // 2. Chercher aussi la session active (pour le forfait en cours)
        const { data: sessionData } = await supabase
          .from('user_sessions')
          .select('selected_package_id, start_date, updated_at, session_data')
          .eq('user_id', userId)
          .maybeSingle();

        // 3. Si on a un assessment complété, l'utiliser en priorité
        if (completedAssessment && completedAssessment.status === 'completed') {
          const pkg = PACKAGES.find(p => 
            p.name.toLowerCase().includes((completedAssessment.package_name || '').toLowerCase()) ||
            (completedAssessment.package_name || '').toLowerCase().includes(p.id)
          );

          // Essayer de récupérer les answers depuis l'assessment ou la session
          let assessmentAnswers = completedAssessment.answers || [];
          let assessmentSummary = completedAssessment.summary || null;
          
          // Si les answers ne sont pas dans l'assessment, essayer depuis la session
          if (assessmentAnswers.length === 0 && sessionData?.session_data) {
            try {
              const sessionParsed = typeof sessionData.session_data === 'string' 
                ? JSON.parse(sessionData.session_data) 
                : sessionData.session_data;
              if (sessionParsed?.answers && Array.isArray(sessionParsed.answers)) {
                assessmentAnswers = sessionParsed.answers;
              }
              if (!assessmentSummary && sessionParsed?.summary) {
                assessmentSummary = sessionParsed.summary;
              }
            } catch (e) {
              console.error('[useUserPackage] Erreur parsing session_data:', e);
            }
          }

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

        // 4. Si pas de bilan complété, chercher un assessment en cours
        const { data: inProgressAssessment } = await supabase
          .from('assessments')
          .select('id, package_name, status, created_at, summary, answers')
          .eq('user_id', userId)
          .neq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // 5. Utiliser la session active si disponible
        if (sessionData?.selected_package_id) {
          const pkg = PACKAGES.find(p => p.id === sessionData.selected_package_id);
          if (pkg) {
            // Récupérer les answers depuis la session
            let sessionAnswers: any[] = [];
            let sessionSummary: any = null;
            
            if (sessionData.session_data) {
              try {
                const sessionParsed = typeof sessionData.session_data === 'string'
                  ? JSON.parse(sessionData.session_data)
                  : sessionData.session_data;
                if (sessionParsed?.answers && Array.isArray(sessionParsed.answers)) {
                  sessionAnswers = sessionParsed.answers;
                }
                if (sessionParsed?.summary) {
                  sessionSummary = sessionParsed.summary;
                }
              } catch (e) {
                console.error('[useUserPackage] Erreur parsing session_data:', e);
              }
            }

            // Aussi vérifier l'assessment en cours pour les answers
            if (sessionAnswers.length === 0 && inProgressAssessment?.answers) {
              sessionAnswers = inProgressAssessment.answers;
            }

            setPackageInfo({
              packageId: pkg.id,
              packageName: pkg.name,
              packageDuration: pkg.totalHours,
              packagePrice: getPackagePrice(pkg.name),
              startDate: sessionData.start_date 
                ? new Date(sessionData.start_date).toLocaleDateString('fr-FR')
                : new Date().toLocaleDateString('fr-FR'),
              isCompleted: false,
              summary: sessionSummary,
              answers: sessionAnswers,
              loading: false,
              error: null,
            });
            return;
          }
        }

        // 6. Utiliser l'assessment en cours si pas de session
        if (inProgressAssessment?.package_name) {
          const pkg = PACKAGES.find(p => 
            p.name.toLowerCase().includes(inProgressAssessment.package_name.toLowerCase()) ||
            inProgressAssessment.package_name.toLowerCase().includes(p.id)
          );
          
          setPackageInfo({
            packageId: pkg?.id || 'essentiel',
            packageName: inProgressAssessment.package_name,
            packageDuration: getPackageDuration(inProgressAssessment.package_name),
            packagePrice: getPackagePrice(inProgressAssessment.package_name),
            startDate: inProgressAssessment.created_at 
              ? new Date(inProgressAssessment.created_at).toLocaleDateString('fr-FR')
              : new Date().toLocaleDateString('fr-FR'),
            isCompleted: false,
            summary: inProgressAssessment.summary || null,
            answers: inProgressAssessment.answers || [],
            loading: false,
            error: null,
          });
          return;
        }

        // 7. Valeurs par défaut si rien trouvé
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
