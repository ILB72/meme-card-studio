# HANDOFF — T05 이미지 크기·비율 설정 개선

## 1. 목표
이미지 크기·비율 설정 개선 1단계. 자유 크기 입력, 비율 유지 토글, 최소/최대 검증, state 확장.

## 2. 현재 상태 (완료)
- 너비/높이 text input, 비율 유지 체크박스 (index.html, style.css)
- state.width/height/lockRatio
- parseSize / applyCustomSize / handleSizeInput
- changeRatio의 state·입력창 동기화
- 다운로드 실패 안내
- 템플릿 저장·복원에 width/height 포함

## 3. 실행 명령
- `D:\MS\meme-card-studio\index.html`을 브라우저로 열기 (또는 VS Code Live Server)
- 변경 후 **Ctrl+F5** 강력 새로고침

## 4. 통과 검사
- 통과 8개: C01~C03, C06~C10
- 실패 0개
- 미구현 2개: C04, C05

## 5. 남은 문제
- 16:9(1920×1080), 21:9(2560×1080) 프리셋 버튼 미구현
- `loadTemplate`의 ratio 분기에 새 프리셋 추가 필요
- `presetBtns` 배열에 새 버튼 추가 필요
- `errorMsg`는 파일 업로드 오류와 공유됨
- 비율 유지는 현재 크기 비율로 계산하므로 반올림 오차 누적 가능
- 99999×99999는 브라우저가 렌더링·다운로드하지 못할 수 있음
- 캐시로 구버전이 로드될 수 있음 (Ctrl+F5)

## 6. 다음 행동
1) 16:9, 21:9 프리셋 버튼 추가 (index.html)
2) `presetBtns` 배열, 버튼 클릭 핸들러, `loadTemplate` ratio 분기 함께 수정 (app.js)
3) `active` 클래스 토글에 새 버튼 포함
4) C04, C05 실행

## 7. 건드리지 말 것
- 프리셋 버튼 3개(1:1/4:5/9:16)의 기존 동작 (C01~C03)
- 검사 10개 정의 (삭제·완화·기대값 변경 금지)
- 자유 크기 입력·비율 유지·검증 로직 (C07~C10 통과 상태 유지)

## 버전
- A 시작 소스: `2cb60ce74e2d5799584e25baf63eb1dbb2ede212`
- A 중단 커밋: `52101cabd80439c6f5eddb9ff729fa614e4f6b33`