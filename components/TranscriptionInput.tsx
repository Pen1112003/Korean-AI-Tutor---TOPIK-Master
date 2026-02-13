
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

interface Props {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const TranscriptionInput: React.FC<Props> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Manual encode function as per guidelines
  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const stopRecording = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Create fresh instance as per guidelines
      const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsRecording(true);
            const source = audioContext.createMediaStreamSource(stream);
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const base64Data = encode(new Uint8Array(int16.buffer));
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const transcribedText = message.serverContent.inputTranscription.text;
              setText((prev) => prev + transcribedText);
            }
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            stopRecording();
          },
          onclose: () => {
            setIsRecording(false);
          }
        },
        config: {
          // Fixed typo: responseModalalities -> responseModalities
          responseModalities: [Modality.AUDIO],
          // Explicitly adding speechConfig with a voice to satisfy audio request requirements
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }
            }
          },
          inputAudioTranscription: {},
          systemInstruction: 'Bạn là chuyên gia ghi chép bài giảng song ngữ Hàn-Việt. Nhiệm vụ của bạn là lắng nghe và chuyển giọng nói thành văn bản cực kỳ chính xác. Hãy ưu tiên viết tiếng Hàn bằng Hangul nếu bạn nhận diện được từ đó, và tiếng Việt chuẩn xác.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Không thể truy cập micro. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const handleSubmit = () => {
    if (text.trim().length < 10) {
      alert("Nội dung quá ngắn để phân tích. Vui lòng nhập hoặc thu âm thêm.");
      return;
    }
    onAnalyze(text);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 relative overflow-hidden">
      {isRecording && (
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100 overflow-hidden">
          <div className="h-full bg-indigo-600 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="block text-sm font-bold text-slate-700">
            Nội dung bài giảng (Live Transcription)
          </label>
          <p className="text-xs text-slate-400">Ghi lại lời giảng của giáo viên để AI hệ thống hóa</p>
        </div>
        <button
          onClick={toggleRecording}
          disabled={isLoading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${
            isRecording 
              ? 'bg-red-500 text-white hover:bg-red-600 ring-4 ring-red-100' 
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-indigo-400'}`}></div>
          <span>{isRecording ? 'Đang lắng nghe...' : 'Bắt đầu thu âm'}</span>
        </button>
      </div>
      
      <div className="relative">
        <textarea
          className="w-full h-56 p-5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 resize-none mb-4 leading-relaxed"
          placeholder="Nhấn 'Bắt đầu thu âm' và giáo viên có thể bắt đầu giảng bài. AI sẽ tự động hiển thị văn bản tại đây..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading || isRecording}
        />
        {isRecording && (
          <div className="absolute bottom-8 right-6 flex items-center space-x-2 text-indigo-600 font-medium text-xs bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Real-time Speech to Text Active</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-start space-x-3 max-w-md">
          <div className="mt-1 bg-green-100 text-green-600 p-1 rounded-full flex-shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 leading-normal">
            <strong>Đảm bảo nội dung chính xác:</strong> AI sẽ tự động hiệu đính các lỗi phát âm, chuyển đổi phiên âm sang Hangul và sửa ngữ pháp TOPIK trong bước phân tích cuối cùng.
          </p>
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto">
          <button
            onClick={() => setText('')}
            className="flex-1 md:flex-none px-6 py-2.5 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors border border-transparent hover:bg-slate-50 rounded-lg"
          >
            Làm mới
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !text.trim() || isRecording}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-3 px-10 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
              isLoading || !text.trim() || isRecording
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang xử lý giáo án...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Hệ thống hóa bài học</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
};

export default TranscriptionInput;
