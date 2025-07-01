import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminAccessControlProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
}

export const AdminAccessControl: React.FC<AdminAccessControlProps> = ({
  children,
  fallbackComponent
}) => {
  const { user } = useAuth();
  const adminEmail = 'kentburchard@sacredshifter.com';

  // Check if user is the admin
  const isAdmin = user?.email?.toLowerCase() === adminEmail.toLowerCase();

  if (isAdmin) {
    return <>{children}</>;
  }

  // Return fallback or null
  return fallbackComponent ? <>{fallbackComponent}</> : null;
};