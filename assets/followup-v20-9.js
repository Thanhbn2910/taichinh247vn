// V20.9 Follow-up D1/D3/D7
window.V247_FOLLOWUP_V209 = function(grade){
  if(grade==='A') return {NEXT_CALL:'Gọi ngay trong 1 giờ', FOLLOWUP_DAY:'D1', TIMELINE:'D0 Lead mới → D1 Gọi → D3 Nhắc hồ sơ → D7 Cảnh báo mất lead'};
  if(grade==='B') return {NEXT_CALL:'Gọi trong 24 giờ', FOLLOWUP_DAY:'D3', TIMELINE:'D0 Lead mới → D1 Gọi → D3 Nhắc → D7 Nuôi lại'};
  return {NEXT_CALL:'Nuôi bằng SEO/FAQ', FOLLOWUP_DAY:'D7', TIMELINE:'D0 Lead mới → D3 Nội dung tham khảo → D7 Hỏi lại nhu cầu'};
};
