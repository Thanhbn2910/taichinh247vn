// V20.9 AI Knowledge
window.V247_KNOWLEDGE_V209 = {
  "cic":"CIC là lịch sử tín dụng. Cần xem nhóm nợ, đã tất toán chưa và thu nhập hiện tại.",
  "nợ xấu":"Nợ xấu có thể vẫn được tư vấn tùy nhóm nợ, thời gian tất toán và hồ sơ.",
  "bảo hiểm":"Bảo hiểm nên chọn theo nhu cầu bảo vệ, ngân sách và độ tuổi.",
  "tín chấp":"Vay tín chấp phụ thuộc thu nhập, CIC, nghề nghiệp và hồ sơ.",
  answer(q){
    q=String(q||'').toLowerCase();
    if(q.includes('cic')) return this.cic;
    if(q.includes('nợ xấu')||q.includes('no xau')) return this["nợ xấu"];
    if(q.includes('bảo hiểm')||q.includes('bao hiem')) return this["bảo hiểm"];
    return this["tín chấp"];
  }
};
