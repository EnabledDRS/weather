# Weather Desk

기상청 API허브의 AWS 관측자료와 전국 기상특보 이미지를 한 화면에 모아보는 개인용 기상 대시보드입니다.

## 구성

- `app/page.tsx` — 대시보드 HTML 구조
- `public/style.css` — 반응형 화면 스타일
- `public/script.js` — 지점 선택, 검색, 새로고침, API 연결
- `app/api/weather/route.ts` — AWS 관측자료 프록시
- `app/api/warnings/route.ts` — 전국 기상특보 이미지 프록시

## 실행

```bash
npm install
npm run dev
```

`KMA_AUTH_KEY`가 없으면 시연 데이터로 실행됩니다. 키를 환경변수로 설정하면 실시간 관측자료와 전국 특보 이미지로 자동 전환됩니다.
