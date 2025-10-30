# EPUB Reader - Ứng dụng đọc sách offline

## Tổng quan
Ứng dụng đọc sách EPUB offline được xây dựng bằng React, TypeScript, Express.js và Tailwind CSS. Ứng dụng cho phép người dùng đọc các file EPUB được lưu trữ trong thư mục `books` với giao diện đẹp mắt và chuyên nghiệp.

## Tính năng chính
- ✅ Quét và hiển thị danh sách sách từ thư mục `books`
- ✅ Trích xuất metadata từ EPUB (tiêu đề, tác giả, mô tả, ảnh bìa)
- ✅ Hiển thị ảnh bìa sách (nếu có) hoặc biểu tượng mặc định
- ✅ Đọc nội dung sách theo từng chương
- ✅ Điều hướng giữa các chương (trước/sau)
- ✅ Mục lục tương tác để nhảy nhanh giữa các chương
- ✅ Chế độ sáng/tối (Dark mode)
- ✅ Giao diện responsive cho mobile, tablet, desktop
- ✅ Bảo mật: Sanitize HTML content để ngăn chặn XSS attacks

## Cấu trúc dự án

### Frontend (`client/`)
- `src/pages/Library.tsx` - Trang thư viện hiển thị danh sách sách
- `src/pages/Reader.tsx` - Trang đọc sách với điều hướng chương
- `src/components/` - Các component UI tái sử dụng
  - `BookCard.tsx` - Card hiển thị thông tin sách
  - `BookGrid.tsx` - Grid layout cho danh sách sách
  - `ChapterNavigation.tsx` - Sidebar mục lục
  - `ChapterContent.tsx` - Hiển thị nội dung chương (có sanitization)
  - `ChapterControls.tsx` - Nút điều hướng chương
  - `ThemeProvider.tsx` & `ThemeToggle.tsx` - Quản lý theme

### Backend (`server/`)
- `epubParser.ts` - Parser để đọc và trích xuất dữ liệu từ EPUB files
- `routes.ts` - API endpoints cho books và chapters
- `storage.ts` - In-memory storage cho books và content

### Shared (`shared/`)
- `schema.ts` - TypeScript types và Zod schemas cho Book, Chapter, BookContent

## Cách sử dụng

### Thêm sách vào thư viện
1. Tạo thư mục `books` ở root của project (nếu chưa có)
2. Copy các file EPUB (`.epub`) vào thư mục `books`
3. Khởi động lại ứng dụng hoặc reload trang
4. Các sách sẽ tự động được quét và hiển thị

### Đọc sách
1. Trên trang Library, click vào bìa sách hoặc tiêu đề để mở sách
2. Sử dụng sidebar (desktop) hoặc menu (mobile) để xem mục lục
3. Click vào tên chương để nhảy đến chương đó
4. Sử dụng nút "Chương trước" / "Chương sau" để điều hướng
5. Click nút back để quay về thư viện

### Chuyển đổi theme
- Click vào icon mặt trời/mặt trăng ở góc trên bên phải để chuyển giữa chế độ sáng/tối

## Công nghệ sử dụng

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI components
- Wouter (routing)
- TanStack Query (data fetching)
- DOMPurify (HTML sanitization)

### Backend
- Express.js
- adm-zip (EPUB parsing)
- xml2js (XML parsing)
- TypeScript

## Design Guidelines
Ứng dụng tuân theo Material Design principles:
- Typography: Inter cho UI, Merriweather cho nội dung đọc
- Spacing: Consistent spacing với scale 2, 3, 4, 6, 8, 12
- Colors: Semantic color system với dark mode support
- Layout: Responsive grid layout với breakpoints md, lg, xl
- Components: Sử dụng Shadcn UI components

## API Endpoints

### GET /api/books
Trả về danh sách tất cả sách trong thư viện
```json
[
  {
    "id": "uuid",
    "filename": "book.epub",
    "title": "Tên sách",
    "author": "Tác giả",
    "description": "Mô tả",
    "coverImage": "data:image/jpeg;base64,...",
    "language": "vi",
    "publisher": "Nhà xuất bản"
  }
]
```

### GET /api/books/:id
Trả về thông tin chi tiết của một cuốn sách

### GET /api/books/:id/content
Trả về nội dung đầy đủ của sách (tất cả chương + mục lục)
```json
{
  "bookId": "uuid",
  "chapters": [...],
  "toc": [
    {
      "id": "chapter-uuid",
      "title": "Tên chương",
      "order": 1
    }
  ]
}
```

## Lưu ý
- Ứng dụng chỉ parse metadata khi khởi động, nội dung sách được load on-demand khi user mở sách
- Book IDs được generate deterministic từ filename (SHA256 hash) để ổn định qua các lần restart
- Với EPUB files rất lớn (>100MB), có thể gặp vấn đề về memory khi load toàn bộ chapters
- HTML content từ EPUB được sanitize bằng DOMPurify để đảm bảo an toàn chống XSS
- Ảnh bìa được encode thành base64 để hiển thị nhanh
- Reader header tự động ẩn khi scroll xuống để tập trung vào nội dung đọc

## Phát triển tiếp
- [ ] Streaming/pagination cho file EPUB rất lớn
- [ ] Lưu vị trí đọc cuối cùng
- [ ] Bookmarks và highlights
- [ ] Tìm kiếm sách theo tên/tác giả
- [ ] Tùy chỉnh font size và line spacing
- [ ] Export notes và highlights
