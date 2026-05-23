// V21.4.2 HOTFIX — clean chat UI, exactly 2 floating buttons
(function(){
  const CALL_PHONE = "0822397836";
  const CFG = window.VAYNHANH247_CONFIG || {};
  const GAS_URL = CFG.GAS_URL || "";
  let history = JSON.parse(localStorage.getItem("v247_chat_history_v2142") || "[]");
  let profile = JSON.parse(localStorage.getItem("v247_chat_profile_v2142") || "{}");

  function esc(s){ return String(s || "").replace(/[&<>"']/g, function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];}); }
  function save(){ localStorage.setItem("v247_chat_history_v2142", JSON.stringify(history.slice(-30))); localStorage.setItem("v247_chat_profile_v2142", JSON.stringify(profile)); }
  function cleanPhone(v){ return String(v || "").replace(/\D/g,""); }

  function hideOldWidgets(){
    document.querySelectorAll("#v21AiBox,#aiProV2132,#v2133AiRoot,#v214Chatbot").forEach(function(el){ el.remove(); });
    document.querySelectorAll("a,button").forEach(function(el){
      if(el.closest("#v2142Actions") || el.closest("#v2142Panel")) return;
      const t = (el.textContent || "").toLowerCase();
      const href = (el.getAttribute("href") || "").toLowerCase();
      if(t.includes("zalo") || href.includes("zalo.me") || t.includes("ai tư vấn") || t.includes("ai v21") || t.includes("tư vấn ai")){
        el.style.display = "none";
      }
    });
  }

  function updateProfile(text){
    const t = String(text || "");
    const phone = t.match(/(?:0|\+84)\d[\d\s.-]{7,12}/);
    if(phone) profile.phone = cleanPhone(phone[0]).replace(/^84/,"0");
    const income = t.match(/(\d+[\.,]?\d*)\s*(triệu|trieu|tr|m|million)/i);
    if(income && /thu nhập|lương|luong|income/i.test(t)) profile.incomeText = income[0];
    const amount = t.match(/(\d+[\.,]?\d*)\s*(triệu|trieu|tr|m|tỷ|ty)/i);
    if(amount && /vay|cần|muốn|nhu cầu|can|muon/i.test(t)) profile.amountText = amount[0];
    if(/cic|nợ xấu|no xau|nhóm nợ/i.test(t)) profile.hasCicConcern = true;
    if(/thẻ|the tin dung|tín dụng/i.test(t)) profile.product = "Thẻ tín dụng";
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
    score = Math.max(0, Math.min(100, score));
    const grade = score >= 75 ? "A" : score >= 50 ? "B" : "C";
    const tag = grade === "A" ? "🔥 Nóng" : grade === "B" ? "🌤 Ấm" : "❄ Lạnh";
    return {score:score, grade:grade, tag:tag};
  }

  function productSuggest(){
    if(profile.product) return profile.product;
    if(profile.hasCicConcern) return "Tư vấn CIC / nợ xấu";
    return "Vay tín chấp";
  }

  function answer(q){
    updateProfile(q);
    const t = String(q || "").toLowerCase();
    const sc = scoreProfile();
    const product = productSuggest();
    let main = "AI có thể tư vấn về vay tín chấp, CIC/nợ xấu, thẻ tín dụng, bảo hiểm và hồ sơ tài chính cá nhân.";
    if(/cic/.test(t)) main = "CIC là lịch sử tín dụng. Khi tư vấn cần xem nhóm nợ, thời điểm tất toán, thu nhập hiện tại và nhu cầu vay.";
    else if(/nợ xấu|no xau|nhóm nợ/.test(t)) main = "Nợ xấu vẫn có thể xem xét tùy nhóm nợ, đã tất toán chưa, thời gian phát sinh và hồ sơ hiện tại.";
    else if(/vay|tín chấp|tin chap/.test(t)) main = "Vay tín chấp thường cần thu nhập ổn định, CIC phù hợp, SĐT liên hệ và nhu cầu vay rõ ràng.";
    else if(/thẻ|the tin dung|tín dụng/.test(t)) main = "Thẻ tín dụng phụ thuộc thu nhập, lịch sử tín dụng, nghề nghiệp và hồ sơ cá nhân.";
    else if(/bảo hiểm|bao hiem|bhnt/.test(t)) main = "Bảo hiểm nên chọn theo mục tiêu bảo vệ, ngân sách, độ tuổi và điều kiện quyền lợi.";
    else if(/hồ sơ|ho so|giấy tờ|can gi|cần gì/.test(t)) main = "Hồ sơ cơ bản gồm thông tin cá nhân, SĐT, thu nhập, nhu cầu vay và tình trạng CIC.";
    let miss = [];
    if(!profile.phone) miss.push("SĐT liên hệ");
    if(!profile.incomeText && product.includes("Vay")) miss.push("thu nhập/tháng");
    if(miss.length) return main + "\n\nĐể tư vấn sát hơn, bạn cho thêm: " + miss.join(", ") + ".";
    return main + "\n\nĐánh giá nhanh: " + sc.grade + " - " + sc.tag + " (" + sc.score + "/100). Gợi ý: " + product + ".";
  }

  async function createLead(){
    const sc = scoreProfile();
    const lead = {
      name: "Khách từ Chat tư vấn",
      phone: profile.phone || "",
      service: productSuggest(),
      income: profile.incomeText || "",
      need: profile.need || "Tư vấn từ chat",
      note: "Lead tạo từ Chat tư vấn V21.4.2",
      sourcePage: "Chat tư vấn V21.4.2",
      utm_source: "chat_tu_van",
      aiScore: sc.score,
      aiGrade: sc.grade,
      aiTag: sc.tag
    };
    if(!lead.phone) return {ok:false,error:"Bạn cần nhập SĐT trong chat trước khi tạo lead."};
    if(window.V247_V21 && window.V247_V21.sendRealtimeLead) return await window.V247_V21.sendRealtimeLead(lead);
    if(!GAS_URL) return {ok:false,error:"Chưa cấu hình GAS_URL."};
    const r = await fetch(GAS_URL, {method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"create",lead:lead})});
    return await r.json();
  }

  function render(){
    hideOldWidgets();
    if(document.getElementById("v2142Actions")) return;

    const actions = document.createElement("div");
    actions.id = "v2142Actions";
    actions.innerHTML = '<a id="v2142Call" href="tel:0822397836">Gọi ngay 0822397836</a><button id="v2142ChatOpen" type="button">Chat tư vấn</button>';
    document.body.appendChild(actions);

    const panel = document.createElement("div");
    panel.id = "v2142Panel";
    panel.innerHTML = '<div class="v2142Head"><div><b>Chat tư vấn tài chính</b><small>Hỏi về vay, CIC, thẻ, bảo hiểm</small></div><button id="v2142Close" type="button">×</button></div><div id="v2142Msgs"></div><div class="v2142Quick"><button type="button">Tôi bị nợ xấu có vay được không?</button><button type="button">Vay tín chấp cần hồ sơ gì?</button><button type="button">CIC là gì?</button></div><div class="v2142Input"><textarea id="v2142Text" placeholder="Nhập câu hỏi..."></textarea><div class="v2142Buttons"><button id="v2142Send" type="button">Gửi</button><button id="v2142Lead" type="button">Tạo lead</button></div></div>';
    document.body.appendChild(panel);

    const msgs = document.getElementById("v2142Msgs");
    const input = document.getElementById("v2142Text");

    function add(role, text){
      history.push({role:role,text:text,time:new Date().toISOString()});
      save();
      msgs.innerHTML += '<div class="v2142Msg '+role+'">'+esc(text).replace(/\n/g,"<br>")+'</div>';
      msgs.scrollTop = msgs.scrollHeight;
    }

    if(history.length){
      history.slice(-8).forEach(function(m){ msgs.innerHTML += '<div class="v2142Msg '+m.role+'">'+esc(m.text).replace(/\n/g,"<br>")+'</div>'; });
    } else {
      add("bot","Xin chào! Bạn cần tư vấn về vay tín chấp, CIC/nợ xấu, thẻ tín dụng hay bảo hiểm?");
    }

    function send(text){
      const q = String(text || input.value || "").trim();
      if(!q) return;
      add("user", q);
      add("bot", answer(q));
      input.value = "";
    }

    document.getElementById("v2142ChatOpen").onclick = function(){
      panel.style.display = panel.style.display === "block" ? "none" : "block";
      if(panel.style.display === "block") input.focus();
    };
    document.getElementById("v2142Close").onclick = function(){ panel.style.display = "none"; };
    document.getElementById("v2142Send").onclick = function(){ send(); };
    input.addEventListener("keydown", function(e){ if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); send(); }});
    document.querySelectorAll(".v2142Quick button").forEach(function(b){ b.onclick = function(){ send(b.textContent); }; });
    document.getElementById("v2142Lead").onclick = async function(){
      try {
        const res = await createLead();
        add("bot", res.ok ? "Đã tạo lead và lưu vào CRM. Mã lead: " + (res.id || "OK") : "Chưa tạo được lead: " + (res.error || "Vui lòng nhập SĐT."));
      } catch(e) {
        add("bot","Lỗi tạo lead: " + e.message);
      }
    };
  }

  document.addEventListener("DOMContentLoaded", render);
  setTimeout(render, 700);
  setTimeout(hideOldWidgets, 1500);
})();
