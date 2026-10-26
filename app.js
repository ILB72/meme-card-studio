// ★ 저장 공간 한도 늘리기 (기본 5MB -> 브라우저 최대 허용치)
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist();
}

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

// 템플릿 UI 요소
const templateNameInput = document.getElementById("templateName");
const saveTemplateBtn = document.getElementById("saveTemplateBtn");
const templateList = document.getElementById("templateList");

const state = {
  image: null,
  text: textInput.value,
  x: 0.5,
  y: 0.5,
  fontSize: 60,
  color: "#ffffff",
  ratio: "1:1" 
};

// --- 기본 그리기 로직 ---
function drawImageCover(ctx, img, cw, ch) {
  const scale = Math.max(cw / img.width, ch / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const dx = (cw - w) / 2;
  const dy = (ch - h) / 2;
  ctx.drawImage(img, dx, dy, w, h);
}

function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split('\n');
  const lines = [];
  for (let p = 0; p < paragraphs.length; p++) {
    const chars = Array.from(paragraphs[p]);
    let currentLine = '';
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const testLine = currentLine + char;
      if (ctx.measureText(testLine).width > maxWidth && currentLine !== '') {
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

function render() {
  try {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.image) {
      drawImageCover(ctx, state.image, canvas.width, canvas.height);
    }

    if (state.text.trim() !== "") {
      ctx.fillStyle = state.color;
      ctx.font = `bold ${state.fontSize}px "Malgun Gothic", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const maxWidth = canvas.width * 0.9;
      const lines = wrapText(ctx, state.text, maxWidth);
      const px = state.x * canvas.width;
      const py = state.y * canvas.height;
      const lineHeight = state.fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      const startY = py - (totalHeight / 2) + (lineHeight / 2);

      lines.forEach((line, index) => {
        ctx.fillText(line, px, startY + (index * lineHeight));
      });
    }
  } catch (error) {
    console.error("렌더링 오류 발생:", error);
  }
}

// --- 이벤트 리스너 (기본) ---
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
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

textInput.addEventListener("input", (e) => { state.text = e.target.value; render(); });
xInput.addEventListener("input", (e) => { state.x = parseFloat(e.target.value); render(); });
yInput.addEventListener("input", (e) => { state.y = parseFloat(e.target.value); render(); });
sizeInput.addEventListener("input", (e) => { state.fontSize = parseInt(e.target.value, 10); render(); });
colorInput.addEventListener("input", (e) => { state.color = e.target.value; render(); });

function changeRatio(width, height, ratioName, activeBtn) {
  canvas.width = width;
  canvas.height = height;
  state.ratio = ratioName; 
  [btn1x1, btn4x5, btn9x16].forEach(btn => btn.classList.remove("active"));
  activeBtn.classList.add("active");
  render();
}

btn1x1.addEventListener("click", () => changeRatio(1080, 1080, "1:1", btn1x1));
btn4x5.addEventListener("click", () => changeRatio(1080, 1350, "4:5", btn4x5));
btn9x16.addEventListener("click", () => changeRatio(1080, 1920, "9:16", btn9x16));

downloadBtn.addEventListener("click", () => {
  render(); 
  const link = document.createElement("a");
  link.download = "card_image.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// ==========================================
// ★ 템플릿 관리 로직 (localStorage)
// ==========================================

function getTemplates() {
  const data = localStorage.getItem("meme_templates");
  return data ? JSON.parse(data) : [];
}

function saveTemplates(templates) {
  localStorage.setItem("meme_templates", JSON.stringify(templates));
}

function renderTemplateList() {
  templateList.innerHTML = "";
  const templates = getTemplates();

  if (templates.length === 0) {
    templateList.innerHTML = "<li style='font-size: 13px; color: #888;'>저장된 템플릿이 없습니다.</li>";
    return;
  }

  templates.forEach(t => {
    const li = document.createElement("li");
    li.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid #ddd; padding: 8px; border-radius: 4px;";
    
    const nameSpan = document.createElement("span");
    nameSpan.textContent = t.name;
    nameSpan.style.cssText = "font-size: 14px; cursor: pointer; flex: 1; word-break: break-all;";
    
    const btnGroup = document.createElement("div");
    btnGroup.style.cssText = "display: flex; gap: 4px; flex-shrink: 0;";

    const loadBtn = document.createElement("button");
    loadBtn.textContent = "불러오기";
    loadBtn.style.cssText = "padding: 4px 8px; font-size: 12px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;";
    loadBtn.onclick = () => loadTemplate(t.id);

    const editBtn = document.createElement("button");
    editBtn.textContent = "수정";
    editBtn.style.cssText = "padding: 4px 8px; font-size: 12px; cursor: pointer;";
    editBtn.onclick = () => editTemplate(t.id, t.name);

    const delBtn = document.createElement("button");
    delBtn.textContent = "삭제";
    delBtn.style.cssText = "padding: 4px 8px; font-size: 12px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 4px;";
    delBtn.onclick = () => deleteTemplate(t.id);

    btnGroup.appendChild(loadBtn);
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(delBtn);
    li.appendChild(nameSpan);
    li.appendChild(btnGroup);
    templateList.appendChild(li);
  });
}

// 1. 저장 (Create) - ★ 배경 이미지와 텍스트 분리 저장
saveTemplateBtn.addEventListener("click", () => {
  const name = templateNameInput.value.trim();
  if (!name) return alert("템플릿 이름을 입력해주세요.");
  if (!state.image) return alert("이미지를 먼저 불러와주세요.");

  const templates = getTemplates();
  
  // 화면 전체(글씨 포함)가 아닌, 사용자가 올린 '원본 이미지'만 축소해서 저장합니다.
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  
  const maxThumbSize = 800; 
  const scale = Math.min(maxThumbSize / state.image.width, maxThumbSize / state.image.height);
  tempCanvas.width = state.image.width * scale;
  tempCanvas.height = state.image.height * scale;
  
  // 원본 이미지만 그리기 (텍스트 제외)
  tempCtx.drawImage(state.image, 0, 0, tempCanvas.width, tempCanvas.height);
  
  // 용량이 훨씬 적은 JPEG로 변환 (화질 0.7)
  const imageDataURL = tempCanvas.toDataURL("image/jpeg", 0.7); 

  const newTemplate = {
    id: crypto.randomUUID(),
    name: name,
    image: imageDataURL, // 배경 이미지만 저장
    text: state.text,    // 텍스트 데이터는 따로 저장
    x: state.x,
    y: state.y,
    fontSize: state.fontSize,
    color: state.color,
    ratio: state.ratio
  };

  templates.push(newTemplate);
  
  try {
    saveTemplates(templates);
    templateNameInput.value = ""; 
    renderTemplateList(); 
    alert("템플릿이 저장되었습니다.");
  } catch (error) {
    console.error("저장 실패:", error);
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      alert("브라우저 저장 공간이 부족합니다.\n기존 템플릿을 몇 개 삭제한 후 다시 시도해주세요.");
    } else {
      alert("템플릿 저장 중 알 수 없는 오류가 발생했습니다.");
    }
    templates.pop(); 
  }
});

// 2. 불러오기 (Read)
function loadTemplate(id) {
  const templates = getTemplates();
  const t = templates.find(item => item.id === id);
  if (!t) return;

  // 텍스트 및 스타일 상태 복원
  state.text = t.text;
  state.x = t.x;
  state.y = t.y;
  state.fontSize = t.fontSize;
  state.color = t.color;
  state.ratio = t.ratio;

  // UI 입력값 복원
  textInput.value = t.text;
  xInput.value = t.x;
  yInput.value = t.y;
  sizeInput.value = t.fontSize;
  colorInput.value = t.color;

  // 비율 버튼 상태 복원
  if (t.ratio === "1:1") changeRatio(1080, 1080, "1:1", btn1x1);
  else if (t.ratio === "4:5") changeRatio(1080, 1350, "4:5", btn4x5);
  else if (t.ratio === "9:16") changeRatio(1080, 1920, "9:16", btn9x16);

  // 배경 이미지 복원 후 렌더링 (텍스트가 새로 그려짐)
  const img = new Image();
  img.onload = () => {
    state.image = img;
    render();
  };
  img.src = t.image;
}

// 3. 수정 (Update) - 이름 변경
function editTemplate(id, oldName) {
  const newName = prompt("새로운 템플릿 이름을 입력하세요.", oldName);
  if (!newName || newName.trim() === "") return;

  let templates = getTemplates();
  templates = templates.map(t => {
    if (t.id === id) return { ...t, name: newName.trim() };
    return t;
  });

  try {
    saveTemplates(templates);
    renderTemplateList();
  } catch (error) {
    alert("수정 내용을 저장하는 중 오류가 발생했습니다.");
  }
}

// 4. 삭제 (Delete)
function deleteTemplate(id) {
  if (!confirm("정말 이 템플릿을 삭제하시겠습니까?")) return;
  
  let templates = getTemplates();
  templates = templates.filter(t => t.id !== id);
  
  try {
    saveTemplates(templates);
    renderTemplateList();
  } catch (error) {
    alert("삭제 내용을 저장하는 중 오류가 발생했습니다.");
  }
}

// 초기화
render();
renderTemplateList();