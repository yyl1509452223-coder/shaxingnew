// 鲨醒版本页增量脚本
// 不替换原 script.js，只补充 release.json 下载链接同步能力。

(() => {
  const versionNodes = document.querySelectorAll("[data-current-version]");
  const downloadLinks = document.querySelectorAll("[data-download-link]");

  if (!versionNodes.length && !downloadLinks.length) return;

  fetch("./release.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("release.json not found");
      return response.json();
    })
    .then((release) => {
      if (!release) return;

      versionNodes.forEach((node) => {
        node.textContent = release.version || node.textContent;
      });

      if (release.downloadUrl) {
        downloadLinks.forEach((link) => {
          link.href = release.downloadUrl;
        });
      }
    })
    .catch(() => {
      // 静态页面可直接使用 HTML 中写死的下载链接；这里静默失败，避免影响原网页交互。
    });
})();


// 首页番茄钟互动演示：独立运行，不影响原网页 script.js。
(() => {
  const demo = document.querySelector("[data-pomodoro-demo]");
  if (!demo) return;

  const timeNode = demo.querySelector("[data-pomodoro-time]");
  const statusNode = demo.querySelector("[data-pomodoro-status]");
  const ringNode = demo.querySelector("[data-pomodoro-ring]");
  const cardNode = demo.querySelector(".pomodoro-card");
  const startButton = demo.querySelector("[data-pomodoro-start]");
  const pauseButton = demo.querySelector("[data-pomodoro-pause]");
  const resetButton = demo.querySelector("[data-pomodoro-reset]");
  const minuteButtons = demo.querySelectorAll("[data-pomodoro-minutes]");

  let totalSeconds = 25 * 60;
  let remainingSeconds = totalSeconds;
  let timer = null;
  let running = false;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${rest}`;
  };

  const render = () => {
    if (!timeNode || !ringNode) return;
    timeNode.textContent = formatTime(remainingSeconds);
    const done = totalSeconds ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
    ringNode.style.setProperty("--progress", `${Math.min(360, Math.max(0, done * 360))}deg`);
  };

  const setStatus = (text, state) => {
    if (statusNode) statusNode.textContent = text;
    if (cardNode) {
      cardNode.classList.toggle("is-paused", state === "paused");
    }
  };

  const stopTimer = () => {
    window.clearInterval(timer);
    timer = null;
    running = false;
  };

  const startTimer = () => {
    if (running) return;
    running = true;
    setStatus("正在专注", "running");

    timer = window.setInterval(() => {
      remainingSeconds -= 1;

      if (remainingSeconds <= 0) {
        remainingSeconds = 0;
        stopTimer();
        setStatus("已完成", "done");
      }

      render();
    }, 1000);
  };

  const pauseTimer = () => {
    if (!running && remainingSeconds !== totalSeconds) {
      setStatus("已暂停", "paused");
      return;
    }

    stopTimer();
    setStatus("已暂停", "paused");
    render();
  };

  const resetTimer = () => {
    stopTimer();
    remainingSeconds = totalSeconds;
    setStatus("准备专注", "ready");
    render();
  };

  minuteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const minutes = Number(button.dataset.pomodoroMinutes || 25);
      totalSeconds = minutes * 60;
      remainingSeconds = totalSeconds;

      minuteButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      resetTimer();
    });
  });

  startButton?.addEventListener("click", startTimer);
  pauseButton?.addEventListener("click", pauseTimer);
  resetButton?.addEventListener("click", resetTimer);

  render();
})();





// v6：更稳的像素掌机主题切换。
// 使用捕获阶段拦截 pixel 按钮，避免原站 script.js 因不认识 pixel 而先回退到 glass。
(() => {
  const SITE_THEME_KEY = "shaxing-site:theme";
  const EXTENDED_THEME_KEY = "shaxing-site:theme-extended";
  const PIXEL = "pixel";

  const buttons = () => Array.from(document.querySelectorAll("[data-theme-pick]"));

  const paintButtons = (theme) => {
    buttons().forEach((button) => {
      const isActive = button.dataset.themePick === theme;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    try {
      localStorage.setItem(SITE_THEME_KEY, theme);
      if (theme === PIXEL) {
        localStorage.setItem(EXTENDED_THEME_KEY, PIXEL);
      } else {
        localStorage.removeItem(EXTENDED_THEME_KEY);
      }
    } catch (_) {}
    paintButtons(theme);
  };

  buttons().forEach((button) => {
    button.addEventListener(
      "click",
      (event) => {
        if (button.dataset.themePick !== PIXEL) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        applyTheme(PIXEL);
      },
      true
    );
  });

  try {
    if (localStorage.getItem(EXTENDED_THEME_KEY) === PIXEL || localStorage.getItem(SITE_THEME_KEY) === PIXEL) {
      window.requestAnimationFrame(() => applyTheme(PIXEL));
    }
  } catch (_) {}
})();
