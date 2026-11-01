# QA — DA BONG 2/12

## One-time setup (on a test/copy spreadsheet first, if testing)
- Confirm tab `DANH SACH HOC SINH` has headings A1 = `STT`, B1 = `Họ tên học sinh`.
- Set `CFG.spreadsheetId` to the desired sheet; run `setupProject()` once as owner.
- Check student names in B are unchanged; C now has stable `STUDENT_ID`.
- Confirm tabs `DANG_KY`, `DS_THI_DAU`, `DS_DAT_AO` exist and headers are correct.
- Deploy as a Web App, execute as owner, restrict audience to the class's Google-account users.

## Functional acceptance checklist
- [ ] Search `lich khe` and select `Nguyễn Đình Lịch Khê`; no accent required.
- [ ] Search `khang`; multiple suggestions appear; Enter does **not** guess one.
- [ ] Only two role buttons: Thi đấu and Cổ vũ.
- [ ] Jersey image is the supplied blue set; size chart reference image opens.
- [ ] Sizes 5/7/9/11/13 are selectable; 1/3/15 shown for reference only.
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
