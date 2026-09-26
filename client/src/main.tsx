import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { MoodProvider } from './context/MoodContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MoodProvider>
      <App />
    </MoodProvider>
  </StrictMode>,
);
