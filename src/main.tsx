import '@fontsource-variable/bricolage-grotesque/opsz.css';
import '@fontsource-variable/figtree/wght.css';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/ui/Toast';
import './index.css';
import { AppStoreProvider } from './store/AppStore';

createRoot(document.getElementById('root')!).render(
  <AppStoreProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </AppStoreProvider>,
);