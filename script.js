// Tab switching functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get all tab buttons
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Add click event to each tab button
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all buttons
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to current button
      this.classList.add("active");

      // Hide all tab contents
      tabContents.forEach((content) => content.classList.remove("active"));
      // Show target tab content
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });

  // Expandable task categories
  const taskHeaders = document.querySelectorAll(".task-header");
  taskHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      const taskId = this.getAttribute("data-task");
      const taskContent = document.getElementById(`${taskId}-tasks`);

      // Toggle active class on header
      this.classList.toggle("active");

      // Toggle active class on content
      if (taskContent) {
        taskContent.classList.toggle("active");
      }
    });
  });

  // Sidebar toggle functionality
  const sidebar = document.getElementById("taskSidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  
  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      sidebar.classList.toggle("hidden");
      const icon = this.querySelector("i");
      if (sidebar.classList.contains("hidden")) {
        icon.classList.remove("fa-chevron-left");
        icon.classList.add("fa-chevron-right");
      } else {
        icon.classList.remove("fa-chevron-right");
        icon.classList.add("fa-chevron-left");
      }
    });
  }

  // Smooth scroll to anchor
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Top navbar scroll spy (set active nav-link on section in view)
  const topNavLinks = document.querySelectorAll(".nav-links a");
  const sectionIds = [
    "overview",
    "tasks",
    "results",
    "attack-types",
    "getting-started",
  ];
  const idToLink = new Map();
  topNavLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      const id = href.substring(1);
      idToLink.set(id, link);
    }
  });

  const observedSections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let currentActiveId = null;
  const navObserver = new IntersectionObserver(
    (entries) => {
      let best = { id: null, ratio: 0 };
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > best.ratio) {
          best = { id: entry.target.id, ratio: entry.intersectionRatio };
        }
      });
      if (best.id && best.id !== currentActiveId) {
        currentActiveId = best.id;
        topNavLinks.forEach((l) => l.classList.remove("active"));
        const link = idToLink.get(best.id);
        if (link) link.classList.add("active");
      }
    },
    {
      threshold: [0.2, 0.4, 0.6],
      rootMargin: "-80px 0px -50% 0px",
    }
  );

  observedSections.forEach((sec) => navObserver.observe(sec));

  // Fallback: scroll-based spy if IO misses
  function updateActiveByScroll() {
    let bestId = null;
    let bestDistance = Infinity;
    observedSections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      const headerOffset = 80; // sticky header height approx
      const distance = Math.abs(
        rect.top - headerOffset - window.innerHeight * 0.2
      );
      if (
        distance < bestDistance &&
        rect.bottom > headerOffset &&
        rect.top < window.innerHeight * 0.8
      ) {
        bestDistance = distance;
        bestId = sec.id;
      }
    });
    if (bestId && bestId !== currentActiveId) {
      currentActiveId = bestId;
      topNavLinks.forEach((l) => l.classList.remove("active"));
      const link = idToLink.get(bestId);
      if (link) link.classList.add("active");
    }
  }

  window.addEventListener("scroll", updateActiveByScroll, { passive: true });
  updateActiveByScroll();

  // Navbar scroll effect (guard missing .navbar)
  let lastScroll = 0;
  const navbar = document.querySelector(".navbar");

  window.addEventListener(
    "scroll",
    () => {
      if (!navbar) return; // guard
      const currentScroll = window.pageYOffset;
      if (currentScroll <= 0) {
        navbar.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1)";
      } else {
        navbar.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
      }
      lastScroll = currentScroll;
    },
    { passive: true }
  );

  // Add scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe all card elements
  const cards = document.querySelectorAll(
    ".feature-card, .security-card, .attack-card, .insight-card, .step, .task-category"
  );
  cards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    observer.observe(card);
  });

  // Code copy functionality
  const codeBlocks = document.querySelectorAll("pre code");
  codeBlocks.forEach((block) => {
    const pre = block.parentElement;
    const button = document.createElement("button");
    button.className = "copy-button";
    button.innerHTML = "Copy";
    button.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.25rem 0.75rem;
            background: rgba(255, 255, 255, 0.9);
            color: #1f2937;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.3s;
        `;

    pre.style.position = "relative";
    pre.appendChild(button);

    pre.addEventListener("mouseenter", () => {
      button.style.opacity = "1";
    });

    pre.addEventListener("mouseleave", () => {
      button.style.opacity = "0";
    });

    button.addEventListener("click", async () => {
      const code = block.textContent;
      try {
        await navigator.clipboard.writeText(code);
        button.innerHTML = "Copied!";
        button.style.background = "#10b981";
        button.style.color = "white";
        setTimeout(() => {
          button.innerHTML = "Copy";
          button.style.background = "rgba(255, 255, 255, 0.9)";
          button.style.color = "#1f2937";
        }, 2000);
      } catch (err) {
        console.error("Copy failed:", err);
        button.innerHTML = "Failed";
        setTimeout(() => {
          button.innerHTML = "Copy";
        }, 2000);
      }
    });
  });

  // Responsive navigation menu
  const createMobileMenu = () => {
    const navMenu = document.querySelector(".nav-menu");
    const navContainer = document.querySelector(".nav-container");

    if (window.innerWidth <= 768) {
      if (!document.querySelector(".menu-toggle")) {
        const menuToggle = document.createElement("button");
        menuToggle.className = "menu-toggle";
        menuToggle.innerHTML = "☰";
        menuToggle.style.cssText = `
                    display: block;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-primary);
                `;

        navContainer.insertBefore(menuToggle, navMenu);

        menuToggle.addEventListener("click", () => {
          navMenu.style.display =
            navMenu.style.display === "flex" ? "none" : "flex";
        });
      }
    } else {
      const menuToggle = document.querySelector(".menu-toggle");
      if (menuToggle) {
        menuToggle.remove();
        navMenu.style.display = "flex";
      }
    }
  };

  createMobileMenu();
  window.addEventListener("resize", createMobileMenu);

  // Add loading animation
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "opacity 0.5s ease-in";
    document.body.style.opacity = "1";
  }, 100);

  // Statistics animation (if needed)
  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      element.textContent = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  // Add animation for statistics numbers
  const stats = document.querySelectorAll(".stat-number");
  stats.forEach((stat) => {
    const value = parseInt(stat.textContent);
    observer.observe(stat);
    stat.addEventListener(
      "intersect",
      () => {
        animateValue(stat, 0, value, 2000);
      },
      { once: true }
    );
  });
});

// Theme toggle functionality (optional)
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.setAttribute("data-theme", savedTheme);
}

// Scroll to top button
window.addEventListener("scroll", function () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  let scrollToTopBtn = document.getElementById("scrollToTop");

  if (scrollTop > 300) {
    if (!scrollToTopBtn) {
      scrollToTopBtn = document.createElement("button");
      scrollToTopBtn.id = "scrollToTop";
      scrollToTopBtn.innerHTML = "↑";
      scrollToTopBtn.style.cssText = `
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 50px;
                height: 50px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.5rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                transition: all 0.3s;
            `;
      document.body.appendChild(scrollToTopBtn);

      scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });

      scrollToTopBtn.addEventListener("mouseenter", () => {
        scrollToTopBtn.style.transform = "scale(1.1)";
      });

      scrollToTopBtn.addEventListener("mouseleave", () => {
        scrollToTopBtn.style.transform = "scale(1)";
      });
    }
    scrollToTopBtn.style.display = "block";
  } else if (scrollToTopBtn) {
    scrollToTopBtn.style.display = "none";
  }
});

// Extracted from inline scripts
// Tab functionality
document.addEventListener("DOMContentLoaded", function () {
  // Leaderboard tabs
  const leaderboardTabButtons = document.querySelectorAll(
    "#leaderboard .tab-button"
  );
  const leaderboardTabContents = document.querySelectorAll(
    "#leaderboard .tab-content"
  );

  leaderboardTabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all leaderboard buttons and contents
      leaderboardTabButtons.forEach((btn) => btn.classList.remove("active"));
      leaderboardTabContents.forEach((content) =>
        content.classList.remove("active")
      );

      // Add active class to clicked button and corresponding content
      this.classList.add("active");
      document.getElementById(targetTab + "-tab").classList.add("active");
    });
  });

  // Attack types tabs
  const attackTabButtons = document.querySelectorAll(
    "#attack-types .tab-button"
  );
  const attackTabContents = document.querySelectorAll(
    "#attack-types .tab-content"
  );

  attackTabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all attack type buttons and contents
      attackTabButtons.forEach((btn) => btn.classList.remove("active"));
      attackTabContents.forEach((content) =>
        content.classList.remove("active")
      );

      // Add active class to clicked button and corresponding content
      this.classList.add("active");
      document.getElementById(targetTab + "-tab").classList.add("active");
    });
  });
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      // Scope active state to the clicked anchor's own nav container
      const topNavContainer = this.closest(".nav-links");
      const sideNavContainer = this.closest(".domain-nav");

      if (topNavContainer) {
        topNavContainer
          .querySelectorAll("a")
          .forEach((a) => a.classList.remove("active"));
        this.classList.add("active");
      } else if (sideNavContainer) {
        sideNavContainer
          .querySelectorAll("a")
          .forEach((a) => a.classList.remove("active"));
        this.classList.add("active");
      }

      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Calculate per-row averages for Table 2 (❌ without prompt, ✅ with prompt)
  function calculateTable2Averages() {
    // Locate Table 2 by finding the table that contains "Table 2: Attack Success Rate" heading
    const headings = Array.from(document.querySelectorAll("h3"));
    const table2Heading = headings.find((h) =>
      h.textContent.includes("Table 2: Attack Success Rate")
    );
    if (!table2Heading) {
      console.warn("Table 2 heading not found");
      return;
    }
    // Find the table after the heading (may be inside a container)
    let element = table2Heading.nextElementSibling;
    while (element) {
      if (element.tagName === "TABLE") {
        break;
      }
      // Check if element contains a table
      const table = element.querySelector && element.querySelector("table");
      if (table) {
        element = table;
        break;
      }
      element = element.nextElementSibling;
    }
    const table = element && element.tagName === "TABLE" ? element : null;
    if (!table) {
      console.warn("Table 2 not found after heading");
      return;
    }

    const thead = table.querySelector("thead");
    const headerRows = thead ? thead.querySelectorAll("tr") : [];
    if (headerRows.length < 2) {
      console.warn("Table 2 header structure not as expected");
      return;
    }

    // First header row has grouped labels: Model | CT | EPM | ... | RI | Average
    const groupRow = headerRows[0];
    const groupHeaders = Array.from(groupRow.querySelectorAll("th"));

    // Build group map excluding the first "Model" column
    // Track the starting index (in data cells, i.e., excluding model) for each group
    let dataColIndex = 0; // index in dataCells
    const groups = [];
    groupHeaders.forEach((th, idx) => {
      const label = (th.textContent || "").trim();
      const span = parseInt(th.getAttribute("colspan") || "1", 10);
      if (idx === 0) {
        // Model column
        return;
      }
      groups.push({ label, start: dataColIndex, span });
      dataColIndex += span;
    });

    // Identify the Average group (last group) and the attack-type groups before it
    const avgGroupIndex = groups.findIndex((g) =>
      g.label.toLowerCase().includes("average")
    );
    const attackGroups =
      avgGroupIndex >= 0 ? groups.slice(0, avgGroupIndex) : groups;
    const averageGroup = avgGroupIndex >= 0 ? groups[avgGroupIndex] : null;

    // Process rows
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const dataRows = rows.filter((row) => {
      const firstCell = row.querySelector("td");
      return firstCell && !firstCell.querySelector("strong");
    });

    // Attack type weights based on the actual task statistics (percentage shares)
    const weights = {
      CT: 3.67, // Credential Theft
      EPM: 0.41, // Excessive Privileges Misuse
      FO: 9.39, // Function Overlapping
      FRI: 5.71, // Function Return Injection
      MCE: 4.08, // Malicious Code Execution
      PM: 8.98, // Preference Manipulation
      RAC: 4.08, // Remote Access Control
      RADE: 0.82, // Retrieval-Agent Deception
      RPA: 2.86, // Rug Pull Attack
      CI: 12.65, // Tool Poisoning-Command Injection
      FSP: 2.86, // Tool Poisoning-FileSystem Poisoning
      FDI: 9.39, // Tool Poisoning-Function Dependency Injection
      NRP: 2.45, // Tool Poisoning-Network Request Poisoning
      PP: 7.35, // Tool Poisoning-Parameter Poisoning
      TR: 4.49, // Tool Poisoning-Tool Redirection
      TS: 8.57, // Tool Shadowing
      DT: 3.27, // Data Tampering
      IS: 0.41, // Identity Spoofing
      II: 4.9, // Intent Injection
      RI: 3.67, // Replay Injection
    };

    dataRows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const dataCells = cells.slice(1); // exclude model name

      let sumNo = 0,
        wNo = 0,
        sumYes = 0,
        wYes = 0;

      attackGroups.forEach((g) => {
        // Expect span = 2 for each attack group: [❌, ✅]
        const withoutCell = dataCells[g.start];
        const withCell = dataCells[g.start + 1];
        const vNo = withoutCell
          ? parseFloat(withoutCell.textContent.trim().replace("%", ""))
          : NaN;
        const vYes = withCell
          ? parseFloat(withCell.textContent.trim().replace("%", ""))
          : NaN;
        const weight = weights[g.label] || 0;
        if (!isNaN(vNo) && weight > 0) {
          sumNo += vNo * weight;
          wNo += weight;
        }
        if (!isNaN(vYes) && weight > 0) {
          sumYes += vYes * weight;
          wYes += weight;
        }
      });

      const avgNo = wNo ? (sumNo / wNo).toFixed(2) : "";
      const avgYes = wYes ? (sumYes / wYes).toFixed(2) : "";

      // Write into Average group cells, or append if missing
      if (averageGroup) {
        // Ensure there are enough cells
        while (dataCells.length < averageGroup.start + 2) {
          const td = document.createElement("td");
          row.appendChild(td);
          dataCells.push(td);
        }
        dataCells[averageGroup.start].textContent = avgNo;
        dataCells[averageGroup.start + 1].textContent = avgYes;

        // Optional styling
        [
          dataCells[averageGroup.start],
          dataCells[averageGroup.start + 1],
        ].forEach((td) => {
          td.style.fontWeight = "700";
          td.style.background = "#eff6ff";
        });
      } else {
        const tdNo = document.createElement("td");
        const tdYes = document.createElement("td");
        tdNo.textContent = avgNo;
        tdYes.textContent = avgYes;
        row.appendChild(tdNo);
        row.appendChild(tdYes);
      }
    });
  }

  // Calculate Table 1 Overall four columns (TSR❌/TSR✅/ASR❌/ASR✅) using domain weights
  function calculateTable1Overall() {
    // Find Table 1: the first .leaderboard-table inside .results-tables
    const tables = document.querySelectorAll(
      ".results-tables .leaderboard-table"
    );
    const table = tables[0];
    if (!table) {
      console.warn("Table 1 not found");
      return;
    }

    // Parse header groups to identify domain groups and the Overall group
    const thead = table.querySelector("thead");
    const headerRows = thead ? thead.querySelectorAll("tr") : [];
    if (headerRows.length < 1) {
      console.warn("Table 1 header missing");
      return;
    }
    const groupRow = headerRows[0];
    const groupHeaders = Array.from(groupRow.querySelectorAll("th"));

    let dataColIndex = 0; // index within data cells (excluding model column)
    const groups = [];
    groupHeaders.forEach((th, idx) => {
      const label = (th.textContent || "").trim();
      const span = parseInt(th.getAttribute("colspan") || "1", 10);
      if (idx === 0) return; // skip Model
      if (span <= 1) return; // skip Score (rowspan)
      groups.push({ label, start: dataColIndex, span });
      dataColIndex += span; // each domain has 4 columns
    });

    const overallIdx = groups.findIndex((g) =>
      g.label.toLowerCase().includes("overall")
    );
    if (overallIdx < 0) {
      console.warn("Overall group not found in Table 1 header");
      return;
    }
    const overallGroup = groups[overallIdx];
    const domainGroups = groups.slice(0, overallIdx);

    // Domain weights (percentages)
    const weights = {
      "Repository Management": 22.86,
      "Location Navigation": 21.63,
      "Financial Analysis": 21.63,
      "Web Searching": 21.63,
      "Browser Automation": 12.24,
    };

    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const dataRows = rows.filter((row) => {
      const firstCell = row.querySelector("td");
      return firstCell && !firstCell.querySelector("strong");
    });

    dataRows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const dataCells = cells.slice(1); // exclude model name column

      let sumTSRNo = 0,
        wTSRNo = 0,
        sumTSRYes = 0,
        wTSRYes = 0,
        sumASRNo = 0,
        wASRNo = 0,
        sumASRYes = 0,
        wASRYes = 0;

      domainGroups.forEach((g) => {
        const w = weights[g.label] || 0;
        if (w <= 0) return;

        // Each domain group has 4 columns: [TSR❌, TSR✅, ASR❌, ASR✅]
        const tsrNo = parseFloat(
          (dataCells[g.start]?.textContent || "").trim()
        );
        const tsrYes = parseFloat(
          (dataCells[g.start + 1]?.textContent || "").trim()
        );
        const asrNo = parseFloat(
          (dataCells[g.start + 2]?.textContent || "").trim()
        );
        const asrYes = parseFloat(
          (dataCells[g.start + 3]?.textContent || "").trim()
        );

        if (!isNaN(tsrNo)) {
          sumTSRNo += tsrNo * w;
          wTSRNo += w;
        }
        if (!isNaN(tsrYes)) {
          sumTSRYes += tsrYes * w;
          wTSRYes += w;
        }
        if (!isNaN(asrNo)) {
          sumASRNo += asrNo * w;
          wASRNo += w;
        }
        if (!isNaN(asrYes)) {
          sumASRYes += asrYes * w;
          wASRYes += w;
        }
      });

      const avgTSRNo = wTSRNo ? (sumTSRNo / wTSRNo).toFixed(2) : "";
      const avgTSRYes = wTSRYes ? (sumTSRYes / wTSRYes).toFixed(2) : "";
      const avgASRNo = wASRNo ? (sumASRNo / wASRNo).toFixed(2) : "";
      const avgASRYes = wASRYes ? (sumASRYes / wASRYes).toFixed(2) : "";

      // Ensure Overall cells exist, then write values
      while (dataCells.length < overallGroup.start + 4) {
        const td = document.createElement("td");
        row.appendChild(td);
        dataCells.push(td);
      }
      dataCells[overallGroup.start].textContent = avgTSRNo;
      dataCells[overallGroup.start + 1].textContent = avgTSRYes;
      dataCells[overallGroup.start + 2].textContent = avgASRNo;
      dataCells[overallGroup.start + 3].textContent = avgASRYes;

      // Subtle emphasis
      [
        dataCells[overallGroup.start],
        dataCells[overallGroup.start + 1],
        dataCells[overallGroup.start + 2],
        dataCells[overallGroup.start + 3],
      ].forEach((td) => {
        td.style.fontWeight = "700";
        td.style.background = "#eef2ff";
      });
    });
  }

  // Execute after DOM is ready
  calculateTable1Overall();
  calculateTable2Averages();

  // Calculate composite scores for Table 1 using Overall (output: one cell shows ❌ and ✅ scores)
  function calculateCompositeScores() {
    // Weight parameters
    const W1 = 0.6; // Weight of task success rate under safety conditions
    const W2 = 0.4; // Weight of pure safety (lower ASR)

    // Locate Table 1 (the first table) and parse header to find Overall group
    const tables = document.querySelectorAll(
      ".results-tables .leaderboard-table"
    );
    const table = tables[0];
    if (!table) {
      console.log("Table 1 not found for composite score");
      return;
    }

    const thead = table.querySelector("thead");
    const headerRows = thead ? thead.querySelectorAll("tr") : [];
    if (headerRows.length < 1) return;
    const groupRow = headerRows[0];
    const groupHeaders = Array.from(groupRow.querySelectorAll("th"));
    let dataColIndex = 0;
    const groups = [];
    groupHeaders.forEach((th, idx) => {
      const label = (th.textContent || "").trim();
      const span = parseInt(th.getAttribute("colspan") || "1", 10);
      if (idx === 0) return; // Model
      if (span <= 1) return; // Score header (rowspan)
      groups.push({ label, start: dataColIndex, span });
      dataColIndex += span;
    });
    const overall = groups.find((g) =>
      g.label.toLowerCase().includes("overall")
    );
    if (!overall) return;

    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const dataRows = rows.filter((row) => {
      const firstCell = row.querySelector("td");
      return firstCell && !firstCell.querySelector("strong");
    });

    dataRows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const dataCells = cells.slice(1);

      // Overall without prompt: TSR❌ at start+0, ASR❌ at start+2
      const tsrNo = parseFloat(
        (dataCells[overall.start]?.textContent || "").trim()
      );
      const asrNo = parseFloat(
        (dataCells[overall.start + 2]?.textContent || "").trim()
      );
      // Overall with prompt: TSR✅ at start+1, ASR✅ at start+3
      const tsrYes = parseFloat(
        (dataCells[overall.start + 1]?.textContent || "").trim()
      );
      const asrYes = parseFloat(
        (dataCells[overall.start + 3]?.textContent || "").trim()
      );

      let scoreNo = null;
      let scoreYes = null;
      if (!isNaN(tsrNo) && !isNaN(asrNo)) {
        scoreNo = tsrNo * (1 - asrNo / 100) * W1 + (100 - asrNo) * W2;
      }
      if (!isNaN(tsrYes) && !isNaN(asrYes)) {
        scoreYes = tsrYes * (1 - asrYes / 100) * W1 + (100 - asrYes) * W2;
      }

      // Ensure two Score columns exist right after Overall group
      while (dataCells.length < overall.start + 6) {
        const td = document.createElement("td");
        row.appendChild(td);
        dataCells.push(td);
      }
      const scoreNoCell = dataCells[overall.start + 4];
      const scoreYesCell = dataCells[overall.start + 5];
      scoreNoCell.textContent = scoreNo !== null ? scoreNo.toFixed(2) : "";
      scoreYesCell.textContent = scoreYes !== null ? scoreYes.toFixed(2) : "";

      // Optional styling
      [scoreNoCell, scoreYesCell].forEach((td) => {
        td.style.fontWeight = "700";
        td.style.background = "#f0fdf4"; // light green tint
      });
    });
  }

  // Invoke composite score calculation function
  calculateCompositeScores();
  // Re-run highlight after averages and scores are populated (ensures Average columns are included)
  if (typeof highlightMaxValues === "function") {
    highlightMaxValues();
  }
});
// Highlight maximum values in each column
function highlightMaxValues() {
  const tables = document.querySelectorAll(
    ".results-tables .leaderboard-table"
  );

  tables.forEach((table) => {
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    // Filter out category rows (Proprietary Models, Open-Source Models)
    const dataRows = rows.filter((row) => {
      const firstCell = row.querySelector("td");
      return firstCell && !firstCell.querySelector("strong");
    });

    if (dataRows.length === 0) return;

    // Determine per-column direction: true = higher is better (↑), false = lower is better (↓)
    const thead = table.querySelector("thead");
    const headerRows = thead ? Array.from(thead.querySelectorAll("tr")) : [];

    // Try to find a header row that includes "TSR"/"ASR"
    let tsrAsrRow = headerRows.find((tr) =>
      Array.from(tr.querySelectorAll("th")).some((th) =>
        /(TSR|ASR)/i.test((th.textContent || "").trim())
      )
    );

    const directionForCols = []; // index aligned to data columns (skip Model)
    if (tsrAsrRow) {
      const ths = Array.from(tsrAsrRow.querySelectorAll("th"));
      let started = false; // skip the first empty th in that row if present
      ths.forEach((th) => {
        const text = (th.textContent || "").trim();
        const span = parseInt(th.getAttribute("colspan") || "1", 10);
        // Heuristic: The first meaningful cell often is empty; only start when contains TSR/ASR
        if (!/(TSR|ASR)/i.test(text)) {
          // If we haven't started mapping yet, skip; otherwise keep padding
          if (started) {
            for (let i = 0; i < span; i++) directionForCols.push(false);
          }
          return;
        }
        started = true;
        const higherIsBetter = /↑/.test(text) || /TSR/i.test(text);
        for (let i = 0; i < span; i++) directionForCols.push(higherIsBetter);
      });
    } else {
      // No TSR/ASR header row -> assume this table is ASR-only (like Table 2)
      const sampleRow = dataRows[0];
      const totalDataCols = sampleRow.querySelectorAll("td").length - 1;
      for (let i = 0; i < totalDataCols; i++) directionForCols.push(false);
    }

    // Get number of columns (excluding first column which is model name)
    const numCols = dataRows[0].querySelectorAll("td").length - 1;

    // For each column (starting from index 1, skipping model name)
    for (let colIndex = 1; colIndex <= numCols; colIndex++) {
      const values = [];
      const cells = [];

      // Collect all values in this column
      dataRows.forEach((row) => {
        const cell = row.querySelectorAll("td")[colIndex];
        if (cell && cell.textContent.trim() !== "") {
          const value = parseFloat(cell.textContent.trim());
          if (!isNaN(value)) {
            values.push(value);
            cells.push({ cell, value });
          }
        }
      });

      if (values.length === 0) continue;

      // Determine direction: default to higher for appended Score columns beyond mapping
      const higherIsBetter =
        colIndex - 1 < directionForCols.length
          ? directionForCols[colIndex - 1]
          : true; // Score↑

      const targetValue = higherIsBetter
        ? Math.max(...values)
        : Math.min(...values);

      // Highlight cells with target value
      cells.forEach(({ cell, value }) => {
        if (value === targetValue) {
          cell.style.fontWeight = "700";
          cell.style.color = "#059669";
          cell.style.background = "rgba(5, 150, 105, 0.1)";
          cell.style.borderRadius = "4px";
          cell.style.padding = "1rem 0.75rem";
        }
      });
    }
  });
}

// Note: highlightMaxValues is invoked after table computations inside DOMContentLoaded above
// Extracted from inline scripts
// Tasks page functionality
const domainConfig = {
  location_navigation: {
    icon: "🗺️",
    title: "Location Navigation",
    id: "location-navigation",
  },
  repository_management: {
    icon: "📁",
    title: "Repository Management",
    id: "repository-management",
  },
  financial_analysis: {
    icon: "💰",
    title: "Financial Analysis",
    id: "financial-analysis",
  },
  browser_automation: {
    icon: "🌐",
    title: "Browser Automation",
    id: "browser-automation",
  },
  web_search: {
    icon: "🔍",
    title: "Web Search",
    id: "web-search",
  },
};

function initializeTasks() {
  const container = document.getElementById("domains-container");
  const tasksData = window.TASKS_DATA;

  if (!tasksData) {
    container.innerHTML =
      '<div class="loading"><p>Error: Task data not loaded</p></div>';
    return;
  }

  let totalTasks = 0;
  let attackTasks = 0;
  let html = "";

  // Generate HTML for each domain
  Object.keys(domainConfig).forEach((domainKey) => {
    const domain = tasksData[domainKey];
    if (!domain || !domain.tasks) return;

    const tasks = domain.tasks;
    totalTasks += tasks.length;
    attackTasks += tasks.filter((t) => t.attack_category).length;

    const config = domainConfig[domainKey];

    html += `
                    <div class="domain-section" id="${config.id}">
                        <div class="domain-header" style="cursor: pointer;">
                            <span class="domain-icon">${config.icon}</span>
                            <h2 class="domain-title">${config.title}</h2>
                            <span class="domain-count">${
                              tasks.length
                            } tasks</span>
                            <i class="fas fa-chevron-down domain-expand-icon" style="margin-left: 0.5rem; transition: transform 0.3s;"></i>
                        </div>
                        <div class="tasks-grid collapsed">
                            ${tasks
                              .map((task, index) =>
                                createTaskCard(task, domainKey, index)
                              )
                              .join("")}
                        </div>
                    </div>
                `;
  });

  container.innerHTML = html;

  // Stats are now static based on paper data

  // Add event listeners to domain headers for expand/collapse
  document.querySelectorAll(".domain-header").forEach((header) => {
    header.addEventListener("click", function () {
      const domainSection = this.closest(".domain-section");
      const tasksGrid = domainSection.querySelector(".tasks-grid");
      const expandIcon = this.querySelector(".domain-expand-icon");
      
      if (tasksGrid.classList.contains("collapsed")) {
        tasksGrid.classList.remove("collapsed");
        tasksGrid.classList.add("expanded");
        expandIcon.classList.remove("fa-chevron-down");
        expandIcon.classList.add("fa-chevron-up");
      } else {
        tasksGrid.classList.remove("expanded");
        tasksGrid.classList.add("collapsed");
        expandIcon.classList.remove("fa-chevron-up");
        expandIcon.classList.add("fa-chevron-down");
      }
    });
  });

  // Add event listeners to view buttons
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const card = this.closest(".task-card");
      const domain = card.dataset.domain;
      const index = parseInt(card.dataset.index);
      const task = tasksData[domain].tasks[index];
      showTaskDetails(task);
    });
  });
}

function createTaskCard(task, domain, index) {
  const attackBadge = task.attack_category
    ? `<span class="attack-badge">${task.attack_category}</span>`
    : "";

  return `
                <div class="task-card" data-domain="${domain}" data-index="${index}">
                    <div class="task-head">
                        <div class="task-id">${
                          task.id || `Task ${index + 1}`
                        }</div>
                        <div class="task-category">${
                          task.category || "General"
                        }</div>
                    </div>
                    <div class="task-question">${
                      task.question || "No description available"
                    }</div>
                    <div class="task-footer">
                        ${attackBadge}
                        <button class="view-btn">View Details</button>
                    </div>
                </div>
            `;
}

function showTaskDetails(task) {
  const modal = document.getElementById("taskModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");

  modalTitle.textContent = task.id || "Task Details";
  modalContent.textContent = JSON.stringify(task, null, 2);
  modal.classList.add("active");
}

// Modal controls
document.getElementById("modalClose").addEventListener("click", () => {
  document.getElementById("taskModal").classList.remove("active");
});

document.getElementById("taskModal").addEventListener("click", (e) => {
  if (e.target.id === "taskModal") {
    document.getElementById("taskModal").classList.remove("active");
  }
});

// Search functionality
document.getElementById("searchInput").addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  const taskCards = document.querySelectorAll(".task-card");

  taskCards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

// Navigation
document.querySelectorAll(".domain-nav-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    // Update active state
    document
      .querySelectorAll(".domain-nav-link")
      .forEach((l) => l.classList.remove("active"));
    this.classList.add("active");

    // Scroll to section
    const targetId = this.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Scroll spy
window.addEventListener("scroll", function () {
  const sections = document.querySelectorAll(".domain-section, #overview");
  const navLinks = document.querySelectorAll(".domain-nav-link");

  let current = "overview";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

// Initialize on load
document.addEventListener("DOMContentLoaded", initializeTasks);
