import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';
import {
  Sparkles,
  Send,
  User,
  Bot,
  RefreshCw,
  HelpCircle,
  Clock,
  BookOpen,
  Award,
} from 'lucide-react';

const AIAssistantPage = () => {
  const [studentData, setStudentData] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I am Siddhartha AI Assistant for PB Siddhartha College of Arts & Science (Autonomous, Vijayawada). How can I assist you with your 6-semester academic roadmap, exams, syllabus, or campus regulations today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await API.get('/user/profile');
        setStudentData(profileRes.data?.data?.additionalData);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    'What is the 75% attendance rule for PB Siddhartha autonomous exams?',
    'How is CGPA calculated in the 6-semester CBCS grading scale?',
    'What companies visit PB Siddhartha College for campus recruitment?',
    'What are the core subjects for BCA across 6 semesters?',
  ];

  const handleSendMessage = async (textToSend) => {
    const message = textToSend || inputMessage;
    if (!message || message.trim().length === 0 || isLoading) return;

    const userMsg = { role: 'user', content: message, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const payload = { message };
      if (conversationId) payload.conversationId = conversationId;

      const res = await API.post('/ai/chat', payload);
      const assistantReply =
        res.data?.data?.message ||
        res.data?.data?.reply ||
        res.data?.message ||
        "I'm here to help with all questions about PB Siddhartha College curriculum and campus guidelines.";

      if (res.data?.data?.conversationId) {
        setConversationId(res.data.data.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantReply, timestamp: new Date() },
      ]);
    } catch (err) {
      console.error('AI Chat Error', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I am currently having trouble reaching the campus AI server. Please verify your internet connection or try again shortly.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Conversation restarted. Feel free to ask any query about PB Siddhartha College of Arts & Science!",
        timestamp: new Date(),
      },
    ]);
    setConversationId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
      <StudentNavbar studentData={studentData} />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                Siddhartha AI Campus Assistant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PB Siddhartha College of Arts & Science • Powered by Groq LLaMA 3.1
              </p>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Message Box */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col overflow-hidden min-h-[460px]">
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex gap-3 max-w-3xl ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAssistant
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-white dark:bg-slate-600'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    <span
                      className={`block text-[10px] mt-1.5 ${
                        isAssistant ? 'text-slate-400' : 'text-indigo-200 text-right'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 max-w-3xl mr-auto">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/80 text-xs text-slate-500">
                  Siddhartha AI is thinking...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3.5 bg-slate-50 dark:bg-slate-750 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about PB Siddhartha College regulations, exams, syllabus, or placements..."
              className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AIAssistantPage;