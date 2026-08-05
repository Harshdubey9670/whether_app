import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff, Loader2, Sparkles, Shirt, Plane, Tractor, Tent, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentWeather, askAIAssistant } from '../services/api';
import { useLocation as useAppLocation } from '../contexts/LocationContext';
import { useSettings } from '../contexts/SettingsContext';

const AIAssistant = () => {
  const { locationQuery } = useAppLocation();
  const { tempUnit, windUnit } = useSettings();
  
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: "Hello! I'm your WeatherVerse AI Assistant. I can give you personalized advice on clothing, travel, farming, or outdoor activities based on your local weather. What can I help you with today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Fetch current weather to use as context
  const { data: weatherData } = useQuery({
    queryKey: ['weather', locationQuery],
    queryFn: () => getCurrentWeather(locationQuery),
    enabled: !!locationQuery,
    staleTime: 5 * 60 * 1000,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Your browser doesn't support voice input. Please try Chrome or Safari.");
      }
    }
  };

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;
    
    const userMsg = { id: Date.now(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const contextData = weatherData ? {
        location: weatherData.location?.name,
        temperature: `${weatherData.current?.temp_c}°C (${weatherData.current?.temp_f}°F)`,
        condition: weatherData.current?.condition?.text,
        humidity: `${weatherData.current?.humidity}%`,
        wind: `${weatherData.current?.wind_kph} kph`,
        userUnits: { temp: tempUnit, wind: windUnit }
      } : null;

      // Pass the previous conversation history (excluding the very first greeting if we want to save tokens, but passing all is fine)
      const history = messages.map(m => ({ role: m.role, text: m.text }));

      const res = await askAIAssistant(text.trim(), contextData, history);
      
      const aiMsg = { id: Date.now() + 1, role: 'ai', text: res.answer };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg = { id: Date.now() + 1, role: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = [
    { label: 'What should I wear today?', icon: <Shirt className="w-4 h-4" /> },
    { label: 'Any travel delays expected?', icon: <Plane className="w-4 h-4" /> },
    { label: 'Is today good for sowing seeds?', icon: <Tractor className="w-4 h-4" /> },
    { label: 'Can I go hiking this afternoon?', icon: <Tent className="w-4 h-4" /> },
    { label: 'Are there any health risks today?', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 relative z-10">
          <Sparkles className="w-7 h-7 text-yellow-300" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">WeatherVerse AI</h2>
          <p className="text-indigo-100 text-sm">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm flex flex-col">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-sky-500 text-white' : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm md:text-base leading-relaxed ${msg.role === 'user' ? 'bg-sky-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-white/5'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm bg-gradient-to-tr from-indigo-500 to-purple-500 text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}/>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}/>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}/>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          
          {/* Suggested Questions */}
          {messages.length < 3 && (
            <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.label)}
                  className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex items-center">
            <button
              onClick={toggleListen}
              className={`absolute left-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Ask about clothing, travel, farming, health..."}
              className="w-full pl-14 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-3 p-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors shadow-sm disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
