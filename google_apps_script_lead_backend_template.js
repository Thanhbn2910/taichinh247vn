/**
 * V11 template - Google Apps Script để đẩy lead từ Google Sheet/Gmail sang CRM sau này.
 * Bản hiện tại là web tĩnh. V12 có thể dùng endpoint này làm backend miễn phí.
 */
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Leads');
  const data = e.parameter || {};
  sheet.appendRow([
    new Date(),
    data.name || data['Họ tên'] || '',
    data.phone || data['SĐT'] || '',
    data.email || data['Email'] || '',
    data.service || data['Nhu cầu'] || '',
    data.income || data['Thu nhập'] || '',
    'Lead mới',
    data.note || data['Ghi chú'] || ''
  ]);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}
