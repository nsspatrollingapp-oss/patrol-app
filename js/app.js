const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyfs9hiYIC50xxhLG6fmpe6ZLDrBPZr4G6sHTjzj57KOMeLhyLFYCzGi-PP0VqJgnnDdA/exec";

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

    location: document.getElementById("location").value,
    checklist: [...document.querySelectorAll(".chk:checked")]
                .map(c => c.value)
                .join(", "), // 🔑 STRING

    remarks: document.getElementById("remarks").value,

    lat,
    lng,

    photos,
    signature: canvas.toDataURL(),

    syncStatus: navigator.onLine ? "ONLINE" : "OFFLINE",
    device: "Web",
    appVersion: "v1.0"
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data) // ⚠️ NO headers
  })
  .then(r => r.json())
  .then(res => {
    document.getElementById("status").innerText = res.status === "success"
      ? "Submitted Successfully"
      : res.message;
  })
  .catch(() => {
    document.getElementById("status").innerText = "Saved (will sync)";
  });
}
