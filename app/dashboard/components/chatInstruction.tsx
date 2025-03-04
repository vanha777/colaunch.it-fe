"use client";

import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { xSearch } from "@/app/utils/db";

// Add type definitions for Web Speech API
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: { error: any }) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

// Add this to declare the global types
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface ChatInstructionProps {
    onSearch: (searchTerm: { type: string, value: string }) => void;
}

const ChatInstruction: React.FC<ChatInstructionProps> = ({ onSearch }: ChatInstructionProps) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [processing, setProcessing] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                if (recognitionRef.current) {
                    recognitionRef.current.continuous = true;
                    recognitionRef.current.interimResults = true;

                    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                        const currentTranscript = Array.from(event.results)
                            .map(result => result[0].transcript)
                            .join('');
                        setTranscript(currentTranscript);
                    };

                    recognitionRef.current.onerror = (event: { error: any }) => {
                        console.error('Speech recognition error', event.error);
                        setIsListening(false);
                    };

                    recognitionRef.current.onend = () => {
                        setIsListening(false);
                    };
                }
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onresult = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.abort();
            }
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            // Process command when stopping listening if there's a transcript
            if (transcript.trim()) {
                processCommand();
            }
        } else {
            setTranscript('');
            if (recognitionRef.current) {
                recognitionRef.current.start();
            }
            setIsListening(true);
        }
    };

    const processCommand = async () => {
        console.log("processing command");
        if (!transcript.trim()) return;

        setProcessing(true);

        try {
            // Initialize OpenAI model through LangChain
            const model = new ChatOpenAI({
                temperature: 0,
                modelName: 'gpt-3.5-turbo', // Using smaller model for efficiency
                openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            });

            // Create a prompt template
            const promptTemplate = PromptTemplate.fromTemplate(
                `Extract the search criteria from this voice input:
                "{text}"
                
                Respond only with a JSON object in this format:
                {{
                    "command": "search",
                    "parameters": {{
                        "type": "name" | "location" | "category",
                        "value": string
                    }}
                }}
                
                Rules:
                1. For business name searches: When user mentions "search for", "find", "look for" followed by business names
                   Example: "search for AI companies" → {{"command": "search", "parameters": {{"type": "name", "value": "AI"}}}}
                
                2. For location searches: When user mentions "in", "from", "at" followed by location names
                   Example: "show businesses in New York" → {{"command": "search", "parameters": {{"type": "location", "value": "New York"}}}}
                
                3. For category searches: When user mentions any of these categories: software, healthcare, fintech, ecommerce, ai, sustainability
                   Example: "show me fintech companies" → {{"command": "search", "parameters": {{"type": "category", "value": "fintech"}}}}
                
                If no specific search criteria is detected, respond with:
                {{"command": "other", "parameters": {{"type": "", "value": ""}}}}
                `
            );

            // Create a chain
            const chain = new LLMChain({
                llm: model,
                prompt: promptTemplate,
            });

            // Execute the chain
            const response = await chain.call({
                text: transcript,
            });
            console.log("response", response.text);
            // Parse the result but don't set it to state since we don't need to display it
            const parsedResult = JSON.parse(response.text);
            
            // Handle the command based on type
            handleCommand(parsedResult);

        } catch (error) {
            console.error('Error processing command:', error);
            // Don't set result error message
        } finally {
            setProcessing(false);
        }
    };

    const handleCommand = (parsedCommand: { command: string, parameters: any }) => {
        console.log("handleCommand", parsedCommand);
        onSearch(parsedCommand.parameters);
        // switch (parsedCommand.command) {
        //     case 'filter':
        //         console.log('Applying filter:', parsedCommand.parameters);
        //         // Add your filter function call here
        //         onSearch(parsedCommand.parameters.query);
        //         break;
        //     case 'search':
        //         console.log('Searching for:', parsedCommand.parameters?.query);
        //         // Add your search function call here
        //         break;
        //     default:
        //         console.log('Unrecognized command or general input');
        //         break;
        // }
    };

    // When you receive search terms from your chat/AI interaction
    // call the onSearch function with the search term

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Voice Command Assistant</h2>
                    <p className="text-gray-600">Speak your command to trigger actions</p>
                </div>

                <button
                    onClick={toggleListening}
                    className={`rounded-full p-6 ${isListening ? 'bg-red-600' : 'bg-blue-600'} text-white shadow-lg transition-all duration-300 hover:scale-105`}
                    disabled={processing}
                >
                    {isListening ?
                        <FaStop className="w-8 h-8 animate-pulse" /> :
                        <FaMicrophone className="w-8 h-8" />
                    }
                </button>

                <div className="mt-6 text-lg font-medium">
                    {isListening ? 'Listening...' : 'Press to speak'}
                </div>

                {transcript && (
                    <div className="mt-8 w-full">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Transcript:</h3>
                        <div className="p-4 bg-gray-100 rounded-lg">
                            {transcript}
                        </div>

                        {!isListening && !processing && (
                            <button
                                onClick={processCommand}
                                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Process Command
                            </button>
                        )}
                    </div>
                )}

                {processing && (
                    <div className="mt-6 text-blue-600 animate-pulse">
                        Processing your command...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInstruction;

