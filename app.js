const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

const fileInput = document.getElementById("fileInput");
const errorMsg = document.getElementById("errorMsg");
const textInput = document.getElementById("textInput");
const xInput = document.getElementById("xInput");
const yInput = document.getElementById("yInput");
const sizeInput = document.getElementById("sizeInput");
const colorInput = document.getElementById("colorInput");

const btn1x1 = document.getElementById("btn1x1");
const btn4x5 = document.getElementById("btn4x5");
const btn9x16 = document.getElementById("btn9x16");
const downloadBtn = document.getElementById("downloadBtn");

const state = {
  image: null,
  text: textInput.value,
  x: 0.5,
  y: 0.5,
  fontSize: 60,
  color: "#ffffff",
};

// 이미지 Cover 함수
function drawImageCover(ctx, img, cw, ch) {
  const scale = Math.max(cw / img.width, ch / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const dx = (cw - w) / 2;
  const dy = (ch - h) / 2;
  ctx.drawImage(img, dx, dy, w, h);
}

// ★ 글자 단위 줄바꿈 처리 (띄어쓰기가 없어도 무조건 캔버스 안에 들어오게 함)
function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split('\n');
  const lines = [];

  for (let p = 0; p < paragraphs.length; p++) {
    // 한글, 영문, 이모지 등을 모두 1글자 단위로 쪼갬
    const chars = Array.from(paragraphs[p]); 
    let currentLine = '';

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      
      // 허용 폭을 넘어가면 줄바꿈
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
  }
  return lines;
}

// 렌더링 함수
function render() {
  try {
    // 1. 배경 지우기
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 이미지 그리기
    if (state.image) {
      drawImageCover(ctx, state.image, canvas.width, canvas.height);
    }

    // 3. 문구 그리기
    if (state.text.trim() !== "") {
      ctx.fillStyle = state.color;
      ctx.font = `bold ${state.fontSize}px "Malgun Gothic", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const maxWidth = canvas.width * 0.9; // 캔버스 폭의 90%까지만 허용
      const lines = wrapText(ctx, state.text, maxWidth);

      const px = state.x * canvas.width;
      const py = state.y * canvas.height;
      
      const lineHeight = state.fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      const startY = py - (totalHeight / 2) + (lineHeight / 2);

      // 줄바꿈된 각 줄을 그림
      lines.forEach((line, index) => {
        ctx.fillText(line, px, startY + (index * lineHeight));
      });
    }
  } catch (error) {
    console.error("렌더링 오류 발생:", error);
    errorMsg.textContent = "화면을 그리는 중 오류가 발생했습니다.";
  }
}

// --- 이벤트 리스너들 ---
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

function changeRatio(width, height, activeBtn) {
  canvas.width = width;
  canvas.height = height;
  [btn1x1, btn4x5, btn9x16].forEach(btn => btn.classList.remove("active"));
  activeBtn.classList.add("active");
  render();
}

btn1x1.addEventListener("click", () => changeRatio(1080, 1080, btn1x1));
btn4x5.addEventListener("click", () => changeRatio(1080, 1350, btn4x5));
btn9x16.addEventListener("click", () => changeRatio(1080, 1920, btn9x16));

downloadBtn.addEventListener("click", () => {
  render(); 
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "card_image.png";
  link.href = dataURL;
  link.click();
});

render();