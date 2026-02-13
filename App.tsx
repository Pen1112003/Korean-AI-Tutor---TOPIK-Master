
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import TranscriptionInput from './components/TranscriptionInput';
import LessonOutput from './components/LessonOutput';
import { analyzeLectureTranscription } from './services/geminiService';
import { SavedLesson } from './types';

type SortOption = 'newest' | 'oldest' | 'az' | 'za';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);

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
    const titleMatch = lessonContent.match(/^# (.*)/m);
    const title = titleMatch ? titleMatch[1].replace(/🎓\s*/, '') : "Bài học không tên";
    
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
  };

  const loadLesson = (lesson: SavedLesson) => {
    setLessonContent(lesson.content);
    setCurrentLessonId(lesson.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteLesson = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Xóa bài học này khỏi thư viện?")) return;
    const updated = savedLessons.filter(l => l.id !== id);
    setSavedLessons(updated);
    localStorage.setItem('topik_lessons', JSON.stringify(updated));
    if (currentLessonId === id) {
      setCurrentLessonId(null);
      setLessonContent(null);
    }
  };

  const createNew = () => {
    setLessonContent(null);
    setCurrentLessonId(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortedLessons = useMemo(() => {
    const lessons = [...savedLessons];
    switch (sortOption) {
      case 'newest':
        return lessons.sort((a, b) => b.timestamp - a.timestamp);
      case 'oldest':
        return lessons.sort((a, b) => a.timestamp - b.timestamp);
      case 'az':
        return lessons.sort((a, b) => a.title.localeCompare(b.title));
      case 'za':
        return lessons.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return lessons;
    }
  }, [savedLessons, sortOption]);

  const isCurrentSaved = savedLessons.some(l => l.id === currentLessonId || (lessonContent && l.content === lessonContent));

  const sortLabel = {
    newest: 'Mới nhất',
    oldest: 'Cũ nhất',
    az: 'A → Z',
    za: 'Z → A'
  }[sortOption];

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfd]">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Học tiếng Hàn với <span className="text-indigo-600">Trí tuệ nhân tạo</span>
          </h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Chuyên gia hỗ trợ ôn luyện TOPIK 2. AI tự động hệ thống hóa kiến thức từ bài giảng, 
            sửa lỗi chính tả và cung cấp ví dụ ứng dụng thực tế ngay lập tức.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          <div className="lg:col-span-3 space-y-12">
            <TranscriptionInput onAnalyze={handleAnalyze} isLoading={isLoading} />

            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 px-6 py-4 rounded-r-xl flex items-center shadow-sm">
                <svg className="w-6 h-6 mr-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium">{error}</p>
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
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200 opacity-60">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-slate-400">Hệ thống đang chờ bài giảng của bạn</p>
                <p className="text-slate-400 mt-2">Dán văn bản hoặc thu âm để bắt đầu tạo giáo án</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6 sticky top-24 no-print">
            <button 
              onClick={createNew}
              className="w-full flex items-center justify-center space-x-3 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              <span>TẠO BÀI MỚI</span>
            </button>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-black text-slate-800 flex items-center text-sm uppercase tracking-widest">
                  Thư viện
                </h3>
                <div className="relative">
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center space-x-1 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors uppercase tracking-widest border border-indigo-100"
                  >
                    <span>{sortLabel}</span>
                    <svg className={`w-3 h-3 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isSortOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-100">
                      {(['newest', 'oldest', 'az', 'za'] as SortOption[]).map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortOption(option);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between ${
                            sortOption === option ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{
                            option === 'newest' ? 'Mới nhất' : 
                            option === 'oldest' ? 'Cũ nhất' : 
                            option === 'az' ? 'A → Z' : 'Z → A'
                          }</span>
                          {sortOption === option && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {sortedLessons.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <p className="text-sm text-slate-400 italic">Thư viện trống. Hãy lưu bài giảng để ôn tập sau này!</p>
                  </div>
                ) : (
                  sortedLessons.map((lesson) => (
                    <div 
                      key={lesson.id}
                      onClick={() => loadLesson(lesson)}
                      className={`group p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                        currentLessonId === lesson.id 
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-inner' 
                          : 'border-transparent hover:border-indigo-100 hover:bg-slate-50 bg-white shadow-sm'
                      }`}
                    >
                      <button 
                        onClick={(e) => deleteLesson(e, lesson.id)}
                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <p className={`text-sm font-bold mb-2 pr-6 leading-tight ${currentLessonId === lesson.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
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

      <footer className="bg-slate-900 text-white py-12 mt-20 no-print">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-500 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black">TOPIK Master AI</h3>
              </div>
              <p className="text-slate-400 max-w-sm">
                Nền tảng học tập tiên phong ứng dụng Gemini 3 để cách mạng hóa việc ghi chép và hệ thống hóa kiến thức tiếng Hàn cho người Việt.
              </p>
            </div>
            <div className="text-right">
              <div className="flex justify-end space-x-8 text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">
                <span className="hover:text-white cursor-pointer transition-colors">Về chúng tôi</span>
                <span className="hover:text-white cursor-pointer transition-colors">Điều khoản</span>
                <span className="hover:text-white cursor-pointer transition-colors">Liên hệ</span>
              </div>
              <p className="text-xs text-slate-500">© 2024 TOPIK Master AI. Made for learners, by teachers.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
