
import React, { useState } from 'react';
import { ViewState, UserProfile, ExamType, EvaluationState } from './types';
import { Layout } from './components/Layout';
import { Onboarding } from './views/Onboarding';
import { Home } from './views/Home';
import { Stats } from './views/Stats';
import { Community } from './views/Community';
import { Profile } from './views/Profile';
import { Evaluation } from './views/Evaluation';
import { Paywall } from './views/Paywall';
import { VoiceCloneLab } from './views/VoiceCloneLab';
import { scoreSpeech } from './services/api';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<ViewState>(ViewState.ONBOARDING);
  const [user, setUser] = useState<UserProfile>({
    name: '',
    nationality: '',
    ageGroup: '',
    examType: ExamType.GENERAL,
    targetScore: 0,
    points: 120,
    isPro: false
  });
  const [evaluation, setEvaluation] = useState<EvaluationState>({
    loading: false,
    error: null,
    result: null
  });

  // Handlers
  const handleOnboardingComplete = (data: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...data }));
    setView(ViewState.HOME);
  };

  const handleViewChange = (newView: ViewState) => {
    setView(newView);
  };

  const resetEvaluation = () => {
    setEvaluation({ loading: false, error: null, result: null });
  };

  const handleSubmitRecording = async ({
    audioBlob,
    taskDuration,
  }: {
    audioBlob: Blob;
    taskDuration: number;
  }) => {
    const examType = (user.examType || ExamType.TOEFL).toLowerCase();
    const targetScore = user.targetScore || 24;

    setEvaluation({ loading: true, error: null, result: null });
    setView(ViewState.EVALUATION);

    try {
      const result = await scoreSpeech({
        audioBlob,
        examType,
        targetScore,
        timeLimitSec: taskDuration || 45,
      });
      setEvaluation({ loading: false, error: null, result });
    } catch (error: any) {
      setEvaluation({
        loading: false,
        error: error.message || 'Scoring failed. Please try again.',
        result: null,
      });
    }
  };

  // Render Current View
  const renderView = () => {
    switch (view) {
      case ViewState.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case ViewState.HOME:
        return <Home user={user} onSubmitRecording={handleSubmitRecording} />;
      case ViewState.STATS:
        return <Stats />;
      case ViewState.COMMUNITY:
        return <Community />;
      case ViewState.PROFILE:
        return <Profile user={user} changeView={handleViewChange} />;
      case ViewState.EVALUATION:
        return (
          <Evaluation
            user={user}
            changeView={handleViewChange}
            evaluation={evaluation}
            onRetry={() => setView(ViewState.HOME)}
            onDismiss={() => {
              resetEvaluation();
              setView(ViewState.HOME);
            }}
          />
        );
      case ViewState.VOICE_LAB:
        return <VoiceCloneLab changeView={handleViewChange} />;
      case ViewState.PAYWALL:
        return <Paywall onClose={() => setView(ViewState.PROFILE)} />; // Or back to where they came from
      default:
        return <Home user={user} changeView={handleViewChange} />;
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
       {/* Wrapper to simulate mobile device on desktop view */}
       <div className="w-full max-w-md h-screen max-h-[900px] bg-bg-DEFAULT relative overflow-hidden shadow-2xl sm:rounded-[3rem] sm:border-[8px] sm:border-gray-900">
          <Layout currentView={view} onChangeView={handleViewChange}>
            {renderView()}
            {/* Overlay Paywall if accessed via modal logic, though current logic switches full view */}
            {view === ViewState.PAYWALL && <Paywall onClose={() => setView(ViewState.HOME)} />}
          </Layout>
       </div>
    </div>
  );
};

export default App;
