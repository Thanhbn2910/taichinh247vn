// V20.9 AI Score A/B/C
window.V247_SCORE_V209 = function(lead){
  const text=[lead.need,lead.service,lead.income,lead.note,lead.utm_source,lead.sourcePage].join(' ').toLowerCase();
  let score=35;
  const income=Number(String(lead.income||'').replace(/\D/g,''))||0;
  if(income>=20000000) score+=25; else if(income>=10000000) score+=18; else if(income>=5000000) score+=10;
  if(/gấp|hôm nay|cần vay|muốn vay|giải ngân|làm hồ sơ/.test(text)) score+=25;
  if(/cic|nợ xấu|nhóm 2|nhóm 3/.test(text)) score+=12;
  if(/seo|google|blog|organic/.test(text)) score+=6;
  if(/facebook|ads|utm/.test(text)) score+=8;
  if(String(lead.phone||'').replace(/\D/g,'').length>=9) score+=10;
  if(/tham khảo|tìm hiểu|sau|chưa cần/.test(text)) score-=18;
  score=Math.max(0,Math.min(100,score));
  return {AI_SCORE:score,AI_TAG:score>=75?'🔥 Nóng':score>=50?'🌤 Ấm':'❄ Lạnh',GRADE:score>=75?'A':score>=50?'B':'C'};
};
