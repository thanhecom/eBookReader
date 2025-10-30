import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Book, BookContent } from "@shared/schema";
import { ChapterNavigation } from "@/components/ChapterNavigation";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterControls } from "@/components/ChapterControls";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Reader() {
    const [, params] = useRoute("/book/:id");
    const [, setLocation] = useLocation();
    const bookId = params?.id;

    const [currentChapterId, setCurrentChapterId] = useState<string>("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const [isReading, setIsReading] = useState(false); // Trạng thái đọc
    const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null); // Lưu đối tượng phát âm

    const { data: book } = useQuery<Book>({
        queryKey: ["/api/books", bookId],
        enabled: !!bookId,
    });

    const { data: bookContent, isLoading: isLoadingContent } = useQuery<BookContent>({
        queryKey: ["/api/books", bookId, "content"],
        enabled: !!bookId,
    });

    // Khôi phục chương và vị trí cuộn khi mở lại ebook
    useEffect(() => {
        let savedChapterId = null;
        let savedScrollPosition = null;
        // Khôi phục tiến độ từ localStorage khi mở lại sách
        const savedProgress = JSON.parse(localStorage.getItem(bookId) || '{}');
        console.log(savedProgress);
        if (savedProgress && savedProgress.chapterId) {
            savedChapterId = savedProgress.chapterId;
            savedScrollPosition = savedProgress.position;
        }

        if (savedChapterId) {
            setCurrentChapterId(savedChapterId); // Khôi phục chương
        } else if (bookContent?.toc && bookContent.toc.length > 0 && !currentChapterId) {
            setCurrentChapterId(bookContent.toc[0].id); // Gán chương đầu tiên nếu chưa có chương nào
        }

        if (savedScrollPosition) {
            window.scrollTo(0, Number(savedScrollPosition)); // Khôi phục vị trí cuộn
        }
    }, [bookContent, bookId, currentChapterId]);

    // Lưu chương và vị trí cuộn vào localStorage
    const handleScroll = (scrollY: number) => {
        if (scrollY > lastScrollY.current && scrollY > 100) {
            setIsHeaderVisible(false);
        } else if (scrollY < lastScrollY.current) {
            setIsHeaderVisible(true);
        }
        lastScrollY.current = scrollY;

        // Lưu vị trí cuộn vào localStorage
        saveProgress(currentChapterId, scrollY);
    };

    // Cập nhật chương khi người dùng chuyển chương
    const currentChapter = bookContent?.chapters.find(
        (ch) => ch.id === currentChapterId
    );

    const currentChapterIndex = bookContent?.toc.findIndex(
        (ch) => ch.id === currentChapterId
    ) ?? -1;

    const handlePreviousChapter = () => {
        if (bookContent && currentChapterIndex > 0) {
            let chapterId = bookContent.toc[currentChapterIndex - 1].id;
            setCurrentChapterId(chapterId);
            setIsSidebarOpen(false);
            saveProgress(chapterId,0);
        }
    };

    const handleNextChapter = () => {
        if (bookContent && currentChapterIndex < bookContent.toc.length - 1) {
            let chapterId = bookContent.toc[currentChapterIndex + 1].id;
            setCurrentChapterId(chapterId);
            setIsSidebarOpen(false);
            saveProgress(chapterId,0);
        }
    };

    const handleChapterSelect = (chapterId: string) => {
        setCurrentChapterId(chapterId);
        setIsSidebarOpen(false);
        saveProgress(chapterId,0);
    };

    const saveProgress = (newChapterId: string, newPosition: number) => {
        const progressData = { chapterId: newChapterId, position: newPosition };
        localStorage.setItem(bookId, JSON.stringify(progressData));
    };

    // Hàm để xác định đoạn văn bản từ vị trí người dùng nhấp vào
    const handleTextClick = (event: React.MouseEvent) => {
        const targetElement = event.target as HTMLElement;
        console.log(targetElement);

        // Tìm phần tử cha của chương (giả sử chúng ta có thể xác định chương bằng class hoặc ID)
        const chapterElement = targetElement.closest('.chapter'); // Giả sử phần tử chương có class 'chapter'
        if (!chapterElement) {
            console.error('Không tìm thấy phần tử chương.');
            return;
        }

        // Khởi tạo textContent chứa tất cả văn bản cần đọc
        let textContent = '';

        // Tìm vị trí của văn bản trong phần tử được nhấp
        let currentElement: HTMLElement | null = targetElement;
        let foundTarget = false;

        // Duyệt qua các phần tử của chương từ vị trí nhấp chuột đến cuối chương
        while (currentElement && currentElement !== chapterElement) {
            // Nếu phần tử này chứa văn bản (text node)
            if (currentElement.nodeType === 3) { // text node (nodeType = 3)
                if (!foundTarget) {
                    // Lấy phần văn bản từ vị trí click cho đến hết đoạn văn bản hiện tại
                    const selection = window.getSelection();
                    if (!selection) return;

                    const range = selection.getRangeAt(0);
                    const startOffset = range.startOffset;
                    textContent += currentElement.textContent || '';
                    foundTarget = true; // Đánh dấu là đã tìm thấy vị trí bắt đầu
                } else {
                    // Nếu đã tìm thấy vị trí nhấp, lấy toàn bộ văn bản còn lại
                    textContent += currentElement.textContent || '';
                }
            }
            // Nếu phần tử này là một phần tử HTML chứa văn bản (ví dụ: <p>, <div>, <span> ...)
            else if (currentElement.nodeType === 1) { // element node (nodeType = 1)
                if (!foundTarget) {
                    // Nếu chưa tìm thấy vị trí click, tiếp tục duyệt qua các phần tử để tìm phần tử chứa văn bản
                    const selection = window.getSelection();
                    if (!selection) return;

                    const range = selection.getRangeAt(0);
                    const startOffset = range.startOffset;

                    // Kiểm tra xem phần tử này có chứa văn bản, nếu có thì lấy văn bản từ vị trí bắt đầu
                    if (currentElement.textContent) {
                        textContent += currentElement.textContent;
                    }
                    foundTarget = true; // Đánh dấu là đã tìm thấy vị trí bắt đầu
                } else {
                    // Sau khi tìm thấy vị trí click, lấy toàn bộ nội dung còn lại trong phần tử này
                    textContent += currentElement.textContent || '';
                }
            }

            // Tiến đến phần tử tiếp theo trong chương
            currentElement = currentElement.nextElementSibling as HTMLElement;
        }

        // Nếu không có văn bản được lấy từ DOM, ta sẽ lấy toàn bộ văn bản từ `currentChapter.content` nếu cần
        if (!textContent) {
            textContent = currentChapter.content || '';
        }

        // Phát âm văn bản từ vị trí click trở đi
        speakText(textContent);
    };


    // Hàm TTS
    const speakText = (text: string) => {
        if (utterance) {
            speechSynthesis.cancel(); // Hủy việc phát âm cũ nếu có
        }

        const newUtterance = new SpeechSynthesisUtterance(text);
        newUtterance.lang = 'vi-VN';
        newUtterance.onend = () => {
            setIsReading(false); // Đánh dấu việc phát âm đã xong
            // Tự động chuyển sang chương tiếp theo
            handleNextChapter();
        };
        setUtterance(newUtterance);
        speechSynthesis.speak(newUtterance); // Phát âm văn bản
        setIsReading(true); // Đánh dấu là đang đọc
    };

    if (!bookId) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            <header
                className={`sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b h-16 flex items-center px-4 gap-3 transition-transform duration-300 ${
                    isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLocation("/")}
                    data-testid="button-back-to-library"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            data-testid="button-toggle-sidebar"
                        >
                            {isSidebarOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] p-0">
                        {bookContent && (
                            <ChapterNavigation
                                chapters={bookContent.toc}
                                currentChapterId={currentChapterId}
                                onChapterSelect={handleChapterSelect}
                            />
                        )}
                    </SheetContent>
                </Sheet>

                <div className="flex-1 min-w-0">
                    <h1
                        className="font-semibold truncate"
                        data-testid="text-book-title"
                    >
                        {book?.title || "Đang tải..."}
                    </h1>
                </div>

                <ThemeToggle />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => currentChapter && speakText(currentChapter.content)}
                    disabled={isReading}
                >
                    {isReading ? 'Đang đọc...' : 'Phát âm'}
                </Button>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside className="hidden lg:block w-[300px] border-r">
                    {bookContent && (
                        <ChapterNavigation
                            chapters={bookContent.toc}
                            currentChapterId={currentChapterId}
                            onChapterSelect={handleChapterSelect}
                        />
                    )}
                </aside>

                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-hidden chapter"
                         onClick={handleTextClick} // Thêm sự kiện nhấp chuột vào văn bản
                    >
                        {currentChapter ? (
                            <ChapterContent
                                title={currentChapter.title}
                                content={currentChapter.content}
                                isLoading={isLoadingContent}
                                onScroll={handleScroll} // Đảm bảo bạn truyền hàm handleScroll vào đây
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">Đang tải nội dung...</p>
                            </div>
                        )}
                    </div>

                    {bookContent && (
                        <ChapterControls
                            currentChapter={currentChapterIndex + 1}
                            totalChapters={bookContent.toc.length}
                            onPrevious={handlePreviousChapter}
                            onNext={handleNextChapter}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
