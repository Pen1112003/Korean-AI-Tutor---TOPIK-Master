
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
    1. Hiệu đính STT (Speech-to-Text): Bản ghi có thể chứa lỗi do AI nghe nhầm. 
       - Chuyển đổi các từ phiên âm sang Hangul chính xác (VD: "nê" -> "네").
       - Đảm bảo các thuật ngữ chuyên môn TOPIK được viết đúng chính tả.

    2. Cấu trúc nội dung (Định dạng MARKDOWN):

    # 🎓 [Tên bài giảng: Viết in hoa có dấu]
    *Ngày hệ thống: [Ngày hiện tại]*

    ### 📌 Tóm tắt bài giảng
    - [Ý chính 1]
    - [Ý chính 2]

    ### 📚 Từ vựng cốt lõi (TOPIK 2 Focus)
    | Từ vựng (Hangul) | Hán tự | Loại từ | Nghĩa tiếng Việt | Ví dụ minh họa |
    | :--- | :--- | :--- | :--- | :--- |

    ### ⚖️ Hệ thống Ngữ pháp chuyên sâu
    Với mỗi cấu trúc, hãy trình bày:
    - **Cấu trúc:** [Công thức chia động/tính từ]
    - **Cách dùng:** [Giải thích ngắn gọn bằng tiếng Việt]
    - **Ví dụ từ bài giảng:** [Trích dẫn từ bản ghi]
    - **Ví dụ bổ sung (Practical Application):** [Cung cấp một câu ví dụ thực tế hoàn toàn mới để người học hiểu cách áp dụng linh hoạt]
    - **Lưu ý:** [So sánh ngữ pháp tương đương hoặc cách dùng kính ngữ]

    ### 💬 Câu mẫu ứng dụng thực tế
    - [Câu 1: Tiếng Hàn - Dịch nghĩa]
    - [Câu 2: Tiếng Hàn - Dịch nghĩa]

    ### ✍️ Bài tập củng cố (Quiz)
    Tạo 3 câu hỏi trắc nghiệm hoặc điền từ. Đáp án bọc trong tag: <span class="answer-hidden" onclick="this.className='answer-visible'">[Đáp án]</span>.

    LUÔN GIỮ TONE GIỌNG CHUYÊN NGHIỆP, TẬN TÂM. Trình bày Markdown sạch sẽ, sử dụng Emoji phù hợp để bài học sinh động.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Hãy phân tích và hệ thống hóa bản ghi bài giảng sau đây, đảm bảo sửa lỗi Speech-to-Text và cung cấp ví dụ bổ sung cho ngữ pháp: "${transcription}"`,
      config: {
        systemInstruction,
        temperature: 0.2, // Lowered for even more consistent academic output
      },
    });

    return response.text || "Xin lỗi, tôi không thể xử lý nội dung này. Vui lòng thử lại.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Đã có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra kết nối mạng.");
  }
};
