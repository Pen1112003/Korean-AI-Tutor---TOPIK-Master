
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TranscriptionInput from './components/TranscriptionInput';
import LessonOutput from './components/LessonOutput';
import { analyzeLectureTranscription } from './services/geminiService';
import { SavedLesson } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  // Load saved lessons from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('topik_lessons');
    if (stored) {
      try {
        setSavedLessons(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved lessons", e);
      }
    }
  }, []);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentLessonId(null);
    try {
      const result = await analyzeLectureTranscription(text);
      setLessonContent(result);
      setTimeout(() => {
        document.getElementById('lesson-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không mong muốn.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveLesson = () => {
    if (!lessonContent) return;

    // Extract title from content (first heading)
    const titleMatch = lessonContent.match(/^# (.*)/m);
    const title = titleMatch ? titleMatch[1] : "Bài học không tên";
    
    const newLesson: SavedLesson = {
      id: crypto.randomUUID(),
      title,
      date: new Date().toLocaleDateString('vi-VN'),
      content: lessonContent,
      timestamp: Date.now()
    };

    const updated = [newLesson, ...savedLessons];
    setSavedLessons(updated);
    localStorage.setItem('topik_lessons', JSON.stringify(updated));
    setCurrentLessonId(newLesson.id);
    alert("Bài học đã được lưu vào thư viện!");
  };

  const loadLesson = (lesson: SavedLesson) => {
    setLessonContent(lesson.content);
    setCurrentLessonId(lesson.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteLesson = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này khỏi thư viện?")) return;
    
    const updated = savedLessons.filter(l => l.id !== id);
    setSavedLessons(updated);
    localStorage.setItem('topik_lessons', JSON.stringify(updated));
    if (currentLessonId === id) {
      setCurrentLessonId(null);
      setLessonContent(null);
    }
  };

  const isCurrentSaved = savedLessons.some(l => l.id === currentLessonId || l.content === lessonContent);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            Biến bài giảng thành <span className="text-indigo-600">Kiến thức hệ thống</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Công cụ hỗ trợ học tập dành cho người Việt ôn TOPIK. AI của chúng tôi sẽ phân tích bản ghi thô, 
            sửa lỗi chính tả tiếng Hàn và tạo ra giáo án học thuật hoàn chỉnh.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TranscriptionInput onAnalyze={handleAnalyze} isLoading={isLoading} />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-8">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
              </div>
            )}

            <div id="lesson-result">
              {lessonContent && !isLoading && (
                <LessonOutput 
                  content={lessonContent} 
                  onSave={saveLesson}
                  isSaved={isCurrentSaved}
                />
              )}
            </div>

            {!lessonContent && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale pointer-events-none">
                <svg className="w-24 h-24 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-xl font-medium text-slate-400">Kết quả bài học sẽ xuất hiện ở đây</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Thư viện bài học
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{savedLessons.length}</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto p-4 space-y-3">
                {savedLessons.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-sm text-slate-400 italic">Thư viện trống. Hãy lưu bài học đầu tiên của bạn!</p>
                  </div>
                ) : (
                  savedLessons.map((lesson) => (
                    <div 
                      key={lesson.id}
                      onClick={() => loadLesson(lesson)}
                      className={`group p-4 rounded-lg border transition-all cursor-pointer relative ${
                        currentLessonId === lesson.id 
                          ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                          : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <button 
                        onClick={(e) => deleteLesson(e, lesson.id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <p className={`text-sm font-bold mb-1 pr-6 ${currentLessonId === lesson.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {lesson.date}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <div className="flex justify-center space-x-6 mb-4 text-slate-400 text-sm">
            <span>© 2024 TOPIK Master AI</span>
            <span className="opacity-30">•</span>
            <span>Korean Pedagogical Expert</span>
            <span className="opacity-30">•</span>
            <span>Powered by Gemini 3</span>
          </div>
          <p className="text-xs text-slate-400">
            Ứng dụng này được thiết kế để hỗ trợ học tập và không thay thế cho các giáo trình chính thống.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
