// V21.4 — AI Chatbot hội thoại cho VayNhanh247
(function(){
  const CALL_PHONE = "0822397836";
  const CFG = window.VAYNHANH247_CONFIG || {};
  const GAS_URL = CFG.GAS_URL || "";
  let history = JSON.parse(localStorage.getItem("v247_chat_history_v214") || "[]");
  let profile = JSON.parse(localStorage.getItem("v247_chat_profile_v214") || "{}");

  function save(){
    localStorage.setItem("v247_chat_history_v214", JSON.stringify(history.slice(-30)));
    localStorage.setItem("v247_chat_profile_v214", JSON.stringify(profile));
  }
  function esc(s){
    return String(s || "").replace(/[&<>"']/g, function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});
  }
  function cleanPhone(v){ return String(v || "").replace(/\D/g,""); }

  function detectIntent(text){
    const t = String(text || "").toLowerCase();
    if(/cic|lịch sử tín dụng|lich su tin dung/.test(t)) return "cic";
    if(/nợ xấu|no xau|nhóm nợ|nhom no/.test(t)) return "bad_debt";
    if(/vay|tín chấp|tin chap|giải ngân|giai ngan|khoản vay|khoan vay/.test(t)) return "loan";
    if(/thẻ|the tin dung|credit card|hạn mức|han muc/.test(t)) return "card";
    if(/bảo hiểm|bao hiem|bhnt|nhân thọ|sức khỏe|suc khoe/.test(t)) return "insurance";
    if(/hồ sơ|ho so|giấy tờ|giay to|cần gì|can gi/.test(t)) return "documents";
    if(/lãi|lai suat|lãi suất|phí|chi phí/.test(t)) return "cost";
    if(/liên hệ|lien he|gọi|goi|tư vấn viên|tu van vien/.test(t)) return "contact";
    return "general";
  }

  function updateProfile(text){
    const t = String(text || "");
    const phone = t.match(/(?:0|\+84)\d[\d\s.-]{7,12}/);
    if(phone) profile.phone = cleanPhone(phone[0]).replace(/^84/,"0");
    const income = t.match(/(\d+[\.,]?\d*)\s*(triệu|trieu|tr|m|million)/i);
    if(income && /thu nhập|luong|lương|income/i.test(t)) profile.incomeText = income[0];
    const amount = t.match(/(\d+[\.,]?\d*)\s*(triệu|trieu|tr|m|tỷ|ty)/i);
    if(amount && /vay|cần|muốn|nhu cầu|can|muon/i.test(t)) profile.amountText = amount[0];
    if(/cic|nợ xấu|no xau/i.test(t)) profile.hasCicConcern = true;
    if(/thẻ|the tin dung/i.test(t)) profile.product = "Thẻ tín dụng";
    else if(/bảo hiểm|bao hiem|bhnt/i.test(t)) profile.product = "Bảo hiểm";
    else if(/vay|tín chấp|tin chap/i.test(t)) profile.product = "Vay tín chấp";
    profile.need = (profile.need ? profile.need + " | " : "") + t.slice(0,160);
    save();
  }

  function scoreProfile(){
    let score = 35;
    const text = JSON.stringify(profile).toLowerCase();
    if(profile.phone) score += 20;
    if(profile.incomeText) score += 18;
    if(profile.amountText) score += 12;
    if(profile.hasCicConcern) score += 8;
    if(/gấp|hôm nay|nhanh|giải ngân/.test(text)) score += 15;
    if(/tham khảo|chưa cần|sau/.test(text)) score -= 15;
    score = Math.max(0, Math.min(100, score));
    const grade = score >= 75 ? "A" : score >= 50 ? "B" : "C";
    const tag = grade === "A" ? "🔥 Nóng" : grade === "B" ? "🌤 Ấm" : "❄ Lạnh";
    return {score, grade, tag};
  }

  function missingInfo(){
    const miss = [];
    if(!profile.phone) miss.push("SĐT liên hệ");
    if(!profile.incomeText && (profile.product === "Vay tín chấp" || !profile.product)) miss.push("thu nhập/tháng");
    if(!profile.product) miss.push("sản phẩm cần tư vấn");
    return miss;
  }

  function productSuggest(intent){
    if(profile.product) return profile.product;
    if(intent === "card") return "Thẻ tín dụng";
    if(intent === "insurance") return "Bảo hiểm";
    if(intent === "bad_debt" || intent === "cic") return "Tư vấn CIC / nợ xấu";
    return "Vay tín chấp";
  }

  function botReply(userText){
    updateProfile(userText);
    const intent = detectIntent(userText);
    const sc = scoreProfile();
    const product = productSuggest(intent);
    const miss = missingInfo();
    let main = "";

    if(intent === "cic") main = "CIC là lịch sử tín dụng. Khi tư vấn cần xem nhóm nợ, thời điểm tất toán, thu nhập hiện tại và nhu cầu vay.";
    else if(intent === "bad_debt") main = "Nợ xấu vẫn có thể xem xét tùy nhóm nợ, đã tất toán chưa, thời gian phát sinh và hồ sơ hiện tại.";
    else if(intent === "loan") main = "Vay tín chấp thường cần thu nhập ổn định, thông tin CIC, SĐT liên hệ và nhu cầu vay rõ ràng.";
    else if(intent === "card") main = "Thẻ tín dụng phụ thuộc thu nhập, lịch sử tín dụng, nghề nghiệp và hồ sơ cá nhân.";
    else if(intent === "insurance") main = "Bảo hiểm nên chọn theo mục tiêu bảo vệ, ngân sách, độ tuổi và điều kiện quyền lợi.";
    else if(intent === "documents") main = "Hồ sơ cơ bản thường gồm thông tin cá nhân, SĐT, thu nhập, nhu cầu vay và tình trạng CIC.";
    else if(intent === "cost") main = "Chi phí/lãi suất phụ thuộc sản phẩm, hồ sơ, đơn vị tài chính và thời điểm xét duyệt.";
    else if(intent === "contact") main = "Bạn có thể bấm Gọi ngay " + CALL_PHONE + " hoặc để lại SĐT trong chat/form.";
    else main = "AI hỗ trợ các nội dung: vay tín chấp, CIC/nợ xấu, thẻ tín dụng, bảo hiểm và hồ sơ tài chính cá nhân.";

    let follow = "";
    if(miss.length) follow = " Để tư vấn sát hơn, bạn cho thêm: " + miss.join(", ") + ".";
    else follow = " Hồ sơ hiện được đánh giá " + sc.grade + " - " + sc.tag + " (" + sc.score + "/100). Gợi ý: " + product + ".";

    let ask = !profile.phone ? "Bạn muốn để lại SĐT để tư vấn viên liên hệ không?"
      : (!profile.incomeText && product.indexOf("Vay") >= 0 ? "Thu nhập/tháng hiện tại của bạn khoảng bao nhiêu?"
      : "Bạn muốn AI tạo lead tư vấn từ cuộc chat này không?");

    return main + follow + "\n\n" + ask;
  }

  async function createLeadFromChat(){
    const sc = scoreProfile();
    const lead = {
      name: profile.name || "Khách từ AI Chatbot",
      phone: profile.phone || "",
      service: productSuggest("general"),
      income: profile.incomeText || "",
      need: profile.need || "Tư vấn từ AI Chatbot",
      note: "Lead tạo từ AI Chatbot V21.4",
      sourcePage: "AI Chatbot V21.4",
      utm_source: "ai_chatbot",
      aiScore: sc.score,
      aiGrade: sc.grade,
      aiTag: sc.tag
    };
    if(!lead.phone) return {ok:false,error:"Bạn cần nhập SĐT trong chat trước khi tạo lead."};
    if(window.V247_V21 && window.V247_V21.sendRealtimeLead) return await window.V247_V21.sendRealtimeLead(lead);
    if(!GAS_URL) return {ok:false,error:"Chưa cấu hình GAS_URL."};
    const r = await fetch(GAS_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"create", lead})});
    return await r.json();
  }

  function render(){
    if(document.getElementById("v214Chatbot")) return;
    document.querySelectorAll("#v2133AiRoot,#v21AiBox,#aiProV2132").forEach(el => el.style.display="none");

    const box = document.createElement("div");
    box.id = "v214Chatbot";
    box.innerHTML = `
      <button id="v214Open" type="button">Chat tư vấn</button>
      <div id="v214Panel">
        <div class="v214Head"><div><b>AI Chatbot VayNhanh247</b><small>Tư vấn theo ngữ cảnh</small></div><button id="v214Close" type="button">×</button></div>
        <div id="v214Msgs"></div>
        <div class="v214Quick">
          <button type="button">Tôi bị nợ xấu có vay được không?</button>
          <button type="button">Vay tín chấp cần hồ sơ gì?</button>
          <button type="button">CIC là gì?</button>
          <button type="button">Tư vấn thẻ tín dụng</button>
        </div>
        <div class="v214Input">
          <textarea id="v214Text" placeholder="Nhập câu hỏi hoặc thông tin hồ sơ..."></textarea>
          <div class="v214Actions"><button id="v214Send" type="button">Gửi</button><button id="v214Lead" type="button">Tạo lead</button></div>
          <a href="tel:0822397836">Gọi ngay 0822397836</a>
        </div>
      </div>`;
    document.body.appendChild(box);

    const panel = document.getElementById("v214Panel");
    const msgs = document.getElementById("v214Msgs");
    const input = document.getElementById("v214Text");

    function add(role, text){
      history.push({role, text, time:new Date().toISOString()});
      save();
      msgs.innerHTML += '<div class="v214Msg '+role+'">'+esc(text).replace(/\n/g,"<br>")+'</div>';
      msgs.scrollTop = msgs.scrollHeight;
    }

    if(history.length){
      history.slice(-10).forEach(m => msgs.innerHTML += '<div class="v214Msg '+m.role+'">'+esc(m.text).replace(/\n/g,"<br>")+'</div>');
    } else {
      add("bot", "Xin chào! Tôi là AI chatbot tư vấn tài chính của VayNhanh247. Bạn có thể mô tả nhu cầu, tình trạng CIC/nợ xấu, thu nhập hoặc sản phẩm cần tư vấn.");
    }

    function send(text){
      const q = String(text || input.value || "").trim();
      if(!q) return;
      add("user", q);
      add("bot", botReply(q));
      input.value = "";
    }

    document.getElementById("v214Open").onclick = () => {
      panel.style.display = panel.style.display === "block" ? "none" : "block";
      if(panel.style.display === "block") input.focus();
    };
    document.getElementById("v214Close").onclick = () => panel.style.display = "none";
    document.getElementById("v214Send").onclick = () => send();
    input.addEventListener("keydown", e => { if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); }});
    document.querySelectorAll(".v214Quick button").forEach(b => b.onclick = () => send(b.textContent));
    document.getElementById("v214Lead").onclick = async () => {
      try{
        const res = await createLeadFromChat();
        if(res.ok) add("bot", "Đã tạo lead từ cuộc chat và lưu vào CRM. Mã lead: " + (res.id || "OK"));
        else add("bot", "Chưa tạo được lead: " + (res.error || "Vui lòng nhập SĐT trong chat."));
      }catch(e){ add("bot", "Lỗi tạo lead: " + e.message); }
    };
  }

  document.addEventListener("DOMContentLoaded", render);
  setTimeout(render, 800);
})();
