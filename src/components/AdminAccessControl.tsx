// src/components/AdminAccessControl.tsx
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
  const { isAdmin } = useAuth(); // Get isAdmin from context

  if (isAdmin) {
    return <>{children}</>;
  }

  // Return fallback or null
  return fallbackComponent ? <>{fallbackComponent}</> : null;
};