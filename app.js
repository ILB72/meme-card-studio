// ★ 저장 공간 한도 늘리기
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
const btn16x9 = document.getElementById("btn16x9");
const btn21x9 = document.getElementById("btn21x9");
const downloadBtn = document.getElementById("downloadBtn");

// === T05 AI A 추가: 자유 크기 입력 요소 ===
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const lockRatio = document.getElementById("lockRatio");
// === T05 AI B 반영: 프리셋 5개로 확장 ===
const presetBtns = [btn1x1, btn4x5, btn9x16, btn16x9, btn21x9];
const MAX_SIZE = 99999;

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
  ratio: "1:1",
  width: 1080,
  height: 1080,
  lockRatio: true
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  state.width = width;
  state.height = height;
  state.ratio = ratioName;
  widthInput.value = width;
  heightInput.value = height;
  presetBtns.forEach(btn => btn.classList.remove("active"));
  activeBtn.classList.add("active");
  render();
}

btn1x1.addEventListener("click", () => changeRatio(1080, 1080, "1:1", btn1x1));
btn4x5.addEventListener("click", () => changeRatio(1080, 1350, "4:5", btn4x5));
btn9x16.addEventListener("click", () => changeRatio(1080, 1920, "9:16", btn9x16));
// === T05 AI B 반영: 16:9 / 21:9 프리셋 ===
btn16x9.addEventListener("click", () => changeRatio(1920, 1080, "16:9", btn16x9));
btn21x9.addEventListener("click", () => changeRatio(2560, 1080, "21:9", btn21x9));

// --- T05 AI A 추가: 자유 크기 입력 ---
function parseSize(raw) {
  const s = String(raw).trim();
  if (!/^\d+$/.test(s)) return { ok: false, msg: "크기는 숫자만 입력해 주세요." };
  const n = parseInt(s, 10);
  if (n <= 0) return { ok: false, msg: "크기는 1 이상이어야 합니다." };
  if (n > MAX_SIZE) return { ok: true, value: MAX_SIZE, clamped: true };
  return { ok: true, value: n, clamped: false };
}

function applyCustomSize(w, h) {
  canvas.width = w;
  canvas.height = h;
  state.width = w;
  state.height = h;
  state.ratio = "custom";
  presetBtns.forEach(btn => btn.classList.remove("active"));
  widthInput.value = w;
  heightInput.value = h;
  render();
}

function handleSizeInput(changed) {
  const input = changed === "w" ? widthInput : heightInput;
  const r = parseSize(input.value);
  if (!r.ok) {
    errorMsg.textContent = r.msg;
    input.value = changed === "w" ? state.width : state.height;
    return;
  }
  let note = r.clamped ? `최대 ${MAX_SIZE}로 조정되었습니다.` : "";
  const ratio = state.height / state.width;
  let w = state.width, h = state.height;
  if (changed === "w") {
    w = r.value;
    if (state.lockRatio) h = Math.round(w * ratio);
  } else {
    h = r.value;
    if (state.lockRatio) w = Math.round(h / ratio);
  }
  const cw = Math.min(MAX_SIZE, Math.max(1, w));
  const ch = Math.min(MAX_SIZE, Math.max(1, h));
  if (!note && (cw !== w || ch !== h)) note = `비율 계산 결과가 범위를 벗어나 ${MAX_SIZE}/1로 조정되었습니다.`;
  errorMsg.textContent = note;
  applyCustomSize(cw, ch);
}

widthInput.addEventListener("change", () => handleSizeInput("w"));
heightInput.addEventListener("change", () => handleSizeInput("h"));
lockRatio.addEventListener("change", () => { state.lockRatio = lockRatio.checked; });

downloadBtn.addEventListener("click", () => {
  render();
  const link = document.createElement("a");
  link.download = "card_image.png";
  let dataUrl = "";
  try { dataUrl = canvas.toDataURL("image/png"); } catch (e) { dataUrl = ""; }
  if (!dataUrl || dataUrl === "data:,") {
    errorMsg.textContent = "이 크기는 브라우저가 이미지로 만들 수 없습니다. 크기를 줄여 주세요.";
    return;
  }
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// ==========================================
// ★ 템플릿 관리 로직
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
    li.style.cssText = "display: flex; flex-direction: column; gap: 8px; background: white; border: 1px solid #ddd; padding: 8px; border-radius: 4px;";

    const nameRow = document.createElement("div");
    nameRow.style.cssText = "display: flex; gap: 8px; align-items: center;";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = t.name;
    nameSpan.style.cssText = "font-size: 14px; font-weight: bold; flex: 1; word-break: break-all;";
    nameRow.appendChild(nameSpan);

    const btnGroup = document.createElement("div");
    btnGroup.style.cssText = "display: flex; gap: 4px;";

    const loadBtn = document.createElement("button");
    loadBtn.textContent = "불러오기";
    loadBtn.style.cssText = "padding: 4px 8px; font-size: 12px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;";
    loadBtn.onclick = () => loadTemplate(t.id);

    const editBtn = document.createElement("button");
    editBtn.textContent = "수정";
    editBtn.style.cssText = "padding: 4px 8px; font-size: 12px; cursor: pointer;";
    editBtn.onclick = () => startInlineEdit(t.id, nameRow, btnGroup, t.name);

    const delBtn = document.createElement("button");
    delBtn.textContent = "삭제";
    delBtn.style.cssText = "padding: 4px 8px; font-size: 12px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 4px;";
    delBtn.onclick = () => deleteTemplate(t.id);

    btnGroup.appendChild(loadBtn);
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(delBtn);

    li.appendChild(nameRow);
    li.appendChild(btnGroup);
    templateList.appendChild(li);
  });
}

// 1. 저장 (Create)
saveTemplateBtn.addEventListener("click", () => {
  const name = templateNameInput.value.trim();
  if (!name) return alert("템플릿 이름을 입력해주세요.");
  if (!state.image) return alert("이미지를 먼저 불러와주세요.");

  const templates = getTemplates();

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  const maxThumbSize = 800;
  const scale = Math.min(maxThumbSize / state.image.width, maxThumbSize / state.image.height);
  tempCanvas.width = state.image.width * scale;
  tempCanvas.height = state.image.height * scale;
  tempCtx.drawImage(state.image, 0, 0, tempCanvas.width, tempCanvas.height);

  const imageDataURL = tempCanvas.toDataURL("image/jpeg", 0.7);

  const newTemplate = {
    id: crypto.randomUUID(),
    name: name,
    image: imageDataURL,
    text: state.text,
    x: state.x,
    y: state.y,
    fontSize: state.fontSize,
    color: state.color,
    ratio: state.ratio,
    width: state.width,
    height: state.height
  };

  templates.push(newTemplate);

  try {
    saveTemplates(templates);
    templateNameInput.value = "";
    renderTemplateList();
    alert("템플릿이 저장되었습니다.");
  } catch (error) {
    console.error("저장 실패:", error);
    alert("저장 공간이 부족합니다.");
    templates.pop();
  }
});

// 2. 불러오기 (Read)
function loadTemplate(id) {
  const templates = getTemplates();
  const t = templates.find(item => item.id === id);
  if (!t) return;

  state.text = t.text;
  state.x = t.x;
  state.y = t.y;
  state.fontSize = t.fontSize;
  state.color = t.color;
  state.ratio = t.ratio;

  textInput.value = t.text;
  xInput.value = t.x;
  yInput.value = t.y;
  sizeInput.value = t.fontSize;
  colorInput.value = t.color;

  if (t.ratio === "1:1") changeRatio(1080, 1080, "1:1", btn1x1);
  else if (t.ratio === "4:5") changeRatio(1080, 1350, "4:5", btn4x5);
  else if (t.ratio === "9:16") changeRatio(1080, 1920, "9:16", btn9x16);
  // === T05 AI B 반영: 16:9 / 21:9 분기 ===
  else if (t.ratio === "16:9") changeRatio(1920, 1080, "16:9", btn16x9);
  else if (t.ratio === "21:9") changeRatio(2560, 1080, "21:9", btn21x9);
  else if (t.ratio === "custom" && Number.isInteger(t.width) && Number.isInteger(t.height)
           && t.width > 0 && t.height > 0) {
    applyCustomSize(Math.min(t.width, MAX_SIZE), Math.min(t.height, MAX_SIZE));
  }

  const img = new Image();
  img.onload = () => {
    state.image = img;
    render();
  };
  img.src = t.image;
}

// 3. 수정 (UI 인라인 수정)
function startInlineEdit(id, nameRow, btnGroup, currentName) {
  nameRow.innerHTML = "";
  btnGroup.innerHTML = "";

  const input = document.createElement("input");
  input.type = "text";
  input.value = currentName;
  input.style.cssText = "flex: 1; padding: 4px; font-size: 14px;";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "저장";
  saveBtn.style.cssText = "padding: 4px 8px; font-size: 12px; cursor: pointer; background: #28a745; color: white; border: none; border-radius: 4px;";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "취소";
  cancelBtn.style.cssText = "padding: 4px 8px; font-size: 12px; cursor: pointer; background: #ccc; color: #333; border: none; border-radius: 4px;";

  nameRow.appendChild(input);
  btnGroup.appendChild(saveBtn);
  btnGroup.appendChild(cancelBtn);

  saveBtn.onclick = () => {
    const newName = input.value.trim();
    if (!newName) return alert("이름을 입력해주세요.");

    const overwrite = confirm("이름을 변경합니다. 현재 화면의 상태(이미지, 글씨, 위치)도 이 템플릿에 덮어쓰시겠습니까?\n(취소를 누르면 이름만 변경됩니다.)");

    updateTemplateData(id, newName, overwrite);
  };

  cancelBtn.onclick = () => {
    renderTemplateList();
  };
}

// 4. 실제 데이터 저장 (수정 완료)
function updateTemplateData(id, newName, overwriteState) {
  let templates = getTemplates();

  let updatedTemplates = templates.map(t => {
    if (t.id === id) {
      let updatedData = { ...t, name: newName };

      if (overwriteState && state.image) {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        const maxThumbSize = 800;
        const scale = Math.min(maxThumbSize / state.image.width, maxThumbSize / state.image.height);
        tempCanvas.width = state.image.width * scale;
        tempCanvas.height = state.image.height * scale;
        tempCtx.drawImage(state.image, 0, 0, tempCanvas.width, tempCanvas.height);

        updatedData.image = tempCanvas.toDataURL("image/jpeg", 0.7);
        updatedData.text = state.text;
        updatedData.x = state.x;
        updatedData.y = state.y;
        updatedData.fontSize = state.fontSize;
        updatedData.color = state.color;
        updatedData.ratio = state.ratio;
        updatedData.width = state.width;
        updatedData.height = state.height;
      }
      return updatedData;
    }
    return t;
  });

  try {
    saveTemplates(updatedTemplates);
    renderTemplateList();
    alert("템플릿이 성공적으로 수정되었습니다.");
  } catch (error) {
    alert("수정 내용을 저장하는 중 오류가 발생했습니다.");
  }
}

// 5. 삭제 (Delete)
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

// ==========================================
// ★ 카드 5: JSON 내보내기 및 가져오기
// ==========================================

document.getElementById("exportJsonBtn").addEventListener("click", () => {
  const templates = getTemplates();
  if (templates.length === 0) {
    return alert("내보낼 템플릿이 없습니다. 먼저 템플릿을 저장해주세요.");
  }

  const jsonStr = JSON.stringify(templates, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "templates_backup.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  alert("JSON 파일 다운로드를 시작합니다. (다운로드 폴더 확인)");
});

document.getElementById("importJsonBtn").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);

        if (!Array.isArray(imported)) throw new Error("배열 형식이 아닙니다.");
        imported.forEach(t => {
          if (!t.name || t.text === undefined || !t.image) {
            throw new Error("필수 항목(name, text, image)이 누락되었습니다.");
          }
        });

        const current = getTemplates();
        const merged = [...current, ...imported];
        saveTemplates(merged);
        renderTemplateList();
        alert("JSON이 성공적으로 복원되었습니다.");
      } catch (err) {
        alert("올바르지 않은 JSON 파일입니다: " + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
});

// 초기화
render();
renderTemplateList();