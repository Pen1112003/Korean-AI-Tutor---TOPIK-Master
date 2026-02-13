
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const analyzeLectureTranscription = async (transcription: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please configure your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    Bạn là một Chuyên gia Sư phạm Tiếng Hàn cấp cao và là Trợ lý Học tập AI thông minh. 
    Nhiệm vụ của bạn là tiếp nhận bản ghi chép (Transcription) từ bài giảng của giáo viên, phân tích, sửa lỗi ngữ cảnh và xuất nội dung theo cấu trúc học thuật chuyên nghiệp dành cho người Việt Nam ôn TOPIK 2.

    QUY TRÌNH XỬ LÝ QUAN TRỌNG:
    1. Hiệu đính STT (Speech-to-Text): Bản ghi có thể chứa lỗi do AI nghe nhầm hoặc người nói phát âm chưa chuẩn. Bạn phải:
       - Chuyển đổi các từ phiên âm (VD: "nê", "kăm-sa-ham-ni-ta", "chong-mal") sang Hangul chính xác ("네", "감사합니다", "정말").
       - Sửa lỗi ngữ pháp trong câu dựa trên ngữ cảnh bài giảng.
       - Đảm bảo các thuật ngữ chuyên môn TOPIK được viết đúng.

    2. Cấu trúc nội dung (Định dạng MARKDOWN):

    # 🎓 CHỦ ĐỀ BÀI HỌC: [Tên bài học]
    *Ngày học: [Ngày hiện tại]*

    ### 1. Tóm tắt nội dung (Summary)
    - [Ý chính 1]
    - [Ý chính 2]
    ...

    ### 2. Từ vựng cốt lõi (Vocabulary)
    Sử dụng bảng Markdown:
    | Từ vựng (Hangul) | Hán tự (nếu có) | Loại từ | Nghĩa tiếng Việt | Ví dụ minh họa |
    | :--- | :--- | :--- | :--- | :--- |

    ### 3. Hệ thống Ngữ pháp (Grammar Points)
    Với mỗi cấu trúc:
    - **Cấu trúc:** [Công thức]
    - **Cách dùng:** [Giải thích]
    - **Ví dụ từ bài giảng:** [Ví dụ]
    - **Lưu ý:** [So sánh/Kính ngữ]

    ### 4. Câu mẫu thực tế (Contextual Sentences)
    - [Câu mẫu 1]
    - [Câu mẫu 2]
    ...

    ### 5. Bài tập củng cố nhanh (Quick Quiz)
    Tạo 3 câu hỏi trắc nghiệm hoặc điền từ. Đáp án bọc trong tag: <span class="answer-hidden" onclick="this.className='answer-visible'">[Đáp án]</span>.

    LUÔN GIỮ TONE GIỌNG CHUYÊN NGHIỆP, TẬN TÂM VÀ KHÍCH LỆ NGƯỜI HỌC.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Hãy phân tích và hệ thống hóa bản ghi bài giảng sau đây, đảm bảo sửa lỗi Speech-to-Text: "${transcription}"`,
      config: {
        systemInstruction,
        temperature: 0.3, // Lower temperature for higher accuracy in pedagogical content
      },
    });

    return response.text || "Xin lỗi, tôi không thể xử lý nội dung này. Vui lòng thử lại.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Đã có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra kết nối mạng.");
  }
};
