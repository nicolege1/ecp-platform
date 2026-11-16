const state = {
  store: null,
  view: "overview",
  mode: "day",
  date: null,
  rangeStart: null,
  rangeEnd: null,
  selectingRange: false,
  showZeroMetrics: false,
  calendarMonth: null,
  editorKey: sessionStorage.getItem("ecp-editor-key") || ""
};

const $ = (selector) => document.querySelector(selector);
const els = {
  pageTitle: $("#pageTitle"), departmentNav: $("#departmentNav"),
  dateTrigger: $("#dateTrigger"), dateTriggerText: $("#dateTriggerText"),
  datePopover: $("#datePopover"), calendarGrid: $("#calendarGrid"), monthTitle: $("#monthTitle"),
  previousDate: $("#previousDate"), nextDate: $("#nextDate"),
  dayMode: $("#dayMode"), rangeMode: $("#rangeMode"), rangeHint: $("#rangeHint"), quickRanges: $("#quickRanges"),
  selectedDateLabel: $("#selectedDateLabel"), overviewDateLabel: $("#overviewDateLabel"),
  overviewSection: $("#overviewSection"), overviewGrid: $("#overviewGrid"),
  primarySection: $("#primarySection"), primaryMetrics: $("#primaryMetrics"),
  primaryKicker: $("#primaryKicker"), periodAnalyticsSection: $("#periodAnalyticsSection"),
  periodCharts: $("#periodCharts"),
  secondaryMetrics: $("#secondaryMetrics"), secondarySection: $("#secondarySection"), toggleZeroMetrics: $("#toggleZeroMetrics"),
  editButton: $("#editButton"), editDialog: $("#editDialog"), editForm: $("#editForm"),
  editFields: $("#editFields"), editTitle: $("#editTitle"), formMessage: $("#formMessage"),
  saveButton: $("#saveButton"), sidebar: $("#sidebar"), drawerBackdrop: $("#drawerBackdrop"),
  exportButton: $("#exportButton"), exportDialog: $("#exportDialog"), exportForm: $("#exportForm"),
  exportDepartments: $("#exportDepartments"), exportDateLabel: $("#exportDateLabel"),
  exportMessage: $("#exportMessage"), downloadExport: $("#downloadExport"),
  editorLoginButton: $("#editorLoginButton"), editorLoginDialog: $("#editorLoginDialog"),
  editorLoginForm: $("#editorLoginForm"), editorCode: $("#editorCode"), editorLoginMessage: $("#editorLoginMessage")
};

const overviewLabels = {
  "Персональные координаторы": ["ПК в смену", "Взаимодействия в ЕЦП", "Взаимодействия в сообщениях и по телефону", "Обзвон по категориям М1-М3"],
  "М4": ["Всего сотрудников в смене", "Взаимодействия с семьями в ЕЦП", "Забор генетического материала", "Обработано заявок на розыск"],
  "ОППС, социальные психологи": ["Беседы и информирование", "Кризисные консультации очно", "Психологическое анкетирование"],
  "Психотерапевтическая помощь": [],
  "Стойка регистрации": ["Всего посетителей", "Участники", "Родственники", "Дети"],
  "Контакт-центр": ["Количество обработанных входящих звонков", "Исходящие звонки", "Из них переведённых с 117"],
  "Похоронный отдел": ["Всего сотрудников в смене", "Взаимодействие в ЕЦП с семьёй", "Взаимодействие по телефону с семьёй", "Взаимодействие с ГБУ Ритуал"],
  "ЭДО": ["Сотрудников в смену", "Подготовка ответов на входящие обращения", "Регистрация ЭДО: получено", "Регистрация ЭДО: закрыто"],
  "Первичный прием": ["Всего", "Первично: всего", "Вторично: всего", "Верификация"],
  "МФЦ": ["Принято заявителей", "Принято запросов и услуг", "Отработано заявителей", "Дозвон"],
  "Мероприятия во 2 корпусе": ["Посетили: всего", "Оказано услуг: всего", "Спортивный зал", "Тренажёрный зал"],
  "Экспертная группа": ["Обратились очно: всего", "Обратились онлайн: всего", "Консультации: всего", "Составлено или отправлено заявлений: всего"],
  "Юридическая помощь": ["Количество юристов", "Обратилось за юридической помощью или консультацией", "Лично", "По записи: принято"],
  "Региональные выплаты": ["Принято пакетов с документами", "Отработано", "Документы по гибели", "Документы по ранению"]
};

const psychotherapyPrimaryMetrics = [
  { id: "__psych_individual", label: "Индивидуальные консультации", parts: [{ id: "m01", label: "Участники" }, { id: "m02", label: "Родственники" }] },
  { id: "__psych_therapist", label: "Консультации взрослого психотерапевта", parts: [{ id: "m06", label: "Участники" }, { id: "m07", label: "Родственники" }] },
  { id: "__psych_psychiatrist", label: "Консультации взрослого психиатра", parts: [{ id: "m08", label: "Участники" }, { id: "m09", label: "Родственники" }] },
  { id: "m04", label: "Консультации детского психолога" },
  { id: "m10", label: "Консультации детского психотерапевта" }
];
const psychotherapyMetricById = new Map(psychotherapyPrimaryMetrics.filter((metric) => metric.parts).map((metric) => [metric.id, metric]));

const registrationPrimaryMetrics = [
  { id: "m01", label: "Всего посетителей" },
  { id: "m05", label: "Участники" },
  { id: "m06", label: "Родственники" },
  { id: "__registration_rci", label: "РЦИ", parts: [{ id: "m09", label: "ТСР" }, { id: "m10", label: "Сопровождение" }] },
  { id: "m11", label: "Пропущено без очереди" }
];
const registrationMetricById = new Map(registrationPrimaryMetrics.filter((metric) => metric.parts).map((metric) => [metric.id, metric]));

const contactCenterPrimaryMetrics = [
  { id: "__contact_center_total", label: "Всего звонков" },
  { id: "m02", label: "Количество обработанных входящих звонков" },
  { id: "m06", label: "Исходящие звонки" },
  { id: "m03", label: "Из них переведённых с 117" }
];

const funeralPrimaryMetrics = [
  { id: "m01", label: "Всего сотрудников в смене" },
  { id: "__funeral_family_total", label: "Всего взаимодействий с семьями", parts: [{ id: "m04", label: "В ЕЦП" }, { id: "m05", label: "По телефону" }] },
  { id: "m18", label: "Получено извещений" },
  { id: "m19", label: "Отработано извещений" }
];
const funeralMetricById = new Map(funeralPrimaryMetrics.filter((metric) => metric.parts).map((metric) => [metric.id, metric]));

const edoPrimaryMetrics = [
  { id: "m01", label: "Сотрудников в смену" },
  { id: "m02", label: "Подготовлено ответов на входящие обращения" },
  { id: "m03", label: "Получено в ЭДО" },
  { id: "m04", label: "Закрыто в ЭДО" }
];

const formatDate = (date, options = { day: "numeric", month: "long", year: "numeric" }) => {
  if (!date) return "-";
  const [day, month, year] = date.split(".");
  return new Intl.DateTimeFormat("ru-RU", options).format(new Date(`${year}-${month}-${day}T12:00:00`));
};
const toDate = (value) => { const [d, m, y] = value.split(".").map(Number); return new Date(y, m - 1, d, 12); };
const toKey = (value) => `${String(value.getDate()).padStart(2, "0")}.${String(value.getMonth() + 1).padStart(2, "0")}.${value.getFullYear()}`;
function formatRange(start, end) {
  if (!start || !end) return "-";
  if (start === end) return formatDate(start);
  const first = toDate(start); const last = toDate(end);
  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) return `${first.getDate()}-${formatDate(end)}`;
  return `${formatDate(start)} - ${formatDate(end)}`;
}
function allDates() {
  const values = new Set();
  Object.values(state.store.departments).forEach((department) => department.dates.forEach((date) => values.add(date)));
  return [...values].sort((a, b) => toDate(a) - toDate(b));
}

function selectedDates() {
  if (state.mode === "day") return state.date ? [state.date] : [];
  if (!state.rangeStart || !state.rangeEnd) return [];
  const start = toDate(state.rangeStart); const end = toDate(state.rangeEnd);
  return allDates().filter((date) => toDate(date) >= start && toDate(date) <= end);
}

function selectedPeriodLabel() {
  return state.mode === "day" ? formatDate(state.date) : formatRange(state.rangeStart, state.rangeEnd);
}

function recordStatus(department, date) {
  const record = department.records[date] || {};
  const filled = department.metrics.filter((metric) => record[metric.id] !== null && record[metric.id] !== undefined).length;
  if (filled === 0) return { key: "empty", label: "Нет данных", filled, total: department.metrics.length };
  if (filled === department.metrics.length) return { key: "complete", label: "Заполнено", filled, total: department.metrics.length };
  return { key: "partial", label: "Частично", filled, total: department.metrics.length };
}

function aggregateRecord(department) {
  if (state.mode === "day") return department.records[state.date] || {};
  const dates = selectedDates(); const result = {};
  for (const metric of department.metrics) {
    const values = dates.map((date) => department.records[date]?.[metric.id]).filter((value) => value !== null && value !== undefined && Number.isFinite(Number(value))).map(Number);
    result[metric.id] = values.length ? (isWorkforceMetric(metric) ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : values.reduce((sum, value) => sum + value, 0)) : null;
  }
  return result;
}

function dateStatus(date) {
  if (state.view !== "overview") return recordStatus(state.store.departments[state.view], date).key;
  const statuses = state.store.departmentOrder.map((id) => recordStatus(state.store.departments[id], date).key);
  if (statuses.every((item) => item === "complete")) return "complete";
  if (statuses.every((item) => item === "empty")) return "empty";
  return "partial";
}

function latestAvailableDate() {
  const dates = allDates();
  if (state.view === "overview") {
    const minimumCoverage = Math.ceil(state.store.departmentOrder.length / 2);
    for (let index = dates.length - 1; index >= 0; index -= 1) {
      const date = dates[index];
      const coverage = state.store.departmentOrder.filter((id) => recordStatus(state.store.departments[id], date).key !== "empty").length;
      if (coverage >= minimumCoverage) return date;
    }
    return dates.at(-1) || null;
  }
  for (let index = dates.length - 1; index >= 0; index -= 1) if (dateStatus(dates[index]) !== "empty") return dates[index];
  return dates.at(-1) || null;
}

function metricByLabel(department, label) { return department.metrics.find((metric) => metric.label === label); }
function keyMetrics(department) {
  const found = (overviewLabels[department.name] || []).map((label) => metricByLabel(department, label)).filter(Boolean);
  if (department.name === "ОППС, социальные психологи") return [{ id: "__opps_workforce", label: "Психологи в смене" }, ...found].slice(0, 4);
  if (department.name === "Психотерапевтическая помощь") return psychotherapyPrimaryMetrics;
  if (department.name === "Стойка регистрации") return registrationPrimaryMetrics;
  if (department.name === "Контакт-центр") return contactCenterPrimaryMetrics;
  if (department.name === "Похоронный отдел") return funeralPrimaryMetrics;
  if (department.name === "ЭДО") return edoPrimaryMetrics;
  return found.length ? found : department.metrics.slice(0, 4);
}

function metricSeries(department, metric, dates) {
  if (metric.id === "__contact_center_total") return dates.map((date) => {
    const record = department.records[date] || {};
    const values = [record.m02, record.m06].filter((value) => value !== null && value !== undefined && Number.isFinite(Number(value))).map(Number);
    return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
  });
  const composite = psychotherapyMetricById.get(metric.id) || registrationMetricById.get(metric.id) || funeralMetricById.get(metric.id);
  if (composite) return dates.map((date) => {
    const record = department.records[date] || {};
    const values = composite.parts.map((part) => record[part.id]).filter((value) => value !== null && value !== undefined && Number.isFinite(Number(value))).map(Number);
    return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
  });
  if (metric.id !== "__opps_workforce") return dates.map((date) => department.records[date]?.[metric.id] ?? null);
  return dates.map((date) => {
    const record = department.records[date] || {};
    const parts = [record.m01, record.m02].filter((value) => value !== null && value !== undefined && Number.isFinite(Number(value))).map(Number);
    return parts.length ? parts.reduce((sum, value) => sum + value, 0) : null;
  });
}

function metricValue(department, record, metric) {
  if (metric.id === "__contact_center_total") {
    const values = [record.m02, record.m06].filter((value) => value !== null && value !== undefined && Number.isFinite(Number(value))).map(Number);
    return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
  }
  if (psychotherapyMetricById.has(metric.id) || registrationMetricById.has(metric.id) || funeralMetricById.has(metric.id)) {
    const values = metricSeries(department, metric, selectedDates()).filter((value) => value !== null && value !== undefined);
    if (!values.length) return null;
    return state.mode === "range" ? values.reduce((sum, value) => sum + value, 0) : values[0];
  }
  if (metric.id !== "__opps_workforce") return record[metric.id];
  const values = metricSeries(department, metric, selectedDates()).filter((value) => value !== null && value !== undefined);
  if (!values.length) return null;
  return state.mode === "range" ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : values[0];
}

function oppsWorkforceBreakdown(department, record) {
  const metrics = department.metrics.filter((metric) => ["m01", "m02"].includes(metric.id));
  const named = (metric) => ({ ...metric, label: metric.id === "m01" ? "12 часов" : "4 часа" });
  if (state.mode === "day") return metrics.map((metric) => ({ metric: named(metric), value: record[metric.id] }));
  const dates = selectedDates();
  const availableDates = dates.filter((date) => [department.records[date]?.m01, department.records[date]?.m02].some((value) => value !== null && value !== undefined && Number.isFinite(Number(value))));
  if (!availableDates.length) return metrics.map((metric) => ({ metric: named(metric), value: null }));
  const exact = metrics.map((metric) => availableDates.reduce((sum, date) => sum + Number(department.records[date]?.[metric.id] ?? 0), 0) / availableDates.length);
  const roundedTotal = Math.round(exact.reduce((sum, value) => sum + value, 0));
  const values = exact.map(Math.floor);
  let remainder = roundedTotal - values.reduce((sum, value) => sum + value, 0);
  exact.map((value, index) => ({ index, fraction: value - Math.floor(value) })).sort((a, b) => b.fraction - a.fraction).forEach(({ index }) => { if (remainder > 0) { values[index] += 1; remainder -= 1; } });
  return metrics.map((metric, index) => ({ metric: named(metric), value: values[index] }));
}

function scrollReportTop() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })));
}

function makeNav() {
  els.departmentNav.innerHTML = "";
  const overview = document.createElement("button");
  overview.type = "button";
  overview.className = `nav-item nav-overview${state.view === "overview" ? " active" : ""}`;
  overview.textContent = "Обзор центра";
  overview.addEventListener("click", () => selectView("overview"));
  els.departmentNav.append(overview);
  for (const id of state.store.departmentOrder) {
    const department = state.store.departments[id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `nav-item${id === state.view ? " active" : ""}`;
    button.textContent = department.name;
    button.addEventListener("click", () => selectView(id));
    els.departmentNav.append(button);
  }
}

function selectView(view) {
  state.view = view;
  state.showZeroMetrics = false;
  if (state.mode === "day" && (!state.date || dateStatus(state.date) === "empty")) state.date = latestAvailableDate();
  state.calendarMonth = toDate(state.mode === "day" ? state.date : state.rangeEnd);
  makeNav(); renderDateControl(); render(); closeSidebar();
  scrollReportTop();
}
function selectDate(date) {
  if (state.mode === "day") {
    state.date = date; state.showZeroMetrics = false; state.calendarMonth = toDate(date); renderDateControl(); render(); closeDatePopover(); return;
  }
  if (!state.selectingRange) {
    state.rangeStart = date; state.rangeEnd = date; state.selectingRange = true;
    state.calendarMonth = toDate(date); renderDateControl(); render(); return;
  }
  const anchor = state.rangeStart;
  state.rangeStart = toDate(date) < toDate(anchor) ? date : anchor;
  state.rangeEnd = toDate(date) < toDate(anchor) ? anchor : date;
  state.selectingRange = false; state.calendarMonth = toDate(state.rangeEnd);
  renderDateControl(); render(); closeDatePopover();
  scrollReportTop();
}

function setMode(mode) {
  if (state.mode === mode) return;
  state.mode = mode; state.selectingRange = false; state.showZeroMetrics = false;
  if (mode === "range") {
    const dates = allDates(); const endIndex = Math.max(0, dates.indexOf(state.date));
    state.rangeEnd = dates[endIndex] || dates.at(-1); state.rangeStart = dates[Math.max(0, endIndex - 6)] || state.rangeEnd;
    state.calendarMonth = toDate(state.rangeEnd);
  } else {
    state.date = state.rangeEnd || state.date; state.calendarMonth = toDate(state.date);
  }
  renderDateControl(); render(); closeDatePopover();
  scrollReportTop();
}

function renderDateControl() {
  els.dayMode.classList.toggle("active", state.mode === "day"); els.rangeMode.classList.toggle("active", state.mode === "range");
  els.dayMode.setAttribute("aria-pressed", String(state.mode === "day")); els.rangeMode.setAttribute("aria-pressed", String(state.mode === "range"));
  els.dateTriggerText.textContent = selectedPeriodLabel();
  const dates = allDates();
  const index = dates.indexOf(state.date);
  els.previousDate.hidden = state.mode === "range"; els.nextDate.hidden = state.mode === "range";
  els.previousDate.disabled = state.mode === "range" || index <= 0;
  els.nextDate.disabled = state.mode === "range" || index < 0 || index >= dates.length - 1;
  els.rangeHint.hidden = state.mode !== "range";
  els.quickRanges.hidden = state.mode !== "range";
  if (state.mode === "range") els.rangeHint.textContent = state.selectingRange ? "Выберите дату окончания периода" : "Выберите даты начала и окончания периода";
  renderCalendar();
}

function setQuickRange(range) {
  const dates = allDates();
  if (!dates.length) return;
  const currentEnd = state.rangeEnd || state.date || dates.at(-1);
  const endIndex = Math.max(0, dates.indexOf(currentEnd));
  if (range === "month") {
    const end = toDate(dates[endIndex]);
    const monthDates = dates.filter((date) => {
      const value = toDate(date);
      return value.getMonth() === end.getMonth() && value.getFullYear() === end.getFullYear();
    });
    state.rangeStart = monthDates[0] || dates[endIndex];
    state.rangeEnd = monthDates.at(-1) || dates[endIndex];
  } else {
    const length = Number(range);
    state.rangeEnd = dates[endIndex];
    state.rangeStart = dates[Math.max(0, endIndex - length + 1)];
  }
  state.selectingRange = false;
  state.showZeroMetrics = false;
  state.calendarMonth = toDate(state.rangeEnd);
  renderDateControl(); render(); closeDatePopover();
  els.dateTrigger.focus({ preventScroll: true });
  scrollReportTop();
}

function renderCalendar() {
  const month = state.calendarMonth || toDate(state.date);
  const year = month.getFullYear(); const monthIndex = month.getMonth();
  els.monthTitle.textContent = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(month);
  els.calendarGrid.innerHTML = "";
  const offset = (new Date(year, monthIndex, 1, 12).getDay() + 6) % 7;
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const allowed = new Set(allDates());
  for (let i = 0; i < offset; i += 1) { const spacer = document.createElement("span"); spacer.className = "calendar-spacer"; els.calendarGrid.append(spacer); }
  for (let day = 1; day <= days; day += 1) {
    const key = toKey(new Date(year, monthIndex, day, 12));
    const button = document.createElement("button");
    button.type = "button";
    const isDaySelected = state.mode === "day" && key === state.date;
    const isRangeStart = state.mode === "range" && key === state.rangeStart;
    const isRangeEnd = state.mode === "range" && key === state.rangeEnd;
    const inRange = state.mode === "range" && state.rangeStart && state.rangeEnd && toDate(key) > toDate(state.rangeStart) && toDate(key) < toDate(state.rangeEnd);
    button.className = `calendar-day ${allowed.has(key) ? dateStatus(key) : "unavailable"}${isDaySelected ? " selected" : ""}${inRange ? " in-range" : ""}${isRangeStart ? " range-start" : ""}${isRangeEnd ? " range-end" : ""}`;
    button.disabled = !allowed.has(key);
    button.setAttribute("aria-label", formatDate(key));
    button.innerHTML = `<span>${day}</span><i></i>`;
    if (allowed.has(key)) button.addEventListener("click", (event) => { event.stopPropagation(); selectDate(key); });
    els.calendarGrid.append(button);
  }
}

function changeDate(step) { const dates = allDates(); const next = dates[dates.indexOf(state.date) + step]; if (next) selectDate(next); }
function changeMonth(step) { state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + step, 1, 12); renderCalendar(); }
function toggleDatePopover() { const open = !els.datePopover.hidden; els.datePopover.hidden = open; els.dateTrigger.setAttribute("aria-expanded", String(!open)); }
function closeDatePopover() { els.datePopover.hidden = true; els.dateTrigger.setAttribute("aria-expanded", "false"); }

function displayValue(value) { return value === null || value === undefined ? "-" : new Intl.NumberFormat("ru-RU").format(value); }
function isWorkforceMetric(metric) {
  return /^(ПК в смену|Всего сотрудников в смене|Сотрудников в смену|Психологи в смене|Психологов в смене: 12 часов|Количество юристов|Смена)$/i.test(metric.label);
}
function peopleIcon() {
  return `<span class="workforce-icon" aria-hidden="true"><img src="assets/dashboard-icons/people-white.png" alt="" /></span>`;
}
function metricVisual(label) {
  const value = label.toLowerCase();
  if (/^всего звонков$/.test(value)) return { file: "headset-purple.png", tone: "tone-darkgreen", recolor: true };
  if (/^количество обработанных входящих звонков$/.test(value)) return { file: "incoming-call-custom.png", tone: "tone-orange", recolor: true };
  if (/^исходящие звонки$/.test(value)) return { file: "outgoing-call-custom.png", tone: "tone-slate", recolor: true };
  if (/^из них перевед[её]нных с 117$/.test(value)) return { file: "transferred-call-custom.png", tone: "tone-forest", recolor: true };
  if (/^всего взаимодействий с семьями$/.test(value)) return { file: "family-child-blue-v1.png", tone: "tone-blue", recolor: true };
  if (/^получено извещений$/.test(value)) return { file: "envelope-orange-v1.png", tone: "tone-rust", recolor: true };
  if (/^отработано извещений$/.test(value)) return { file: "document-green.png", tone: "tone-forest", recolor: true };
  if (/^подготовлено ответов на входящие обращения$/.test(value)) return { file: "chat-orange.png", tone: "tone-orange" };
  if (/^получено в эдо$/.test(value)) return { file: "envelope-orange-v1.png", tone: "tone-rust", recolor: true };
  if (/^закрыто в эдо$/.test(value)) return { file: "document-green.png", tone: "tone-forest", recolor: true };
  if (/^всего посетителей$/.test(value)) return { file: "people-green.png", tone: "tone-darkgreen", recolor: true };
  if (/^участники$/.test(value)) return { file: "user-plus-purple.png", tone: "tone-blue", recolor: true };
  if (/^родственники$/.test(value)) return { file: "family-child-blue-v1.png", tone: "tone-olive", recolor: true };
  if (/^рци$/.test(value)) return { file: "building-green.png", tone: "tone-forest", recolor: true };
  if (/^пропущено без очереди/.test(value)) return { file: "ticket-orange.png", tone: "tone-rust", recolor: true };
  if (/^индивидуальные консультации$/.test(value)) return { file: "user-plus-purple.png", tone: "tone-purple" };
  if (/взрослого психотерапевта/.test(value)) return { file: "chat-orange.png", tone: "tone-orange" };
  if (/взрослого психиатра/.test(value)) return { file: "people-green.png", tone: "tone-green" };
  if (/детского психолога/.test(value)) return { file: "family-child-blue-v1.png", tone: "tone-blue", recolor: true };
  if (/детского психотерапевта/.test(value)) return { file: "family-child-blue-v1.png", tone: "tone-purple", recolor: true };
  if (/кризисн.*консультац/.test(value)) return { file: "people-purple.png", tone: "tone-purple" };
  if (/анкетирован/.test(value)) return { file: "document-green.png", tone: "tone-green" };
  if (/обзвон.*м3/.test(value)) return { file: "headset-purple.png", tone: "tone-purple" };
  if (/сопровожд.*посетител/.test(value)) return { file: "people-green.png", tone: "tone-green" };
  if (/групповые занятия.*посетител/.test(value)) return { file: "people-orange.png", tone: "tone-orange" };
  if (/индивидуальн.*консультац.*сотрудник/.test(value)) return { file: "user-plus-purple.png", tone: "tone-purple" };
  if (/групповые занятия.*сотрудник/.test(value)) return { file: "people-purple.png", tone: "tone-purple" };
  if (/^взаимодействия? в ецп$/.test(value)) return { file: "building-olive.png", tone: "tone-olive" };
  if (/тренаж[её]рный зал/.test(value)) return { file: "gym-dumbbell-blue.png", tone: "tone-blue" };
  if (/спортивный зал/.test(value)) return { file: "sports-ball-orange.png", tone: "tone-orange" };
  if (/бильярд/.test(value)) return { file: "sports-ball-orange.png", tone: "tone-orange" };
  if (/настольный футбол|настольный хоккей|настольный теннис/.test(value)) return { file: "table-green.png", tone: "tone-green" };
  if (/музыкальн/.test(value)) return { file: "headset-purple.png", tone: "tone-purple" };
  if (/оказано услуг/.test(value)) return { file: "document-green.png", tone: "tone-green" };
  if (/посетили/.test(value)) return { file: "people-green.png", tone: "tone-green" };
  if (/массаж/.test(value)) return { file: "user-plus-purple.png", tone: "tone-purple" };
  if (/парковк|пропуск/.test(value)) return { file: "envelope-orange-v1.png", tone: "tone-orange" };
  if (/генетичес|анализ|материал/.test(value)) {
    return { file: "genetic-analysis-teal.png", tone: "tone-teal" };
  }
  if (/розыск|поиск/.test(value)) return { file: "search-purple-v1.png", tone: "tone-purple" };
  if (/сообщ/.test(value) && /телефон|звон/.test(value)) return { file: "phone-chat-orange-v2.png", tone: "tone-orange" };
  if (/обзвон (спецкатегорий|по категориям м1-м3)/.test(value)) return { file: "phone-waves-circle-purple.png", tone: "tone-purple" };
  if (/звон|телефон|дозвон/.test(value)) return { file: "phone-chat-orange-v2.png", tone: "tone-orange" };
  if (/сообщ|обращен|обратн|бесед|консультац/.test(value)) return { file: "chat-orange.png", tone: "tone-orange" };
  if (/ецп|центр|департамент|мфц|стойк/.test(value)) return { file: "building-olive.png", tone: "tone-olive" };
  if (/мероприят|зал|клуб|афиша/.test(value)) return { file: "calendar-green.png", tone: "tone-green" };
  if (/почт|письм/.test(value)) return { file: "envelope-orange-v1.png", tone: "tone-orange" };
  if (/пакет|вещ/.test(value)) return { file: "bag-orange-v1.png", tone: "tone-orange" };
  if (/таблиц/.test(value)) return { file: "table-green.png", tone: "tone-green" };
  if (/первич|вторич|участник|семь|посетител|координатор|психолог|юрист|лично/.test(value)) return { file: "people-purple.png", tone: "tone-purple" };
  return { file: "document-green.png", tone: "tone-green" };
}
function metricIcon(visual) {
  if (visual.recolor || visual.tone === "tone-green" || visual.tone === "tone-olive") {
    return `<span class="metric-icon recolor-accent" style="--metric-icon-image: url('assets/dashboard-icons/${visual.file}')" aria-hidden="true"></span>`;
  }
  return `<span class="metric-icon" aria-hidden="true"><img src="assets/dashboard-icons/${visual.file}" alt="" /></span>`;
}
function metricCard(metric, value, index, hasWorkforce, extras = []) {
  const workforce = isWorkforceMetric(metric);
  const visual = metricVisual(metric.label);
  const card = document.createElement("article"); card.className = `metric-card ${workforce ? "workforce-card" : visual.tone}${extras.length ? " has-breakdown" : ""}`;
  const label = document.createElement("p"); label.className = "metric-label"; label.textContent = metric.label;
  const number = document.createElement("p"); number.className = `metric-value${value === null || value === undefined ? " empty-value" : ""}`; number.textContent = displayValue(value);
  const context = document.createElement("p"); context.className = "metric-context"; context.textContent = workforce ? "Среднее за день" : "Итого за период";
  if (workforce) {
    card.insertAdjacentHTML("beforeend", peopleIcon());
    card.append(label); if (state.mode === "range") card.append(context); card.append(number);
  } else {
    const headline = document.createElement("div"); headline.className = "metric-card-headline";
    headline.insertAdjacentHTML("beforeend", metricIcon(visual)); headline.append(label);
    card.append(headline); if (state.mode === "range") card.append(context); card.append(number);
  }
  if (workforce && extras.length) {
    const breakdown = document.createElement("div"); breakdown.className = "workforce-breakdown";
    extras.forEach(({ metric: extraMetric, value: extraValue }) => {
      const row = document.createElement("div");
      row.innerHTML = `<span>${extraMetric.label.replace(/^В графике /, "График ")}</span><strong>${displayValue(extraValue)}</strong>`;
      breakdown.append(row);
    });
    card.append(breakdown);
  } else if (extras.length) {
    const breakdown = document.createElement("div"); breakdown.className = "metric-breakdown";
    extras.forEach(({ metric: extraMetric, value: extraValue }) => {
      const item = document.createElement("div");
      item.innerHTML = `<span>${extraMetric.label}</span><strong>${displayValue(extraValue)}</strong>`;
      breakdown.append(item);
    });
    card.append(breakdown);
  }
  return card;
}

function renderOverview() {
  els.pageTitle.textContent = "Операционные показатели";
  els.overviewSection.hidden = false; els.primarySection.hidden = true; els.periodAnalyticsSection.hidden = true; els.secondarySection.hidden = true; els.editButton.hidden = true;
  els.overviewDateLabel.hidden = true; els.overviewGrid.innerHTML = "";
  for (const id of state.store.departmentOrder) {
    const department = state.store.departments[id];
    const record = aggregateRecord(department);
    const card = document.createElement("button"); card.type = "button"; card.className = "department-card"; card.addEventListener("click", () => selectView(id));
    const head = document.createElement("div"); head.className = "department-card-head"; head.innerHTML = `<strong>${department.name}</strong><span class="department-card-arrow" aria-hidden="true">›</span>`;
    const metrics = document.createElement("div"); metrics.className = "overview-metrics";
    const overviewMetrics = department.name === "Стойка регистрации"
      ? ["m01", "m05", "m06"].map((metricId) => department.metrics.find((metric) => metric.id === metricId)).filter(Boolean)
      : keyMetrics(department).slice(0, 3);
    for (const metric of overviewMetrics) { const item = document.createElement("div"); item.innerHTML = `<span>${metric.label}</span><strong>${displayValue(metricValue(department, record, metric))}</strong>`; metrics.append(item); }
    card.append(head, metrics); els.overviewGrid.append(card);
  }
}

function renderPeriodAnalytics(department, record) {
  const dates = selectedDates();
  els.periodAnalyticsSection.hidden = state.mode !== "range" || dates.length < 2;
  if (els.periodAnalyticsSection.hidden) return;
  const compactRange = dates.length > 7;
  const denseRange = dates.length > 14;
  const monthRange = dates.length > 21;
  els.periodCharts.innerHTML = "";
  const chartColorByTone = {
    "tone-green": "#6b7a34",
    "tone-olive": "#6b7a34",
    "tone-orange": "#ff5a00",
    "tone-purple": "#631dbd",
    "tone-teal": "#029a9c",
    "tone-blue": "#204077",
    "tone-darkgreen": "#455120",
    "tone-forest": "#2f6a4f",
    "tone-slate": "#5d708d",
    "tone-rust": "#e36b2c"
  };
  const chartMetrics = department.name === "Стойка регистрации"
    ? [registrationPrimaryMetrics[0], registrationPrimaryMetrics[1], registrationPrimaryMetrics[2], registrationPrimaryMetrics[4]]
    : keyMetrics(department);
  for (const metric of chartMetrics) {
    const values = metricSeries(department, metric, dates);
    const numeric = values.filter((value) => value !== null && value !== undefined).map(Number);
    const maximum = Math.max(0, ...numeric);
    const workforce = isWorkforceMetric(metric);
    const visual = metricVisual(metric.label);
    const chartColor = workforce ? "#455120" : chartColorByTone[visual.tone] || "#6b7a34";
    const card = document.createElement("article"); card.className = "analytics-card"; card.style.setProperty("--chart-color", chartColor);
    const head = document.createElement("div"); head.className = "analytics-card-head";
    const title = document.createElement("h3"); title.textContent = metric.label;
    const total = document.createElement("strong"); total.textContent = `${workforce ? "Среднее" : "Итого"} ${displayValue(metricValue(department, record, metric))}`;
    head.append(title, total);
    const chart = document.createElement("div"); chart.className = "bar-chart"; chart.setAttribute("aria-label", `Динамика: ${metric.label}`);
    const plot = document.createElement("div"); plot.className = `chart-plot${compactRange ? " compact" : ""}${denseRange ? " dense" : ""}${monthRange ? " month" : ""}`; plot.style.setProperty("--point-count", values.length);
    values.forEach((value, index) => {
      const point = document.createElement("div"); point.className = "chart-point";
      const valueLabel = document.createElement("span"); valueLabel.className = "chart-point-value"; valueLabel.textContent = displayValue(value);
      const track = document.createElement("span"); track.className = "chart-bar-track";
      const bar = document.createElement("span"); bar.className = `chart-bar${value === null || value === undefined ? " missing" : ""}`;
      const height = value === null || value === undefined ? 0 : maximum > 0 ? Math.max(5, Number(value) / maximum * 100) : 5;
      const tooltip = `${formatDate(dates[index])}: ${displayValue(value)}`;
      bar.style.setProperty("--bar-height", `${height}%`); bar.dataset.tooltip = tooltip; bar.title = tooltip;
      bar.setAttribute("aria-hidden", "true"); track.append(bar);
      const dateLabel = document.createElement("time"); dateLabel.className = "chart-point-date"; dateLabel.dateTime = toDate(dates[index]).toISOString().slice(0, 10);
      dateLabel.textContent = new Intl.DateTimeFormat("ru-RU", denseRange ? { day: "2-digit" } : { day: "2-digit", month: "2-digit" }).format(toDate(dates[index]));
      point.tabIndex = 0; point.setAttribute("role", "img"); point.setAttribute("aria-label", tooltip);
      point.append(valueLabel, track, dateLabel); plot.append(point);
    });
    chart.append(plot); card.append(head, chart); els.periodCharts.append(card);
  }
}

function prefixOf(label) { return label.includes(":") ? label.split(":")[0].trim() : null; }
const workforceDetailPattern = /^(пк в смену|всего сотрудников|сотрудников в смену|сотрудники,|в графике|количество юристов|психологов? в смене|старшие смены|первая смена|вторая смена|смена$)/i;
function personalCoordinatorGroups(department) {
  const byId = new Map(department.metrics.map((metric) => [metric.id, metric]));
  const group = (title, ids) => ({ title, metrics: ids.map((id) => byId.get(id)).filter(Boolean) });
  return [
    group("Взаимодействия в ЕЦП", ["m02", "m03", "m04"]),
    group("Взаимодействия в сообщениях и по телефону", ["m05", "m06", "m07"]),
    group("Обзвон по категориям М1-М3", ["m08", "m09", "m10", "m11"]),
    group("Обращения и коммуникации", ["m13", "m14", "m15", "m16", "m19", "m20", "m44", "m46"]),
    group("Межведомственная работа и заявки", ["m12", "m21", "m22", "m24", "m25", "m26", "m27", "m28", "m29", "m30", "m37", "m38", "m47"]),
    group("Документы и реестры", ["m17", "m18", "m23", "m40", "m41", "m42", "m43", "m45"]),
    group("Подписки", ["m32", "m33", "m34", "m35"]),
    group("Дополнительные услуги", ["m31", "m36", "m39"])
  ].filter((item) => item.metrics.length);
}
function m4Groups(department) {
  const byId = new Map(department.metrics.map((metric) => [metric.id, metric]));
  const group = (title, ids) => ({ title, metrics: ids.map((id) => byId.get(id)).filter(Boolean) });
  return [
    group("Приём и сопровождение", ["m04", "m05", "m07", "m10", "m12", "m15", "m16", "m17"]),
    group("Работа с генетическим материалом", ["m06", "m08", "m09", "m14"]),
    group("Документы и взаимодействие с подразделениями", ["m11", "m13"])
  ].filter((item) => item.metrics.length);
}
function oppsGroups(department) {
  const byId = new Map(department.metrics.map((metric) => [metric.id, metric]));
  const group = (title, ids) => ({ title, metrics: ids.map((id) => byId.get(id)).filter(Boolean) });
  return [
    group("Работа с посетителями", ["m03", "m04", "m05", "m06", "m08", "m09", "m11"]),
    group("Поддержка сотрудников", ["m07", "m10"])
  ].filter((item) => item.metrics.length);
}
function psychotherapyGroups(department) {
  const byId = new Map(department.metrics.map((metric) => [metric.id, metric]));
  const group = (title, ids) => ({ title, metrics: ids.map((id) => byId.get(id)).filter(Boolean) });
  return [
    group("Индивидуальные консультации", ["m01", "m02"]),
    group("Дети", ["m04", "m10"]),
    group("Взрослые специалисты", ["m06", "m07", "m08", "m09"]),
    group("Диагностика и анкетирование", ["m03", "m11", "m12"]),
    group("Групповая работа", ["m05"])
  ].filter((item) => item.metrics.length);
}
function registrationGroups(department) {
  const byId = new Map(department.metrics.map((metric) => [metric.id, metric]));
  const group = (title, ids) => ({ title, metrics: ids.map((id) => byId.get(id)).filter(Boolean) });
  return [
    group("Основные показатели", ["m01", "m11"]),
    group("Посетители", ["m05", "m06", "m07", "m08"]),
    group("Посетители по полу и возрасту", ["m02", "m03", "m04"]),
    group("РЦИ", ["m09", "m10"]),
    group("Место призыва / регион ухода", ["m12", "m13", "m14", "m15", "m16", "m17"])
  ].filter((item) => item.metrics.length);
}
function contactCenterGroups(department) {
  const groups = new Map();
  groups.set("Основные показатели", [contactCenterPrimaryMetrics[0]]);
  for (const metric of department.metrics) {
    const title = metric.group || "Другие показатели";
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push(metric);
  }
  return [...groups].map(([title, metrics]) => ({ title, metrics })).filter((group) => group.metrics.length);
}

function funeralGroups(department) {
  const byId = new Map(department.metrics.map((metric) => [metric.id, metric]));
  const group = (title, ids) => ({ title, metrics: ids.map((id) => byId.get(id)).filter(Boolean) });
  const familyTotal = funeralPrimaryMetrics[1];
  const m1Metrics = ["m07", "m08", "m09", "m10", "m11"].map((id) => byId.get(id)).filter(Boolean).map((metric) => (
    ["m08", "m09", "m10"].includes(metric.id) ? { ...metric, label: metric.label.replace(/^М1:\s*/i, "") } : metric
  ));
  return [
    { title: "Работа с семьями", metrics: [familyTotal, byId.get("m04"), byId.get("m05")].filter(Boolean) },
    { title: "М1 и спецкатегории", metrics: m1Metrics },
    group("Извещения и соответствие 1185", ["m18", "m19", "m20", "m21"]),
    group("Взаимодействие с организациями", ["m06", "m12", "m13", "m15"]),
    group("Кейсы и направления", ["m14", "m16", "m17"])
  ].filter((item) => item.metrics.length);
}

function edoGroups(department) {
  const byId = new Map(department.metrics.map((metric) => [metric.id, metric]));
  const metric = (id, label = null) => {
    const source = byId.get(id);
    return source && label ? { ...source, label } : source;
  };
  const group = (title, metrics) => ({ title, metrics: metrics.filter(Boolean) });
  return [
    group("Регистрация ЭДО", [metric("m03"), metric("m04"), metric("m05", "Отработка обращений 01-01"), metric("m06", "Отработка обращений 01-02")]),
    group("Мос.ру", [metric("m07"), metric("m08"), metric("m09")]),
    group("ДСП", [metric("m10"), metric("m11")]),
    group("Чек-листы", [metric("m13"), metric("m14")]),
    group("Исходящие документы и ответы", [metric("m02"), metric("m12")]),
    group("Реестры", [metric("m15"), metric("m16")])
  ].filter((item) => item.metrics.length);
}

function contactCenterLabel(label) {
  return label
    .replace(/^Центр Береговой\.\s*/i, "")
    .replace(/^Центр Береговой\s*[-:]\s*/i, "")
    .trim();
}
function buildDetailGroups(department) {
  if (department.name === "Контакт-центр") return contactCenterGroups(department);
  let customGroups = null;
  if (department.name === "Персональные координаторы") customGroups = personalCoordinatorGroups(department);
  if (department.name === "М4") customGroups = m4Groups(department);
  if (department.name === "ОППС, социальные психологи") customGroups = oppsGroups(department);
  if (department.name === "Психотерапевтическая помощь") customGroups = psychotherapyGroups(department);
  if (department.name === "Стойка регистрации") customGroups = registrationGroups(department);
  if (department.name === "Похоронный отдел") customGroups = funeralGroups(department);
  if (department.name === "ЭДО") customGroups = edoGroups(department);
  if (customGroups) {
    const groupedIds = new Set(customGroups.flatMap((group) => group.metrics.map((metric) => metric.id)));
    const ungrouped = department.metrics.filter((metric) => !groupedIds.has(metric.id) && !workforceDetailPattern.test(metric.label));
    if (ungrouped.length) customGroups.push({ title: "Другие показатели", metrics: ungrouped });
    return customGroups;
  }
  const remaining = department.metrics;
  const workforce = remaining.filter((metric) => workforceDetailPattern.test(metric.label));
  const rest = remaining.filter((metric) => !workforce.includes(metric));
  const prefixes = new Map();
  for (const metric of rest) { const prefix = prefixOf(metric.label); if (!prefix) continue; if (!prefixes.has(prefix)) prefixes.set(prefix, []); prefixes.get(prefix).push(metric); }
  const groups = []; const grouped = new Set();
  for (const [prefix, metrics] of prefixes) if (metrics.length >= 2) { groups.push({ title: prefix, metrics }); metrics.forEach((metric) => grouped.add(metric.id)); }
  const other = rest.filter((metric) => !grouped.has(metric.id));
  if (other.length) groups.push({ title: "Другие показатели", metrics: other });
  return groups;
}

function renderDonutGroup(group, record) {
  const colors = ["#204077", "#6b7a34", "#e36b2c", "#6f7f91"];
  const items = group.metrics.map((metric, index) => ({ metric, value: Number(record[metric.id] || 0), color: colors[index % colors.length] }));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const exactPercents = items.map((item) => total ? item.value / total * 100 : 0);
  const percents = exactPercents.map(Math.floor);
  let percentRemainder = total ? 100 - percents.reduce((sum, value) => sum + value, 0) : 0;
  exactPercents.map((value, index) => ({ index, fraction: value - Math.floor(value) })).sort((a, b) => b.fraction - a.fraction).forEach(({ index }) => {
    if (percentRemainder > 0) { percents[index] += 1; percentRemainder -= 1; }
  });
  let cursor = 0;
  const stops = items.map((item) => {
    const start = cursor;
    cursor += total ? item.value / total * 100 : 0;
    return `${item.color} ${start}% ${cursor}%`;
  });
  const body = document.createElement("div"); body.className = "donut-layout";
  const chart = document.createElement("div"); chart.className = "donut-chart";
  chart.style.background = total ? `conic-gradient(${stops.join(", ")})` : "#e8eae5";
  chart.setAttribute("role", "img"); chart.setAttribute("aria-label", `${group.title}: ${displayValue(total)}`);
  const center = document.createElement("div"); center.className = "donut-center"; center.innerHTML = `<span>Всего</span><strong>${displayValue(total)}</strong>`;
  chart.append(center);
  const legend = document.createElement("div"); legend.className = "donut-legend";
  items.forEach((item, index) => {
    const row = document.createElement("div"); row.className = "donut-legend-row";
    const percent = percents[index];
    row.innerHTML = `<i style="--legend-color:${item.color}"></i><span>${item.metric.label}</span><strong>${displayValue(item.value)} <small>${percent}%</small></strong>`;
    legend.append(row);
  });
  body.append(chart, legend);
  return body;
}

function renderDetailGroups(department, record, alwaysVisibleIds = new Set()) {
  els.secondaryMetrics.innerHTML = "";
  els.secondaryMetrics.classList.toggle("contact-center-sections", department.name === "Контакт-центр");
  const allGroups = buildDetailGroups(department);
  const zeroCount = department.name === "Контакт-центр"
    ? 0
    : allGroups.flatMap((group) => group.metrics).filter((metric) => record[metric.id] === 0).length;
  const groups = allGroups.map((group) => ({
    ...group,
    metrics: group.metrics.filter((metric) => {
      if (department.name === "Контакт-центр") {
        return group.title === "Основные показатели" || (record[metric.id] !== null && record[metric.id] !== undefined);
      }
      if (state.showZeroMetrics) return true;
      if (alwaysVisibleIds.has(metric.id)) return true;
      if (record[metric.id] !== 0) return true;
      const prefix = prefixOf(metric.label);
      if (!prefix) return false;
      const contextualZeroPrefixes = new Set([
        "Обзвон по категориям М1-М3", "Контакт-центр", "Сложные кейсы Контакт-центра",
        "ЭДО", "Карты ЕЦП и соцсети", "Департамент", "Заявки МО", "Подписки"
      ]);
      if (!contextualZeroPrefixes.has(prefix)) return false;
      return group.metrics.some((related) => prefixOf(related.label) === prefix && record[related.id] !== 0 && record[related.id] !== null && record[related.id] !== undefined);
    })
  })).filter((group) => group.metrics.length);
  if (!groups.length && allGroups.length) {
    const empty = document.createElement("p");
    empty.className = "detail-empty";
    empty.textContent = "Все дополнительные показатели равны нулю.";
    els.secondaryMetrics.append(empty);
  }
  for (const group of groups) {
    const section = document.createElement("section"); section.className = "detail-group";
    if (department.name === "Контакт-центр") section.classList.add("contact-center-detail-group");
    const title = document.createElement("h3"); title.textContent = group.title;
    const registrationDonut = department.name === "Стойка регистрации" && ["Посетители", "Посетители по полу и возрасту"].includes(group.title);
    const coordinatorDonut = department.name === "Персональные координаторы" && ["Взаимодействия в ЕЦП", "Взаимодействия в сообщениях и по телефону"].includes(group.title);
    const donut = registrationDonut || coordinatorDonut;
    if (donut) {
      section.classList.add("detail-group-donut");
      const donutGroup = coordinatorDonut ? {
        ...group,
        metrics: group.metrics.slice(1).map((metric) => {
          const prefix = `${group.title}:`;
          const label = metric.label.startsWith(prefix) ? metric.label.slice(prefix.length).trim() : metric.label;
          return { ...metric, label: label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : metric.label };
        })
      } : group;
      section.append(title, renderDonutGroup(donutGroup, record));
      els.secondaryMetrics.append(section);
      continue;
    }
    const list = document.createElement("div"); list.className = "detail-list";
    for (const metric of group.metrics) {
      const value = record[metric.id]; const row = document.createElement("div");
      row.className = `detail-row${value === 0 ? " zero" : ""}${value === null || value === undefined ? " missing" : ""}`;
      const prefix = `${group.title}:`;
      const sourceLabel = metric.label.startsWith(prefix) ? metric.label.slice(prefix.length).trim() : metric.label;
      const rawLabel = department.name === "Контакт-центр" ? contactCenterLabel(sourceLabel) : sourceLabel;
      const shortLabel = department.name === "Персональные координаторы" && group.title === "Обзвон по категориям М1-М3" && metric.id === "m08"
        ? "Всего"
        : rawLabel ? `${rawLabel.charAt(0).toUpperCase()}${rawLabel.slice(1)}` : metric.label;
      row.innerHTML = `<span>${shortLabel}</span><strong>${displayValue(value)}</strong>`;
      list.append(row);
    }
    section.append(title, list); els.secondaryMetrics.append(section);
  }
  els.secondarySection.hidden = allGroups.length === 0;
  els.toggleZeroMetrics.hidden = zeroCount === 0;
  els.toggleZeroMetrics.textContent = state.showZeroMetrics ? "Скрыть нулевые значения" : `Показать нулевые значения (${zeroCount})`;
  els.toggleZeroMetrics.setAttribute("aria-pressed", String(state.showZeroMetrics));
}

function renderDepartment() {
  const department = state.store.departments[state.view]; const record = aggregateRecord(department);
  if (department.name === "Контакт-центр") record.__contact_center_total = metricValue(department, record, contactCenterPrimaryMetrics[0]);
  if (department.name === "Похоронный отдел") record.__funeral_family_total = metricValue(department, record, funeralPrimaryMetrics[1]);
  const keys = keyMetrics(department).map((metric) => (
    department.name !== "Персональные координаторы" ? metric
      : metric.id === "m08" ? { ...metric, label: "Обзвон спецкатегорий" }
        : metric
  ));
  const workforceExtras = department.name === "М4"
    ? department.metrics.filter((metric) => ["В графике 5/2", "В графике 2/2"].includes(metric.label)).map((metric) => ({ metric, value: record[metric.id] }))
    : department.name === "ОППС, социальные психологи"
      ? oppsWorkforceBreakdown(department, record)
      : [];
  const metricExtras = new Map();
  if (department.name === "Персональные координаторы") {
    metricExtras.set("m08", ["m09", "m10", "m11"].map((id) => ({
      metric: { id, label: department.metrics.find((metric) => metric.id === id)?.label.split(":").at(-1).trim() || id },
      value: record[id]
    })));
  }
  if (department.name === "Психотерапевтическая помощь") {
    keys.forEach((metric) => {
      const composite = psychotherapyMetricById.get(metric.id);
      if (!composite) return;
      const extras = composite.parts.map((part) => ({ metric: { id: part.id, label: part.label }, value: record[part.id] }));
      metricExtras.set(metric.id, extras);
    });
  }
  if (department.name === "Стойка регистрации" && state.mode === "range") {
    const values = selectedDates().map((date) => department.records[date]?.m01).filter((value) => value !== null && value !== undefined).map(Number);
    metricExtras.set("m01", [{ metric: { id: "__registration_average", label: "Среднее за день" }, value: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null }]);
  }
  if (department.name === "Стойка регистрации") {
    const rci = registrationMetricById.get("__registration_rci");
    metricExtras.set("__registration_rci", rci.parts.map((part) => ({ metric: { id: part.id, label: part.label }, value: record[part.id] })));
  }
  if (department.name === "Похоронный отдел") {
    const familyTotal = funeralMetricById.get("__funeral_family_total");
    metricExtras.set("__funeral_family_total", familyTotal.parts.map((part) => ({ metric: { id: part.id, label: part.label }, value: record[part.id] })));
  }
  if (department.name === "ЭДО") {
    metricExtras.set("m04", [
      { metric: { id: "m05", label: "01-01" }, value: record.m05 },
      { metric: { id: "m06", label: "01-02" }, value: record.m06 }
    ]);
  }
  const sourceMetricIds = new Set(department.metrics.map((metric) => metric.id));
  const alwaysVisibleDetailIds = new Set();
  keys.forEach((metric) => {
    if (!isWorkforceMetric(metric)) alwaysVisibleDetailIds.add(metric.id);
    if (sourceMetricIds.has(metric.id)) alwaysVisibleDetailIds.add(metric.id);
    (metricExtras.get(metric.id) || []).forEach(({ metric: part }) => {
      if (sourceMetricIds.has(part.id)) alwaysVisibleDetailIds.add(part.id);
    });
  });
  workforceExtras.forEach(({ metric }) => alwaysVisibleDetailIds.add(metric.id));
  els.pageTitle.textContent = department.name; els.overviewSection.hidden = true; els.primarySection.hidden = false;
  els.editButton.hidden = state.mode === "range" || !state.store.permissions.canEdit;
  els.primaryKicker.textContent = state.mode === "range" ? "Итоги за период" : "Показатели за день";
  els.selectedDateLabel.hidden = true; els.primaryMetrics.innerHTML = "";
  const hasWorkforce = keys.some(isWorkforceMetric);
  els.primaryMetrics.classList.toggle("has-workforce", hasWorkforce);
  els.primaryMetrics.classList.toggle("psychotherapy-five", department.name === "Психотерапевтическая помощь");
  els.primaryMetrics.classList.toggle("registration-five", department.name === "Стойка регистрации");
  keys.forEach((metric, index) => els.primaryMetrics.append(metricCard(metric, metricValue(department, record, metric), index, hasWorkforce, isWorkforceMetric(metric) ? workforceExtras : (metricExtras.get(metric.id) || []))));
  renderPeriodAnalytics(department, record);
  renderDetailGroups(department, record, alwaysVisibleDetailIds);
}

function render() { if (state.view === "overview") renderOverview(); else renderDepartment(); }

function openEditor() {
  if (state.view === "overview" || state.mode !== "day") return;
  const department = state.store.departments[state.view]; const record = department.records[state.date] || {};
  els.editTitle.textContent = `${department.name}, ${formatDate(state.date)}`; els.editFields.innerHTML = ""; els.formMessage.textContent = "";
  for (const metric of department.metrics) {
    const label = document.createElement("label"); label.className = "field";
    const title = document.createElement("span"); title.textContent = metric.label;
    const input = document.createElement("input"); input.type = "number"; input.min = "0"; input.step = "1"; input.name = metric.id; input.inputMode = "numeric"; input.value = record[metric.id] ?? "";
    label.append(title, input); els.editFields.append(label);
  }
  els.editDialog.showModal();
}

async function saveEditor(event) {
  event.preventDefault(); els.formMessage.textContent = ""; els.saveButton.disabled = true; els.saveButton.textContent = "Сохранение...";
  const values = Object.fromEntries(new FormData(els.editForm).entries());
  try {
    const response = await fetch("/api/record", { method: "PUT", headers: { "Content-Type": "application/json", ...(state.editorKey ? { Authorization: `Bearer ${state.editorKey}` } : {}) }, body: JSON.stringify({ departmentId: state.view, date: state.date, values }) });
    const result = await response.json(); if (!response.ok) throw new Error(result.error || "Ошибка сохранения");
    state.store.departments[state.view].records[state.date] = result.record; state.store.meta.updatedAt = result.updatedAt;
    render(); renderCalendar(); els.editDialog.close();
  } catch (error) { els.formMessage.textContent = error.message; }
  finally { els.saveButton.disabled = false; els.saveButton.textContent = "Сохранить изменения"; }
}

function selectedExportDepartments() {
  return [...els.exportDepartments.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
}

function updateExportSelection() {
  const selected = selectedExportDepartments().length;
  const total = state.store.departmentOrder.length;
  $("#toggleAllDepartments").textContent = selected === total ? "Снять выбор" : "Выбрать все";
  els.downloadExport.disabled = selected === 0;
}

function openExportDialog() {
  els.exportDateLabel.textContent = selectedPeriodLabel();
  els.exportMessage.textContent = "";
  els.exportDepartments.innerHTML = "";
  const defaults = new Set(state.view === "overview" ? state.store.departmentOrder : [state.view]);
  for (const id of state.store.departmentOrder) {
    const department = state.store.departments[id];
    const label = document.createElement("label");
    label.className = "export-department";
    label.innerHTML = `<input type="checkbox" value="${id}" ${defaults.has(id) ? "checked" : ""}/><span>${department.name}</span>`;
    label.querySelector("input").addEventListener("change", updateExportSelection);
    els.exportDepartments.append(label);
  }
  updateExportSelection();
  els.exportDialog.showModal();
}

function toggleAllExportDepartments() {
  const boxes = [...els.exportDepartments.querySelectorAll('input[type="checkbox"]')];
  const shouldSelect = boxes.some((box) => !box.checked);
  boxes.forEach((box) => { box.checked = shouldSelect; });
  updateExportSelection();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportReports(event) {
  event.preventDefault();
  const departmentIds = selectedExportDepartments();
  if (!departmentIds.length) return;
  const format = new FormData(els.exportForm).get("format");
  els.exportMessage.textContent = ""; els.downloadExport.disabled = true; els.downloadExport.textContent = "Формирование...";
  try {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: state.date, mode: state.mode, rangeStart: state.rangeStart, rangeEnd: state.rangeEnd, departmentIds, format })
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Ошибка формирования отчётов");
    }
    const disposition = response.headers.get("Content-Disposition") || "";
    const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    const filename = encoded ? decodeURIComponent(encoded) : `Отчёты ЕЦП ${state.mode === "day" ? state.date : `${state.rangeStart}-${state.rangeEnd}`}.${format}`;
    downloadBlob(await response.blob(), filename);
    els.exportDialog.close();
  } catch (error) {
    els.exportMessage.textContent = error.message;
  } finally {
    els.downloadExport.disabled = false; els.downloadExport.textContent = "Скачать отчёты";
  }
}

function updateEditorAccess() {
  const permissions = state.store.permissions || {};
  els.editorLoginButton.hidden = !permissions.editorKeyRequired;
  if (!els.editorLoginButton.hidden) els.editorLoginButton.querySelector("span").textContent = permissions.canEdit ? "Выйти из режима редактора" : "Режим редактора";
}

function openEditorLogin() {
  if (state.store.permissions.canEdit) {
    sessionStorage.removeItem("ecp-editor-key");
    state.editorKey = "";
    load();
    return;
  }
  els.editorCode.value = "";
  els.editorLoginMessage.textContent = "";
  els.editorLoginDialog.showModal();
  els.editorCode.focus();
}

async function submitEditorLogin(event) {
  event.preventDefault();
  const code = els.editorCode.value.trim();
  if (!code) return;
  els.editorLoginMessage.textContent = "";
  try {
    const response = await fetch("/api/editor-access", { method: "POST", headers: { Authorization: `Bearer ${code}` } });
    if (!response.ok) throw new Error("Неверный код редактора");
    state.editorKey = code;
    sessionStorage.setItem("ecp-editor-key", code);
    els.editorLoginDialog.close();
    await load();
  } catch (error) {
    els.editorLoginMessage.textContent = error.message;
  }
}

function openSidebar() { els.sidebar.classList.add("open"); els.drawerBackdrop.hidden = false; }
function closeSidebar() { els.sidebar.classList.remove("open"); els.drawerBackdrop.hidden = true; }

async function load() {
  const response = await fetch("dashboard.json", { cache: "no-store" });
  state.store = await response.json(); state.view = "overview"; state.date = latestAvailableDate(); state.calendarMonth = toDate(state.date);
  const dates = allDates(); const endIndex = Math.max(0, dates.indexOf(state.date)); state.rangeEnd = state.date; state.rangeStart = dates[Math.max(0, endIndex - 6)] || state.date;
  makeNav(); updateEditorAccess(); renderDateControl(); render();
}

els.dayMode.addEventListener("click", () => setMode("day")); els.rangeMode.addEventListener("click", () => setMode("range"));
els.previousDate.addEventListener("click", () => changeDate(-1)); els.nextDate.addEventListener("click", () => changeDate(1));
els.dateTrigger.addEventListener("click", toggleDatePopover); $("#previousMonth").addEventListener("click", () => changeMonth(-1)); $("#nextMonth").addEventListener("click", () => changeMonth(1));
els.quickRanges.addEventListener("click", (event) => { const button = event.target.closest("button[data-range]"); if (button) setQuickRange(button.dataset.range); });
els.toggleZeroMetrics.addEventListener("click", () => { state.showZeroMetrics = !state.showZeroMetrics; renderDepartment(); });
els.editButton.addEventListener("click", openEditor); els.editForm.addEventListener("submit", saveEditor);
els.exportButton.addEventListener("click", openExportDialog); els.exportForm.addEventListener("submit", exportReports);
$("#toggleAllDepartments").addEventListener("click", toggleAllExportDepartments);
$("#closeExportDialog").addEventListener("click", () => els.exportDialog.close());
$("#cancelExport").addEventListener("click", () => els.exportDialog.close());
els.editorLoginButton.addEventListener("click", openEditorLogin); els.editorLoginForm.addEventListener("submit", submitEditorLogin);
$("#closeEditorLogin").addEventListener("click", () => els.editorLoginDialog.close());
$("#cancelEditorLogin").addEventListener("click", () => els.editorLoginDialog.close());
$("#menuButton").addEventListener("click", openSidebar); $("#closeSidebar").addEventListener("click", closeSidebar); els.drawerBackdrop.addEventListener("click", closeSidebar);
$("#closeDialog").addEventListener("click", () => els.editDialog.close()); $("#cancelEdit").addEventListener("click", () => els.editDialog.close());
document.addEventListener("click", (event) => { if (!event.target.closest(".date-picker-wrap") && !els.datePopover.hidden) closeDatePopover(); });

load().catch(() => { els.pageTitle.textContent = "Ошибка загрузки данных"; });
