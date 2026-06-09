const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");
const themeButtons = document.querySelectorAll("[data-theme-pick]");
const weatherIcons = document.querySelectorAll(".weather-anim");
const themeNames = {
  glass: "默认轻盈毛玻璃",
  cream: "暖白奶油系",
  mint: "薄荷清新系",
  cyber: "赛博朋克 2077",
};

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -60px 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  observer.observe(item);
});

const setTheme = (theme) => {
  const nextTheme = themeNames[theme] ? theme : "glass";
  document.body.dataset.theme = nextTheme;
  localStorage.setItem("shaxing-site:theme", nextTheme);

  themeButtons.forEach((button) => {
    const isActive = button.dataset.themePick === nextTheme;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

themeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.themePick));
});

setTheme(localStorage.getItem("shaxing-site:theme") || "glass");

const weatherTypes = ["cloud", "clear", "rain", "thunder", "fog"];
let weatherIndex = 0;

window.setInterval(() => {
  weatherIndex = (weatherIndex + 1) % weatherTypes.length;
  weatherIcons.forEach((icon) => {
    icon.classList.remove(...weatherTypes);
    icon.classList.add(weatherTypes[weatherIndex]);
  });
}, 2800);
