
// V20.8.1 fix
const zaloBtn={innerText:""};
zaloBtn.innerText="Zalo sắp cập nhật";

function aiScore(lead){
 let s=0;
 if(lead.cic==="tot") s+=3;
 if(lead.income>15000000) s+=3;
 return s>=5?"A":"B";
}
