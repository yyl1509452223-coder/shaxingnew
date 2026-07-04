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
  const cardNode = demo.querySelector(".pomodoro-card") || demo.querySelector("[data-pomodoro-card]") || demo.querySelector(".sx14-pomodoro-card");
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
    if (!timeNode) return;
    timeNode.textContent = formatTime(remainingSeconds);
    const done = totalSeconds ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
    if (ringNode) ringNode.style.setProperty("--progress", `${Math.min(360, Math.max(0, done * 360))}deg`);
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





// v7：默认主题修复。
// 目标：主页首次打开默认保持“默认轻盈毛玻璃”；同时保留点击“像素掌机”后即时切换整站主题。
// 说明：v6 曾经把 pixel 记入 localStorage，导致你的浏览器刷新后仍默认进像素主题。
// 这里会自动清理一次旧的 pixel 记忆；之后用户再次手动点击像素掌机，仍然可以正常切换。
(() => {
  const SITE_THEME_KEY = "shaxing-site:theme";
  const EXTENDED_THEME_KEY = "shaxing-site:theme-extended";
  const RESET_FLAG = "shaxing-site:default-glass-reset-v7";
  const DEFAULT_THEME = "glass";
  const PIXEL = "pixel";

  const buttons = () => Array.from(document.querySelectorAll("[data-theme-pick]"));

  const paintButtons = (theme) => {
    buttons().forEach((button) => {
      const isActive = button.dataset.themePick === theme;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const applyTheme = (theme, options = {}) => {
    document.body.dataset.theme = theme;
    try {
      if (options.persist !== false) {
        localStorage.setItem(SITE_THEME_KEY, theme);
        if (theme === PIXEL) {
          localStorage.setItem(EXTENDED_THEME_KEY, PIXEL);
        } else {
          localStorage.removeItem(EXTENDED_THEME_KEY);
        }
      }
    } catch (_) {}
    paintButtons(theme);
  };

  // 只执行一次：把 v6 留下来的 pixel 默认记忆清掉，让官网回到默认轻盈毛玻璃。
  try {
    const shouldResetOldPixel =
      !localStorage.getItem(RESET_FLAG) &&
      (localStorage.getItem(EXTENDED_THEME_KEY) === PIXEL ||
        localStorage.getItem(SITE_THEME_KEY) === PIXEL);

    if (shouldResetOldPixel) {
      localStorage.setItem(SITE_THEME_KEY, DEFAULT_THEME);
      localStorage.removeItem(EXTENDED_THEME_KEY);
      localStorage.setItem(RESET_FLAG, "1");
      window.requestAnimationFrame(() => applyTheme(DEFAULT_THEME, { persist: false }));
    }
  } catch (_) {}

  buttons().forEach((button) => {
    button.addEventListener(
      "click",
      (event) => {
        const pickedTheme = button.dataset.themePick;
        if (pickedTheme !== PIXEL) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        applyTheme(PIXEL);
      },
      true
    );
  });

  // 非首次清理场景：如果用户后来主动选择了像素掌机，则刷新后继续保持；
  // 如果没有保存任何主题，则明确使用 glass。
  try {
    const savedTheme = localStorage.getItem(SITE_THEME_KEY) || DEFAULT_THEME;
    const savedExtendedTheme = localStorage.getItem(EXTENDED_THEME_KEY);

    if (savedTheme === PIXEL || savedExtendedTheme === PIXEL) {
      window.requestAnimationFrame(() => applyTheme(PIXEL, { persist: false }));
    } else if (!localStorage.getItem(SITE_THEME_KEY)) {
      window.requestAnimationFrame(() => applyTheme(DEFAULT_THEME, { persist: false }));
    }
  } catch (_) {
    window.requestAnimationFrame(() => applyTheme(DEFAULT_THEME, { persist: false }));
  }
})();
