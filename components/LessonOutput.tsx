
import React from 'react';

interface Props {
  content: string;
  onSave?: () => void;
  isSaved?: boolean;
}

const LessonOutput: React.FC<Props> = ({ content, onSave, isSaved }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert("Đã sao chép nội dung bài học!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const titleMatch = content.match(/^# (.*)/m);
    const title = titleMatch ? titleMatch[1].replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'lesson';
    const filename = `${title}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderContent = (markdown: string) => {
    return markdown.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed && line === '') return <div key={idx} className="h-4"></div>;

      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-3xl font-black text-slate-900 mb-8 border-b-4 border-indigo-500 pb-4 uppercase tracking-tight">
            {trimmed.substring(2)}
          </h1>
        );
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl font-bold text-indigo-800 mt-12 mb-6 flex items-center bg-indigo-50/50 p-3 rounded-r-lg border-l-4 border-indigo-600">
            {trimmed.substring(4)}
          </h3>
        );
      }

      if (trimmed.startsWith('- **Ví dụ bổ sung')) {
        return (
          <div key={idx} className="bg-emerald-50 border-l-4 border-emerald-500 p-4 my-4 rounded-r-lg">
             <p className="text-emerald-900 font-medium">💡 {trimmed.substring(2)}</p>
          </div>
        );
      }

      if (trimmed.startsWith('- **')) {
        const [label, ...rest] = trimmed.substring(2).split(':');
        return (
          <div key={idx} className="flex flex-col mb-4 ml-4">
            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{label.replace(/\*\*/g, '')}</span>
            <p className="text-slate-700">{rest.join(':').trim()}</p>
          </div>
        );
      }

      if (trimmed.startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start mb-3 ml-4">
            <span className="text-indigo-500 mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
            <p className="text-slate-700 leading-relaxed">{trimmed.substring(2)}</p>
          </div>
        );
      }

      if (trimmed.includes('|')) {
        if (trimmed.includes('---')) return null;
        const cells = trimmed.split('|').filter(c => c.trim() !== '');
        if (cells.length > 0) {
          return (
            <div key={idx} className="overflow-x-auto my-6 shadow-sm rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <tbody className="bg-white divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    {cells.map((c, i) => (
                      <td key={i} className={`px-4 py-4 text-sm ${idx < 10 ? 'font-bold bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider' : 'text-slate-700'}`}>
                        {c.trim()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
      }

      // Handle Bold and Italic and Code
      let formattedLine = trimmed
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-slate-500">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-sm border border-indigo-100">$1</code>')
        .replace(/<span class="answer-hidden"(.*?)>(.*?)<\/span>/g, '<span class="answer-hidden" $1>$2</span>');

      return (
        <p key={idx} className="leading-relaxed mb-4 text-slate-700" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center no-print">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-700">Giáo án học thuật</span>
            {isSaved && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-black uppercase tracking-widest">Đã lưu</span>}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {onSave && !isSaved && (
            <button 
              onClick={onSave}
              className="flex items-center space-x-2 text-white bg-indigo-600 hover:bg-indigo-700 font-bold text-xs px-4 py-2 rounded-lg shadow-md shadow-indigo-100 transition-all hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Lưu thư viện</span>
            </button>
          )}
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 space-x-1 shadow-sm">
            <button onClick={handleCopy} className="p-2 hover:bg-slate-50 text-slate-500 rounded-md transition-colors" title="Sao chép">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-7 4h7" /></svg>
            </button>
            <button onClick={handleDownloadTxt} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-md transition-colors" title="Xuất .txt">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </button>
            <button onClick={handlePrint} className="p-2 hover:bg-rose-50 text-rose-600 rounded-md transition-colors" title="Xuất PDF">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="p-10 md:p-16 print:p-0">
        <div className="markdown-content max-w-none text-slate-800">
          {renderContent(content)}
        </div>
      </div>
      <div className="bg-slate-900 px-10 py-8 text-white flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 no-print">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Trình độ mục tiêu</p>
            <p className="text-lg font-bold">TOPIK II - Trung & Cao cấp</p>
          </div>
        </div>
        <div className="text-center md:text-right">
          <p className="text-slate-400 text-sm mb-2">Bạn đã sẵn sàng cho bài học tiếp theo?</p>
          <button className="px-8 py-3 bg-white text-slate-900 font-black rounded-xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-lg">
            ĐÁNH DẤU HOÀN THÀNH
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonOutput;
