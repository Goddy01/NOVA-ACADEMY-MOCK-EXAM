
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppStep, CourseTrack, StudentResult, Question } from './types';
import { QUESTIONS } from './questions';

// --- Constants ---
const ALLOWED_CODES = [
  'NV-8821-XP', 'NV-4732-LQ', 'NV-9105-BR', 'NV-2287-KS',
  'NV-5564-DM', 'NV-3391-TZ', 'NV-7810-GW', 'NV-6422-PH',
  'NV-1159-JC', 'NV-8246-KV', 'NV-3950-RM', 'NV-5077-WE',
  'NV-0859-VC', 'NV-8846-KC', 'NV-3450-MO', 'NV-5007-JE',
];

// --- Helper Functions ---
const saveResultToLocalStorage = (result: StudentResult) => {
  try {
    const existing = JSON.parse(localStorage.getItem('nova_academy_results') || '[]');
    localStorage.setItem('nova_academy_results', JSON.stringify([...existing, result]));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
};

const getResultsFromLocalStorage = (): StudentResult[] => {
  try {
    return JSON.parse(localStorage.getItem('nova_academy_results') || '[]');
  } catch (e) {
    return [];
  }
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// --- Sub-components ---

const WelcomeView = ({ 
  studentName, 
  setStudentName, 
  desiredCourse, 
  setDesiredCourse, 
  accessCode,
  setAccessCode,
  track, 
  setTrack, 
  handleStartExam, 
  setStep,
  error
}: any) => (
  <div className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-12">
    <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase border border-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Session 2025 Mock
        </div>
        <h1 className="heading-font text-4xl md:text-5xl lg:text-7xl font-black leading-[1.1] text-slate-900">
          Nova <span className="text-blue-600">Academy</span> Mock Exam.
        </h1>
        <p className="text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed max-w-md">
          Official JAMB UTME Simulation Platform. 
          Enter your registered details and one-time access code to begin.
        </p>
      </div>

      <div className="bg-white p-6 md:p-10 lg:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-1000">
        <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-6xl md:text-8xl -mr-8 -mt-8 pointer-events-none">NOVA</div>
        <div className="relative z-10 space-y-5 lg:space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Full Name</label>
            <input 
              type="text" 
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-800"
              placeholder="e.g. Ebuka Davies"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course of Study</label>
            <input 
              type="text" 
              value={desiredCourse}
              onChange={(e) => setDesiredCourse(e.target.value)}
              className="w-full bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-800"
              placeholder="e.g. Medicine"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Access Code</label>
            <input 
              type="text" 
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              className={`w-full bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all outline-none font-mono font-bold text-slate-800 ${error ? 'border-red-500 focus:border-red-600' : 'border-transparent focus:border-blue-500 focus:bg-white'}`}
              placeholder="NV-XXXX-XX"
            />
            {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Track</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setTrack(CourseTrack.BIOLOGICAL)}
                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 font-bold text-[10px] md:text-sm transition-all ${track === CourseTrack.BIOLOGICAL ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
              >
                Biological
              </button>
              <button 
                onClick={() => setTrack(CourseTrack.ENGINEERING)}
                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 font-bold text-[10px] md:text-sm transition-all ${track === CourseTrack.ENGINEERING ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
              >
                Engineering
              </button>
            </div>
          </div>
          <button 
            disabled={!studentName || !desiredCourse || !accessCode}
            onClick={handleStartExam}
            className="w-full jamb-gradient text-white font-extrabold p-4 md:p-5 rounded-xl md:rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none text-xs md:text-base uppercase tracking-widest"
          >
            START EXAM
          </button>
        </div>
      </div>
    </div>
    <button onClick={() => setStep('admin-login')} className="fixed bottom-6 right-6 p-3 bg-white shadow-xl rounded-full text-slate-300 hover:text-blue-500 transition-all hover:scale-110 active:scale-95 border border-slate-100 no-print">
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
    </button>
  </div>
);

const ExamView = ({ 
  q, 
  activeQuestions, 
  currentQuestionIndex, 
  setCurrentQuestionIndex, 
  timeLeft, 
  studentName, 
  answers, 
  setAnswers, 
  onFinish 
}: any) => {
  const [showNavigator, setShowNavigator] = useState(false);
  
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = activeQuestions.length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  // The central trigger for submission
  const handleFinalSubmit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.confirm('Are you sure you want to SUBMIT your assessment? This action is final.')) {
      try {
        onFinish();
      } catch (error) {
        console.error('Error in handleFinalSubmit:', error);
        alert('There was an error submitting your exam. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#fafbfc]">
      {/* Header with high-visibility Submit button */}
      <header className="glass sticky top-0 z-50 border-b border-slate-200/50 shadow-sm">
        <div className="px-4 md:px-8 py-3 md:py-4 flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 jamb-gradient rounded-lg flex items-center justify-center text-white font-black text-xs">NA</div>
            <div className="hidden sm:block">
              <h2 className="heading-font font-bold text-slate-900 leading-none text-sm">MOCK 2025</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{studentName}</p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className={`px-4 py-1.5 rounded-xl border-2 flex flex-col items-center min-w-[120px] ${timeLeft < 300 ? 'border-red-500 bg-red-50 animate-pulse' : 'border-blue-100 bg-white'}`}>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TIME</span>
              <span className={`text-xl font-black tabular-nums leading-none ${timeLeft < 300 ? 'text-red-600' : 'text-slate-900'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PROGRESS</span>
              <span className="text-sm font-black text-blue-600">{answeredCount}/{totalQuestions}</span>
            </div>
            {/* Red Submit Button styled as requested */}
            <button 
              type="button"
              onClick={handleFinalSubmit}
              className="bg-[#d91e1e] hover:bg-[#b91c1c] text-white px-6 py-2.5 rounded-[12px] font-bold text-sm shadow-lg shadow-red-200 transition-all active:scale-95 uppercase tracking-wider"
            >
              SUBMIT
            </button>
          </div>
        </div>
        <div className="w-full h-1 bg-slate-100"><div className="h-full jamb-gradient transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div></div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 p-6 transition-transform lg:relative lg:translate-x-0 ${showNavigator ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-6 px-2 lg:hidden">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Questions</h3>
            <button onClick={() => setShowNavigator(false)} className="text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-full pb-20">
            {activeQuestions.map((question: any, idx: number) => (
              <button
                key={question.id}
                onClick={() => { setCurrentQuestionIndex(idx); if (window.innerWidth < 1024) setShowNavigator(false); }}
                className={`aspect-square rounded-xl text-[10px] font-bold transition-all flex items-center justify-center border-2 ${currentQuestionIndex === idx ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-transparent'} ${answers[question.id] ? (currentQuestionIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white') : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>

        {showNavigator && <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setShowNavigator(false)}></div>}

        <main className="flex-1 overflow-y-auto bg-slate-50/30 p-4 md:p-12">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase">{q.subject}</span>
                <div className="h-px flex-1 bg-slate-200"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase">ITEM {currentQuestionIndex + 1}</span>
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-slate-800 leading-snug">{q.text}</h2>
            </div>
            <div className="grid gap-3">
              {q.options.map((opt: any) => (
                <button
                  key={opt.label}
                  onClick={() => setAnswers({...answers, [q.id]: opt.label})}
                  className={`group relative w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${answers[q.id] === opt.label ? 'border-blue-600 bg-white text-blue-900 shadow-lg' : 'border-white bg-white hover:border-slate-200 text-slate-600 shadow-sm'}`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg uppercase transition-all ${answers[q.id] === opt.label ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-300'}`}>{opt.label}</div>
                  <span className="text-base md:text-lg font-semibold flex-1">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      <footer className="glass border-t border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button onClick={() => setShowNavigator(true)} className="lg:hidden p-3 rounded-xl bg-slate-100 text-slate-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg></button>
          <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} className="px-6 py-3 rounded-xl font-bold text-xs uppercase text-slate-400 disabled:opacity-0">← PREV</button>
        </div>
        <div className="flex gap-3">
          {currentQuestionIndex < activeQuestions.length - 1 ? (
            <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">NEXT →</button>
          ) : (
            <button type="button" onClick={handleFinalSubmit} className="bg-[#d91e1e] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700">SUBMIT</button>
          )}
        </div>
      </footer>
    </div>
  );
};

const ResultView = ({ currentResult, handleReturnToDashboard, handlePrint }: any) => {
  if (!currentResult) return null;
  const percentage = Math.round((currentResult.score / currentResult.totalPossible) * 100);
  const isPass = percentage >= 50;

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-slate-50">
      <div id="print-area" className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-700 print:shadow-none print:border-none print:rounded-none">
        <div className={`p-10 md:p-16 text-center text-white relative ${isPass ? 'jamb-gradient' : 'bg-slate-800'}`}>
          <div className="absolute inset-0 opacity-10 font-black text-[20rem] -bottom-20 -right-20 pointer-events-none overflow-hidden">NOVA</div>
          <div className="relative z-10 space-y-4">
            <h2 className="heading-font text-4xl md:text-6xl font-black uppercase tracking-tighter">{isPass ? 'PASSED' : 'COMPLETED'}</h2>
            <p className="font-bold tracking-[0.3em] opacity-80 uppercase text-[10px] md:text-sm">Mock Examination Result Statement</p>
          </div>
        </div>
        
        <div className="p-8 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Total Score</p>
              <p className="text-5xl font-black text-blue-600">{currentResult.score}/{currentResult.totalPossible}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Accuracy</p>
              <p className="text-5xl font-black text-slate-900">{percentage}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Result ID</p>
              <p className="text-2xl font-mono font-bold text-blue-400 mt-2">#{currentResult.id}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Candidate</p>
              <p className="text-xl font-bold text-slate-800">{currentResult.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Course Choice</p>
              <p className="text-xl font-bold text-slate-800">{currentResult.course}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-12 no-print">
            <button onClick={handleReturnToDashboard} className="flex-1 bg-slate-900 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all">Back to Home</button>
            <button onClick={handlePrint} className="flex-1 bg-white border-2 border-slate-200 text-slate-800 p-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">Download Transcript (PDF)</button>
          </div>
          <div className="hidden print:block mt-20 border-t pt-8 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">
            Authorized Nova Academy Document • Date: {new Date(currentResult.timestamp).toLocaleDateString()} • Code: {currentResult.accessCode}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [step, setStep] = useState<AppStep>('welcome');
  const [studentName, setStudentName] = useState('');
  const [desiredCourse, setDesiredCourse] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [track, setTrack] = useState<CourseTrack>(CourseTrack.BIOLOGICAL);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [welcomeError, setWelcomeError] = useState('');
  const [currentResult, setCurrentResult] = useState<StudentResult | null>(null);

  // Use a ref to always have access to current state in async closures
  const stateRef = useRef({ answers, studentName, desiredCourse, track, accessCode });
  stateRef.current = { answers, studentName, desiredCourse, track, accessCode };

  const activeQuestions = useMemo(() => {
    return QUESTIONS.filter(q => {
      const commonIds = [...Array.from({length: 10}, (_, i) => i + 1), ...Array.from({length: 20}, (_, i) => i + 11), ...Array.from({length: 20}, (_, i) => i + 31), ...Array.from({length: 10}, (_, i) => i + 71)];
      if (commonIds.includes(q.id)) return true;
      if (track === CourseTrack.BIOLOGICAL) return q.id >= 51 && q.id <= 70;
      return q.id >= 81 && q.id <= 100;
    });
  }, [track]);

  const handleActualSubmit = useCallback(() => {
    try {
      // Accessing latest state from ref to avoid closure issues
      const { answers: latestAnswers, studentName: name, desiredCourse: course, track: t, accessCode: code } = stateRef.current;
      
      // Get current activeQuestions based on current track
      const currentActiveQuestions = QUESTIONS.filter(q => {
        const commonIds = [...Array.from({length: 10}, (_, i) => i + 1), ...Array.from({length: 20}, (_, i) => i + 11), ...Array.from({length: 20}, (_, i) => i + 31), ...Array.from({length: 10}, (_, i) => i + 71)];
        if (commonIds.includes(q.id)) return true;
        if (t === CourseTrack.BIOLOGICAL) return q.id >= 51 && q.id <= 70;
        return q.id >= 81 && q.id <= 100;
      });
      
      let score = 0;
      currentActiveQuestions.forEach(q => { 
        if (latestAnswers[q.id] === q.correctAnswer) score++; 
      });

      const result: StudentResult = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        name: name,
        course: course,
        track: t,
        accessCode: code,
        score: score,
        totalPossible: currentActiveQuestions.length,
        timestamp: Date.now(),
        answers: { ...latestAnswers }
      };

      saveResultToLocalStorage(result);
      setCurrentResult(result);
      setStep('result');
      document.title = `Nova_Mock_Result_${name.replace(/\s+/g, '_')}`;
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('There was an error submitting your exam. Please try again.');
    }
  }, []);

  useEffect(() => {
    let timer: any;
    if (step === 'exam' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && step === 'exam') {
      handleActualSubmit();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft, handleActualSubmit]);

  const handleStartExam = () => {
    if (!studentName || !desiredCourse || !accessCode) return;
    if (!ALLOWED_CODES.includes(accessCode)) { setWelcomeError('INVALID ACCESS CODE'); return; }
    const results = getResultsFromLocalStorage();
    if (results.some(r => r.accessCode === accessCode)) { setWelcomeError('CODE ALREADY USED'); return; }
    setWelcomeError(''); setStep('exam'); setAnswers({}); setTimeLeft(3600); setCurrentQuestionIndex(0);
  };

  const handleReturnToDashboard = () => {
    setStep('welcome'); setAnswers({}); setTimeLeft(3600); setCurrentQuestionIndex(0); setCurrentResult(null); setAccessCode('');
    document.title = 'NOVA Academy | Mock UTME 2025';
  };

  return (
    <div className="selection:bg-blue-100 selection:text-blue-900">
      {step === 'welcome' && <WelcomeView studentName={studentName} setStudentName={setStudentName} desiredCourse={desiredCourse} setDesiredCourse={setDesiredCourse} accessCode={accessCode} setAccessCode={setAccessCode} track={track} setTrack={setTrack} handleStartExam={handleStartExam} setStep={setStep} error={welcomeError} />}
      {step === 'exam' && <ExamView q={activeQuestions[currentQuestionIndex]} activeQuestions={activeQuestions} currentQuestionIndex={currentQuestionIndex} setCurrentQuestionIndex={setCurrentQuestionIndex} timeLeft={timeLeft} studentName={studentName} answers={answers} setAnswers={setAnswers} onFinish={handleActualSubmit} />}
      {step === 'result' && <ResultView currentResult={currentResult} handleReturnToDashboard={handleReturnToDashboard} handlePrint={() => window.print()} />}
      {step === 'admin-login' && (
        <div className="min-h-screen flex items-center justify-center p-6"><div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center"><h2 className="heading-font text-2xl font-black uppercase">ADMIN LOGIN</h2><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 mt-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 text-center text-2xl font-black" placeholder="••••" />{adminError && <p className="text-red-500 text-xs font-black mt-2 uppercase">{adminError}</p>}<button onClick={() => adminPassword === 'niggasake' ? setStep('admin-panel') : setAdminError('DENIED')} className="w-full bg-slate-900 text-white p-5 mt-6 rounded-2xl font-black uppercase tracking-widest">Login</button><button onClick={() => setStep('welcome')} className="mt-4 text-slate-300 font-bold uppercase text-xs">Cancel</button></div></div>
      )}
      {step === 'admin-panel' && (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
          <div className="flex justify-between items-center"><h1 className="heading-font text-4xl font-black">RECORDS.</h1><button onClick={() => setStep('welcome')} className="bg-white px-6 py-3 rounded-xl font-black text-xs border border-slate-200 shadow-sm">LOGOUT</button></div>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-8 text-[10px] font-black uppercase tracking-widest">Candidate</th><th className="p-8 text-[10px] font-black uppercase tracking-widest">Code Used</th><th className="p-8 text-[10px] font-black uppercase tracking-widest text-center">Score</th><th className="p-8 text-[10px] font-black uppercase tracking-widest text-right">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{getResultsFromLocalStorage().map(r => (<tr key={r.id}><td className="p-8 font-bold">{r.name}<br/><span className="text-[10px] text-blue-500">#{r.id}</span></td><td className="p-8 font-mono text-xs">{r.accessCode}</td><td className="p-8 text-center font-black">{r.score}/{r.totalPossible}</td><td className="p-8 text-right text-xs">{new Date(r.timestamp).toLocaleDateString()}</td></tr>))}</tbody></table></div>
        </div>
      )}
    </div>
  );
}
