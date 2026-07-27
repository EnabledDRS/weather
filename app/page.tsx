import DashboardScript from "./dashboard-script";
import { FALLBACK_STATIONS } from "./stations";

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="metric-icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="주 메뉴">
        <a className="brand" href="#" aria-label="Weather Desk 홈">
          <span className="brand-mark"><i /></span>
          <span>기상청<small>KMA</small></span>
        </a>
        <nav>
          <a className="active" href="#dashboard"><span>⌂</span> 대시보드</a>
          <a href="#observations"><span>⌁</span> 관측</a>
          <a href="#forecast"><span>☁</span> 예보</a>
          <a href="#warnings"><span>⚑</span> 특보</a>
          <a href="#radar"><span>◉</span> 레이더</a>
          <a href="#settings"><span>⚙</span> 설정</a>
        </nav>
        <p className="sidebar-foot">기상청 API 기반<br />개인 기상 관제실</p>
      </aside>

      <main>
        <header className="topbar">
          <button className="menu-button" type="button" aria-label="메뉴 열기">☰</button>
          <div>
            <p className="eyebrow">KOREA WEATHER MONITOR</p>
            <h1>WEATHER DESK</h1>
          </div>
          <div className="update-status">
            <span className="live-dot" />
            <span id="dataMode">시연 데이터</span>
            <time id="updatedAt">업데이트 중</time>
          </div>
        </header>

        <div className="dashboard" id="dashboard">
          <section className="overview-grid">
            <article className="hero-card">
              <div className="hero-copy">
                <span className="sun" aria-hidden="true">☀</span>
                <div>
                  <p className="station-label" id="heroStation">서울</p>
                  <div className="hero-temperature"><strong id="heroTemp">23.4</strong><span>°C</span></div>
                  <p className="condition">맑음 · 관측 양호</p>
                </div>
              </div>
              <div className="city-line" aria-hidden="true">
                <span /><span /><span /><span /><span /><span /><span /><span />
              </div>
            </article>

            <div className="metrics" aria-label="현재 관측값">
              <article className="metric-card">
                <Icon>♨</Icon><p>기온</p>
                <strong><span id="tempValue">23.4</span><small>°C</small></strong>
              </article>
              <article className="metric-card">
                <Icon>♧</Icon><p>습도</p>
                <strong><span id="humidityValue">58</span><small>%</small></strong>
              </article>
              <article className="metric-card">
                <Icon>≋</Icon><p>풍속</p>
                <strong><span id="windValue">2.1</span><small>m/s</small></strong>
              </article>
              <article className="metric-card">
                <Icon>♢</Icon><p>강수</p>
                <strong><span id="rainValue">0.0</span><small>mm</small></strong>
              </article>
            </div>
          </section>

          <section className="control-card" id="observations">
            <div className="control-title">
              <span className="section-number">01</span>
              <div>
                <h2>AWS 관측소 <span className="station-count" id="stationCount">{FALLBACK_STATIONS.length}개 지점</span></h2>
                <p>전국 자동기상관측지점을 이름이나 번호로 검색하세요.</p>
              </div>
            </div>
            <label className="select-wrap">
              <span>관측 지점</span>
              <select id="stationSelect" defaultValue="108">
                {FALLBACK_STATIONS.map(({ id, name }) => <option value={id} key={id}>{name} ({id})</option>)}
              </select>
            </label>
            <label className="search-wrap">
              <span>지점 검색</span>
              <input id="stationSearch" type="search" placeholder="지역명 또는 지점번호" />
            </label>
            <button className="refresh-button" id="refreshButton" type="button"><span>↻</span> 새로고침</button>
          </section>

          <section className="content-grid">
            <article className="hourly-card" id="forecast">
              <div className="section-head">
                <div><span className="section-number">02</span><h2>시간별 현황</h2></div>
                <span className="data-tag">최근 관측 추이</span>
              </div>
              <div className="hour-strip" id="hourStrip">
                {["14", "15", "16", "17", "18", "19", "20", "21"].map((hour, index) => (
                  <div className="hour-item" key={hour}>
                    <time>{hour}시</time><span>{index < 5 ? "☀" : "☾"}</span>
                    <strong>{Math.round(23.4 - index * 0.6)}°</strong>
                  </div>
                ))}
              </div>
              <div className="chart" aria-label="시간별 기온 변화">
                <div className="chart-labels"><span>26°</span><span>22°</span><span>18°</span></div>
                <svg viewBox="0 0 720 180" role="img" aria-label="기온 하락 추세선">
                  <defs>
                    <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#1677e8" stopOpacity=".2" />
                      <stop offset="1" stopColor="#1677e8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path className="chart-area" d="M20 42 L118 51 L216 56 L314 72 L412 94 L510 110 L608 119 L700 124 L700 165 L20 165 Z" />
                  <path className="chart-line" d="M20 42 L118 51 L216 56 L314 72 L412 94 L510 110 L608 119 L700 124" />
                  {[["20","42"],["118","51"],["216","56"],["314","72"],["412","94"],["510","110"],["608","119"],["700","124"]].map(([cx,cy]) => <circle key={cx} cx={cx} cy={cy} r="5" />)}
                </svg>
              </div>
            </article>

            <article className="warning-card" id="warnings">
              <div className="section-head">
                <div><span className="section-number">03</span><h2>전국 기상특보</h2></div>
                <div className="legend"><span><i className="blue" />호우</span><span><i className="green" />강풍</span><span><i className="red" />폭염</span></div>
              </div>
              <div className="warning-map">
                {/* The source is a dynamic KMA image endpoint, so native img is intentional. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="warningImage"
                  src="/api/warnings"
                  alt="전국 기상특보 발효 현황 지도"
                  decoding="async"
                />
                <div className="map-placeholder" id="mapPlaceholder">
                  <div className="radar-rings"><i /><i /><i /></div>
                  <strong>전국 특보 지도</strong>
                  <p>기상청 인증키 연결 후<br />실시간 이미지가 표시됩니다.</p>
                </div>
              </div>
              <footer>
                <p><span className="status-dot" /> 특보 발효 기준</p>
                <button id="mapRefresh" type="button">지도 새로고침 ↻</button>
              </footer>
            </article>
          </section>

          <section className="radar-section" id="radar">
            <article className="radar-card">
              <div className="section-head">
                <div><span className="section-number">04</span><h2>전국 강수 레이더</h2></div>
                <div className="radar-meta">
                  <span className="live-dot" />
                  <span id="radarUpdatedAt">최신 자료 확인 중</span>
                </div>
              </div>
              <div className="radar-image-wrap">
                {/* Dynamic KMA radar image proxy. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="radarImage"
                  src="/api/radar"
                  alt="기상청 HSR 전국 강수 레이더 영상"
                  decoding="async"
                />
                <div className="radar-placeholder" id="radarPlaceholder">
                  <div className="radar-sweep" aria-hidden="true"><i /><i /><i /></div>
                  <div>
                    <strong>전국 강수 레이더</strong>
                    <p>최신 HSR 합성영상을 불러오고 있습니다.</p>
                  </div>
                </div>
              </div>
              <footer className="radar-footer">
                <p>500m 격자 · HSR 합성 · 기상청 레이더</p>
                <button id="radarRefresh" type="button">레이더 새로고침 ↻</button>
              </footer>
            </article>
          </section>
        </div>
      </main>
      <DashboardScript />
    </div>
  );
}
