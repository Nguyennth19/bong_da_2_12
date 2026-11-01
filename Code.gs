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
  jerseyImageId: '1ZRsAJOUB4ASQ6DFMd-pW0lNhWVC5UD93',
  crestImageId: '1fwefzqlmTwvp3Rc5R7CGX-9IUZCfWTbA',
  sizeImageId: '19FmCI4RBG1WGtMCtg-ZmfUs1Ae8EH_6N',
  shirtPrice: 147000,
  availableSizes: ['5','7','8','11','13'],
  allowedRoles: ['Thi đấu','Cổ vũ']
});
const REG_HEADERS = [
  'STUDENT_ID','HO_TEN','VAI_TRO','SIZE_AO','SO_AO',
  'TEN_IN_AO','DON_GIA_VND','TAO_LUC','CAP_NHAT_LUC','EDIT_TOKEN_HASH'
];
const SIZE_CHART = [
  {size:'5', weight:'20 kg', length:'52 cm', chest:'74 cm'},
  {size:'7', weight:'25 kg', length:'54 cm', chest:'78 cm'},
  // Size 8 chưa có số đo trong ảnh từ nhà cung cấp; không lấy số đo của size 9.
  {size:'8', weight:'—', length:'—', chest:'—'},
  {size:'11',weight:'35 kg', length:'58 cm', chest:'86 cm'},
  {size:'13',weight:'40–45 kg',length:'60 cm',chest:'90 cm'}
];

function doGet() {
  const tpl=HtmlService.createTemplateFromFile('Index');
  tpl.jerseyImage = imageDataUri_(CFG.jerseyImageId);
  tpl.crestImage = imageDataUri_(CFG.crestImageId, 5 * 1024 * 1024);
  tpl.sizeImage = imageDataUri_(CFG.sizeImageId);
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
    number:row.number,printName:row.printName
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
    const values=[
      id,student.name,role,size,number,printName,CFG.shirtPrice,
      existing ? existing.createdAt : now,now,digest_(token)
    ];
    if(existing) {
      sh.getRange(existing.sheetRow,1,1,REG_HEADERS.length).setValues([values]);
    } else {
      sh.getRange(sh.getLastRow()+1,1,1,REG_HEADERS.length).setValues([values]);
    }
    rebuildSummaries_(ss);
    SpreadsheetApp.flush();
    return {ok:true,studentName:student.name,printName:printName,editToken:token,lists:getPublicLists()};
  } finally {
    lock.releaseLock();
  }
}

/** Public lists show registrants, not the full underlying student roster. */
function getPublicLists() {
  assertSetup_();
  const ss=SpreadsheetApp.openById(CFG.spreadsheetId);
  const entries=readRegistrations_(ss.getSheetByName(CFG.registrationSheet));
  const sorted=entries.slice().sort(compareStudentNames_);
  const athletes=sorted.filter(r=>r.role==='Thi đấu').map((r,i)=>({
    stt:i+1,name:r.name,number:r.number
  }));
  const orders=sorted.map((r,i)=>({
    stt:i+1,name:r.name,printName:r.printName,size:r.size,
    number:r.number,role:r.role
  }));
  return {athletes,orders,updatedAt:new Date().toISOString()};
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
  reg.setFrozenRows(1);
  ensureSheet_(ss,CFG.athleteSheet,['STT','HỌ VÀ TÊN','SỐ ÁO']);
  ensureSheet_(ss,CFG.jerseySheet,['STT','HỌ VÀ TÊN','TÊN IN ÁO','SIZE','SỐ ÁO','HÌNH THỨC']);
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
  if(first.some(x=>String(x).trim()) && first.join('|')!==headers.join('|')) {
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
      createdAt:r[7],hash:String(r[9]||'')
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
  const all=readRegistrations_(ss.getSheetByName(CFG.registrationSheet)).sort(compareStudentNames_);
  const athletes=all.filter(x=>x.role==='Thi đấu').map((x,i)=>[i+1,x.name,x.number]);
  const jerseys=all.map((x,i)=>[i+1,x.name,x.printName,x.size,x.number,x.role]);
  writeSummary_(ss.getSheetByName(CFG.athleteSheet),['STT','HỌ VÀ TÊN','SỐ ÁO'],athletes);
  writeSummary_(ss.getSheetByName(CFG.jerseySheet),['STT','HỌ VÀ TÊN','TÊN IN ÁO','SIZE','SỐ ÁO','HÌNH THỨC'],jerseys);
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
