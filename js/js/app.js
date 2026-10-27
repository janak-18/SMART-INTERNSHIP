/* Smart Internship Verification Portal - app.js */

// ========== DATA ==========
const COMPANIES = [
  { name: "TCS", domain: "tcs.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "Infosys", domain: "infosys.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "Wipro", domain: "wipro.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "Accenture", domain: "accenture.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "Capgemini", domain: "capgemini.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "Cognizant", domain: "cognizant.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "HCL Technologies", domain: "hcltech.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "Tech Mahindra", domain: "techmahindra.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "IBM", domain: "ibm.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "Microsoft", domain: "microsoft.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "Google", domain: "google.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "Amazon", domain: "amazon.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "Deloitte", domain: "deloitte.com", status: "Verified", programs: "Yes", risk: "Low" },
  { name: "QuickIntern", domain: "quickintern.in", status: "Suspicious", programs: "Unclear", risk: "High" },
  { name: "InternShipHub", domain: "internshiphub.co", status: "Suspicious", programs: "No", risk: "High" },
  { name: "FakeCorp Solutions", domain: "fakecorp.xyz", status: "Blacklisted", programs: "No", risk: "Critical" },
  { name: "PayToJoin Interns", domain: "paytojoin.com", status: "Blacklisted", programs: "No", risk: "Critical" },
];

const FAQS = [
  {
    q: "Is this portal 100% accurate?",
    a: "No system is 100% accurate. This is a demo prototype that uses rule-based checks + a sample company database. Always do additional research and contact official placement cell."
  },
  {
    q: "What should I do if the result shows Suspicious or High Risk?",
    a: "Do not pay any money. Cross-verify the company on LinkedIn, official website, and ask your college placement officer. Report suspicious offers to your university."
  },
  {
    q: "Can Placement Officers use this portal?",
    a: "Yes. Switch to Officer mode for additional guidance suited for placement cells and bulk verification scenarios."
  },
  {
    q: "Where is my data stored?",
    a: "All verification history is stored only in your browser (localStorage). Nothing is sent to any server in this demo."
  },
  {
    q: "How does the red-flag detection work?",
    a: "It scans for keywords like payment requests, free email domains (gmail, yahoo), urgency language, unrealistic stipends, WhatsApp-only contact, etc."
  }
];

const RED_FLAGS = [
  { pattern: /pay.*(registration|fee|deposit|security)/i, weight: 35, reason: "Asks for payment / registration fee" },
  { pattern: /whatsapp only|only whatsapp|contact on whatsapp/i, weight: 20, reason: "WhatsApp-only communication" },
  { pattern: /urgent|immediately|limited seats|act fast|hurry/i, weight: 15, reason: "Creates false urgency" },
  { pattern: /gmail\.com|yahoo\.com|hotmail\.com|outlook\.com/i, weight: 18, reason: "Uses free email domain" },
  { pattern: /work from home.*guaranteed|100% placement|assured job/i, weight: 25, reason: "Unrealistic guarantees" },
  { pattern: /send.*(aadhaar|pan|bank details|otp)/i, weight: 30, reason: "Requests sensitive personal data" },
];

// ========== STATE ==========
let currentRole = "student";
let history = JSON.parse(localStorage.getItem("siv_history") || "[]");

// ========== THEME ==========
function initTheme() {
  const saved = localStorage.getItem("siv_theme");
  if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
}

document.getElementById("theme-toggle")?.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("siv_theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
});

// ========== ROLE ==========
function setRole(role) {
  currentRole = role;
  document.getElementById("role-label").textContent = role === "student" ? "Student" : "Placement Officer";

  // Desktop buttons
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.classList.remove("bg-primary-600", "text-white");
    btn.classList.add("text-slate-600", "dark:text-slate-300");
  });
  const activeBtn = document.getElementById(role === "student" ? "role-student" : "role-officer");
  if (activeBtn) {
    activeBtn.classList.add("bg-primary-600", "text-white");
    activeBtn.classList.remove("text-slate-600", "dark:text-slate-300");
  }

  // Mobile
  const mStudent = document.getElementById("role-student-m");
  const mOfficer = document.getElementById("role-officer-m");
  if (mStudent && mOfficer) {
    mStudent.className = role === "student" ? "flex-1 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white" : "flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800";
    mOfficer.className = role === "officer" ? "flex-1 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white" : "flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800";
  }
}

document.getElementById("role-student")?.addEventListener("click", () => setRole("student"));
document.getElementById("role-officer")?.addEventListener("click", () => setRole("officer"));
document.getElementById("role-student-m")?.addEventListener("click", () => setRole("student"));
document.getElementById("role-officer-m")?.addEventListener("click", () => setRole("officer"));

// ========== MOBILE MENU ==========
document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
  document.getElementById("mobile-menu").classList.toggle("hidden");
});

// ========== VERIFY TYPE TOGGLE ==========
document.querySelectorAll('input[name="verify-type"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    const fields = document.getElementById("certificate-fields");
    if (e.target.value === "certificate") {
      fields.classList.remove("hidden");
      fields.classList.add("grid");
    } else {
      fields.classList.add("hidden");
      fields.classList.remove("grid");
    }
  });
});

// ========== AUTOCOMPLETE ==========
const companyInput = document.getElementById("company-name");
const autocompleteList = document.getElementById("autocomplete-list");

companyInput?.addEventListener("input", () => {
  const val = companyInput.value.toLowerCase().trim();
  if (val.length < 1) {
    autocompleteList.classList.add("hidden");
    return;
  }
  const matches = COMPANIES.filter(c => c.name.toLowerCase().includes(val)).slice(0, 6);
  if (matches.length === 0) {
    autocompleteList.classList.add("hidden");
    return;
  }
  autocompleteList.innerHTML = matches.map(c => `
    <div class="autocomplete-item px-4 py-2.5 cursor-pointer text-sm" data-name="${c.name}" data-domain="${c.domain}">
      <span class="font-medium">${c.name}</span>
      <span class="text-slate-400 ml-2 text-xs">${c.domain}</span>
    </div>
  `).join("");
  autocompleteList.classList.remove("hidden");
});

autocompleteList?.addEventListener("click", (e) => {
  const item = e.target.closest(".autocomplete-item");
  if (!item) return;
  companyInput.value = item.dataset.name;
  document.getElementById("company-domain").value = item.dataset.domain;
  autocompleteList.classList.add("hidden");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#company-name") && !e.target.closest("#autocomplete-list")) {
    autocompleteList?.classList.add("hidden");
  }
});

// ========== VERIFICATION ENGINE ==========
function analyzeOffer(data) {
  let score = 0;
  const reasons = [];
  let matchedCompany = null;

  // 1. Company match
  const nameLower = data.company.toLowerCase();
  matchedCompany = COMPANIES.find(c => c.name.toLowerCase() === nameLower || c.name.toLowerCase().includes(nameLower));

  if (matchedCompany) {
    if (matchedCompany.status === "Verified") {
      score -= 25;
      reasons.push({ type: "good", text: `Found in trusted database (${matchedCompany.name})` });
    } else if (matchedCompany.status === "Suspicious") {
      score += 40;
      reasons.push({ type: "bad", text: `Company flagged as Suspicious in database` });
    } else if (matchedCompany.status === "Blacklisted") {
      score += 70;
      reasons.push({ type: "bad", text: `Company is Blacklisted` });
    }
  } else {
    score += 15;
    reasons.push({ type: "neutral", text: "Company not found in trusted database" });
  }

  // 2. Domain check
  if (data.domain) {
    const domain = data.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^.*@/, "");
    const freeDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "rediffmail.com"];
    if (freeDomains.some(d => domain.includes(d))) {
      score += 22;
      reasons.push({ type: "bad", text: "Uses free email domain (common in scams)" });
    }
    if (matchedCompany && matchedCompany.domain && domain.includes(matchedCompany.domain)) {
      score -= 15;
      reasons.push({ type: "good", text: "Domain matches known company domain" });
    }
  }

  // 3. Stipend check
  if (data.stipend) {
    const s = Number(data.stipend);
    if (s > 80000) {
      score += 25;
      reasons.push({ type: "bad", text: "Unrealistically high stipend" });
    } else if (s > 0 && s < 2000) {
      score += 10;
      reasons.push({ type: "neutral", text: "Very low stipend (possible unpaid/scam)" });
    }
  }

  // 4. Red flags in text
  const textToScan = `${data.details || ""} ${data.role || ""}`;
  RED_FLAGS.forEach(flag => {
    if (flag.pattern.test(textToScan)) {
      score += flag.weight;
      reasons.push({ type: "bad", text: flag.reason });
    }
  });

  // Normalize score 0-100
  score = Math.max(0, Math.min(100, score + 20)); // base offset

  let verdict, colorClass, advice;
  if (score <= 25) {
    verdict = "Genuine";
    colorClass = "result-genuine";
    advice = currentRole === "student"
      ? "Looks safe to proceed. Still verify official offer letter and contact HR through official channels."
      : "Company appears legitimate. You may proceed with standard placement verification steps.";
  } else if (score <= 55) {
    verdict = "Suspicious";
    colorClass = "result-suspicious";
    advice = currentRole === "student"
      ? "Exercise caution. Do not pay any money. Cross-check with your placement cell and LinkedIn."
      : "Recommend deeper due diligence before endorsing this company to students.";
  } else {
    verdict = "High Risk / Likely Fake";
    colorClass = "result-fake";
    advice = currentRole === "student"
      ? "Strongly advised to avoid. Report this offer to your university placement cell immediately."
      : "Flag this company. Advise students against engagement and consider blacklisting.";
  }

  return { score, verdict, colorClass, reasons, advice, matchedCompany };
}

// ========== FORM SUBMIT ==========
document.getElementById("verify-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    type: document.querySelector('input[name="verify-type"]:checked')?.value || "offer",
    company: document.getElementById("company-name").value.trim(),
    domain: document.getElementById("company-domain").value.trim(),
    role: document.getElementById("internship-role").value.trim(),
    stipend: document.getElementById("stipend").value,
    certId: document.getElementById("cert-id")?.value || "",
    duration: document.getElementById("duration")?.value || "",
    details: document.getElementById("offer-details").value.trim(),
  };

  // Show loading
  document.getElementById("result-card").classList.add("hidden");
  document.getElementById("loading-state").classList.remove("hidden");

  const loadingTexts = ["Checking company records...", "Scanning for red flags...", "Evaluating domain reputation...", "Calculating risk score..."];
  let i = 0;
  const loadingInterval = setInterval(() => {
    document.getElementById("loading-text").textContent = loadingTexts[i % loadingTexts.length];
    i++;
  }, 700);

  // Simulate delay
  await new Promise(r => setTimeout(r, 2200));
  clearInterval(loadingInterval);
  document.getElementById("loading-state").classList.add("hidden");

  const result = analyzeOffer(data);
  showResult(data, result);
  saveToHistory(data, result);
  updateStats();
});

function showResult(data, result) {
  const card = document.getElementById("result-card");
  card.classList.remove("hidden");
  card.innerHTML = `
    <div class="rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="${result.colorClass} text-white p-6">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p class="text-sm opacity-90 mb-1">Verification Result</p>
            <h3 class="text-2xl font-bold">${result.verdict}</h3>
          </div>
          <div class="text-right">
            <p class="text-sm opacity-90">Risk Score</p>
            <p class="text-3xl font-bold">${result.score}/100</p>
          </div>
        </div>
        <div class="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
          <div class="risk-bar h-full bg-white rounded-full" style="width: ${result.score}%"></div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 space-y-4">
        <div>
          <h4 class="font-semibold mb-2">Analysis Summary</h4>
          <ul class="space-y-2">
            ${result.reasons.map(r => `
              <li class="flex items-start gap-2 text-sm">
                <span class="mt-0.5">${r.type === "good" ? "✅" : r.type === "bad" ? "⚠️" : "ℹ️"}</span>
                <span>${r.text}</span>
              </li>
            `).join("")}
          </ul>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
          <p class="text-sm font-medium mb-1">Recommended Action (${currentRole === "student" ? "Student" : "Officer"})</p>
          <p class="text-sm text-slate-600 dark:text-slate-300">${result.advice}</p>
        </div>
        <div class="text-xs text-slate-500">
          Verified: ${data.company} ${data.domain ? "• " + data.domain : ""} • ${new Date().toLocaleString()}
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
  card.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ========== HISTORY ==========
function saveToHistory(data, result) {
  history.unshift({
    id: Date.now(),
    company: data.company,
    verdict: result.verdict,
    score: result.score,
    date: new Date().toISOString(),
  });
  if (history.length > 20) history = history.slice(0, 20);
  localStorage.setItem("siv_history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("history-list");
  if (!history.length) {
    list.innerHTML = `<p class="text-center text-slate-500 py-10">No history yet. Run a verification to see results here.</p>`;
    return;
  }
  list.innerHTML = history.map(h => `
    <div class="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <div>
        <p class="font-medium">${h.company}</p>
        <p class="text-xs text-slate-500">${new Date(h.date).toLocaleString()}</p>
      </div>
      <div class="text-right">
        <span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold
          ${h.score <= 25 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
            h.score <= 55 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
            "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}">
          ${h.verdict}
        </span>
        <p class="text-xs text-slate-500 mt-1">Score: ${h.score}</p>
      </div>
    </div>
  `).join("");
}

document.getElementById("clear-history")?.addEventListener("click", () => {
  if (confirm("Clear all verification history?")) {
    history = [];
    localStorage.removeItem("siv_history");
    renderHistory();
    updateStats();
  }
});

// ========== COMPANY TABLE ==========
function renderCompanyTable() {
  const tbody = document.getElementById("company-table-body");
  if (!tbody) return;
  tbody.innerHTML = COMPANIES.map(c => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <td class="px-5 py-3.5 font-medium">${c.name}</td>
      <td class="px-5 py-3.5 text-sm text-slate-500">${c.domain}</td>
      <td class="px-5 py-3.5">
        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold
          ${c.status === "Verified" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
            c.status === "Suspicious" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
            "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}">
          ${c.status}
        </span>
      </td>
      <td class="px-5 py-3.5 text-sm">${c.programs}</td>
      <td class="px-5 py-3.5 text-sm font-medium
        ${c.risk === "Low" ? "text-emerald-600" : c.risk === "High" ? "text-amber-600" : "text-red-600"}">
        ${c.risk}
      </td>
    </tr>
  `).join("");
}

// ========== FAQ ==========
function renderFAQ() {
  const list = document.getElementById("faq-list");
  if (!list) return;
  list.innerHTML = FAQS.map((f, i) => `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button class="faq-btn w-full flex items-center justify-between p-5 text-left font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition" data-index="${i}">
        <span>${f.q}</span>
        <i data-lucide="chevron-down" class="w-5 h-5 transition-transform"></i>
      </button>
      <div class="faq-answer hidden px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        ${f.a}
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".faq-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const answer = btn.nextElementSibling;
      const icon = btn.querySelector("i");
      const isOpen = !answer.classList.contains("hidden");
      
      // Close all
      list.querySelectorAll(".faq-answer").forEach(a => a.classList.add("hidden"));
      list.querySelectorAll(".faq-btn i").forEach(i => i.style.transform = "");

      if (!isOpen) {
        answer.classList.remove("hidden");
        icon.style.transform = "rotate(180deg)";
      }
    });
  });
  lucide.createIcons();
}

// ========== STATS ==========
function updateStats() {
  const el = document.getElementById("stat-verified");
  if (el) {
    const count = history.length;
    el.textContent = count;
  }
}

// ========== TOAST ==========
function showToast(msg, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-slide-up ${
    type === "success" ? "bg-emerald-600" : type === "error" ? "bg-red-600" : "bg-slate-800"
  }`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setRole("student");
  renderCompanyTable();
  renderFAQ();
  renderHistory();
  updateStats();
  lucide.createIcons();
});