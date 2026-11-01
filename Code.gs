/**
 * DA BONG 2/12 — Google Apps Script backend (V8).
 * Run setupProject() ONCE in the Apps Script editor, then deploy a Web App.
 * Source: "DANH SACH HOC SINH"!A:B in the existing Google Sheet.
 */
const CFG = Object.freeze({
  spreadsheetId: '1hZc7Xvpy2jfBRZZF0o07msk6zc6TgZBst4PDrC4fdtk',
  studentSheet: 'DANH SACH HOC SINH',
  registrationSheet: 'DANG_KY',
  athleteSheet: 'DS_THI_DAU',
  jerseySheet: 'DS_DAT_AO',
  extraJerseySheet: 'AO_BO_SUNG',
  jerseyImageId: '1ZRsAJOUB4ASQ6DFMd-pW0lNhWVC5UD93',
  crestImageId: '1hK0oAl1M_yHtrUjsUGHVJSY9UQ7kWqQz',
  sizeImageId: '19FmCI4RBG1WGtMCtg-ZmfUs1Ae8EH_6N',
  paymentQrImageId: '1qHIar0aRKqAmg9v4OllzPYeWQ-n9jguz',
  shirtPrice: 150000,
  availableSizes: ['5','7','9','11','13'],
  allowedRoles: ['Thi đấu','Cổ vũ']
});
const REG_HEADERS = [
  'STUDENT_ID','HO_TEN','VAI_TRO','SIZE_AO','SO_AO',
  'TEN_IN_AO','DON_GIA_VND','TAO_LUC','CAP_NHAT_LUC','EDIT_TOKEN_HASH',
  'PAYMENT_REPORTED','PAYMENT_REPORTED_AT','PAID','PAID_AT',
  'PAID_AMOUNT','PAID_METHOD','PAID_NOTE','IMPORT_NOTE','EXPECTED_PAYMENT'
];
const EXTRA_HEADERS = [
  'ORDER_ID','STUDENT_ID','HO_TEN','TEN_IN_AO','SIZE','SO_AO',
  'VAI_TRO','PAID','GHI_CHU','SO_LUONG','DON_GIA_VND'
];
const ORDER_HEADERS = ['STT','HỌ VÀ TÊN','TÊN IN ÁO','SIZE','SỐ ÁO','HÌNH THỨC','ĐÃ ĐÓNG TIỀN'];
const SIZE_CHART = [
  {size:'5', weight:'20 kg', length:'52 cm', chest:'74 cm'},
  {size:'7', weight:'25 kg', length:'54 cm', chest:'78 cm'},
  {size:'9', weight:'30 kg', length:'56 cm', chest:'82 cm'},
  {size:'11',weight:'35 kg', length:'58 cm', chest:'86 cm'},
  {size:'13',weight:'40–45 kg',length:'60 cm',chest:'90 cm'}
];

function doGet() {
  const tpl=HtmlService.createTemplateFromFile('Index');
  tpl.jerseyImage = imageDataUri_(CFG.jerseyImageId);
  tpl.crestImage = imageDataUri_(CFG.crestImageId);
  tpl.sizeImage = imageDataUri_(CFG.sizeImageId);
  // Full source QR remains in Drive; client crops QR-only bounds without regenerating QR bits.
  tpl.paymentQrImage = imageDataUri_(CFG.paymentQrImageId);
  tpl.bankAccountName = 'NGUYEN TRAN HOANG NGUYEN';
  tpl.bankAccountNumber = '105310811';
  tpl.bankName = 'VPBank';
  return tpl.evaluate()
    .setTitle('Đăng ký bóng đá 2/12')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}

function getInitialData() {
  assertSetup_();
  return {
    chart: SIZE_CHART.map(row => ({...row,available:CFG.availableSizes.includes(row.size)})),
    price: CFG.shirtPrice,
    lists: getPublicLists()
  };
}

/** Search only on demand; the complete class roster is never sent to the browser. */
function searchStudents(query) {
  assertSetup_();
  const key=normalize_(query).slice(0,80);
  if(key.length<2) return [];
  return readStudents_()
    .filter(s => normalize_(s.name).includes(key))
    .slice(0,12);
}

/** Only the holder of the original edit token may read/update a prior registration. */
function getMyRegistration(studentId,token) {
  const row=findRegistration_(String(studentId||''));
  if(!row) return {exists:false};
  if(!token || digest_(token)!==row.hash) return {exists:true,editable:false};
  return {exists:true,editable:true,registration:{
    studentId:row.id,role:row.role,size:row.size,
    number:row.number,printName:row.printName,paymentReported:row.paymentReported,paid:row.paid
  }};
}

function submitRegistration(input) {
  assertSetup_();
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(20000)) throw new Error('Hệ thống đang bận. Vui lòng thử lại.');
  try {
    if(!input || typeof input!=='object') throw new Error('Thiếu dữ liệu đăng ký.');
    const id=String(input.studentId||'').trim();
    const student=readStudents_().find(s=>s.id===id);
    if(!student) throw new Error('Vui lòng chọn đúng học sinh từ danh sách gợi ý.');
    const role=String(input.role||'').trim();
    if(!CFG.allowedRoles.includes(role)) throw new Error('Chọn Thi đấu hoặc Cổ vũ.');
    const size=String(input.size||'').trim();
    if(!CFG.availableSizes.includes(size)) throw new Error('Size áo hiện không có trong danh mục bán.');
    const rawNumber=String(input.number===undefined?'':input.number).trim();
    if(!/^(?:[0-9]|[1-9][0-9])$/.test(rawNumber)) throw new Error('Số áo cần là số từ 0 đến 99.');
    const number=String(Number(rawNumber));
    // Tên in áo không bắt buộc; nếu để trống tự lấy đúng hai từ cuối.
    const printName=String(input.printName||'').replace(/\s+/g,' ').trim() || suggestedPrintName_(student.name);
    if(printName.length<2 || printName.length>40 || /[<>\r\n]/.test(printName) || /^[=+@-]/.test(printName)) {
      throw new Error('Tên in áo cần 2–40 ký tự và không được bắt đầu bằng ký tự công thức.');
    }
    const ss=SpreadsheetApp.openById(CFG.spreadsheetId);
    const sh=ss.getSheetByName(CFG.registrationSheet);
    const rows=readRegistrations_(sh);
    const existing=rows.find(r=>r.id===id);
    if(existing && digest_(String(input.editToken||''))!==existing.hash) {
      throw new Error('Bé đã được đăng ký. Muốn sửa thông tin, hãy dùng thiết bị đã đăng ký hoặc liên hệ ban tổ chức.');
    }
    if(role==='Thi đấu' && rows.some(r=>r.id!==id && r.role==='Thi đấu' && Number(r.number)===Number(number))) {
      throw new Error('Số áo này đã có bạn thi đấu chọn. Vui lòng chọn số khác.');
    }
    const token=existing ? String(input.editToken) : Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');
    const now=new Date();
    // Giữ trạng thái thanh toán khi chỉnh sửa đăng ký; không cho người dùng đổi PAID.
    const values=[
      id,student.name,role,size,number,printName,CFG.shirtPrice,
      existing ? existing.createdAt : now,now,digest_(token),
      existing ? existing.paymentReported : false,
      existing ? existing.paymentReportedAt : '',
      existing ? existing.paid : false,
      existing ? existing.paidAt : '',
      existing ? existing.paidAmount : '',
      existing ? existing.paidMethod : '',
      existing ? existing.paidNote : '',
      existing ? existing.importNote : '',
      role==='Cổ vũ'?150000:400000
    ];
    if(existing) {
      sh.getRange(existing.sheetRow,1,1,REG_HEADERS.length).setValues([values]);
    } else {
      // Checkbox phủ sẵn toàn cột có thể khiến getLastRow() vượt khỏi dữ liệu thật.
      const firstEmpty=rows.length?Math.max(...rows.map(r=>r.sheetRow))+1:2;
      sh.getRange(firstEmpty,1,1,REG_HEADERS.length).setValues([values]);
    }
    rebuildSummaries_(ss);
    SpreadsheetApp.flush();
    return {ok:true,studentName:student.name,printName:printName,editToken:token,lists:getPublicLists()};
  } finally {
    lock.releaseLock();
  }
}

/**
 * Phụ huynh BÁO đã chuyển khoản, không phải xác nhận ngân hàng đã nhận tiền.
 * Với dữ liệu cũ nhập từ ảnh, không có edit-token; xác thực mức cơ bản bằng số áo.
 * Không trả về hoặc thay đổi cột PAID do ban tổ chức quản lý.
 */
function submitPaymentReport(input) {
  assertSetup_();
  if (!input || typeof input!=='object') throw new Error('Thiếu thông tin.');
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(20000)) throw new Error('Hệ thống đang bận, vui lòng thử lại.');
  try {
    const id=String(input.studentId||'').trim();
    const enteredNumber=String(input.number===undefined?'':input.number).trim();
    const student=readStudents_().find(x=>x.id===id);
    if(!student) throw new Error('Không tìm thấy học sinh.');
    const sheet=SpreadsheetApp.openById(CFG.spreadsheetId).getSheetByName(CFG.registrationSheet);
    const rec=readRegistrations_(sheet).find(x=>x.id===id);
    if(!rec) throw new Error('Vui lòng xác nhận đăng ký trước khi thông báo chuyển khoản.');
    if(!enteredNumber || rec.number==='' || Number(enteredNumber)!==Number(rec.number)) {
      throw new Error('Số áo không khớp đăng ký. Vui lòng kiểm tra hoặc liên hệ ban tổ chức.');
    }
    if(rec.paid) return {ok:true,verified:true,message:'Ban tổ chức đã xác nhận nhận tiền.'};
    if(rec.paymentReported) return {ok:true,verified:false,message:'Đã ghi nhận thông báo trước đó. Ban tổ chức sẽ đối soát.'};
    sheet.getRange(rec.sheetRow,11,1,2).setValues([[true,new Date()]]);
    SpreadsheetApp.flush();
    return {ok:true,verified:false,message:'Đã ghi nhận thông báo chuyển khoản, chờ ban tổ chức đối soát.'};
  } finally { lock.releaseLock(); }
}

/**
 * Có thể chạy thủ công 1 lần nếu triển khai trên project standalone,
 * tạo trigger để ghi PAID_AT khi BQT trực tiếp đánh dấu ô PAID.
 */
function installPaymentEditTrigger() {
  const ss=SpreadsheetApp.openById(CFG.spreadsheetId);
  const exists=ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='handlePaymentEdit_');
  if(!exists) ScriptApp.newTrigger('handlePaymentEdit_').forSpreadsheet(ss).onEdit().create();
  return 'OK';
}

function handlePaymentEdit_(e) {
  if(!e || !e.range) return;
  const sh=e.range.getSheet(),tab=sh.getName();
  const row=e.range.getRow(),col=e.range.getColumn();
  if(row<2 || e.range.getNumRows()!==1 || e.range.getNumColumns()!==1) return;
  if(tab===CFG.registrationSheet && col===13){
    const checked=sh.getRange(row,13).getValue()===true;
    sh.getRange(row,14).setValue(checked?new Date():'');
  } else if(tab===CFG.extraJerseySheet && col===8){
    // Checkbox của áo đặt thêm; không làm thay đổi payment của đăng ký chính.
  } else return;
  rebuildSummaries_(SpreadsheetApp.openById(CFG.spreadsheetId));
}

/** Chạy được lặp lại, chỉ bổ sung các cột thanh toán và checkbox mà không xóa dữ liệu cũ. */
function upgradePaymentTracking() {
  const ss=SpreadsheetApp.openById(CFG.spreadsheetId);
  const sh=ensureSheet_(ss,CFG.registrationSheet,REG_HEADERS);
  sh.getRange('K1:S1').setFontWeight('bold').setBackground('#17446f').setFontColor('#ffffff');
  const n=sh.getMaxRows()-1;
  const checkbox=SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();
  sh.getRange(2,11,n,1).setDataValidation(checkbox);
  sh.getRange(2,13,n,1).setDataValidation(checkbox);
  sh.setColumnWidth(18,340);
  sh.setColumnWidth(17,250);
  sh.setColumnWidth(19,145);
  return 'Đã bổ sung 9 cột thanh toán. PAID do BQT đánh dấu, PAYMENT_REPORTED là tự khai.';
}

/** Public lists show registrants, not the full underlying student roster. */
/**
 * Mỗi học sinh có một đăng ký chính, nhưng có thể có thêm áo bổ sung.
 * Các áo ngoại lệ (người lớn) được ghi AO_BO_SUNG, không tự thêm vào roster.
 */
function collectLists_(ss) {
  const main=readRegistrations_(ss.getSheetByName(CFG.registrationSheet)).sort(compareStudentNames_);
  const athletes=main.filter(r=>r.role==='Thi đấu' && r.number!=='')
    .map((r,i)=>({stt:i+1,name:r.name,number:r.number}));
  const mainOrders=main.filter(r=>CFG.allowedRoles.includes(r.role) && r.size)
    .map(r=>({name:r.name,printName:r.printName,size:r.size,number:r.number,
      role:r.role,paid:r.paid,notes:'',orderId:'MAIN-'+r.id,studentId:r.id}));
  const extraOrders=readExtraOrders_(ss.getSheetByName(CFG.extraJerseySheet))
    .filter(r=>r.quantity>0)
    .flatMap(r=>Array.from({length:r.quantity},(_,i)=>({
      name:r.name,printName:r.printName,size:r.size,number:r.number,
      role:r.role,paid:r.paid,notes:r.notes,
      orderId:r.orderId+(r.quantity>1?'-'+(i+1):''),studentId:r.studentId
    })));
  const allOrders=mainOrders.concat(extraOrders).sort(compareStudentNames_);
  return {athletes,orders:allOrders.map((r,i)=>({...r,stt:i+1}))};
}

function readExtraOrders_(sh) {
  if(!sh || sh.getLastRow()<2)return [];
  return sh.getRange(2,1,sh.getLastRow()-1,EXTRA_HEADERS.length).getValues()
    .map((r,i)=>({sheetRow:i+2,orderId:String(r[0]||'').trim(),
      studentId:String(r[1]||'').trim(),name:String(r[2]||'').trim(),
      printName:String(r[3]||'').trim(),size:String(r[4]||'').trim(),
      number:r[5]===null||r[5]===undefined?'':String(r[5]).trim(),
      role:String(r[6]||'').trim(),paid:r[7]===true,
      notes:String(r[8]||'').trim(),quantity:Number(r[9]||0),
      price:Number(r[10]||0)}))
    .filter(r=>r.orderId && r.name && CFG.allowedRoles.includes(r.role));
}

function getPublicLists() {
  assertSetup_();
  const ss=SpreadsheetApp.openById(CFG.spreadsheetId);
  const lists=collectLists_(ss);
  return {...lists,updatedAt:new Date().toISOString()};
}

/** Initialize registration tabs and immutable student IDs. Does not alter student names. */
function setupProject() {
  const ss=SpreadsheetApp.openById(CFG.spreadsheetId);
  const students=ss.getSheetByName(CFG.studentSheet);
  if(!students) throw new Error('Không tìm thấy tab DANH SACH HOC SINH.');
  if(String(students.getRange('B1').getDisplayValue()).trim()!=='Họ tên học sinh') {
    throw new Error('Cấu trúc danh sách học sinh chưa đúng: kiểm tra ô B1.');
  }
  const col3=String(students.getRange('C1').getDisplayValue()).trim();
  if(col3 && col3!=='STUDENT_ID') throw new Error('Cột C đang có dữ liệu khác. Không tự ghi đè.');
  students.getRange('C1').setValue('STUDENT_ID');
  const n=students.getLastRow()-1;
  if(n>0) {
    const names=students.getRange(2,2,n,1).getDisplayValues();
    const ids=students.getRange(2,3,n,1).getDisplayValues();
    const seen=new Set();
    const output=ids.map((r,i)=>{
      let id=String(r[0]||'').trim();
      if(names[i][0] && (!id||seen.has(id))) id='HS-'+Utilities.getUuid();
      if(id) seen.add(id);
      return [id];
    });
    students.getRange(2,3,n,1).setValues(output);
  }
  const reg=ensureSheet_(ss,CFG.registrationSheet,REG_HEADERS);
  reg.getRange('E:E').setNumberFormat('@');
  upgradePaymentTracking();
  reg.setFrozenRows(1);
  ensureSheet_(ss,CFG.athleteSheet,['STT','HỌ VÀ TÊN','SỐ ÁO']);
  ensureSheet_(ss,CFG.jerseySheet,ORDER_HEADERS);
  ensureSheet_(ss,CFG.extraJerseySheet,EXTRA_HEADERS);
  rebuildSummaries_(ss);
  SpreadsheetApp.flush();
  return 'OK — '+n+' học sinh; đã chuẩn bị các bảng đăng ký.';
}

/** Admin-only: run manually after editing rows in DANG_KY directly. */
function refreshSummaries() {
  assertSetup_();
  const ss=SpreadsheetApp.openById(CFG.spreadsheetId);
  rebuildSummaries_(ss);
  SpreadsheetApp.flush();
  const lists=getPublicLists();
  return {athletes:lists.athletes.length,jerseys:lists.orders.length};
}

function assertSetup_() {
  const ss=SpreadsheetApp.openById(CFG.spreadsheetId);
  if(!ss.getSheetByName(CFG.registrationSheet)) {
    throw new Error('Chưa thiết lập ứng dụng. Quản trị viên cần chạy setupProject() một lần.');
  }
}

function ensureSheet_(ss,name,headers) {
  let sh=ss.getSheetByName(name);
  if(!sh) sh=ss.insertSheet(name);
  const first=sh.getRange(1,1,1,headers.length).getDisplayValues()[0];
  // Cho phép nâng cấp từ schema 10 cột sang schema mới mà vẫn giữ toàn bộ dữ liệu.
  const existingCount=first.filter(x=>String(x).trim()).length;
  if(existingCount && first.slice(0,existingCount).join('|')!==headers.slice(0,existingCount).join('|')) {
    throw new Error('Tab '+name+' có tiêu đề khác cấu hình. Dừng để tránh ghi đè.');
  }
  sh.getRange(1,1,1,headers.length).setValues([headers]);
  sh.getRange(1,1,1,headers.length)
    .setBackground('#10345d').setFontColor('#ffffff').setFontWeight('bold');
  sh.setFrozenRows(1);
  return sh;
}

function readStudents_() {
  const sh=SpreadsheetApp.openById(CFG.spreadsheetId).getSheetByName(CFG.studentSheet);
  const n=sh.getLastRow()-1;
  if(n<=0) return [];
  return sh.getRange(2,2,n,2).getDisplayValues()
    .filter(r=>r[0] && r[1])
    .map(r=>({name:String(r[0]).trim(),id:String(r[1]).trim()}));
}

function readRegistrations_(sh) {
  if(!sh || sh.getLastRow()<2) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,REG_HEADERS.length)
    .getValues().map((r,i)=>({
      sheetRow:i+2,id:String(r[0]||''),name:String(r[1]||''),
      role:String(r[2]||''),size:String(r[3]||''),
      number:String(r[4]||''),printName:String(r[5]||''),
      createdAt:r[7],hash:String(r[9]||''),
      paymentReported:r[10]===true,paymentReportedAt:r[11]||'',
      paid:r[12]===true,paidAt:r[13]||'',paidAmount:r[14]||'',
      paidMethod:String(r[15]||''),paidNote:String(r[16]||''),
      importNote:String(r[17]||''),expectedPayment:r[18]||''
    })).filter(r=>r.id);
}

function findRegistration_(id) {
  if(!id) return null;
  const ss=SpreadsheetApp.openById(CFG.spreadsheetId);
  return readRegistrations_(ss.getSheetByName(CFG.registrationSheet)).find(r=>r.id===id)||null;
}

/** Vietnamese school convention: alphabetize by given name, then full name. */
function compareStudentNames_(a,b) {
  const last=s=>String(s.name).trim().split(/\s+/).pop();
  return last(a).localeCompare(last(b),'vi')||a.name.localeCompare(b.name,'vi');
}

function rebuildSummaries_(ss) {
  const lists=collectLists_(ss);
  const athletes=lists.athletes.map(x=>[x.stt,x.name,x.number]);
  const jerseys=lists.orders.map(x=>[
    x.stt,x.name,x.printName,x.size,x.number,x.role,x.paid?'✓':''
  ]);
  writeSummary_(ss.getSheetByName(CFG.athleteSheet),['STT','HỌ VÀ TÊN','SỐ ÁO'],athletes);
  writeSummary_(ss.getSheetByName(CFG.jerseySheet),ORDER_HEADERS,jerseys);
  const out=ss.getSheetByName(CFG.jerseySheet);
  if(out && jerseys.length){
    out.getRange(2,7,jerseys.length,1).setFontColor('#148454')
      .setFontWeight('bold').setHorizontalAlignment('center');
  }
}

function writeSummary_(sh,headers,rows) {
  sh.clearContents();
  sh.getRange(1,1,1,headers.length).setValues([headers])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#10345d');
  if(rows.length) sh.getRange(2,1,rows.length,headers.length).setValues(rows);
  sh.setFrozenRows(1);
  sh.getRange(1,1,Math.max(1,rows.length+1),headers.length).setVerticalAlignment('middle');
  sh.autoResizeColumns(1,headers.length);
}

/** Tên in áo mặc định: lấy đúng hai từ cuối và giữ dấu. */
function suggestedPrintName_(fullName) {
  const parts=String(fullName||'').trim().split(/\s+/).filter(Boolean);
  return parts.slice(-2).join(' ');
}

function normalize_(s) {
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/\s+/g,' ').trim();
}

function digest_(token) {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,String(token||''),Utilities.Charset.UTF_8));
}

/**
 * Nhúng ảnh Drive vào HTML dưới dạng base64 data URI; chỉ chấp nhận file ảnh.
 */
function imageDataUri_(fileId, maxBytes) {
  try {
    const blob=DriveApp.getFileById(fileId).getBlob();
    let mime=String(blob.getContentType()||'').toLowerCase();
    if(mime==='image/jpg') mime='image/jpeg';
    if(!['image/jpeg','image/png','image/webp'].includes(mime)) throw new Error('Unsupported image type: '+mime);
    const bytes=blob.getBytes();
    // Chibi PNG gốc ~3.6MB: cho phép tối đa 5MB, ảnh còn lại giữ 2MB.
    const limit=maxBytes || 2*1024*1024;
    if(bytes.length>limit) throw new Error('Image too large to embed ('+bytes.length+' bytes).');
    return 'data:'+mime+';base64,'+Utilities.base64Encode(bytes);
  } catch(error) {
    console.error('Unable to read embedded image '+fileId+': '+String(error));
    return '';
  }
}
