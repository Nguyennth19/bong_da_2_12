# Đăng ký bóng đá 2/12 — Google Apps Script

Web App dành cho phụ huynh lớp 2/12: chọn **Thi đấu / Cổ vũ**, áo bóng đá, size, số áo và tên in trên áo; lưu về Google Sheets hiện có.

## Nguồn dữ liệu
- [Google Sheet DA_BONG_2_12](https://docs.google.com/spreadsheets/d/1hZc7Xvpy2jfBRZZF0o07msk6zc6TgZBst4PDrC4fdtk/edit), tab `DANH SACH HOC SINH` có 43 em vào thời điểm khảo sát.
- [Ảnh áo đấu](https://drive.google.com/file/d/1ZRsAJOUB4ASQ6DFMd-pW0lNhWVC5UD93/view)
- [Bảng size ảnh gốc](https://drive.google.com/file/d/19FmCI4RBG1WGtMCtg-ZmfUs1Ae8EH_6N/view)

Giá mẫu áo **147.000đ/bộ**; các size bán theo ảnh là **5, 7, 9, 11, 13**. Size 1, 3, 15 chỉ để tham khảo. Bảng nhà cung cấp không có cột chiều cao: ứng dụng không tự bịa số đo.

## Cấu trúc mã nguồn
- `Code.gs`: kiểm tra dữ liệu, tìm tên không dấu, lưu một bản ghi / học sinh, kiểm soát số áo trùng ở nhóm Thi đấu, tạo bảng in.
- `Index.html`: giao diện responsive, ảnh áo gốc, bảng size, hai danh sách và nút in.
- `appsscript.json`: manifest Apps Script V8, scopes truy cập Google Sheets và đọc ảnh Drive.
- `.clasp.example.json`: cấu hình Script ID mẫu. `.clasp.json` thật không được commit.
- `QA.md`: checklist nghiệm thu.

## Đồng bộ từ GitHub về Google Apps Script bằng clasp

1. Cài Node.js và `npm install -g @google/clasp`.
2. `git clone https://github.com/Nguyennth19/bong_da_2_12.git`
3. `cd bong_da_2_12 && git checkout feat/registration-webapp-v1`
4. `clasp login` bằng tài khoản có quyền sửa Sheet và đọc hai ảnh.
5. Nếu **đã có project Apps Script**, copy `.clasp.example.json` thành `.clasp.json`; thay `DAN_SCRIPT_ID_CUA_BAN` bằng Script ID trong **Project Settings**.
6. Nếu **chưa có project**, dùng `clasp create --type standalone --title "Dang ky bong da 2-12"` trong thư mục repo (lệnh tạo `.clasp.json`). Kiểm tra file trước khi push.
7. Chạy `clasp status`, rồi `clasp push`.
8. Mở Apps Script Editor, chạy hàm **`setupProject()` đúng một lần** và cấp quyền. Hàm này thêm `STUDENT_ID` vào cột C của tab học sinh, giữ nguyên tên ở cột B, đồng thời tạo 3 tab đăng ký và báo cáo.

**Lưu ý:** `clasp push` thay mã nguồn đang có trong project Apps Script đích. Nên chọn một project mới nếu chưa có quy trình kiểm soát phiên bản/backup.

## Triển khai Web App
Apps Script → **Deploy → New deployment → Web app**:
- Execute as: **Me** (chủ sở hữu hoặc tài khoản được cấp quyền sửa file và đọc ảnh).
- Who has access: giới hạn theo nhóm phụ huynh có tài khoản Google phù hợp. Không phát link ra ngoài nhóm lớp.
- Deploy → cấp quyền → sao chép link `/exec` để chia sẻ.

Sau mỗi lần cập nhật source, **Manage deployments → Edit → New version** để `/exec` nhận code mới. URL `/dev` chạy code mới nhất nhưng dành cho người có quyền chỉnh sửa project.

## Cấu trúc Google Sheets

| Tab | Chức năng |
| --- | --- |
| `DANH SACH HOC SINH` | A: STT; B: họ tên; C: mã học sinh tạo một lần |
| `DANG_KY` | Dữ liệu đăng ký chính; mật mã sửa được lưu dưới dạng SHA-256 |
| `DS_THI_DAU` | STT, họ tên, số áo; chỉ các em Thi đấu |
| `DS_DAT_AO` | STT, họ tên, tên in áo, size, số áo, vai trò; cả Thi đấu và Cổ vũ |

Danh sách in **xếp theo tên gọi cuối A–Z** (quy ước xếp tên phổ biến của trường Việt Nam), khi trùng tên gọi thì xếp theo họ tên; STT đánh lại tự động. Trình duyệt cho phép in khổ A4 hoặc lưu PDF.

## Quy tắc V1
- Không có checkbox mua áo: mỗi lượt đăng ký phải điền đầy đủ thông tin một bộ áo.
- Tên in áo mặc định lấy **tên lót + tên** (bỏ họ đầu tiên), có thể sửa.
- Một học sinh chỉ có một bản ghi; đăng ký lại trên **cùng trình duyệt** có mã lưu cục bộ thì cập nhật bản ghi.
- Thiết bị khác không có mã sửa sẽ không ghi đè dữ liệu đã đăng ký; cần liên hệ ban tổ chức.
- Số áo 0–99; **không được trùng giữa hai học sinh Thi đấu**.
- Ảnh lấy từ Drive bằng quyền của tài khoản triển khai và được nhúng vào trang, không cần mở công khai quyền truy cập ảnh.

## Quyền riêng tư
Tên học sinh đã đăng ký xuất hiện trong hai danh sách trên trang. Chỉ gửi link cho người được phép xem thông tin của nhóm lớp. Không cấp quyền Editor của Sheet cho toàn bộ phụ huynh; không đẩy danh sách học sinh và đơn áo lên GitHub.

Xem [QA.md](QA.md) trước khi sử dụng chính thức.
