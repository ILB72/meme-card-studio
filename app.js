// ★ 1. 글자 단위 줄바꿈 처리 (띄어쓰기가 없어도 무조건 캔버스 안에 들어오게 함)
function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split('\n');
  const lines = [];

  for (let p = 0; p < paragraphs.length; p++) {
    const chars = Array.from(paragraphs[p]); // 이모지/한글을 글자 단위로 쪼갬
    let currentLine = '';

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      
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

// ★ 2. 렌더링 함수 (이모지 깨짐 방지 및 줄바꿈 적용)
function render() {
  try {
    // 배경 지우기
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 이미지 그리기
    if (state.image) {
      drawImageCover(ctx, state.image, canvas.width, canvas.height);
    }

    // 문구 그리기
    if (state.text.trim() !== "") {
      ctx.fillStyle = state.color;
      
      // ★ 이모지 깨짐 방지: 폰트를 일반 폰트와 이모지 폰트를 번갈아 쓰도록 설정
      ctx.font = `bold ${state.fontSize}px "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const maxWidth = canvas.width * 0.9; // 캔버스 폭의 90%까지만 허용
      const lines = wrapText(ctx, state.text, maxWidth);

      const px = state.x * canvas.width;
      const py = state.y * canvas.height;
      const lineHeight = state.fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      const startY = py - (totalHeight / 2) + (lineHeight / 2);

      lines.forEach((line, index) => {
        // ★ 이모지가 섞여 있을 때 안 깨지게 그리는 헬퍼 함수 호출
        drawMixedText(ctx, line, px, startY + (index * lineHeight));
      });
    }
  } catch (error) {
    console.error("렌더링 오류 발생:", error);
    errorMsg.textContent = "화면을 그리는 중 오류가 발생했습니다. 입력값을 확인해주세요.";
  }
}

// ★ 3. 이모지와 일반 텍스트를 안전하게 섞어서 그리는 함수
function drawMixedText(ctx, text, x, y) {
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
  const parts = text.split(emojiRegex);
  
  // 전체 텍스트의 너비를 계산해서 가운데 정렬 시작점 찾기
  let totalWidth = 0;
  const partWidths = parts.map(part => {
    // 일반 텍스트와 이모지 폰트 적용
    if (emojiRegex.test(part)) {
      ctx.font = `bold ${state.fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    } else {
      ctx.font = `bold ${state.fontSize}px "Noto Sans KR", "Malgun Gothic", sans-serif`;
    }
    const w = ctx.measureText(part).width;
    totalWidth += w;
    return w;
  });

  let currentX = x - (totalWidth / 2);
  
  parts.forEach((part, index) => {
    if (part === '') return;
    
    if (emojiRegex.test(part)) {
      ctx.font = `bold ${state.fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    } else {
      ctx.font = `bold ${state.fontSize}px "Noto Sans KR", "Malgun Gothic", sans-serif`;
    }
    
    ctx.textAlign = "left"; // 너비 계산을 위해 왼쪽 정렬로 변경
    ctx.fillText(part, currentX, y);
    currentX += partWidths[index];
  });
}