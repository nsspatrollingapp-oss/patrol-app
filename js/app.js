const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzvLIpaYh7gdKE-vRoWhEL2t79CIzUX0di_AvJt4weIP56BEsKOJ1kUEhvwxGtRKIXiFg/exec";

let lat = "", lng = "";

/* GPS */
navigator.geolocation.getCurrentPosition(p => {
  lat = p.coords.latitude;
  lng = p.coords.longitude;
});

/* SIGNATURE */
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

/* FILE → BASE64 */
function toBase64(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });
}

async function submitVisit() {
  status.innerText = "Submitting...";

  const files = photos.files;
  if (files.length > 5) {
    alert("Max 5 photos");
    return;
  }

  const photos64 = [];
  for (let f of files) photos64.push(await toBase64(f));

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "submit",
      username: localStorage.getItem("user"),
      password: localStorage.getItem("pass"),
      location: location.value,
      checklist: [...document.querySelectorAll(".chk:checked")].map(c => c.value),
      remarks: remarks.value,
      lat, lng,
      photos: photos64,
      signature: canvas.toDataURL(),
      syncStatus: navigator.onLine ? "ONLINE" : "OFFLINE"
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.status === "success") {
      status.innerText = "✅ Submitted successfully";
    } else {
      status.innerText = "❌ Submit failed";
    }
  })
  .catch(() => status.innerText = "❌ Network error");
}
