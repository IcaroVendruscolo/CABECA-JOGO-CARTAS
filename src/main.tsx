import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

(window as Window & {__CABECAO_APP_MOUNTED__?: boolean}).__CABECAO_APP_MOUNTED__ =
  true;

createRoot(document.getElementById('root')!).render(<App />);
