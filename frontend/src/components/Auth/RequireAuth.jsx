import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGuest } from '../../contexts/GuestContext';
import AuthModal from './AuthModal';

const RequireAuth = ({ children, onClick, className = '' }) => {
  const { user } = useAuth();
  const { isGuest } = useGuest();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e) => {
    if (user && user.role !== 'guest') {
      // Authenticated user, proceed with action
      if (onClick) onClick(e);
    } else {
      // Guest or unauthenticated user, intercept and show modal
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div onClick={handleClick} className={className} style={{ display: 'contents' }}>
        {children}
      </div>
      
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default RequireAuth;
