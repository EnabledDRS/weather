"use strict";
(() => {
  // public/js/dom.js
  var $ = (selector) => document.querySelector(selector);
  function setText(selector, value, fallback = "\u2014") {
    const element = $(selector);
    if (element) element.textContent = value ?? fallback;
  }
  function updateTime() {
    const formatted = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(/* @__PURE__ */ new Date());
    setText("#updatedAt", `\uB9C8\uC9C0\uB9C9 \uC5C5\uB370\uC774\uD2B8 ${formatted}`);
  }

  // public/js/api.js
  async function getJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} request failed`);
    return response.json();
  }
  function fetchStations() {
    return getJson("/api/stations");
  }
  function fetchWeather(station, stationName) {
    const query = new URLSearchParams({ stn: station, name: stationName });
    return getJson(`/api/weather?${query}`);
  }
  function warningImageUrl() {
    return `/api/warnings?t=${Date.now()}`;
  }
  function radarImageUrl(tm) {
    const query = new URLSearchParams();
    if (tm) query.set("tm", tm);
    else query.set("t", Date.now());
    query.set("size", "400");
    query.set("v", "hsp-hso-hb-400");
    return `/api/radar?${query}`;
  }
  function windRainImageUrl(date) {
    const query = new URLSearchParams();
    if (date) query.set("date", date);
    else query.set("t", Date.now());
    query.set("v", "rgb-cs-ko005lc");
    return `/api/wind-rain?${query}`;
  }

  // public/js/stations.js
  function stationFromOption(option) {
    return {
      id: option.value,
      name: option.text.replace(/\s+\(\d+\)$/, "")
    };
  }
  function createStationController(stationSelect2, stationSearch2) {
    let allStations = [...stationSelect2.options].map(stationFromOption);
    function render(stations, selectedId = stationSelect2.value) {
      stationSelect2.replaceChildren(
        ...stations.map(({ id, name }) => {
          const option = document.createElement("option");
          option.value = id;
          option.textContent = `${name} (${id})`;
          return option;
        })
      );
      if (stations.some(({ id }) => id === selectedId)) {
        stationSelect2.value = selectedId;
      }
    }
    async function load() {
      try {
        const data = await fetchStations();
        if (!Array.isArray(data.stations) || data.stations.length === 0) return;
        allStations = data.stations;
        render(allStations);
        $("#stationCount").textContent = `${data.count ?? allStations.length}\uAC1C \uC9C0\uC810`;
        stationSelect2.setAttribute(
          "aria-label",
          data.live ? "\uAE30\uC0C1\uCCAD \uC6B4\uC601 \uC911 AWS \uC804\uCCB4 \uC9C0\uC810" : "\uC804\uAD6D \uC8FC\uC694 AWS \uC9C0\uC810"
        );
      } catch {
        $("#stationCount").textContent = `${allStations.length}\uAC1C \uC9C0\uC810`;
      }
    }
    function filter() {
      const query = stationSearch2.value.trim().toLowerCase();
      const matches = query ? allStations.filter(({ id, name }) => `${name} ${id}`.toLowerCase().includes(query)) : allStations;
      render(matches);
      $("#stationCount").textContent = query ? `${matches.length}\uAC1C \uAC80\uC0C9\uB428` : `${allStations.length}\uAC1C \uC9C0\uC810`;
    }
    return { load, filter };
  }

  // public/js/weather.js
  function weatherPresentation(data) {
    const rain = Number(data.rain15m);
    const temperature = Number(data.temperature);
    const wind = Number(data.windSpeed);
    const humidity = Number(data.humidity);
    if (Number.isFinite(rain) && rain > 0) {
      if (Number.isFinite(temperature) && temperature <= 1) {
        return { icon: "\u{1F328}\uFE0F", condition: "\uB208 \uB610\uB294 \uC9C4\uB208\uAE68\uBE44" };
      }
      return { icon: "\u{1F327}\uFE0F", condition: "\uBE44" };
    }
    if (Number.isFinite(wind) && wind >= 9) {
      return { icon: "\u{1F32C}\uFE0F", condition: "\uAC15\uD48D" };
    }
    if (Number.isFinite(humidity) && humidity >= 85) {
      return { icon: "\u2601\uFE0F", condition: "\uD750\uB9BC" };
    }
    return { icon: "\u2600\uFE0F", condition: "\uB9D1\uC74C" };
  }
  async function loadWeather(stationSelect2, refreshButton2) {
    refreshButton2.classList.add("loading");
    refreshButton2.disabled = true;
    const station = stationSelect2.value;
    const stationName = stationSelect2.options[stationSelect2.selectedIndex].text.replace(/\s+\(\d+\)$/, "");
    try {
      const data = await fetchWeather(station, stationName);
      const { icon, condition } = weatherPresentation(data);
      const observationTime = data.observedAt && /^\d{12}$/.test(data.observedAt) ? `${data.observedAt.slice(8, 10)}:${data.observedAt.slice(10, 12)} \uAD00\uCE21` : "\uCD5C\uC2E0 \uC790\uB8CC";
      setText("#heroStation", data.stationName, stationName);
      setText("#heroTemp", data.temperature);
      setText("#observationStation", data.stationName, stationName);
      setText("#observationStationCode", `\uC9C0\uC810 ${data.station || station}`);
      setText("#observationCondition", condition);
      setText("#observationWeatherIcon", icon);
      setText("#heroCondition", `${condition} \xB7 \uAD00\uCE21 \uC591\uD638`);
      setText("#observationStatus", data.demo ? "\uC2DC\uC5F0 \uAD00\uCE21\uC790\uB8CC" : "\uC2E4\uC2DC\uAC04 \uAD00\uCE21 \uC815\uC0C1");
      setText("#observationTime", observationTime);
      setText("#tempValue", data.temperature);
      setText("#humidityValue", data.humidity);
      setText("#summaryWindValue", data.windSpeed);
      setText("#summaryRainValue", data.rainDay);
      setText("#dataMode", data.demo ? "\uC2DC\uC5F0 \uB370\uC774\uD130" : "\uC2E4\uC2DC\uAC04 \uAD00\uCE21");
      updateTime();
    } catch {
      setText("#dataMode", "\uC5F0\uACB0 \uD655\uC778 \uD544\uC694");
      updateTime();
    } finally {
      refreshButton2.classList.remove("loading");
      refreshButton2.disabled = false;
    }
  }

  // public/js/warnings.js
  function createWarningController(image, placeholder) {
    const FIVE_MINUTES_MS = 5 * 60 * 1e3;
    let refreshTimer;
    function refresh() {
      image.style.display = "none";
      placeholder.style.display = "block";
      image.src = warningImageUrl();
    }
    function scheduleNextRefresh() {
      const now = Date.now();
      const nextBoundary = Math.floor(now / FIVE_MINUTES_MS) * FIVE_MINUTES_MS + FIVE_MINUTES_MS;
      const delay = Math.max(1e3, nextBoundary - now + 1e3);
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        refresh();
        scheduleNextRefresh();
      }, delay);
    }
    image.addEventListener("load", () => {
      if (image.naturalWidth > 1 && image.naturalHeight > 1) {
        image.style.display = "block";
        placeholder.style.display = "none";
      }
    });
    image.addEventListener("error", () => {
      image.style.display = "none";
      placeholder.style.display = "block";
    });
    scheduleNextRefresh();
    return {
      refresh,
      destroy() {
        window.clearTimeout(refreshTimer);
      }
    };
  }

  // public/js/radar.js
  function createRadarController(image, placeholder, updatedAt, satelliteImage2, satellitePlaceholder2, satelliteUpdatedAt2) {
    const slider = document.querySelector("#radarTimeSlider");
    const frameTime = document.querySelector("#radarFrameTime");
    const playPause = document.querySelector("#radarPlayPause");
    const slower = document.querySelector("#radarSlower");
    const faster = document.querySelector("#radarFaster");
    const speedOutput = document.querySelector("#radarSpeed");
    const satelliteFrameTime = document.querySelector("#satelliteFrameTime");
    const satelliteSystemStatus = document.querySelector("#satelliteSystemStatus");
    const frameCount = 48;
    const frameIntervalMinutes = 5;
    const productionDelayMinutes = 15;
    let frames = [];
    let currentIndex = 0;
    let playbackTimer = null;
    let generation = 0;
    let loadedCount = 0;
    let satelliteLoadedCount = 0;
    let isPlaying = true;
    let speed = Number(localStorage.getItem("radar-speed")) || 500;
    function kstParts(date) {
      const shifted = new Date(date.getTime() + 9 * 60 * 6e4);
      return {
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth() + 1,
        day: shifted.getUTCDate(),
        hour: shifted.getUTCHours(),
        minute: shifted.getUTCMinutes()
      };
    }
    function pad(value) {
      return String(value).padStart(2, "0");
    }
    function timestamp(date) {
      const part = kstParts(date);
      return `${part.year}${pad(part.month)}${pad(part.day)}${pad(part.hour)}${pad(part.minute)}`;
    }
    function displayTime(date) {
      const part = kstParts(date);
      return `${part.year}.${pad(part.month)}.${pad(part.day)} ${pad(part.hour)}:${pad(part.minute)}`;
    }
    function latestFrameDate() {
      const date = new Date(Date.now() - productionDelayMinutes * 6e4);
      date.setUTCSeconds(0, 0);
      date.setUTCMinutes(
        Math.floor(date.getUTCMinutes() / frameIntervalMinutes) * frameIntervalMinutes
      );
      return date;
    }
    function createFrames() {
      const latest = latestFrameDate();
      return Array.from({ length: frameCount }, (_, index) => {
        const minutesAgo = (frameCount - 1 - index) * frameIntervalMinutes;
        const date = new Date(latest.getTime() - minutesAgo * 6e4);
        return {
          date,
          tm: timestamp(date),
          src: radarImageUrl(timestamp(date)),
          satelliteSrc: windRainImageUrl(timestamp(date)),
          image: null,
          satelliteImage: null,
          loaded: false,
          satelliteLoaded: false,
          failed: false,
          satelliteFailed: false
        };
      });
    }
    function updateSpeed() {
      speedOutput.textContent = `${(speed / 1e3).toFixed(1)}\uCD08/\uC7A5`;
      localStorage.setItem("radar-speed", String(speed));
    }
    function showFrame(index) {
      const frame = frames[index];
      if (!frame) return false;
      currentIndex = index;
      slider.value = String(index);
      frameTime.textContent = displayTime(frame.date);
      showSatelliteFrame(frame);
      if (!frame.loaded) {
        image.style.display = "none";
        placeholder.style.display = "grid";
        return false;
      }
      image.src = frame.image.src;
      image.style.display = "block";
      placeholder.style.display = "none";
      return true;
    }
    function showSatelliteFrame(frame) {
      satelliteFrameTime.textContent = displayTime(frame.date);
      if (frame.satelliteLoaded) {
        satelliteImage2.src = frame.satelliteImage.src;
        satelliteImage2.style.display = "block";
        satellitePlaceholder2.style.display = "none";
        satelliteSystemStatus.textContent = "\uB808\uC774\uB354 \uC2DC\uAC01 \uC77C\uCE58";
        return;
      }
      satelliteImage2.style.display = "none";
      satellitePlaceholder2.style.display = "grid";
      satelliteSystemStatus.textContent = frame.satelliteFailed ? "\uD574\uB2F9 \uC2DC\uAC01 \uC790\uB8CC \uC5C6\uC74C" : "\uBD88\uB7EC\uC624\uB294 \uC911";
    }
    function findNextLoaded(startIndex) {
      for (let offset = 1; offset <= frames.length; offset += 1) {
        const index = (startIndex + offset) % frames.length;
        if (frames[index]?.loaded) return index;
      }
      return -1;
    }
    function stopPlaybackTimer() {
      if (playbackTimer) clearInterval(playbackTimer);
      playbackTimer = null;
    }
    function startPlaybackTimer() {
      stopPlaybackTimer();
      if (!isPlaying || loadedCount < 2) return;
      playbackTimer = setInterval(() => {
        const nextIndex = findNextLoaded(currentIndex);
        if (nextIndex >= 0) showFrame(nextIndex);
      }, speed);
    }
    function setPlaying(nextPlaying) {
      isPlaying = nextPlaying;
      playPause.textContent = isPlaying ? "\uC815\uC9C0" : "\uC7AC\uC0DD";
      if (isPlaying) startPlaybackTimer();
      else stopPlaybackTimer();
    }
    function refresh() {
      const activeGeneration = ++generation;
      stopPlaybackTimer();
      loadedCount = 0;
      satelliteLoadedCount = 0;
      currentIndex = 0;
      frames = createFrames();
      slider.min = "0";
      slider.max = String(frames.length - 1);
      slider.value = "0";
      image.style.display = "none";
      placeholder.style.display = "grid";
      satelliteImage2.style.display = "none";
      satellitePlaceholder2.style.display = "grid";
      frameTime.textContent = "\uACFC\uAC70 \uC790\uB8CC \uC900\uBE44 \uC911";
      satelliteFrameTime.textContent = "\uACFC\uAC70 \uC790\uB8CC \uC900\uBE44 \uC911";
      updatedAt.textContent = `HSR \uC790\uB8CC 0/${frames.length}`;
      satelliteUpdatedAt2.textContent = `GK2A \uC790\uB8CC 0/${frames.length}`;
      satelliteSystemStatus.textContent = "\uB3D9\uAE30\uD654 \uC911";
      frames.forEach((frame, index) => {
        const preload = new Image();
        frame.image = preload;
        preload.onload = () => {
          if (activeGeneration !== generation) return;
          frame.loaded = preload.naturalWidth > 1 && preload.naturalHeight > 1;
          if (!frame.loaded) return;
          loadedCount += 1;
          updatedAt.textContent = `HSR \xB7 5\uBD84 \uAC04\uACA9 \xB7 ${loadedCount}/${frames.length}`;
          if (loadedCount === 1 || frames[currentIndex]?.tm === frame.tm) {
            showFrame(index);
          }
          if (isPlaying && loadedCount === 2) startPlaybackTimer();
        };
        preload.onerror = () => {
          if (activeGeneration !== generation) return;
          frame.failed = true;
          if (frames.every((item) => item.failed)) {
            updatedAt.textContent = "\uC790\uB8CC \uC218\uC2E0 \uB300\uAE30";
          }
        };
        preload.src = frame.src;
        const satellitePreload = new Image();
        frame.satelliteImage = satellitePreload;
        satellitePreload.onload = () => {
          if (activeGeneration !== generation) return;
          frame.satelliteLoaded = satellitePreload.naturalWidth > 1 && satellitePreload.naturalHeight > 1;
          if (!frame.satelliteLoaded) return;
          satelliteLoadedCount += 1;
          satelliteUpdatedAt2.textContent = `GK2A \xB7 \uB808\uC774\uB354 \uB3D9\uAE30 \xB7 ${satelliteLoadedCount}/${frames.length}`;
          if (frames[currentIndex]?.tm === frame.tm) showSatelliteFrame(frame);
        };
        satellitePreload.onerror = () => {
          if (activeGeneration !== generation) return;
          frame.satelliteFailed = true;
          if (frames[currentIndex]?.tm === frame.tm) showSatelliteFrame(frame);
          if (frames.every((item) => item.satelliteFailed)) {
            satelliteUpdatedAt2.textContent = "\uC790\uB8CC \uC218\uC2E0 \uB300\uAE30";
            satelliteSystemStatus.textContent = "\uC790\uB8CC \uC218\uC2E0 \uB300\uAE30";
          }
        };
        satellitePreload.src = frame.satelliteSrc;
      });
    }
    slider.addEventListener("input", () => {
      const index = Number(slider.value);
      if (!showFrame(index)) {
        frameTime.textContent = `${displayTime(frames[index].date)} \xB7 \uBD88\uB7EC\uC624\uB294 \uC911`;
      }
    });
    playPause.addEventListener("click", () => setPlaying(!isPlaying));
    faster.addEventListener("click", () => {
      speed = Math.max(100, speed - 100);
      updateSpeed();
      startPlaybackTimer();
    });
    slower.addEventListener("click", () => {
      speed = Math.min(2e3, speed + 100);
      updateSpeed();
      startPlaybackTimer();
    });
    updateSpeed();
    setPlaying(true);
    refresh();
    setInterval(() => {
      if (isPlaying) refresh();
    }, 5 * 6e4);
    return { refresh };
  }

  // public/js/app.js
  var stationSelect = $("#stationSelect");
  var stationSearch = $("#stationSearch");
  var refreshButton = $("#refreshButton");
  var warningImage = $("#warningImage");
  var mapPlaceholder = $("#mapPlaceholder");
  var radarImage = $("#radarImage");
  var radarPlaceholder = $("#radarPlaceholder");
  var radarUpdatedAt = $("#radarUpdatedAt");
  var satelliteImage = $("#satelliteImage");
  var satellitePlaceholder = $("#satellitePlaceholder");
  var satelliteUpdatedAt = $("#satelliteUpdatedAt");
  if (stationSelect && stationSearch && refreshButton && warningImage && mapPlaceholder && radarImage && radarPlaceholder && radarUpdatedAt && satelliteImage && satellitePlaceholder && satelliteUpdatedAt) {
    const stations = createStationController(stationSelect, stationSearch);
    const warnings = createWarningController(warningImage, mapPlaceholder);
    const radar = createRadarController(
      radarImage,
      radarPlaceholder,
      radarUpdatedAt,
      satelliteImage,
      satellitePlaceholder,
      satelliteUpdatedAt
    );
    const refreshWeather = () => loadWeather(stationSelect, refreshButton);
    stationSelect.addEventListener("change", refreshWeather);
    refreshButton.addEventListener("click", refreshWeather);
    stationSearch.addEventListener("input", stations.filter);
    stationSearch.addEventListener("change", async () => {
      stations.filter();
      await refreshWeather();
    });
    $("#mapRefresh")?.addEventListener("click", warnings.refresh);
    $("#radarRefresh")?.addEventListener("click", radar.refresh);
    $(".menu-button")?.addEventListener("click", () => $(".sidebar")?.classList.toggle("open"));
    updateTime();
    stations.load().finally(refreshWeather);
  }
})();
