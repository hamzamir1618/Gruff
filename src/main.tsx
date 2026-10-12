import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/fonts.css';
import './styles/paper.css';
import './styles/app.css';

// No StrictMode: its double-mounted effects would print the edition and play the opening twice.
createRoot(document.getElementById('root')!).render(<App />);
