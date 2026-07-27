import DashboardScript from "./dashboard-script";
import { FALLBACK_STATIONS } from "./stations";

function PanelHeader({
  number,
  title,
  status,
}: {
  number: string;
  title: string;
  status?: React.ReactNode;
}) {
  return (
    <header className="panel-head">
      <div>
        <span className="panel-number">{number}</span>
        <h2>{title}</h2>
      </div>
      {status}
    </header>
  );
}

export default function Home() {
  return (
    <main className="monitor-shell">
      <header className="monitor-topbar">
        <a className="monitor-brand" href="#dashboard" aria-label="Weather Desk 홈">
          <span className="brand-mark"><i /></span>
          <span>
            <small>KOREA WEATHER MONITOR</small>
            WEATHER DESK
          </span>
        </a>
        <div className="monitor-clock">
          <span className="live-dot" />
          <strong id="dataMode">시연 데이터</strong>
          <time id="updatedAt">업데이트 중</time>
        </div>
      </header>

      <div className="situation-board" id="dashboard">
        <article className="monitor-panel warning-panel" id="warnings">
          <PanelHeader
            number="01"
            title="전국 기상특보"
            status={<span className="status-line"><i /> 발효 기준</span>}
          />
          <div className="warning-map">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img id="warningImage" src="/api/warnings" alt="전국 기상특보 발효 현황 지도" decoding="async" />
            <div className="map-placeholder" id="mapPlaceholder">
              <div className="radar-rings"><i /><i /><i /></div>
              <strong>전국 특보 지도</strong>
              <p>기상특보 자료를 불러오고 있습니다.</p>
            </div>
          </div>
          <footer className="panel-footer">
            <span>기상청 특보 현황 · 5분 자동 갱신</span>
            <button id="mapRefresh" type="button">새로고침 ↻</button>
          </footer>
        </article>

        <article className="monitor-panel radar-panel" id="radar">
          <PanelHeader
            number="02"
            title="전국 강수 레이더"
            status={<span className="radar-meta"><i className="live-dot" /><span id="radarUpdatedAt">확인 중</span></span>}
          />
          <div className="radar-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img id="radarImage" src="/api/radar?size=400&v=hsp-hso-hb-400" alt="기상청 HSP 전국 강수 레이더 영상" decoding="async" />
            <div className="radar-placeholder" id="radarPlaceholder">
              <div className="radar-sweep" aria-hidden="true"><i /><i /><i /></div>
              <div><strong>HSR 강수 레이더</strong><p>과거 프레임을 불러오고 있습니다.</p></div>
            </div>
          </div>
          <footer className="panel-footer">
            <span>500m 격자 · 5분 간격</span>
            <button id="radarRefresh" type="button">새로고침 ↻</button>
          </footer>
        </article>

        <article className="monitor-panel satellite-panel">
          <PanelHeader
            number="03"
            title="천리안 위성"
            status={<span className="radar-meta"><i className="live-dot" /><span id="satelliteUpdatedAt">확인 중</span></span>}
          />
          <div className="satellite-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img id="satelliteImage" src="/api/wind-rain" alt="기상청 GK2A 한반도 RGB 합성 위성영상" decoding="async" />
            <div className="satellite-placeholder" id="satellitePlaceholder">
              <div className="satellite-orbit" aria-hidden="true"><i /></div>
              <div><strong>GK2A RGB 합성</strong><p>레이더와 같은 시각의 영상을 불러오고 있습니다.</p></div>
            </div>
          </div>
          <footer className="panel-footer">
            <span>GK2A · RGB 합성 · 레이더 시각 동기화</span>
            <time id="satelliteFrameTime">과거 자료 준비 중</time>
          </footer>
        </article>

        <article className="monitor-panel playback-panel">
          <PanelHeader
            number="04"
            title="영상 재생 제어"
            status={<span className="panel-badge">4H</span>}
          />
          <div className="radar-frame-info">
            <span>현재 프레임</span>
            <time id="radarFrameTime">과거 자료 준비 중</time>
          </div>
          <input id="radarTimeSlider" type="range" min="0" max="47" defaultValue="0" aria-label="레이더 관측 시각" />
          <div className="radar-playback">
            <button id="radarSlower" type="button">− 느리게</button>
            <output id="radarSpeed">0.5초/장</output>
            <button id="radarFaster" type="button">+ 빠르게</button>
            <button className="radar-play-button" id="radarPlayPause" type="button">정지</button>
          </div>
        </article>

        <article className="monitor-panel station-panel" id="observations">
          <PanelHeader
            number="05"
            title="AWS 관측소"
            status={<span className="station-count" id="stationCount">{FALLBACK_STATIONS.length}개</span>}
          />
          <div className="station-controls">
            <label>
              <span>관측 지점</span>
              <select id="stationSelect" defaultValue="108">
                {FALLBACK_STATIONS.map(({ id, name }) => (
                  <option value={id} key={id}>{name} ({id})</option>
                ))}
              </select>
            </label>
            <label>
              <span>지점 검색</span>
              <input id="stationSearch" type="search" placeholder="지역명 또는 지점번호" />
            </label>
            <button className="refresh-button" id="refreshButton" type="button">
              <span>↻</span> 관측값 새로고침
            </button>
          </div>
          <div className="observation-summary compact-summary">
            <section className="observation-summary-item station-summary">
              <span className="station-weather-icon" id="observationWeatherIcon" aria-hidden="true">☀️</span>
              <div>
                <p>관측지점</p>
                <strong id="observationStation">서울</strong>
                <small id="observationStationCode">지점 108</small>
              </div>
            </section>
            <section className="observation-summary-item condition-summary">
              <span className="summary-icon weather" aria-hidden="true">●</span>
              <div>
                <p>현재 기상</p>
                <strong id="observationCondition">강수 없음</strong>
                <small id="observationStatus">실시간 관측 정상</small>
              </div>
            </section>
            <section className="observation-summary-item">
              <span className="summary-icon" aria-hidden="true">♨</span>
              <div>
                <p>기온 / 습도</p>
                <strong className="summary-values stacked-values">
                  <span><em>기온</em><b id="tempValue">23.4</b><small>°C</small></span>
                  <span><em>습도</em><b id="humidityValue">58</b><small>%</small></span>
                </strong>
              </div>
            </section>
            <section className="observation-summary-item">
              <span className="summary-icon" aria-hidden="true">≋</span>
              <div>
                <p>바람 / 강수</p>
                <strong className="summary-values stacked-values">
                  <span><em>바람</em><b id="summaryWindValue">2.1</b><small>m/s</small></span>
                  <span><em>강수</em><b id="summaryRainValue">0.0</b><small>mm</small></span>
                </strong>
              </div>
            </section>
          </div>
          <footer className="observation-summary-footer">
            <span><i /> 관측자료 자동 갱신</span>
            <time id="observationTime">최신 자료</time>
          </footer>
        </article>

        <article className="monitor-panel hourly-panel" id="forecast">
          <PanelHeader number="06" title="시간별 현황" status={<span className="data-tag">최근 추이</span>} />
          <div className="hour-strip" id="hourStrip">
            {["14", "15", "16", "17", "18", "19"].map((hour, index) => (
              <div className="hour-item" key={hour}>
                <time>{hour}시</time>
                <span>{index < 4 ? "☀" : "☾"}</span>
                <strong>{Math.round(23.4 - index * 0.6)}°</strong>
              </div>
            ))}
          </div>
          <div className="chart" aria-label="시간별 기온 변화">
            <div className="chart-labels"><span>26°</span><span>22°</span><span>18°</span></div>
            <svg viewBox="0 0 720 180" role="img" aria-label="기온 변화 추세선">
              <defs>
                <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#26b6ff" stopOpacity=".24" />
                  <stop offset="1" stopColor="#26b6ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className="chart-area" d="M20 42 L150 51 L280 62 L420 84 L560 108 L700 124 L700 165 L20 165 Z" />
              <path className="chart-line" d="M20 42 L150 51 L280 62 L420 84 L560 108 L700 124" />
              {[["20","42"],["150","51"],["280","62"],["420","84"],["560","108"],["700","124"]].map(([cx,cy]) => (
                <circle key={cx} cx={cx} cy={cy} r="5" />
              ))}
            </svg>
          </div>
        </article>

        <article className="monitor-panel empty-panel" aria-label="비어 있는 7번 패널">
          <PanelHeader number="07" title="" />
        </article>

        <article className="monitor-panel current-panel status-panel">
          <PanelHeader number="08" title="STATUS" status={<span className="panel-badge">LIVE</span>} />
          <div className="status-overview">
            <div>
              <p className="station-label" id="heroStation">서울</p>
              <div className="hero-temperature">
                <strong id="heroTemp">23.4</strong><span>°C</span>
              </div>
              <p className="condition" id="heroCondition">맑음 · 관측 양호</p>
            </div>
            <span className="status-line"><i /> 정상 수신</span>
          </div>
          <div className="system-status">
            <p><span><i className="ok" />AWS 관측</span><strong>정상</strong></p>
            <p><span><i className="ok" />기상특보</span><strong>수신 중</strong></p>
            <p><span><i className="ok" />HSR 레이더</span><strong>자동 재생</strong></p>
            <p><span><i className="ok" />GK2A 위성영상</span><strong id="satelliteSystemStatus">동기화 중</strong></p>
          </div>
        </article>
      </div>
      <DashboardScript />
    </main>
  );
}
