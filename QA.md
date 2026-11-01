# QA — DA BONG 2/12

## One-time setup (on a test/copy spreadsheet first, if testing)
- Confirm tab `DANH SACH HOC SINH` has headings A1 = `STT`, B1 = `Họ tên học sinh`.
- Set `CFG.spreadsheetId` to the desired sheet; run `setupProject()` once as owner.
- Check student names in B are unchanged; C now has stable `STUDENT_ID`.
- Confirm tabs `DANG_KY`, `DS_THI_DAU`, `DS_DAT_AO` exist and headers are correct.
- Deploy as a Web App, execute as owner, restrict audience to the class's Google-account users.

## V2 layout and live update acceptance
- [ ] Hero và thống kê ở đầu giữ nguyên nội dung và bố cục cũ.
- [ ] Module 1 đứng trước module 2; Thi đấu và Cổ vũ trong một hàng trên desktop.
- [ ] Module 2: ô tìm tên full-width, ảnh áo 1/3 bên trái, bảng size 2/3 bên phải.
- [ ] Thứ tự khung phải: bảng size -> chọn size -> số áo & tên in áo.
- [ ] Module 3 là khối xác nhận; module 4 thi đấu và module 5 đặt áo vẫn có nút in.
- [ ] Font Be Vietnam Pro có tải được trên môi trường online; khi bị chặn vẫn dùng Arial.
- [ ] Kiểm tra màn hình 360px, 390px, 768px, 1024px và 1440px; không tràn ngang, mọi nút bấm dễ thao tác.
- [ ] Chọn Thi đấu trước rồi mới tìm tên bé: lựa chọn Thi đấu không bị xóa khi đang gõ.
- [ ] Không nhập tên in áo, chọn Nguyễn Đình Lịch Khê: bảng DS_DAT_AO lưu **Lịch Khê**.
- [ ] Nhập tên in áo tùy chọn: bảng DS_DAT_AO giữ đúng tên phụ huynh nhập.
- [ ] Có hai trình duyệt A và B: A thêm đăng ký, B tự hiện trong danh sách tối đa khoảng 30 giây khi đang mở (không cần bấm Cập nhật).
- [ ] Không còn nút “Cập nhật hai danh sách”; sau khi lưu, danh sách và thống kê cập nhật ngay.
- [ ] Bảng thi đấu và bảng đặt áo vẫn xếp theo tên gọi A–Z và đánh lại STT.

## V8 — nghiệm thu đội tuyển thủ công, size theo kg và auto fill
- [ ] `DANH SACH HOC SINH` vẫn có đúng 43 bé và STUDENT_ID gốc.
- [ ] `DOI_THI_DAU` có 13 tên từ giấy, không có tên trùng, mỗi bé dùng STUDENT_ID chính xác.
- [ ] `DS_THI_DAU` có 14 bé (13 từ giấy + Lịch Khê), xếp theo tên gọi A-Z; các bé chưa mua áo có số áo trống.
- [ ] Đăng ký áo cho bé đã có trong `DOI_THI_DAU` nhưng chưa có `DANG_KY`, rồi kiểm tra số áo tự cập nhật trong `DS_THI_DAU` mà không tạo cầu thủ trùng.
- [ ] `Nguyễn Đức Phú` có đơn số 17, size 5 vì cân nặng 20kg; xuất hiện trong cả danh sách cầu thủ và bảng áo.
- [ ] `Lâm Gia Minh` có số 21 trong danh sách cầu thủ và một áo em bé số trống trong đơn áo; vai trò đơn áo Cổ vũ vẫn giữ theo dữ liệu trước đó.
- [ ] `Cô Ngọc` size S số 12 vẫn chỉ là đơn áo, không có trong đội tuyển hoặc 43 học sinh gốc.
- [ ] Không hiển thị ghi chú ngoại lệ và ghi chú nội bộ bên cạnh tên Cô Ngọc trong Web App.
- [ ] `Lịch Khê` giữ size 7 số 19 từ lần cập nhật trước.
- [ ] `sizeFromWeight_('20kg')` trả '5'; các giá trị không nằm mốc nhà cung cấp trả rỗng.
- [ ] DS_DAT_AO có 12 đơn, các checkbox đã đóng tiền không bị đổi; mobile vẫn hiển thị đủ cột.
- [ ] `clasp push` / `/dev` / `/exec`: kiểm tra dữ liệu tự cập nhật, số cầu thủ mới và không hiển thị ghi chú admin.

## V7 — nghiệm thu đơn áo thêm và thanh toán
- [ ] `DANH SACH HOC SINH` giữ nguyên 43 học sinh; không bổ sung người lớn vào roster.
- [ ] `DANG_KY`: hồ sơ chính Gia Minh = Cổ vũ, size 7, số 21; Lịch Khê size 7, số 19.
- [ ] `AO_BO_SUNG`: 2 đơn độc lập gồm 1 áo em bé size 7 chưa có số và 1 áo người lớn ngoại lệ size S số 12; H có checkbox PAID = FALSE.
- [ ] `DS_THI_DAU`: 7 học sinh, không có người chỉ cổ vũ.
- [ ] `DS_DAT_AO`: 11 dòng áo + header, gồm 2 áo Gia Minh và 1 áo ngoại lệ Cô Ngọc, số áo em bé để trống.
- [ ] Cột G DS_DAT_AO là ĐÃ ĐÓNG TIỀN, đang trống vì chưa xác nhận tiền; web app ô trống khi PAID false, dấu ✓ xanh khi true.
- [ ] Sau khi BQT tick DANG_KY!M hoặc AO_BO_SUNG!H, Web App tự hiển thị trạng thái sau đồng bộ (≤30s); với trigger đã cài, DS_DAT_AO cập nhật ngay.
- [ ] Thử in đơn áo: khổ A4 có cột đã đóng; dòng em bé số áo để trống để viết bổ sung.
- [ ] Size 8 không còn trong các nút; size 9 có đủ số đo gốc; size S chỉ là đơn ngoại lệ.
- [ ] Desktop: bảng thi đấu nhỏ hơn bảng áo; trên mobile hai bảng xếp dọc, có thể cuộn bảng áo ngang để không bị cắt chữ.
- [ ] Không có số liệu thanh toán nào được tự suy từ checkbox màu xanh trong ảnh nhóm.
- [ ] Cần kiểm thử trên link /dev sau clasp push, sau đó New version cập nhật /exec.

## V6 — nguồn ảnh, checkbox và hai nút
- [ ] `DANG_KY!A2:S10` có đúng 9 bản ghi; mỗi hàng khớp đúng một STUDENT_ID gốc.
- [ ] `DS_THI_DAU` có 7 bé; `DS_DAT_AO` có 8 đơn; không có Gia Minh chưa rõ số áo trong hai danh sách in.
- [ ] `Lê Chấn Hưng` thuộc `Cổ vũ` và chỉ có trong đơn áo, số áo 7 size 7.
- [ ] Bốn hồ sơ size 9 (Trí Khang, Minh Khang, Khánh Minh, Minh Quang) cùng Henry Hải là size 9; có nút chọn size 9.
- [ ] Gia Minh được lưu size 7, số áo trống, vai trò `Chờ xác nhận`, có ghi chú nguồn ảnh.
- [ ] Checkbox K=PAYMENT_REPORTED và M=PAID có dataValidation BOOLEAN; không hồ sơ nhập ảnh nào được đánh dấu đã thu trước khi đối soát.
- [ ] Khối thu quỹ xuất hiện sau form học sinh/áo, trước hai nút xác nhận.
- [ ] Thuê sân tập và ăn nhẹ: 1.000.000đ/buổi, dự kiến 2; thi đấu nước/ăn nhẹ: 300.000đ/trận, tối thiểu 3.
- [ ] Hai nút Xác nhận đăng ký / Xác nhận đã đóng tiền cùng một hàng desktop, màu khác nhau, mỗi nút có chú thích riêng.
- [ ] Nhấn nút đóng tiền: chỉ thay cột K:L (báo đã chuyển), **không** thay cột M hoặc số tiền đã thu.
- [ ] Phụ huynh đã báo lại không tạo thêm dòng hay ghi đè lịch sử.
- [ ] Khi BQT tick M, trigger ghi ngày giờ N nếu được cài; admin không phải nhập lại đăng ký.
- [ ] `setupProject()` không bị chạy tự động khi cập nhật V6.
- [ ] Không nhân bản 9 hồ sơ khi đồng bộ `clasp push`.

## V5 — acceptance test quỹ và ảnh mới
- [ ] Module thu quỹ nằm **sau hero** và **trước ba ô thống kê**, layout hai cột desktop, một cột mobile.
- [ ] Phí thi đấu dự kiến **400.000đ/bé**, áo **150.000đ/bộ**, sân/ăn/uống **100.000đ/buổi**, ghi chú hoàn dư/quà rõ ràng.
- [ ] Người chỉ cổ vũ/mua áo được thông báo **150.000đ/bộ**.
- [ ] Đúng ngân hàng VPBank, tên tài khoản NGUYEN TRAN HOANG NGUYEN, số tài khoản 105310811.
- [ ] QR cắt chỉ còn phần mã, không có phần thông tin tài khoản/quảng cáo của ảnh gốc; mã quét thành công trên ứng dụng ngân hàng.
- [ ] Khi chọn bé, cú pháp chuyển khoản tự đổi thành `[Họ tên bé] - Lớp 2/12 - Đóng quỹ bóng đá`.
- [ ] Không chọn bé thì hiển thị gợi ý `[Tên bé] - Lớp 2/12 - Đóng quỹ bóng đá`.
- [ ] Header lấy ảnh `boy-chibi.png` phiên bản ~132KB với ID Drive mới.
- [ ] Giá hiển thị trong khung áo và giá ghi vào đơn mới đều là 150.000đ; đơn đã có trước đó không bị migrate.
- [ ] Trên trình duyệt chính thức /dev và /exec, kiểm tra mã QR không bị ẩn và được giải mã đúng.
- [ ] Ảnh QR/crest không yêu cầu cấp quyền Drive cho phụ huynh (base64 được nhúng lúc chạy doGet).
- [ ] Cập nhật code không chỉnh sửa bất kỳ ô học sinh hoặc hàng đăng ký nào trên Sheets.

## V4 — checklist chibi và cân đối khung
- [ ] Header có hình `boy-chibi.png` thực tế, không còn quả bóng mặc định nếu ảnh tải được.
- [ ] Với file chibi gốc 3,57 MB, hàm `imageDataUri_` trả về PNG base64 thay vì từ chối vì giới hạn 2 MB.
- [ ] Trong bảng size chỉ có 5, 7, 11, 13 (không còn dòng 8 thiếu số đo); ô chọn size 8 vẫn có vì trước đó đã chốt.
- [ ] Giá áo 147.000đ/bộ có màu đỏ đậm `#a8092c`.
- [ ] Desktop: ảnh áo và bảng thông số cùng chiều cao container, khung thông số hẹp lại; mobile: hai khung xếp dọc.
- [ ] Kiểm thử trực quan 390px, 768px, 1440px trên `/dev` và phiên bản `/exec` mới.
- [ ] `/exec` xuất hiện chibi sau khi deploy New version.

## V3 — checklist nghiệm thu bắt buộc
- [ ] GitHub `main` có đủ sửa đổi, không chỉ đổi size và chiều cao module.
- [ ] Không có huy hiệu số thứ tự ở bất kỳ tiêu đề module nào.
- [ ] Module 1: chú thích nằm trên cả hai lựa chọn.
- [ ] Module 2: không hiển thị ghi chú tìm kiếm ở dưới ô tên.
- [ ] Ảnh `ao_dau.jpg` hiển thị thực tế, dùng base64 data URI từ Drive; không phải hình demo hoặc khung trống.
- [ ] Bảng size chỉ có 5, 7, 8, 11, 13 và chỉ đúng 5 nút chọn tương ứng.
- [ ] Size 8 có dấu — vì ảnh nguồn chỉ có số đo size 9; không tự gán số đo 9 cho 8.
- [ ] Không còn ghi chú loại size hoặc đoạn ví dụ dài dưới phần chọn số áo.
- [ ] Đăng ký không nhập tên in áo cho `Nguyễn Đình Lịch Khê`: bảng `DS_DAT_AO` lưu **Lịch Khê**.
- [ ] Module 3 không có heading: nút Xác nhận rộng 100% và ghi chú dưới nút.
- [ ] Bỏ dòng đồng bộ hiển thị, nhưng ở tab đang mở danh sách vẫn tự cập nhật mỗi 30 giây.
- [ ] Cả 5 module có viền trên màu; module 4/5 thẳng hàng, đồng chiều rộng/chiều cao.
- [ ] Nút In danh sách và In đơn áo vẫn hoạt động; các bảng A4 không bị mất nội dung.
- [ ] Kiểm tra giao diện thật trên mobile (360px, 390px), tablet (768px) và desktop (1024px, 1440px).
- [ ] Đã kiểm tra `/dev` trên Apps Script và bản `/exec` ở deployment mới.

## Functional acceptance checklist
- [ ] Search `lich khe` and select `Nguyễn Đình Lịch Khê`; no accent required.
- [ ] Search `khang`; multiple suggestions appear; Enter does **not** guess one.
- [ ] Only two role buttons: Thi đấu and Cổ vũ.
- [ ] Jersey image is the supplied blue set; size chart reference image opens.
- [ ] Sizes 5/7/8/11/13 are selectable; size 8 does not have verified reference dimensions.
- [ ] Size 5: weight 20 kg, length 52 cm, chest 74 cm. No unsupported height estimates.
- [ ] Choose Thi đấu, size 7, shirt number 10, custom print name; submit.
- [ ] Entry appears in both DS_THI_DAU and DS_DAT_AO.
- [ ] Choose Cổ vũ, size 9, shirt number 11; submit.
- [ ] Supporter appears only in DS_DAT_AO, not in DS_THI_DAU.
- [ ] Two contestants cannot select the same shirt number; different roles may.
- [ ] Reload same browser and reselect student; saved fields can be edited.
- [ ] From a different browser without edit token, prior entry cannot be overwritten.
- [ ] Print each list: A4 layout, Vietnamese characters, ordered by given name A-Z.
- [ ] Refresh lists in two concurrent browsers; data remains consistent.
- [ ] Submit same registration twice; there is only one row per STUDENT_ID.

## Negative test / security checks
- [ ] Search with <2 characters returns no candidates.
- [ ] Invalid/unknown student_id is rejected.
- [ ] Unknown role, out-of-stock size, missing shirt number rejected.
- [ ] Invalid print name rejected; no HTML or formulas are executed.
- [ ] Existing row without owner token cannot be overwritten.
- [ ] Google Sheets is **not** shared with parents as Editors.
- [ ] The Web App link is restricted to the intended parent group; names of children are visible in public list to permitted viewers.

## Deployment note
A `clasp push` updates script *source code*, not the already released `/exec` deployment.
After syncing, publish a **new deployment version** (or use the developer `/dev` endpoint to test).
Never store Google credentials or `.clasp.json` in the public repo.
