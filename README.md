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

## V5 — module thu quỹ & QR chuyển khoản
- Chèn **module mới giữa header và ba ô thống kê**, hai cột tự co giãn: bên trái thông báo quỹ, bên phải thông tin VPBank và mã QR.
- Mức dự định thu cho **bé thi đấu: 400.000đ/bé**. Chi phí tham khảo: **áo 150.000đ/bộ**, **thuê sân/ăn nhẹ/nước uống 100.000đ/buổi**. Quỹ sẽ quyết toán, khoản dư hoàn trả hoặc mua quà kỷ niệm.
- Bé **cổ vũ chỉ mua áo: 150.000đ/bộ**.
- Thông tin được trích từ ảnh `Ma_QR.jpg` trong Drive: **VPBank / NGUYEN TRAN HOANG NGUYEN / 105310811**. Chuỗi chuyển khoản tự điền tên bé từ ô tìm kiếm.
- **Chỉ hiển thị vùng QR**, không hiển thị lại họ tên, số tài khoản, quảng cáo app bên trong ảnh. Canvas cắt ảnh nguồn 1254×2560 tại vùng (166,492) kích thước 924×1012 và không vẽ lại QR, đã thử giải mã thành công.
- **Ảnh chibi đã thay** sang file mới `1hK0oAl1M_yHtrUjsUGHVJSY9UQ7kWqQz` (~132 KB); không còn dùng bản lớn trước đó.
- Giá áo dùng để lưu vào đơn **đổi từ 147.000đ lên 150.000đ** để thống nhất thông báo thu quỹ. **Bản ghi đã lưu trước đó không tự đổi đơn giá**.
- Giữ nguyên source học sinh, các tab trong Sheets và quyền dữ liệu. Không chạy lại `setupProject()` khi chỉ cập nhật GitHub.
- Khi thay file ảnh Drive bằng **file ID mới**, cần cập nhật `CFG.crestImageId` hoặc `CFG.paymentQrImageId` trong `Code.gs`. Nếu thay nội dung ngay trên cùng ID thì không cần sửa ID.

## V6 — nhập đăng ký từ ảnh, cập nhật quỹ và theo dõi thu tiền
- Đã nhập trực tiếp **9 học sinh** từ ảnh nhóm phụ huynh vào `DANG_KY` của Sheet hiện tại, khớp các `STUDENT_ID` trong danh sách gốc; không thay đổi danh sách học sinh.
- **7 học sinh Thi đấu** vào `DS_THI_DAU` và **8 đơn áo đủ thông tin** vào `DS_DAT_AO`. `Lâm Gia Minh` đang ở trạng thái `Chờ xác nhận` vì ảnh không nêu số áo và chưa xác định Thi đấu hay Cổ vũ; không xuất vào danh sách in cho đến khi BQT bổ sung và chạy `refreshSummaries()`.
- `Lê Chấn Hưng` là **Cổ vũ**, do đó có trong danh sách đặt áo nhưng không có trong danh sách thi đấu.
- Bổ sung size **9**, giữ size 8 trước đó. Size 9 có số đo theo ảnh nhà cung cấp: 30 kg, dài áo 56 cm, vòng ngực 82 cm.
- Khối thông tin quỹ nay nằm **sau phần học sinh/áo đấu và trước hàng nút xác nhận**. Thuê sân tập/ăn nhẹ/nước uống **1.000.000đ/buổi (dự kiến 2 buổi)**; thi đấu nước uống/ăn nhẹ **300.000đ/trận (dự kiến tối thiểu 3 trận)**. Mức dự kiến đóng theo diện Thi đấu **400.000đ/bé**, Cổ vũ **150.000đ/bộ áo**, chưa phải quyết toán.
- Hai nút đặt cạnh nhau: **Xác nhận đăng ký** (lưu/điều chỉnh đăng ký) và **Xác nhận đã đóng tiền** (phụ huynh **báo chuyển khoản**, không xác minh ngân hàng).
- Cột `K` (`PAYMENT_REPORTED`) là checkbox **phụ huynh báo chuyển khoản**; cột `M` (`PAID`) là checkbox **ban tổ chức đã kiểm tra thực nhận**; không tự đánh dấu `PAID=TRUE` từ nút của phụ huynh.
- Thêm các cột L `PAYMENT_REPORTED_AT`, N `PAID_AT`, O `PAID_AMOUNT`, P `PAID_METHOD`, Q `PAID_NOTE`, R `IMPORT_NOTE`, S `EXPECTED_PAYMENT`. Trạng thái thực nhận của 9 hồ sơ nhập ảnh mặc định **chưa xác minh (FALSE)**. BQT có thể nhập số tiền thực nhận, ghi chú và phương thức tại Sheet.
- Sau khi đồng bộ mã `clasp push`, chạy **`upgradePaymentTracking()`** một lần nếu muốn cài lại validation khi đổi file. Để tự ghi ngày giờ khi BQT tick `PAID`, chạy **`installPaymentEditTrigger()`** một lần bằng tài khoản quản trị và cấp quyền; trigger này *không* tự đánh dấu đã thu.
- Các hồ sơ nhập ảnh được khóa cập nhật qua Web App nếu không có mã sửa trên trình duyệt; BQT điều chỉnh ở tab `DANG_KY` rồi chạy `refreshSummaries()`. Các nút thông báo chuyển khoản chỉ thay đổi `PAYMENT_REPORTED`, không thay đổi `PAID`.
- Không chạy lại `setupProject()` chỉ để đồng bộ giao diện. Không cần nhập lại 9 hồ sơ; tránh nhân bản.

## V7 — Đơn áo bổ sung, ngoại lệ và dấu đã đóng
- **Danh mục size chính thức:** 5, 7, 9, 11, 13. Size 8 trước đây là nhầm lẫn; đã loại khỏi lựa chọn Web App. Size `S` chỉ dành cho **đơn ngoại lệ áo người lớn** trong `AO_BO_SUNG`, không hiện trong form áo học sinh.
- `DANG_KY`: lưu **một hồ sơ chính / học sinh**; người mua nhiều bộ vẫn giữ mã STUDENT_ID duy nhất. Hồ sơ Gia Minh được cập nhật `Cổ vũ`, size 7, số áo lớn 21 và ghi chú đặt 2 bộ; số tiền đặt áo dự kiến tổng 300.000đ. Hồ sơ Lịch Khê hiện đã là size 7, số áo 19, không sửa lại.
- Thêm tab `AO_BO_SUNG` chứa áo thêm riêng từng đơn: một bộ em bé size 7 **để trống số áo** (để điền sau khi in); một bộ áo ngoại lệ `Cô Ngọc`, size `S`, số 12, vai trò `Cổ vũ`, không đưa vào `DANH SACH HOC SINH`.
- `AO_BO_SUNG` có cột `PAID` (H) là **checkbox của ban tổ chức**; mỗi bộ là một dòng, `SO_LUONG` = 1. Không chèn thêm người ngoài vào danh sách học sinh gốc.
- Bảng `DS_DAT_AO` mới có **7 cột**, cột cuối `ĐÃ ĐÓNG TIỀN` chứa dấu ✓ màu xanh lá chỉ khi được xác nhận. Web App hiển thị một **ô vuông trống** nếu chưa thu, **dấu ✓ xanh** khi đã thu. Cả hai đều chỉ là trạng thái *đọc*, không được tự đánh dấu qua web công khai.
- Web App kết hợp các đơn chính và `AO_BO_SUNG`; hiện có **11 bộ áo** theo các dữ liệu đang lưu, **7 học sinh thi đấu**. Các khoản thanh toán không được đánh dấu chỉ dựa vào screenshot chọn hàng trong ứng dụng khác.
- Giao diện desktop ưu tiên **thu hẹp bảng thi đấu** và **mở rộng bảng đặt áo** theo tỷ lệ gần 1:2; mobile vẫn hiển thị hai bảng xếp dọc. Nút in đơn áo có thêm cột đã đóng.
- Để tab báo cáo trên Sheets tự cập nhật sau khi tick `PAID` ở tab `DANG_KY` hoặc `AO_BO_SUNG`, hãy chạy một lần `installPaymentEditTrigger()` trong Apps Script, cấp quyền khi được yêu cầu. Nếu chưa cài trigger, có thể chạy thủ công `refreshSummaries()`; Web App vẫn tự đọc tình trạng thu mới khi đồng bộ.
- Sau khi đồng bộ, **không chạy lại lệnh nhập dữ liệu**: dữ liệu đã ghi trực tiếp vào Google Sheets. Chỉ `clasp push` và deploy phiên bản Web App mới.

## V8 — Cập nhật bình chọn mới và đội tuyển từ danh sách viết tay
- **Nguồn dữ liệu đã nhập trực tiếp Google Sheets**: 13 tên có trong ảnh danh sách đội tuyển, đối chiếu 100% với `DANH SACH HOC SINH`; lưu trong tab **`DOI_THI_DAU`** (STUDENT_ID / HỌ VÀ TÊN / NGUỒN ĐĂNG KÝ).
- `DS_THI_DAU` và Web App dùng hợp nhất **đội tuyển viết tay** với các bé đã chọn **Thi đấu** trước đây, khử trùng theo `STUDENT_ID`. Hiện **14 bé** (13 từ giấy + 1 bé đã đăng ký thi đấu trước đó nhưng không xuất hiện trong giấy). Bé chưa đặt áo vẫn có tên và số áo trống. Khi bé đăng ký áo sau này, số áo tự điền từ `DANG_KY` qua cùng STUDENT_ID.
- **Nguyễn Đức Phú** được nhập đơn áo từ bình chọn: số **17**, cân nặng **20 kg** => **size 5** theo bảng nhà cung cấp, được thêm vào `DANG_KY` với giá áo 150.000đ; `DS_DAT_AO` hiện **12 bộ**.
- **Lâm Gia Minh** vẫn có áo chính số **21**, size 7 và một áo em bé chưa có số (cả hai bộ đã có trong bảng đặt áo). Tên Gia Minh trên giấy đội tuyển được ghi thêm vào `DOI_THI_DAU`, **không xóa hay tự đổi vai trò "Cổ vũ"** trong đăng ký áo trước đó. Đội tuyển và mua áo là hai danh mục độc lập.
- **Cô Ngọc** vẫn có đơn áo người lớn size **S**, số **12**; bỏ thông tin ngoại lệ và các ghi chú nội bộ khỏi danh sách áo hiển thị công khai. Nội bộ tab `AO_BO_SUNG` ghi chú trung tính "Áo người lớn".
- **Lịch Khê** được giữ **size 7, số 19** theo yêu cầu chỉnh sửa rõ ràng đã chốt trước đó. Ảnh bình chọn mới có dòng size 5 nhưng không dùng để ghi đè yêu cầu này.
- Nếu người đăng ký khai theo kg, hàm `sizeFromWeight_(kg)` chỉ suy mốc cân nặng có số liệu gốc: **20→5**, **25→7**, **30→9**, **35→11**, **40–45→13**; ngoài mốc này để trống, yêu cầu chọn size thủ công, tránh đoán cỡ.
- Sheet `DOI_THI_DAU` được dùng lâu dài làm nguồn cầu thủ đăng ký trực tiếp. Không thêm các em chưa mua áo vào `DANG_KY` vì như vậy sẽ tạo đơn ảo.
- Cập nhật code trên `main`, chạy `clasp push`, rồi triển khai phiên bản Web App mới; **không chạy lại setup/import dữ liệu**. Không đổi các checkbox đã thu tiền.

## V9 — 4 chỉ số & đối soát quỹ
- Lâm Gia Minh đổi **Thi đấu**, giữ áo chính size 7/số 21. Đơn em bé đã được **xóa** theo yêu cầu; Cô Ngọc và Chấn Hưng là hai đơn **Cổ vũ** còn lại.
- Phí dự kiến đổi thành **500.000đ/cầu thủ** và **150.000đ/bộ cổ vũ**. Tính kế hoạch theo số bé có tên trong đội tuyển hợp nhất và các đơn áo chỉ Cổ vũ: `14 × 500.000 + 2 × 150.000 = 7.300.000đ`. Đây là mức **dự kiến**, chưa trừ chi phí hay phản ánh tiền đã thu.
- Thống kê đầu trang có **4 ô**: Đăng ký tham gia thi đấu (14), Bé đã xác nhận tham gia (9 bé trong đội tuyển có đăng ký áo), Bộ áo cổ vũ (2), Bộ áo đã đăng ký (11). Tên học sinh chỉ có trong giấy vẫn là đăng ký dự kiến, chưa xác nhận.
- Trong Web App, trạng thái **ô trắng** khi chưa báo, **ô cam không tick** khi phụ huynh đã báo chuyển `DANG_KY!K`, **✓ xanh lá** khi ban tổ chức tick đã thu tại `DANG_KY!M` hoặc `AO_BO_SUNG!H`. Ưu tiên ✓ xanh khi cả K/M đều đúng.
- Nút báo đã đóng của phụ huynh chỉ ghi cột K/L, tuyệt đối không ghi M hoặc PAID_AMOUNT; báo cáo tổng tiền thực thu chỉ đếm những hàng đã được admin xác nhận ở M/H. Nếu O=PAID_AMOUNT có giá trị dương thì lấy số thực nhận; nếu admin tick M nhưng chưa ghi số, dùng **mức chuẩn theo vai trò** (500k Thi đấu; 150k Cổ vũ).
- Ảnh chụp Sheet cho thấy Khê có cả K/M = TRUE và O còn rỗng; theo quy tắc hiện tại, tiền thực thu ghi nhận **500.000đ**, dấu ✓ xanh.
- Khối thông báo hoàn dư/quà và cổ vũ được đẩy lên ngay sau các khoản chi; cuối cột trái là **Tổng tiền dự kiến** và **Tổng tiền thực thu** tự tính.
- 4 cấp kích thước chữ: h1, h2, body, caption; các ô thống kê responsive 4 cột desktop, 2 cột tablet/mobile. Phần đặt áo/thu quỹ vẫn thích nghi với khổ màn hình khác nhau.
- Sau khi `clasp push` và deploy New version, dữ liệu Google Sheets đã được cập nhật trực tiếp, không chạy lại setup. Để tab `DS_DAT_AO` đồng bộ ngay khi tick M, cần `installPaymentEditTrigger()` (nếu chưa cài); Web App tự đọc lại sau 30 giây.

## Nguồn dữ liệu
- [Google Sheet DA_BONG_2_12](https://docs.google.com/spreadsheets/d/1hZc7Xvpy2jfBRZZF0o07msk6zc6TgZBst4PDrC4fdtk/edit), tab `DANH SACH HOC SINH` có 43 em vào thời điểm khảo sát.
- [Ảnh áo đấu](https://drive.google.com/file/d/1ZRsAJOUB4ASQ6DFMd-pW0lNhWVC5UD93/view)
- [Ảnh chibi bản nhẹ](https://drive.google.com/file/d/1hK0oAl1M_yHtrUjsUGHVJSY9UQ7kWqQz/view)
- [Ảnh QR gốc](https://drive.google.com/file/d/1qHIar0aRKqAmg9v4OllzPYeWQ-n9jguz/view)
- [Bảng size ảnh gốc](https://drive.google.com/file/d/19FmCI4RBG1WGtMCtg-ZmfUs1Ae8EH_6N/view)

Giá quảng cáo gốc của nhà cung cấp **147.000đ/bộ**, nhưng phí thu theo chương trình đã chốt là **150.000đ/bộ**; ảnh nhà cung cấp ghi size 5, 7, 9, 11, 13. Giao diện hiện có các lựa chọn 5, 7, 8, 9, 11, 13; thông số size 8 còn chờ xác nhận từ nhà cung cấp, không suy đoán.

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
| `DANG_KY` | Dữ liệu đăng ký chính (A:J), báo chuyển khoản (K:L), đã thu thực tế (M:Q), nhập từ ảnh (R), tạm thu dự kiến (S) |
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
