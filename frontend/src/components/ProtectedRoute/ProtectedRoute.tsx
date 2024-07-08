import { FC, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import gitlabInterceptor from '../../utils/GitlabInterceptor';

export const ProtectedRoute: FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthentication = async (): Promise<void> => {
      try {
        const response = await gitlabInterceptor.get(
          'check'
        );
        setAuthenticated(response.status === 200);
      } catch (error) {
        console.log(error)
        setAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);
  if (authenticated === null) {
    return null;
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" />;
};