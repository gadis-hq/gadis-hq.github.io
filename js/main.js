import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';

const API = "https://script.google.com/macros/s/AKfycbx.../exec"; // Gantikan dengan API awak
const stampSah = document.getElementById("stampSah");
const stampAktif = document.getElementById("stampAktif");
const audioSah = document.getElementById("audioSah");
const audioAktif = document.getElementById("audioAktif");

async function semakKod(){
  const kod=document.getElementById("kodInput").value.trim().toUpperCase();
  if(!kod) return alert("Masukkan Kod Siri");

  const res=await fetch(`${API}?kod=${kod}`);
  const data=await res.json();

  document.getElementById("result").innerHTML="";
  if(data.success){
    generateQR(kod);
    if(data.status=="TELAH DITEBUS"){
      stampSah.classList.add("fall"); stampAktif.classList.remove("fall"); audioSah.play();
    }else if(data.status=="AKTIF"){
      stampAktif.classList.add("fall"); stampSah.classList.remove("fall"); audioAktif.play();
    }
    showResult(data);
  }else{
    document.getElementById("result").innerHTML=`<span style="color:red">${data.message}</span>`;
    stampSah.classList.remove("fall"); stampAktif.classList.remove("fall");
  }
}

function generateQR(kod){
  QRCode.toCanvas(document.getElementById("qrCanvas"), `${API}?verify=${kod}`, {width:150});
}

function showResult(data){
  const res=document.getElementById("result");
  res.innerHTML=`
  KOD SIRI: ${data.kod_siri}<br>
  NAMA: ${data.nama||"-"}<br>
  HADIAH: ${data.hadiah}<br>
  STATUS KOD: ${data.status_kod}<br>
  PEMBELIAN PRODUK: ${data.produk}<br>
  HARGA: ${data.harga}<br>
  NO. TELEFON: ${data.telefon||"-"}<br>
  NO. IC: ${data.ic||"-"}<br>
  STATUS PENEBUSAN: ${data.status_penebusan}<br>
  DISAHKAN: ${data.disahkan}<br>
  TARIKH: ${data.tarikh||"-"}<br>
  BANDAR / NEGERI: ${data.lokasi||"-"}
  `;
}

/* =======================
Map Pemenang
======================= */
const map = L.map('map').setView([4.2105,101.9758],6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

fetch(`${API}?mode=map`)
.then(r=>r.json())
.then(data=>{
  const heatPoints=[];
  data.forEach(w=>{
    heatPoints.push([w.lat,w.lng,1]);
    const marker=L.marker([w.lat,w.lng]).addTo(map);
    marker.bindPopup(`<b>${w.nama}</b><br>${w.lokasi}<br>Hadiah: ${w.hadiah}`);
  });
  L.heatLayer(heatPoints,{radius:35,blur:25,maxZoom:10,gradient:{0.2:'blue',0.4:'lime',0.6:'yellow',0.8:'orange',1.0:'red'}}).addTo(map);
});

/* =======================
Live Counter + Ticker
======================= */
async function updateDashboard(){
  const res=await fetch(`${API}?mode=dashboard`);
  const data=await res.json();
  document.getElementById("countSah").textContent=data.total_sah;
  document.getElementById("countAktif").textContent=data.total_aktif;
  document.getElementById("countInvalid").textContent=data.total_invalid;
}
setInterval(updateDashboard,5000);
updateDashboard();
