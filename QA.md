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
