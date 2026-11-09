document.addEventListener("DOMContentLoaded", () => {
  const historyLog = [];

  // Tab Navigation Elements
  const verifyTab = document.getElementById("verify-tab");
  const counselingTab = document.getElementById("counseling-tab");
  const verifyBtn = document.getElementById("tab-verify-btn");
  const counselingBtn = document.getElementById("tab-counseling-btn");

  // Tab Switcher Event Listeners
  verifyBtn.addEventListener("click", () => switchTab("verify"));
  counselingBtn.addEventListener("click", () => switchTab("counseling"));

  function switchTab(tab) {
    if (tab === "verify") {
      verifyTab.classList.remove("hidden");
      counselingTab.classList.add("hidden");
      verifyBtn.classList.add("active");
      counselingBtn.classList.remove("active");
    } else {
      verifyTab.classList.add("hidden");
      counselingTab.classList.remove("hidden");
      counselingBtn.classList.add("active");
      verifyBtn.classList.remove("active");
    }
  }

  // Presets Handlers
  const presetButtons = document.querySelectorAll(".preset-btn");
  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-preset");
      applyPreset(type);
    });
  });

  function applyPreset(type) {
    const presets = {
      tap: { id: "Kitchen Tap - Home", source: "Drinking / Municipal Tap", ph: 7.4, turbidity: 0.8, tds: 180, chlorine: 0.5, temp: 21 },
      aquarium: { id: "Aquarium Tank #1", source: "Aquarium / Fish Tank", ph: 6.9, turbidity: 1.2, tds: 220, chlorine: 0.0, temp: 25 },
      well: { id: "Submersible Well", source: "Groundwater / Well", ph: 6.2, turbidity: 4.5, tds: 650, chlorine: 0.0, temp: 19 },
      polluted: { id: "Pond Sample - Yard", source: "Pond / Lake Sample", ph: 9.1, turbidity: 8.5, tds: 920, chlorine: 2.5, temp: 28 },
    };

    const p = presets[type];
    if (p) {
      document.getElementById("sample-id").value = p.id;
      document.getElementById("water-source").value = p.source;
      document.getElementById("ph").value = p.ph;
      document.getElementById("turbidity").value = p.turbidity;
      document.getElementById("tds").value = p.tds;
      document.getElementById("chlorine").value = p.chlorine;
      document.getElementById("temperature").value = p.temp;
    }
  }

  // Water Verification Form Submission
  const waterForm = document.getElementById("water-form");
  waterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    verifyWater();
  });

  function verifyWater() {
    const sampleId = document.getElementById("sample-id").value;
    const source = document.getElementById("water-source").value;
    const ph = parseFloat(document.getElementById("ph").value);
    const turbidity = parseFloat(document.getElementById("turbidity").value);
    const tds = parseFloat(document.getElementById("tds").value);
    const chlorine = parseFloat(document.getElementById("chlorine").value);
    const temp = parseFloat(document.getElementById("temperature").value);

    let issues = [];
    let score = 100;
    const isAquarium = source.includes("Aquarium");

    // pH checks
    let phStatus = "Ideal";
    if (ph < 6.5) {
      phStatus = "Too Acidic";
      score -= 20;
      issues.push("pH is dangerously low (acidic water). May cause pipe corrosion or harm fish.");
    } else if (ph > 8.5) {
      phStatus = "Too Alkaline";
      score -= 20;
      issues.push("pH is high (alkaline water). Can cause scaling and unpleasant taste.");
    }

    // Turbidity checks
    let turbStatus = "Ideal";
    if (turbidity > 5.0) {
      turbStatus = "High Clarity Risk";
      score -= 25;
      issues.push("High turbidity (>5 NTU). Indicates cloudy water or microbial presence.");
    } else if (turbidity > 1.0) {
      turbStatus = "Acceptable";
      score -= 5;
    }

    // TDS checks
    let tdsStatus = "Ideal";
    if (tds > 500) {
      tdsStatus = "Elevated Dissolved Solids";
      score -= 25;
      issues.push("TDS exceeds 500 ppm limit. High mineral contents or potential contamination.");
    }

    // Chlorine checks
    let chlorineStatus = "Ideal";
    if (isAquarium && chlorine > 0) {
      chlorineStatus = "Toxic for Aquatic Life";
      score -= 40;
      issues.push("CRITICAL: Aquarium water contains chlorine, which is fatal for fish!");
    } else if (!isAquarium && chlorine > 4.0) {
      chlorineStatus = "Excessive Chlorine";
      score -= 20;
      issues.push("Chlorine exceeds safety limits (max 4.0 mg/L). Strong chemical taste/odor.");
    }

    score = Math.max(0, score);

    // Status Badge
    let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
    let statusText = "SAFE / EXCELLENT";
    if (score < 60) {
      badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
      statusText = "HAZARDOUS";
    } else if (score < 85) {
      badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
      statusText = "MODERATE RISK";
    }

    // Recommendations
    let recs = [];
    if (isAquarium && chlorine > 0) recs.push("Add an immediate dechlorinator / tap water conditioner before adding fish.");
    if (tds > 500) recs.push("Use a Reverse Osmosis (RO) filtration system to reduce dissolved solids.");
    if (ph < 6.5) recs.push("Use an alkaline remineralizer or calcite filter to raise pH.");
    if (turbidity > 5) recs.push("Install a sediment pre-filter (5 micron) to clarify cloudy water.");
    if (recs.length === 0) recs.push("Water quality parameters meet WHO standards! No action required.");

    // Render Output Result
    const resultsCard = document.getElementById("results-card");
    resultsCard.className = "bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-left space-y-6";
    resultsCard.innerHTML = `
      <div class="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 gap-2">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Analysis Result</span>
          <h3 class="text-xl font-bold text-slate-800">${sampleId}</h3>
          <p class="text-xs text-slate-500">Source: ${source}</p>
        </div>
        <div class="px-4 py-1.5 rounded-full border text-xs font-bold ${badgeColor} inline-block self-start sm:self-auto">
          ${statusText} (${score}%)
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-[10px] text-slate-400 uppercase font-semibold">pH Level</span>
          <div class="text-base font-bold text-slate-800">${ph}</div>
          <span class="text-[11px] font-medium ${phStatus === 'Ideal' ? 'text-emerald-600' : 'text-amber-600'}">${phStatus}</span>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-[10px] text-slate-400 uppercase font-semibold">TDS Value</span>
          <div class="text-base font-bold text-slate-800">${tds} ppm</div>
          <span class="text-[11px] font-medium ${tdsStatus === 'Ideal' ? 'text-emerald-600' : 'text-amber-600'}">${tdsStatus}</span>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-[10px] text-slate-400 uppercase font-semibold">Turbidity</span>
          <div class="text-base font-bold text-slate-800">${turbidity} NTU</div>
          <span class="text-[11px] font-medium ${turbStatus === 'Ideal' ? 'text-emerald-600' : 'text-amber-600'}">${turbStatus}</span>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-[10px] text-slate-400 uppercase font-semibold">Chlorine</span>
          <div class="text-base font-bold text-slate-800">${chlorine} mg/L</div>
          <span class="text-[11px] font-medium ${chlorineStatus === 'Ideal' ? 'text-emerald-600' : 'text-rose-600'}">${chlorineStatus}</span>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-2">
          <span class="text-[10px] text-slate-400 uppercase font-semibold">Temperature</span>
          <div class="text-base font-bold text-slate-800">${temp} °C</div>
          <span class="text-[11px] font-medium text-slate-500">Normal Range (15-25°C)</span>
        </div>
      </div>

      <div class="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
        <h4 class="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
          <i class="fa-solid fa-lightbulb text-amber-500"></i> Recommended Actions:
        </h4>
        <ul class="text-xs text-blue-800 space-y-1 list-disc list-inside">
          ${recs.map((r) => `<li>${r}</li>`).join("")}
        </ul>
      </div>
    `;

    historyLog.unshift({ id: sampleId, source, ph, tds, turbidity, score, status: statusText });
    updateHistoryTable();
  }

  function updateHistoryTable() {
    const tbody = document.getElementById("history-log");
    tbody.innerHTML = historyLog.map((item) => `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-3 font-semibold text-slate-700">${item.id}</td>
        <td class="p-3 text-slate-500">${item.source}</td>
        <td class="p-3 font-mono">${item.ph}</td>
        <td class="p-3 font-mono">${item.tds}</td>
        <td class="p-3 font-mono">${item.turbidity}</td>
        <td class="p-3 font-bold text-blue-600">${item.score}%</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.score < 60 ? 'bg-rose-100 text-rose-700' : item.score < 85 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">
            ${item.status}
          </span>
        </td>
      </tr>
    `).join("");
  }

  // Counseling Service Mode Toggle
  const counselingRadios = document.querySelectorAll(".counseling-type-radio");
  counselingRadios.forEach((radio) => {
    radio.addEventListener("change", toggleAddressField);
  });

  function toggleAddressField() {
    const selectedType = document.querySelector('input[name="counseling_type"]:checked').value;
    const addressContainer = document.getElementById("address-container");
    const addressInput = document.getElementById("client-address");

    if (selectedType === "Home Visit & Inspection") {
      addressContainer.classList.remove("hidden");
      addressInput.setAttribute("required", "true");
    } else {
      addressContainer.classList.add("hidden");
      addressInput.removeAttribute("required");
    }
  }

  // Counseling Form Submission
  const counselingForm = document.getElementById("counseling-form");
  counselingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    submitCounseling();
  });

  function submitCounseling() {
    const type = document.querySelector('input[name="counseling_type"]:checked').value;
    const name = document.getElementById("client-name").value;
    const phone = document.getElementById("client-phone").value;
    const address = document.getElementById("client-address").value;
    const specialist = document.getElementById("specialist-select").value;
    const date = document.getElementById("booking-date").value;
    const time = document.getElementById("booking-time").value;
    const notes = document.getElementById("issue-notes").value || "None provided";

    const modalDetails = document.getElementById("modal-details");
    modalDetails.innerHTML = `
      <p><strong>Service:</strong> ${type}</p>
      <p><strong>Client:</strong> ${name} (${phone})</p>
      ${type.includes("Home") ? `<p><strong>Address:</strong> ${address}</p>` : ""}
      <p><strong>Specialist:</strong> ${specialist}</p>
      <p><strong>Schedule:</strong> ${date} at ${time}</p>
      <p><strong>Notes:</strong> ${notes}</p>
      <div class="mt-2 text-[10px] text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
        <i class="fa-solid fa-circle-info mr-1"></i> Reference ID: #AQ-${Math.floor(100000 + Math.random() * 900000)}
      </div>
    `;

    document.getElementById("booking-modal").classList.remove("hidden");
  }

  // Close Modal Handler
  const closeModalBtn = document.getElementById("close-modal-btn");
  closeModalBtn.addEventListener("click", () => {
    document.getElementById("booking-modal").classList.add("hidden");
    counselingForm.reset();
    toggleAddressField();
  });
});