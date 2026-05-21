FINANCE CONSUMER SITE V14 - AI CHATBOT THAT + CRM

BAN MOI CO:
- Chatbot AI noi tren website
- Tra loi tu dong ve vay, CIC, the tin dung, bao hiem
- Form thu lead ngay trong chatbot
- Day lead vao CRM Google Sheet
- Luu hoi thoai AI vao sheet Chats
- Admin xem lead, pipeline, lich goi, xuat CSV, xem hoi thoai AI

HUONG DAN CAP NHAT LEN GITHUB PAGES:
1. Giai nen file finance_consumer_site_v14_real_ai_chatbot.zip
2. Vao repo GitHub: taichinh247vn
3. Upload de len cac file/folder moi:
   assets, data, google-apps-script, posts, admin.html, cam-on.html, index.html, robots.txt, sitemap.xml, vay-tin-chap.html
4. Commit changes
5. Cho GitHub Pages tu deploy
6. Mo: https://thanhbn2910.github.io/taichinh247vn/
7. Admin: https://thanhbn2910.github.io/taichinh247vn/admin.html

HUONG DAN CAI GOOGLE SHEET + APPS SCRIPT V14:
1. Mo Google Sheet CRM dang dung hoac tao sheet moi
2. Extensions > Apps Script
3. Xoa code cu, copy noi dung file google-apps-script/Code.gs vao
4. Save
5. Deploy > New deployment > Web app
6. Execute as: Me
7. Who has access: Anyone
8. Copy Web App URL
9. Mo file assets/app.js
10. Tim dong GAS_URL:''
11. Dan link vao, vi du:
    GAS_URL:'https://script.google.com/macros/s/AKfycb.../exec'
12. Luu file, upload lai len GitHub, Commit changes

CAI API KEY AI THAT:
1. Trong Apps Script, vao Project Settings
2. Script properties > Add script property
3. Name: OPENAI_API_KEY
4. Value: dan API key OpenAI cua ban
5. Save
6. Deploy lai Apps Script neu can

NEU CHUA CO API KEY:
- Chatbot van chay bang rule fallback co san
- CRM van thu lead binh thuong

KIEM TRA:
1. Mo web
2. Bam nut "AI tu van"
3. Hoi: "Luong 8 trieu vay duoc bao nhieu?"
4. De lai SDT trong form chatbot
5. Mo admin.html de xem lead
6. Mo Google Sheet tab Leads va Chats de xem du lieu that
