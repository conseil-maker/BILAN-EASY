/**
 * Tests pour les composants Modals
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  Modal, 
  LogoutModal, 
  HelpModal, 
  EndConfirmationModal,
  EndWarningModal,
  OutOfScopeModal 
} from './Modals';

describe('Modal', () => {
  it('ne devrait pas rendre si isOpen est false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Contenu</p>
      </Modal>
    );
    
    expect(screen.queryByText('Contenu')).not.toBeInTheDocument();
  });

  it('devrait rendre si isOpen est true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Contenu</p>
      </Modal>
    );
    
    expect(screen.getByText('Contenu')).toBeInTheDocument();
  });

  it('devrait afficher le titre si fourni', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Mon Titre">
        <p>Contenu</p>
      </Modal>
    );
    
    expect(screen.getByText('Mon Titre')).toBeInTheDocument();
  });

  it('devrait appeler onClose au clic sur le backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Contenu</p>
      </Modal>
    );
    
    // Cliquer sur le backdrop (le parent du contenu)
    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });
});

describe('LogoutModal', () => {
  it('devrait afficher le message de déconnexion', () => {
    render(
      <LogoutModal isOpen={true} onClose={() => {}} onConfirm={() => {}} />
    );
    
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
    expect(screen.getByText(/progression est automatiquement sauvegardée/i)).toBeInTheDocument();
  });

  it('devrait afficher un avertissement si modifications non sauvegardées', () => {
    render(
      <LogoutModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}} 
        hasUnsavedChanges={true}
      />
    );
    
    expect(screen.getByText(/modifications non sauvegardées/i)).toBeInTheDocument();
  });

  it('devrait appeler onConfirm au clic sur Se déconnecter', () => {
    const onConfirm = vi.fn();
    render(
      <LogoutModal isOpen={true} onClose={() => {}} onConfirm={onConfirm} />
    );
    
    fireEvent.click(screen.getByText('Se déconnecter'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('devrait appeler onClose au clic sur Annuler', () => {
    const onClose = vi.fn();
    render(
      <LogoutModal isOpen={true} onClose={onClose} onConfirm={() => {}} />
    );
    
    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('HelpModal', () => {
  it('devrait afficher les questions fréquentes', () => {
    render(<HelpModal isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Aide')).toBeInTheDocument();
    expect(screen.getByText(/Comment répondre aux questions/i)).toBeInTheDocument();
    expect(screen.getByText(/progression est-elle sauvegardée/i)).toBeInTheDocument();
  });

  it('devrait appeler onClose au clic sur Compris', () => {
    const onClose = vi.fn();
    render(<HelpModal isOpen={true} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('Compris'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('EndConfirmationModal', () => {
  it('devrait afficher le pourcentage de progression', () => {
    render(
      <EndConfirmationModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}} 
        onDeepen={() => {}}
        progressPercentage={75}
      />
    );
    
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('devrait appeler onDeepen au clic sur Approfondir', () => {
    const onDeepen = vi.fn();
    render(
      <EndConfirmationModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}} 
        onDeepen={onDeepen}
        progressPercentage={75}
      />
    );
    
    fireEvent.click(screen.getByText('Approfondir encore'));
    expect(onDeepen).toHaveBeenCalled();
  });

  it('devrait appeler onConfirm au clic sur Générer ma synthèse', () => {
    const onConfirm = vi.fn();
    render(
      <EndConfirmationModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={onConfirm} 
        onDeepen={() => {}}
        progressPercentage={75}
      />
    );
    
    fireEvent.click(screen.getByText('Générer ma synthèse'));
    expect(onConfirm).toHaveBeenCalled();
  });
});

describe('EndWarningModal', () => {
  it('devrait afficher le nombre de questions restantes', () => {
    render(
      <EndWarningModal 
        isOpen={true} 
        onClose={() => {}} 
        remainingQuestions={5}
      />
    );
    
    expect(screen.getByText('5 questions')).toBeInTheDocument();
    expect(screen.getByText('Bientôt terminé !')).toBeInTheDocument();
  });
});

describe('OutOfScopeModal', () => {
  it('devrait afficher le message', () => {
    render(
      <OutOfScopeModal 
        isOpen={true} 
        onClose={() => {}} 
        message="Cette question sort du cadre du bilan."
      />
    );
    
    expect(screen.getByText('Cette question sort du cadre du bilan.')).toBeInTheDocument();
  });

  it('devrait afficher les ressources alternatives si fournies', () => {
    render(
      <OutOfScopeModal 
        isOpen={true} 
        onClose={() => {}} 
        message="Message"
        alternativeResources={['Ressource 1', 'Ressource 2']}
      />
    );
    
    expect(screen.getByText('Ressource 1')).toBeInTheDocument();
    expect(screen.getByText('Ressource 2')).toBeInTheDocument();
  });

  it('devrait afficher le bouton Continuer si onContinue est fourni', () => {
    const onContinue = vi.fn();
    render(
      <OutOfScopeModal 
        isOpen={true} 
        onClose={() => {}} 
        message="Message"
        onContinue={onContinue}
      />
    );
    
    fireEvent.click(screen.getByText('Continuer le bilan'));
    expect(onContinue).toHaveBeenCalled();
  });
});
