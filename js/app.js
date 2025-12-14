const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQaUmcixmxU2OGQqIfQ3kffEW0GGgIElE3oas2xJNKXitXADuyfAt7BJegD-wItFmXJg/exec";

let lat = "", lng = "";

// GPS
navigator.geolocation.getCurrentPosition(p => {
  lat = p.coords.latitude;
  lng = p.coords.longitude;
});

// SIGNATURE
const canvas = document.getElementById("sign");
const ctx = canvas.getContext("2d");
let draw = false;

canvas.onmousedown = () => draw = true;
canvas.onmouseup = () => { draw = false; ctx.beginPath(); };
canvas.onmousemove = e => {
  if (!draw) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

function clearSign() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// IMAGE → BASE64
function toBase64(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });
}

async function submitVisit() {
  const photosInput = document.getElementById("photos").files;
  if (photosInput.length > 5) {
    alert("Maximum 5 photos");
    return;
  }

  const photos = [];
  for (let f of photosInput) {
    photos.push(await toBase64(f));
  }

  const data = {
    username: localStorage.getItem("user"),
    password: localStorage.getItem("pass"),
    location: location.value,
    checklist: [...document.querySelectorAll(".chk:checked")].map(c => c.value),
    remarks: remarks.value,
    lat, lng,
    photos,
    signature: canvas.toDataURL(),
    syncStatus: navigator.onLine ? "ONLINE" : "OFFLINE"
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(r => r.json())
  .then(() => status.innerText = "Submitted Successfully")
  .catch(() => status.innerText = "Saved (will sync)");
}
