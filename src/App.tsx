import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Translator } from './components/Translator';
import { WordDetails } from './components/WordDetails';
import { TransformationResult } from './types';

export default function App() {
  const [uiLang, setUiLang] = useState<'id' | 'en'>('id');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [toneLevel, setToneLevel] = useState(50);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage uiLang={uiLang} setUiLang={setUiLang} />} />
        <Route 
          path="/translate" 
          element={
            <Translator 
              uiLang={uiLang} 
              setUiLang={setUiLang} 
              input={input}
              setInput={setInput}
              result={result}
              setResult={setResult}
              toneLevel={toneLevel}
              setToneLevel={setToneLevel}
            />
          } 
        />
        <Route path="/word/:word" element={<WordDetails uiLang={uiLang} />} />
      </Routes>
    </Router>
  );
}
