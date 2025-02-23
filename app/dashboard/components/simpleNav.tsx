import { useState } from 'react';
import ManageIdeaForm from './manageIdeas';

const SimpleNav = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showIdeaForm, setShowIdeaForm] = useState(false);

    return (
        <>
            <div className="fixed bottom-16 right-6 flex flex-col-reverse gap-3 z-50">
                {isExpanded && (
                    <>
                        <div className="tooltip tooltip-left" data-tip="Add New Idea">
                            <button 
                                className="btn btn-circle btn-success animate-bounce-up"
                                onClick={() => setShowIdeaForm(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                        <div className="tooltip tooltip-left" data-tip="Contact Us">
                            <button className="btn btn-circle btn-primary animate-bounce-up">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                        <div className="tooltip tooltip-left" data-tip="Help & Information">
                            <button className="btn btn-circle btn-secondary animate-bounce-up">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>
                        <div className="tooltip tooltip-left" data-tip="More Options">
                            <button className="btn btn-circle btn-accent animate-bounce-up">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                </svg>
                            </button>
                        </div>
                    </>
                )}
                <div className="tooltip tooltip-left" data-tip="Support">
                    <button
                        className="btn btn-circle btn-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-80 transition-all duration-300"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-8 w-8 transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>
            
            {showIdeaForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <ManageIdeaForm setShowCreateForm={setShowIdeaForm} selectedGame={undefined} />
                    </div>
                </div>
            )}
        </>
    );
};

export default SimpleNav;
