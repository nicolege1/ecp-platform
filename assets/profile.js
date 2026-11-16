// Общий профиль сотрудника для версии на GitHub Pages: хранится в браузере,
// одинаковый на главной, в настройках и во всех трёх сервисах.
(function () {
  var KEY = "ецп-платформа:профиль";
  var DEFAULT = { фио: "Тест", должность: "Аналитик", отдел: "" };
  var script = document.currentScript;
  var settingsUrl = new URL("../settings.html", script ? script.src : location.href).href;

  function get() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && saved.фио) return { фио: saved.фио, должность: saved.должность || "", отдел: saved.отдел || "" };
    } catch (e) {}
    return Object.assign({}, DEFAULT);
  }

  function set(data) {
    var profile = get();
    ["фио", "должность", "отдел"].forEach(function (key) {
      if (key in data) profile[key] = String(data[key] || "").trim();
    });
    if (!profile.фио) return { ok: false, data: { ошибка: "ФИО не заполнено" } };
    try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch (e) {}
    fill(profile);
    return { ok: true, data: profile };
  }

  function fill(profile) {
    document.querySelectorAll(".pbar-user").forEach(function (box) {
      if (box.closest("header.top")) return; // шапку адаптации рисует сама адаптация
      var name = box.querySelector("strong");
      var sub = box.querySelector("span");
      if (name) name.textContent = profile.фио || "";
      if (sub) sub.textContent = profile.должность || profile.отдел || "";
    });
  }

  window.ECPProfile = { get: get, set: set };

  function init() {
    document.querySelectorAll('.pbar-icons [aria-label="Настройки"]').forEach(function (el) {
      if (el.tagName === "A") { el.href = settingsUrl; return; }
      el.addEventListener("click", function () { location.href = settingsUrl; });
    });
    fill(get());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
