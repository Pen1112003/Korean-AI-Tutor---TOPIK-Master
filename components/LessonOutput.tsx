
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
    // Extract title for filename
    const titleMatch = content.match(/^# (.*)/m);
    const title = titleMatch ? titleMatch[1].replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'lesson';
    const filename = `${title}.txt`;

    // Create a version of the content without markdown symbols for better readability in plain text if desired
    // But usually saving the raw markdown as .txt or .md is preferred for students
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

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden mb-12">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center no-print">
        <span className="text-sm font-medium text-slate-600 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Kết quả phân tích học thuật {isSaved && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-bold uppercase">Đã lưu</span>}
        </span>
        <div className="flex items-center space-x-2">
          {onSave && !isSaved && (
            <button 
              onClick={onSave}
              className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 transition-all mr-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Lưu thư viện</span>
            </button>
          )}
          <div className="flex border-l border-slate-200 pl-2 space-x-1">
            <button 
              onClick={handleCopy}
              className="text-slate-500 hover:text-indigo-600 p-1.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-all"
              title="Sao chép"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-7 4h7" />
              </svg>
            </button>
            <button 
              onClick={handleDownloadTxt}
              className="text-slate-500 hover:text-emerald-600 p-1.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-all"
              title="Xuất .txt"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button 
              onClick={handlePrint}
              className="text-slate-500 hover:text-red-600 p-1.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-all"
              title="Xuất PDF"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="p-8 md:p-12 print:p-0">
        <div 
          className="markdown-content prose max-w-none text-slate-800"
          dangerouslySetInnerHTML={{ __html: content.split('\n').map(line => {
             if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold text-slate-900 mb-6 border-b-4 border-indigo-600 pb-2 uppercase tracking-wide">${line.substring(2)}</h1>`;
             if (line.startsWith('### ')) return `<h3 class="text-xl font-bold text-indigo-700 mt-10 mb-4 flex items-center"><span class="w-1.5 h-6 bg-indigo-600 mr-3 rounded-full"></span>${line.substring(4)}</h3>`;
             if (line.startsWith('*')) return `<p class="text-sm font-medium text-slate-500 mb-6 italic">${line}</p>`;
             if (line.startsWith('- ')) return `<div class="flex items-start mb-3"><span class="text-indigo-500 mr-2">•</span><p class="text-slate-700">${line.substring(2)}</p></div>`;
             if (line.includes('|')) {
                 if (line.includes('---')) return '';
                 const cells = line.split('|').filter(c => c.trim() !== '');
                 if (cells.length > 0) {
                     return `<div class="overflow-x-auto my-6"><table class="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                        <tr class="bg-slate-50">
                            ${cells.map(c => `<td class="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border">${c.trim()}</td>`).join('')}
                        </tr>
                     </table></div>`;
                 }
             }
             if (line.trim() === '') return '<div class="h-2"></div>';
             
             let formattedLine = line
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-sm border border-indigo-100">$1</code>');
             
             return `<p class="leading-relaxed mb-4 text-slate-700">${formattedLine}</p>`;
          }).join('') }}
        />
      </div>
      <div className="bg-indigo-900 px-8 py-6 text-indigo-100 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 no-print">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Progress Tracker</p>
            <p className="font-medium text-sm">Bài học này bao gồm nội dung chuẩn TOPIK 2</p>
          </div>
        </div>
        <button className="px-6 py-2 bg-white text-indigo-900 font-bold rounded-lg shadow-sm hover:bg-indigo-50 transition-colors">
          Hoàn thành bài học
        </button>
      </div>
    </div>
  );
};

export default LessonOutput;
