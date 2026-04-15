import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Waveform from './components/Waveform';
import FeatureCards from './components/FeatureCards';
import TeamPage from './pages/TeamPage';
import TextToVoicePage from './pages/TextToVoicePage';
import VoiceClonePage from './pages/VoiceClonePage';

function Home() {
  return (
    <div className="min-h-screen bg-[#0d0e15] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      <Background />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex flex-col justify-center pt-10">
          <Waveform />
          <FeatureCards />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/text-to-voice" element={<TextToVoicePage />} />
        <Route path="/voice-clone" element={<VoiceClonePage />} />
      </Routes>
    </Router>
  );
}

