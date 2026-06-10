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



// v5：补充原站 script.js 没有登记的 pixel 主题。
// 原 script.js 的 themeNames 只有 glass/cream/mint/cyber，点击 pixel 会被回退到 glass。
// 这里在原脚本之后运行，重新把 body[data-theme]、按钮状态和本地记忆修正为 pixel。
(() => {
  const SITE_THEME_KEY = "shaxing-site:theme";
  const EXTENDED_THEME_KEY = "shaxing-site:theme-extended";
  const PIXEL = "pixel";

  const themeButtons = () => Array.from(document.querySelectorAll("[data-theme-pick]"));

  const paintButtons = (theme) => {
    themeButtons().forEach((button) => {
      const active = button.dataset.themePick === theme;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const applyPixelTheme = () => {
    document.body.dataset.theme = PIXEL;
    try {
      localStorage.setItem(SITE_THEME_KEY, PIXEL);
      localStorage.setItem(EXTENDED_THEME_KEY, PIXEL);
    } catch (_) {}
    paintButtons(PIXEL);
  };

  const clearExtendedTheme = () => {
    try {
      localStorage.removeItem(EXTENDED_THEME_KEY);
    } catch (_) {}
  };

  themeButtons().forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.themePick === PIXEL) {
        window.requestAnimationFrame(applyPixelTheme);
      } else {
        clearExtendedTheme();
      }
    });
  });

  try {
    if (localStorage.getItem(EXTENDED_THEME_KEY) === PIXEL) {
      window.requestAnimationFrame(applyPixelTheme);
    }
  } catch (_) {}
})();
