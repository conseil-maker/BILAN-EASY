/**
 * BadgeNotification - Composant d'affichage des badges débloqués
 * 
 * Affiche une notification animée avec confettis lorsqu'un badge est débloqué
 * après la complétion d'une phase du bilan.
 * 
 * @author Manus AI
 * @date 22 janvier 2026
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Confetti from '../Confetti';

interface BadgeNotificationProps {
  phaseName: string;
  onClose: () => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ phaseName, onClose }) => {
  const { t } = useTranslation('questionnaire');
  const [showConfetti, setShowConfetti] = useState(true);
  
  useEffect(() => {
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
    const badgeTimer = setTimeout(onClose, 4000);
    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(badgeTimer);
    };
  }, [onClose]);

  return (
    <>
      {showConfetti && <Confetti duration={3000} />}
      <div className="fixed top-5 right-5 bg-gradient-to-r from-secondary to-primary-600 text-white p-6 rounded-xl shadow-2xl animate-fade-in-down z-50 border-2 border-white/30">
        <p className="font-bold text-xl mb-1">🎉 {t('badge.unlocked')}</p>
        <p className="text-white/90">{t('badge.completed', { phase: phaseName })}</p>
      </div>
    </>
  );
};

export default BadgeNotification;
