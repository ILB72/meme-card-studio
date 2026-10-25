const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");
const fileInput = document.getElementById("fileInput");
const errorMsg = document.getElementById("errorMsg");
const textInput = document.getElementById("textInput");
const xInput = document.getElementById("xInput");
const yInput = document.getElementById("yInput");
const sizeInput = document.getElementById("sizeInput");
const colorInput = document.getElementById("colorInput");

const state = {
  image: null,
  text: textInput.value,
  x: 0.5,
  y: 0.5,
  fontSize: 60,
  color: "#ffffff",
};

function drawImageCover(ctx, img, cw, ch) {
  const scale = Math.max(cw / img.width, ch / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const dx = (cw - w) / 2;
  const dy = (ch - h) / 2;
  ctx.drawImage(img, dx, dy, w, h);
}

function render() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.image) {
    drawImageCover(ctx, state.image, canvas.width, canvas.height);
  }

  if (state.text.trim() !== "") {
    ctx.fillStyle = state.color;
    ctx.font = `bold ${state.fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const px = state.x * canvas.width;
    const py = state.y * canvas.height;
    ctx.fillText(state.text, px, py);
  }
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  errorMsg.textContent = "";

  const okTypes = ["image/png", "image/jpeg"];
  if (!okTypes.includes(file.type)) {
    errorMsg.textContent = "PNG 또는 JPEG 이미지만 올릴 수 있습니다.";
    fileInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.image = img;
      render();
    };
    img.onerror = () => {
      errorMsg.textContent = "이미지를 읽을 수 없습니다.";
    };
    img.src = reader.result;
  };
  reader.onerror = () => {
    errorMsg.textContent = "파일을 읽는 중 오류가 발생했습니다.";
  };
  reader.readAsDataURL(file);
});

textInput.addEventListener("input", (e) => {
  state.text = e.target.value;
  render();
});
xInput.addEventListener("input", (e) => {
  state.x = parseFloat(e.target.value);
  render();
});
yInput.addEventListener("input", (e) => {
  state.y = parseFloat(e.target.value);
  render();
});
sizeInput.addEventListener("input", (e) => {
  state.fontSize = parseInt(e.target.value, 10);
  render();
});
colorInput.addEventListener("input", (e) => {
  state.color = e.target.value;
  render();
});

render();