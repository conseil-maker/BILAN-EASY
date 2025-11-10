import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoaded, isSignedIn } = useUser();

  // Chargement initial
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-800">BILAN-EASY</div>
          <p className="mt-2 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Utilisateur non connecté
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-800 font-display">BILAN-EASY</h1>
            <p className="mt-2 text-slate-600">Votre bilan de compétences avec l'IA</p>
          </div>
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-xl",
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Utilisateur connecté
  return <>{children}</>;
};
