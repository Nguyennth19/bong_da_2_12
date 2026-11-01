# Đăng ký bóng đá 2/12 — Google Apps Script

Web App dành cho phụ huynh lớp 2/12: chọn **Thi đấu / Cổ vũ**, áo bóng đá, size, số áo và tên in trên áo; lưu về Google Sheets hiện có.

## Giao diện V2 — responsive
Giữ nguyên hero và 3 ô thống kê. Các module theo thứ tự:
1. **Hình thức tham gia:** hai lựa chọn Thi đấu/Cổ vũ nằm ngang, full-width.
2. **Thông tin học sinh & áo:** tìm tên full-width; ảnh áo **1/3 trái** và bảng size **2/3 phải** ở desktop; bên dưới bảng là nút chọn size, số áo, tên in áo. Trên điện thoại khung áo và thông tin xếp dọc.
3. **Xác nhận:** nút lưu trên một khối riêng, nút chạm lớn.
4. **Danh sách thi đấu:** chỉ những bé Thi đấu, có nút in.
5. **Danh sách đặt áo:** cả bé Thi đấu/Cổ vũ, có nút in.

Giao diện dùng **Be Vietnam Pro** qua Google Fonts (fallback Arial khi offline), màu xanh ngọc / xanh dương / tím / cam hồng, các kích thước responsive theo desktop/tablet/mobile. **Không cần nút Cập nhật**: sau khi đăng ký, dữ liệu cập nhật ngay; khi trang đang mở và còn hiển thị, hệ thống đồng bộ danh sách từ Sheets mỗi **30 giây**, đồng thời làm mới khi trở lại tab. Không cần tải lại trang.


## V3 — điều chỉnh theo ảnh nghiệm thu
- Loại toàn bộ huy hiệu số 1, 2, 3, 4, 5 ở phần tiêu đề module. Module 1 đặt chú thích **phía trên** hai lựa chọn.
- Module 2 bỏ ghi chú dưới ô tìm học sinh; dùng **ảnh thực tế `ao_dau.jpg`** từ Drive, được server chuyển thành **base64 data URI** và xuất qua `<?!= jerseyImage ?>` để tránh HTML template escape làm mất ảnh.
- Chỉ hiển thị 5 size **5, 7, 8, 11, 13**. **Lưu ý nguồn:** ảnh bảng size nhà cung cấp ghi **9**, không phải **8**; size **8** chưa có số đo xác thực, vì vậy các ô cân nặng/dài áo/vòng ngực của size 8 hiển thị dấu **—**, không chép nhầm thông số size 9. Không sửa các đơn size 9 đã được lưu từ trước.
- Tên in áo được phép để trống; backend tự lấy **đúng hai từ cuối**, ví dụ `Nguyễn Đình Lịch Khê` → `Lịch Khê`. Bỏ đoạn giải thích dài dưới form.
- Module 3: chỉ còn nút Xác nhận full-width và chú thích ở dưới; các bảng 4/5 cùng chiều rộng, kéo giãn cùng chiều cao và vị trí nút in đồng nhất.
- Ẩn dòng chú thích tự đồng bộ; cơ chế cập nhật tự động mỗi 30 giây vẫn hoạt động.
- Thêm viền trên có màu cho module 2 và khung xác nhận để đồng bộ hệ màu.
- Không cần chạy lại `setupProject()` khi chỉ cập nhật Web App từ GitHub.

## V4 — cập nhật hình ảnh và bố cục (01/11/2026)
- Thay emoji quả bóng ở header bằng ảnh `boy-chibi.png` từ chính folder Drive của lớp (ID `1fwefzqlmTwvp3Rc5R7CGX-9IUZCfWTbA`).
- Ảnh gốc PNG khoảng **3,57 MB**: backend dùng `imageDataUri_` để nhúng base64, tăng ngưỡng dung lượng riêng crest lên **5 MB** (không thay đổi giới hạn ảnh áo).
- Bỏ **riêng dòng size 8** chưa có số đo khỏi bảng tham khảo. **Nút chọn size 8 vẫn được giữ**, theo cấu hình đăng ký trước đó; nếu size 8 không phải sản phẩm được bán, cần sửa thêm danh mục `availableSizes`.
- Giá 147.000đ/bộ đổi thành đỏ đậm `#a8092c`.
- Ở màn hình lớn, hai khung ảnh áo và thông số được kéo giãn theo cùng một chiều cao; khung bên phải hẹp hơn một chút và giảm khoảng trống. Ở màn hình nhỏ, hai khung xếp dọc.
- `/exec` cần deploy phiên bản mới sau `clasp push`. Không có thay đổi cấu trúc dữ liệu Sheets.

## Nguồn dữ liệu
- [Google Sheet DA_BONG_2_12](https://docs.google.com/spreadsheets/d/1hZc7Xvpy2jfBRZZF0o07msk6zc6TgZBst4PDrC4fdtk/edit), tab `DANH SACH HOC SINH` có 43 em vào thời điểm khảo sát.
- [Ảnh áo đấu](https://drive.google.com/file/d/1ZRsAJOUB4ASQ6DFMd-pW0lNhWVC5UD93/view)
- [Bảng size ảnh gốc](https://drive.google.com/file/d/19FmCI4RBG1WGtMCtg-ZmfUs1Ae8EH_6N/view)

Giá mẫu áo **147.000đ/bộ**; ảnh nhà cung cấp ghi size 5, 7, 9, 11, 13. Giao diện hiện triển khai theo lựa chọn mới 5, 7, 8, 11, 13; thông số size 8 còn chờ xác nhận từ nhà cung cấp, không suy đoán.

## Cấu trúc mã nguồn
- `Code.gs`: kiểm tra dữ liệu, tìm tên không dấu, lưu một bản ghi / học sinh, kiểm soát số áo trùng ở nhóm Thi đấu, tạo bảng in.
- `Index.html`: giao diện responsive, ảnh áo gốc, bảng size, hai danh sách và nút in.
- `appsscript.json`: manifest Apps Script V8, scopes truy cập Google Sheets và đọc ảnh Drive.
- `.clasp.example.json`: cấu hình Script ID mẫu. `.clasp.json` thật không được commit.
- `QA.md`: checklist nghiệm thu.

## Đồng bộ từ GitHub về Google Apps Script bằng clasp

1. Cài Node.js và `npm install -g @google/clasp`.
2. `git clone https://github.com/Nguyennth19/bong_da_2_12.git`
3. `cd bong_da_2_12 && git checkout main`
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
- **Tên in áo không bắt buộc.** Nếu để trống, máy chủ tự lấy **đúng hai từ cuối của họ tên** để ghi vào DS_DAT_AO; nếu phụ huynh nhập, giữ nguyên tên đã nhập.
- Một học sinh chỉ có một bản ghi; đăng ký lại trên **cùng trình duyệt** có mã lưu cục bộ thì cập nhật bản ghi.
- Thiết bị khác không có mã sửa sẽ không ghi đè dữ liệu đã đăng ký; cần liên hệ ban tổ chức.
- Số áo 0–99; **không được trùng giữa hai học sinh Thi đấu**.
- Ảnh lấy từ Drive bằng quyền của tài khoản triển khai và được nhúng vào trang, không cần mở công khai quyền truy cập ảnh.

## Quyền riêng tư
Nếu ban tổ chức chỉnh sửa thủ công DANG_KY, chạy hàm `refreshSummaries()` trong Apps Script để làm mới hai tab báo cáo. Khi sắp xếp danh sách học sinh, luôn sắp **cả cột A:C** để STUDENT_ID đi cùng đúng bé.

Tên học sinh đã đăng ký xuất hiện trong hai danh sách trên trang. Chỉ gửi link cho người được phép xem thông tin của nhóm lớp. Không cấp quyền Editor của Sheet cho toàn bộ phụ huynh; không đẩy danh sách học sinh và đơn áo lên GitHub.

Xem [QA.md](QA.md) trước khi sử dụng chính thức.
