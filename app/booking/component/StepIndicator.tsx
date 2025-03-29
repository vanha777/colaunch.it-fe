"use client";

import { motion } from "framer-motion";

export type BookingStep = 'service' | 'professional' | 'date_time' | 'contact';

interface StepIndicatorProps {
    currentStep: BookingStep;
    onStepClick: (step: BookingStep) => void;
    canNavigateToStep: (step: BookingStep) => boolean;
}

const StepIndicator = ({
    currentStep,
    onStepClick,
    canNavigateToStep
}: StepIndicatorProps) => {
    const steps: { id: BookingStep }[] = [
        { id: 'service' },
        { id: 'professional' },
        { id: 'date_time' },
        { id: 'contact' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="mb-3">
            <div className="relative flex items-center justify-between">
                {/* Connection lines between circles - set to lower z-index */}
                <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 z-0">
                    <div className="h-1 w-full bg-gray-200">
                        <div
                            className="h-full bg-black"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step circles - higher z-index and with background to cover the line */}
                {steps.map((step, index) => {
                    const isClickable = canNavigateToStep(step.id);
                    const isComplete = index < currentStepIndex;
                    const isActive = index === currentStepIndex;

                    return (
                        <div
                            key={step.id}
                            className="relative z-10" // Ensure this container has a higher z-index
                        >
                            <motion.button
                                type="button"
                                onClick={() => isClickable && onStepClick(step.id)}
                                whileHover={isClickable ? { scale: 1.05 } : {}}
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                                className={`w-10 h-10 rounded-full flex items-center justify-center 
                                    ${isComplete
                                        ? 'bg-black text-white'
                                        : isActive
                                            ? 'bg-white text-black border-2 border-black'
                                            : 'bg-gray-200 text-gray-500'
                                    } transition-all duration-200
                                    ${isClickable && !isActive && !isComplete ? 'hover:bg-gray-300 cursor-pointer' : ''}
                                    ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}
                                    shadow-sm`}
                            >
                                {isComplete ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="font-bold text-base">{index + 1}</span>
                                )}
                            </motion.button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator; 