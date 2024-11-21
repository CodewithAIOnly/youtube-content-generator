import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { ContentTypeStep } from './steps/ContentTypeStep';
import { KeywordsStep } from './steps/KeywordsStep';
import { CompetitorsStep } from './steps/CompetitorsStep';

const steps = ['Content Type', 'Keywords', 'Competitors'];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { setPreferences, completeOnboarding } = useUserStore();

  const handleComplete = (stepData: any) => {
    if (currentStep === steps.length - 1) {
      setPreferences(stepData);
      completeOnboarding();
      navigate('/dashboard');
    } else {
      setPreferences(stepData);
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index !== steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {steps[currentStep]}
          </h2>
        </div>

        {currentStep === 0 && <ContentTypeStep onComplete={handleComplete} />}
        {currentStep === 1 && <KeywordsStep onComplete={handleComplete} />}
        {currentStep === 2 && <CompetitorsStep onComplete={handleComplete} />}
      </div>
    </div>
  );
}