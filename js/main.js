const API = "https://script.google.com/macros/s/AKfycbzzE1MZSWJKvis8_DsJ9wKJMEj3jXXsuMHAYv77L4r5PxRbbh6WpnBnx_W_8IFtlEMh/exec"; // Gantikan dengan Apps Script API

import L from "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
import "https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js";

// Map
const map = L.map('map').setView([4.2105, 101.9758], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map);

let heatPoints=[], markers=[];

// Load heatmap & pins pemenang
async function loadMap(){
  const res = await fetch(API+"?mode=map");
  const data = await res.json();
  data.forEach(w=>{
    heatPoints.push([w.lat,w.lng,1]);
    let m = L.marker([w.lat,w.lng]).addTo(map);
    m.bindPopup(`<b>${w.nama}</b><br>${w.lokasi}<br>Hadiah: ${w.hadiah}`);
    markers.push(m);
  });
  L.heatLayer(heatPoints,{radius:35,blur:25,maxZoom:10,gradient:{0.2:'blue',0.4:'lime',0.6:'yellow',0.8:'orange',1.0:'red'}}).addTo(map);
}
loadMap();

// Counter + Chart saham
async function updateDashboard(){
  const res = await fetch(API+"?page=dashboard");
  const data = await res.json();
  document.getElementById("totalKod").innerText = data.total;
  document.getElementById("totalDitebus").innerText = data.ditebus;
  document.getElementById("totalBelum").innerText = data.belum;
}
setInterval(updateDashboard,5000);

// Ticker pemenang
async function loadTicker(){
  const res = await fetch(API+"?page=dashboard");
  const data = await res.json();
  const ticker = document.getElementById("ticker");
  let idx=0;
  setInterval(()=>{
    ticker.innerText=`${data.pemenang[idx].nama} menebus ${data.pemenang[idx].hadiah}`;
    idx=(idx+1)%data.pemenang.length;
  },4000);
}
loadTicker();

// Semak Kod Siri
document.getElementById("checkBtn").addEventListener("click",async ()=>{
  const kod = document.getElementById("kodInput").value.trim().toUpperCase();
  const res = await fetch(API+"?kod="+kod);
  const data = await res.json();
  const resultEl = document.getElementById("result");
  const stampSah = document.getElementById("stampSah");
  const stampAktif = document.getElementById("stampAktif");
  const audioSah = document.getElementById("audioSah");
  const audioAktif = document.getElementById("audioAktif");

if(data.success){
  if(data.status=="TELAH DITEBUS"){
    stampSah.classList.add("fall");
    stampAktif.classList.remove("fall");
    audioSah.play();
  } else if(data.status=="AKTIF"){
    stampAktif.classList.add("fall");
    stampSah.classList.remove("fall");
    audioAktif.play();
  }
} else {
  stampSah.classList.remove("fall");
  stampAktif.classList.remove("fall");
}

  // Scan animation
  document.getElementById("scanLine").classList.add("active");
  setTimeout(()=>document.getElementById("scanLine").classList.remove("active"),2000);

  if(data.success){
    resultEl.innerHTML = `
      <div style="color:${data.color}">
      ${data.tajuk}<br>
      KOD SIRI: ${data.kod_siri}<br>
      NAMA: ${data.nama}<br>
      HADIAH: ${data.hadiah}<br>
      STATUS KOD: ${data.status_kod}<br>
      PRODUK: ${data.produk}<br>
      HARGA: ${data.harga}<br>
      TEL: ${data.telefon}<br>
      IC: ${data.ic}<br>
      STATUS PENEBUSAN: ${data.status_penebusan}<br>
      DISAHKAN: ${data.disahkan}<br>
      TARIKH: ${data.tarikh}<br>
      LOKASI: ${data.lokasi}
      </div>
    `;
    stamp.classList.add("fall");
    document.getElementById(data.status=="TELAH DITEBUS"?"audioSah":"audioAktif").play();
  } else {
    resultEl.innerHTML = `<div style="color:red">${data.message}</div>`;
    document.getElementById("audioInvalid").play();
  }
});
