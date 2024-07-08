import { StyledEngineProvider } from '@mui/material';
import { FC } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import ErrorFallback from './components/ErrorFallback';
import { ThemeContext } from './context/themeContext';
import ScriptPage from './views/ScriptPage';
import LoginPage from './views/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

const App: FC = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ThemeContext>
      <StyledEngineProvider injectFirst>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<ScriptPage />} />
            </Route>
              <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </StyledEngineProvider>
    </ThemeContext>
  </ErrorBoundary>
);

export default App;
