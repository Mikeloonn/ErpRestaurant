/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider, useAppContext } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { MainLayout } from './components/MainLayout';

const AppContent = () => {
  const { currentUser } = useAppContext();
  return currentUser ? <MainLayout /> : <LoginScreen />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
