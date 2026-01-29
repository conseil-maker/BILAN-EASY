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
  isCompleted: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer les informations du forfait de l'utilisateur
 * depuis Supabase (session active ou dernier bilan)
 */
export const useUserPackage = (userId: string | undefined): UserPackageInfo => {
  const [packageInfo, setPackageInfo] = useState<UserPackageInfo>({
    packageId: 'test',
    packageName: 'Forfait Test',
    packageDuration: 2,
    packagePrice: 0,
    startDate: new Date().toLocaleDateString('fr-FR'),
    isCompleted: false,
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
        // 1. D'abord chercher dans user_sessions (session active)
        const { data: sessionData, error: sessionError } = await supabase
          .from('user_sessions')
          .select('selected_package_id, start_date, updated_at')
          .eq('user_id', userId)
          .single();

        if (sessionData?.selected_package_id) {
          const pkg = PACKAGES.find(p => p.id === sessionData.selected_package_id);
          if (pkg) {
            setPackageInfo({
              packageId: pkg.id,
              packageName: pkg.name,
              packageDuration: pkg.totalHours,
              packagePrice: getPackagePrice(pkg.name),
              startDate: sessionData.start_date 
                ? new Date(sessionData.start_date).toLocaleDateString('fr-FR')
                : new Date().toLocaleDateString('fr-FR'),
              isCompleted: false,
              loading: false,
              error: null,
            });
            return;
          }
        }

        // 2. Sinon chercher dans assessments (bilans terminés ou en cours)
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('package_name, created_at, status')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (assessmentData?.package_name) {
          const pkg = PACKAGES.find(p => 
            p.name.toLowerCase().includes(assessmentData.package_name.toLowerCase()) ||
            assessmentData.package_name.toLowerCase().includes(p.id)
          );
          
          setPackageInfo({
            packageId: pkg?.id || 'essentiel',
            packageName: assessmentData.package_name,
            packageDuration: getPackageDuration(assessmentData.package_name),
            packagePrice: getPackagePrice(assessmentData.package_name),
            startDate: assessmentData.created_at 
              ? new Date(assessmentData.created_at).toLocaleDateString('fr-FR')
              : new Date().toLocaleDateString('fr-FR'),
            isCompleted: assessmentData.status === 'completed',
            loading: false,
            error: null,
          });
          return;
        }

        // 3. Valeurs par défaut si rien trouvé
        setPackageInfo({
          packageId: 'test',
          packageName: 'Forfait Test',
          packageDuration: 2,
          packagePrice: 0,
          startDate: new Date().toLocaleDateString('fr-FR'),
          isCompleted: false,
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
