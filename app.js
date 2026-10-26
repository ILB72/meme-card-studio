const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

const fileInput = document.getElementById("fileInput");
const errorMsg = document.getElementById("errorMsg");
const textInput = document.getElementById("textInput");
const xInput = document.getElementById("xInput");
const yInput = document.getElementById("yInput");
const sizeInput = document.getElementById("sizeInput");
const colorInput = document.getElementById("colorInput");

// 화면비 및 다운로드 버튼
const btn1x1 = document.getElementById("btn1x1");
const btn4x5 = document.getElementById("btn4x5");
const btn9x16 = document.getElementById("btn9x16");
const downloadBtn = document.getElementById("downloadBtn");

// 상태 관리 객체
const state = {
  image: null,
  text: textInput.value,
  x: 0.5,
  y: 0.5,
  fontSize: 60,
  color: "#ffffff",
};

// 이미지를 캔버스에 꽉 차게 그리는 함수 (Cover)
function drawImageCover(ctx, img, cw, ch) {
  const scale = Math.max(cw / img.width, ch / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const dx = (cw - w) / 2;
  const dy = (ch - h) / 2;
  ctx.drawImage(img, dx, dy, w, h);
}

// ★ 미리보기와 다운로드가 공유하는 단 하나의 그리기 함수
function render() {
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
    ctx.font = `bold ${state.fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // 비율 좌표(0~1)를 실제 캔버스 픽셀 좌표로 변환
    const px = state.x * canvas.width;
    const py = state.y * canvas.height;
    
    ctx.fillText(state.text, px, py);
  }
}

// --- 이벤트 리스너: 파일 업로드 ---
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  errorMsg.textContent = ""; // 이전 에러 초기화

  const okTypes = ["image/png", "image/jpeg"];
  if (!okTypes.includes(file.type)) {
    errorMsg.textContent = "PNG 또는 JPEG 이미지만 올릴 수 있습니다.";
    fileInput.value = "";
    return; // 기존 state 유지
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.image = img; // 성공 시에만 state 교체
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

// --- 이벤트 리스너: 텍스트/슬라이더 ---
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

// --- 이벤트 리스너: 화면비 변경 ---
function changeRatio(width, height, activeBtn) {
  // 캔버스 실제 해상도 변경
  canvas.width = width;
  canvas.height = height;
  
  // 버튼 UI 활성화 상태 변경
  [btn1x1, btn4x5, btn9x16].forEach(btn => btn.classList.remove("active"));
  activeBtn.classList.add("active");
  
  // 비율이 바뀌었으므로 다시 그리기 (비율 좌표 덕분에 글자 위치 자동 조정)
  render();
}

btn1x1.addEventListener("click", () => changeRatio(1080, 1080, btn1x1));
btn4x5.addEventListener("click", () => changeRatio(1080, 1350, btn4x5));
btn9x16.addEventListener("click", () => changeRatio(1080, 1920, btn9x16));

// --- 이벤트 리스너: 다운로드 ---
downloadBtn.addEventListener("click", () => {
  // 다운로드 직전, 현재 캔버스 상태를 한 번 더 그려서 확실하게 갱신
  render(); 
  
  // 캔버스를 PNG 데이터(Data URL)로 변환
  const dataURL = canvas.toDataURL("image/png");
  
  // 가상 링크를 만들어 다운로드 실행
  const link = document.createElement("a");
  link.download = "card_image.png";
  link.href = dataURL;
  link.click();
});

// 초기 렌더링 실행
render();