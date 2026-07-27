import { radarImageUrl, windRainImageUrl } from "./api.js";

export function createRadarController(
  image,
  placeholder,
  updatedAt,
  satelliteImage,
  satellitePlaceholder,
  satelliteUpdatedAt,
) {
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
    const shifted = new Date(date.getTime() + 9 * 60 * 60_000);
    return {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
      hour: shifted.getUTCHours(),
      minute: shifted.getUTCMinutes(),
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
    const date = new Date(Date.now() - productionDelayMinutes * 60_000);
    date.setUTCSeconds(0, 0);
    date.setUTCMinutes(
      Math.floor(date.getUTCMinutes() / frameIntervalMinutes) * frameIntervalMinutes,
    );
    return date;
  }

  function createFrames() {
    const latest = latestFrameDate();
    return Array.from({ length: frameCount }, (_, index) => {
      const minutesAgo = (frameCount - 1 - index) * frameIntervalMinutes;
      const date = new Date(latest.getTime() - minutesAgo * 60_000);
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
        satelliteFailed: false,
      };
    });
  }

  function updateSpeed() {
    speedOutput.textContent = `${(speed / 1000).toFixed(1)}초/장`;
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
      satelliteImage.src = frame.satelliteImage.src;
      satelliteImage.style.display = "block";
      satellitePlaceholder.style.display = "none";
      satelliteSystemStatus.textContent = "레이더 시각 일치";
      return;
    }

    satelliteImage.style.display = "none";
    satellitePlaceholder.style.display = "grid";
    satelliteSystemStatus.textContent = frame.satelliteFailed
      ? "해당 시각 자료 없음"
      : "불러오는 중";
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
    playPause.textContent = isPlaying ? "정지" : "재생";
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
    satelliteImage.style.display = "none";
    satellitePlaceholder.style.display = "grid";
    frameTime.textContent = "과거 자료 준비 중";
    satelliteFrameTime.textContent = "과거 자료 준비 중";
    updatedAt.textContent = `HSR 자료 0/${frames.length}`;
    satelliteUpdatedAt.textContent = `GK2A 자료 0/${frames.length}`;
    satelliteSystemStatus.textContent = "동기화 중";

    frames.forEach((frame, index) => {
      const preload = new Image();
      frame.image = preload;
      preload.onload = () => {
        if (activeGeneration !== generation) return;
        frame.loaded = preload.naturalWidth > 1 && preload.naturalHeight > 1;
        if (!frame.loaded) return;
        loadedCount += 1;
        updatedAt.textContent = `HSR · 5분 간격 · ${loadedCount}/${frames.length}`;
        if (loadedCount === 1 || frames[currentIndex]?.tm === frame.tm) {
          showFrame(index);
        }
        if (isPlaying && loadedCount === 2) startPlaybackTimer();
      };
      preload.onerror = () => {
        if (activeGeneration !== generation) return;
        frame.failed = true;
        if (frames.every((item) => item.failed)) {
          updatedAt.textContent = "자료 수신 대기";
        }
      };
      preload.src = frame.src;

      const satellitePreload = new Image();
      frame.satelliteImage = satellitePreload;
      satellitePreload.onload = () => {
        if (activeGeneration !== generation) return;
        frame.satelliteLoaded =
          satellitePreload.naturalWidth > 1 && satellitePreload.naturalHeight > 1;
        if (!frame.satelliteLoaded) return;
        satelliteLoadedCount += 1;
        satelliteUpdatedAt.textContent =
          `GK2A · 레이더 동기 · ${satelliteLoadedCount}/${frames.length}`;
        if (frames[currentIndex]?.tm === frame.tm) showSatelliteFrame(frame);
      };
      satellitePreload.onerror = () => {
        if (activeGeneration !== generation) return;
        frame.satelliteFailed = true;
        if (frames[currentIndex]?.tm === frame.tm) showSatelliteFrame(frame);
        if (frames.every((item) => item.satelliteFailed)) {
          satelliteUpdatedAt.textContent = "자료 수신 대기";
          satelliteSystemStatus.textContent = "자료 수신 대기";
        }
      };
      satellitePreload.src = frame.satelliteSrc;
    });
  }

  slider.addEventListener("input", () => {
    const index = Number(slider.value);
    if (!showFrame(index)) {
      frameTime.textContent = `${displayTime(frames[index].date)} · 불러오는 중`;
    }
  });

  playPause.addEventListener("click", () => setPlaying(!isPlaying));
  faster.addEventListener("click", () => {
    speed = Math.max(100, speed - 100);
    updateSpeed();
    startPlaybackTimer();
  });
  slower.addEventListener("click", () => {
    speed = Math.min(2000, speed + 100);
    updateSpeed();
    startPlaybackTimer();
  });

  updateSpeed();
  setPlaying(true);
  refresh();
  setInterval(() => {
    if (isPlaying) refresh();
  }, 5 * 60_000);

  return { refresh };
}
