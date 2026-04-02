/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider, useAppContext } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { MainLayout } from './components/MainLayout';
import { Toaster } from 'sonner';

const AppContent = () => {
  const { currentUser } = useAppContext();
  return currentUser ? <MainLayout /> : <LoginScreen />;
};

export default function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" richColors />
      <AppContent />
    </AppProvider>
  );
}
