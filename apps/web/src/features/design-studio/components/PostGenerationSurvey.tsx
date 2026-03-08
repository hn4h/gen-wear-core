import { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageSquarePlus } from 'lucide-react';

const XIcon = X as any;
const CheckCircle2Icon = CheckCircle2 as any;
const MessageSquarePlusIcon = MessageSquarePlus as any;

interface PostGenerationSurveyProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUESTIONS = [
    {
        id: 'q1',
        title: '1. Trải nghiệm tổng thể từ thiết kế → thanh toán',
        question: 'Bạn đánh giá trải nghiệm từ lúc tạo thiết kế đến thao tác thanh toán trên website như thế nào?',
        options: [
            'Rất dễ sử dụng, mượt mà',
            'Khá dễ sử dụng',
            'Bình thường',
            'Hơi khó thao tác ở một số bước',
            'Khó sử dụng / cần cải thiện nhiều'
        ]
    },
    {
        id: 'q2',
        title: '2. Phiên bản Free và Pro',
        question: 'Sau khi trải nghiệm thiết kế, bạn thấy phiên bản Free và Pro hiện tại như thế nào?',
        options: [
            'Phiên bản Free đã đủ dùng với tôi',
            'Tôi sẵn sàng nâng cấp Pro để có thêm tính năng',
            'Tôi thấy ổn nhưng muốn thêm gói khác (ví dụ gói trung cấp)',
            'Tôi chưa hiểu rõ sự khác nhau giữa Free và Pro',
            'Ý kiến khác'
        ]
    },
    {
        id: 'q3',
        title: '3. Đánh giá về website GenWear',
        question: 'Bạn cảm nhận thế nào về giao diện và ý tưởng của website GenWear?',
        options: [
            'Rất ấn tượng và sáng tạo',
            'Giao diện đẹp, dễ dùng',
            'Khá ổn',
            'Bình thường',
            'Cần cải thiện thêm'
        ]
    },
    {
        id: 'q4',
        title: '4. Mức độ hài lòng với thiết kế đã tạo',
        question: 'Bạn cảm thấy thế nào về thiết kế mà mình vừa tạo ra trên GenWear?',
        options: [
            'Rất đẹp và sáng tạo',
            'Đẹp, có tính nghệ thuật',
            'Khá ổn, dùng được',
            'Chưa thật sự nổi bật',
            'Cần chỉnh sửa thêm để đúng ý hơn'
        ]
    },
    {
        id: 'q5',
        title: '5. Nếu GenWear có thể cải thiện thêm',
        question: 'Nếu GenWear cải thiện thêm, bạn mong muốn điều gì nhất?',
        options: [
            'Nhiều mẫu / template hơn',
            'Có thêm bộ sưu tập thiết kế sẵn (BST) theo chủ đề',
            'Công cụ custom mạnh hơn',
            'Giá tốt hơn / ưu đãi nhiều hơn',
            'Thanh toán nhanh và đơn giản hơn',
            'Tôi đã hài lòng, chưa cần cải thiện gì'
        ]
    }
];

export function PostGenerationSurvey({ isOpen, onClose }: PostGenerationSurveyProps) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isStarted, setIsStarted] = useState(false);

    // Reset state when modal is opened again
    useEffect(() => {
        if (isOpen) {
            setAnswers({});
            setIsSubmitted(false);
            setIsStarted(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSelectOption = (questionId: string, option: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const handleSubmit = () => {
        console.log("Survey Answers Submitted:", answers);
        setIsSubmitted(true);
        setTimeout(() => {
            onClose();
        }, 3000); // Tự đóng sau 3 giây
    };

    const allAnswered = QUESTIONS.every(q => answers[q.id]);

    // Trạng thái thành công
    if (isSubmitted) {
        return (
            <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-8 fade-in duration-500">
                <div className="bg-slate-900 border border-green-500/30 rounded-2xl p-6 w-[360px] shadow-[0_10px_40px_-10px_rgba(34,197,94,0.2)] flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex flex-shrink-0 items-center justify-center">
                        <CheckCircle2Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white mb-1">Cảm ơn bạn!</h3>
                        <p className="text-sm text-slate-400">Những đánh giá của bạn là rất quý giá để chúng tôi cải thiện.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Bước 1: Opt-in (Card nhỏ không cản tầm nhìn)
    if (!isStarted) {
        return (
            <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-8 fade-in duration-500">
                <div className="bg-slate-900/95 border border-purple-500/30 rounded-2xl p-6 w-[360px] shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[30px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-5 relative z-10">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                                <MessageSquarePlusIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Khảo sát trải nghiệm</h3>
                                <p className="text-sm text-slate-400 mt-1 leading-relaxed">Dành 1 phút đánh giá để giúp GenWear cải thiện nhé!</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 -mr-2 -mt-2">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex gap-3 relative z-10">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors border border-white/10"
                        >
                            Bỏ qua
                        </button>
                        <button 
                            onClick={() => setIsStarted(true)}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
                        >
                            Làm khảo sát
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Bước 2: Bảng khảo sát chi tiết (Vẫn nằm góc dưới phải, có thể cuộn, không block màn hình giữa)
    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-8 fade-in duration-300 pointer-events-none">
            {/* The outer container is pointer-events-none to let clicks pass through to design canvas if needed, 
                but actually the inner card will be pointer-events-auto */}
            <div className="bg-slate-900/95 border border-purple-500/30 rounded-2xl w-[400px] shadow-[0_10px_50px_-10px_rgba(168,85,247,0.3)] relative overflow-hidden backdrop-blur-xl pointer-events-auto flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="flex-shrink-0 border-b border-white/10 p-5 flex items-center justify-between z-10 bg-slate-900/95">
                    <div>
                        <h2 className="text-lg font-bold text-white">Khảo sát GenWear</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Questions Container */}
                <div className="p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    {QUESTIONS.map((q) => (
                        <div key={q.id} className="bg-slate-800/40 p-5 rounded-xl border border-white/5">
                            <h3 className="text-sm font-bold text-purple-400 mb-1">{q.title}</h3>
                            <p className="text-sm text-white mb-4">{q.question}</p>
                            
                            <div className="space-y-2">
                                {q.options.map((option) => (
                                    <label 
                                        key={option} 
                                        className={`flex items-start p-2.5 rounded-lg border cursor-pointer transition-all ${
                                            answers[q.id] === option 
                                                ? 'bg-purple-600/20 border-purple-500/50 text-white' 
                                                : 'bg-slate-900/50 border-white/10 text-slate-300 hover:bg-slate-800/80'
                                        }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name={q.id} 
                                            value={option}
                                            checked={answers[q.id] === option}
                                            onChange={() => handleSelectOption(q.id, option)}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 mt-0.5 rounded-full border flex flex-shrink-0 items-center justify-center mr-3 ${
                                            answers[q.id] === option ? 'border-purple-500' : 'border-slate-500'
                                        }`}>
                                            {answers[q.id] === option && (
                                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                            )}
                                        </div>
                                        <span className="text-sm leading-snug">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="flex-shrink-0 p-5 border-t border-white/10 bg-slate-900/95 flex items-center justify-end gap-3 z-10">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl text-sm border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white font-medium transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className="px-6 py-2 rounded-xl text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                    >
                        Gửi đánh giá
                    </button>
                </div>
                
                {/* Embedded scrollbar styling for this component */}
                <style dangerouslySetInnerHTML={{__html: `
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: rgba(255, 255, 255, 0.1);
                        border-radius: 20px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(255, 255, 255, 0.2);
                    }
                `}} />
            </div>
        </div>
    );
}
