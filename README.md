# weather

기상청 AWS 관측자료와 전국 기상특보를 모아보는 Weather Desk입니다.

- 홈페이지: https://weather-dashboard.limdaehyeon34.chatgpt.site
- 인증키: 배포 환경의 `KMA_AUTH_KEY`에서 관리
- 특보 흐름: `wrn_now_data_new.php` → 최신 `TM_FC` 선택 → `nph-wrn7` 지도 생성
- 호환성: 새 특보현황 API 실패 시 `wrn_now_data.php`로 자동 재시도

## 특보 모듈

- `lib/kma/config.ts`: API 주소와 인증 설정
- `lib/kma/http.ts`: 타임아웃이 적용된 공통 요청
- `lib/kma/warnings.ts`: 현재 유효 특보의 발표시각 선택
- `app/api/warnings/route.ts`: 인증키를 숨긴 이미지 프록시

## 레이더 모듈

- `lib/kma/radar.ts`: 최신 5분 HSR 시각 선택과 누락 자료 재시도
- `app/api/radar/route.ts`: 인증키를 숨긴 공식 레이더 이미지 프록시
- `public/js/radar.js`: 이미지 로딩·오류·수동 새로고침 제어
- 표시 API: `nph-rdr_cmp1_img` (`HSR`, `EXT`, `ECHO`, `C4`)
