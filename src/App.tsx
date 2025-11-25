import React from 'react';
import { User } from '@supabase/supabase-js';
import AuthWrapper from './components/AuthWrapper';
import ClientApp from './components/ClientApp';
import { AdminDashboard } from './components/AdminDashboard';
import { ConsultantDashboard } from './components/ConsultantDashboard';

const App: React.FC = () => {
  const renderByRole = (user: User, userRole: string) => {
    const handleBack = () => {
      // Logout or navigate back
      window.location.reload();
    };

    switch (userRole) {
      case 'admin':
        return <AdminDashboard onBack={handleBack} />;
      case 'consultant':
        return <ConsultantDashboard onBack={handleBack} />;
      case 'client':
      default:
        return <ClientApp user={user} />;
    }
  };

  return (
    <AuthWrapper>
      {(user, userRole) => renderByRole(user, userRole)}
    </AuthWrapper>
  );
};

export default App;
