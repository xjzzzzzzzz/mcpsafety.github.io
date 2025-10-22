// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Add click event to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to current button
            this.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            // Show target tab content
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Expandable task categories
    const taskHeaders = document.querySelectorAll('.task-header');
    taskHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task');
            const taskContent = document.getElementById(`${taskId}-tasks`);
            
            // Toggle active class on header
            this.classList.toggle('active');
            
            // Toggle active class on content
            if (taskContent) {
                taskContent.classList.toggle('active');
            }
        });
    });

    // Smooth scroll to anchor
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Top navbar scroll spy (set active nav-link on section in view)
    const topNavLinks = document.querySelectorAll('.nav-links a');
    const sectionIds = ['overview', 'tasks', 'results', 'attack-types', 'getting-started'];
    const idToLink = new Map();
    topNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const id = href.substring(1);
            idToLink.set(id, link);
        }
    });

    const observedSections = sectionIds
        .map(id => document.getElementById(id))
        .filter(Boolean);

    let currentActiveId = null;
    const navObserver = new IntersectionObserver((entries) => {
        let best = { id: null, ratio: 0 };
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > best.ratio) {
                best = { id: entry.target.id, ratio: entry.intersectionRatio };
            }
        });
        if (best.id && best.id !== currentActiveId) {
            currentActiveId = best.id;
            topNavLinks.forEach(l => l.classList.remove('active'));
            const link = idToLink.get(best.id);
            if (link) link.classList.add('active');
        }
    }, {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: '-80px 0px -50% 0px'
    });

    observedSections.forEach(sec => navObserver.observe(sec));

    // Fallback: scroll-based spy if IO misses
    function updateActiveByScroll() {
        let bestId = null;
        let bestDistance = Infinity;
        observedSections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            const headerOffset = 80; // sticky header height approx
            const distance = Math.abs(rect.top - headerOffset - window.innerHeight * 0.2);
            if (distance < bestDistance && rect.bottom > headerOffset && rect.top < window.innerHeight * 0.8) {
                bestDistance = distance;
                bestId = sec.id;
            }
        });
        if (bestId && bestId !== currentActiveId) {
            currentActiveId = bestId;
            topNavLinks.forEach(l => l.classList.remove('active'));
            const link = idToLink.get(bestId);
            if (link) link.classList.add('active');
        }
    }

    window.addEventListener('scroll', updateActiveByScroll, { passive: true });
    updateActiveByScroll();

    // Navbar scroll effect (guard missing .navbar)
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (!navbar) return; // guard
        const currentScroll = window.pageYOffset;
        if (currentScroll <= 0) {
            navbar.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all card elements
    const cards = document.querySelectorAll('.feature-card, .security-card, .attack-card, .insight-card, .step, .task-category');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // Code copy functionality
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.innerHTML = 'Copy';
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

        pre.style.position = 'relative';
        pre.appendChild(button);

        pre.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
        });

        pre.addEventListener('mouseleave', () => {
            button.style.opacity = '0';
        });

        button.addEventListener('click', async () => {
            const code = block.textContent;
            try {
                await navigator.clipboard.writeText(code);
                button.innerHTML = 'Copied!';
                button.style.background = '#10b981';
                button.style.color = 'white';
                setTimeout(() => {
                    button.innerHTML = 'Copy';
                    button.style.background = 'rgba(255, 255, 255, 0.9)';
                    button.style.color = '#1f2937';
                }, 2000);
            } catch (err) {
                console.error('Copy failed:', err);
                button.innerHTML = 'Failed';
                setTimeout(() => {
                    button.innerHTML = 'Copy';
                }, 2000);
            }
        });
    });

    // Responsive navigation menu
    const createMobileMenu = () => {
        const navMenu = document.querySelector('.nav-menu');
        const navContainer = document.querySelector('.nav-container');

        if (window.innerWidth <= 768) {
            if (!document.querySelector('.menu-toggle')) {
                const menuToggle = document.createElement('button');
                menuToggle.className = 'menu-toggle';
                menuToggle.innerHTML = '☰';
                menuToggle.style.cssText = `
                    display: block;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-primary);
                `;

                navContainer.insertBefore(menuToggle, navMenu);

                menuToggle.addEventListener('click', () => {
                    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
                });
            }
        } else {
            const menuToggle = document.querySelector('.menu-toggle');
            if (menuToggle) {
                menuToggle.remove();
                navMenu.style.display = 'flex';
            }
        }
    };

    createMobileMenu();
    window.addEventListener('resize', createMobileMenu);

    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
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
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const value = parseInt(stat.textContent);
        observer.observe(stat);
        stat.addEventListener('intersect', () => {
            animateValue(stat, 0, value, 2000);
        }, { once: true });
    });
});

// Theme toggle functionality (optional)
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
}

// Scroll to top button
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let scrollToTopBtn = document.getElementById('scrollToTop');

    if (scrollTop > 300) {
        if (!scrollToTopBtn) {
            scrollToTopBtn = document.createElement('button');
            scrollToTopBtn.id = 'scrollToTop';
            scrollToTopBtn.innerHTML = '↑';
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

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            scrollToTopBtn.addEventListener('mouseenter', () => {
                scrollToTopBtn.style.transform = 'scale(1.1)';
            });

            scrollToTopBtn.addEventListener('mouseleave', () => {
                scrollToTopBtn.style.transform = 'scale(1)';
            });
        }
        scrollToTopBtn.style.display = 'block';
    } else if (scrollToTopBtn) {
        scrollToTopBtn.style.display = 'none';
    }
});




// Extracted from inline scripts
// Tab functionality
        document.addEventListener('DOMContentLoaded', function () {
            // Leaderboard tabs
            const leaderboardTabButtons = document.querySelectorAll('#leaderboard .tab-button');
            const leaderboardTabContents = document.querySelectorAll('#leaderboard .tab-content');

            leaderboardTabButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const targetTab = this.getAttribute('data-tab');

                    // Remove active class from all leaderboard buttons and contents
                    leaderboardTabButtons.forEach(btn => btn.classList.remove('active'));
                    leaderboardTabContents.forEach(content => content.classList.remove('active'));

                    // Add active class to clicked button and corresponding content
                    this.classList.add('active');
                    document.getElementById(targetTab + '-tab').classList.add('active');
                });
            });

            // Attack types tabs
            const attackTabButtons = document.querySelectorAll('#attack-types .tab-button');
            const attackTabContents = document.querySelectorAll('#attack-types .tab-content');

            attackTabButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const targetTab = this.getAttribute('data-tab');

                    // Remove active class from all attack type buttons and contents
                    attackTabButtons.forEach(btn => btn.classList.remove('active'));
                    attackTabContents.forEach(content => content.classList.remove('active'));

                    // Add active class to clicked button and corresponding content
                    this.classList.add('active');
                    document.getElementById(targetTab + '-tab').classList.add('active');
                });
            });
            // Smooth scrolling for navigation links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    // Scope active state to the clicked anchor's own nav container
                    const topNavContainer = this.closest('.nav-links');
                    const sideNavContainer = this.closest('.domain-nav');

                    if (topNavContainer) {
                        topNavContainer.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                        this.classList.add('active');
                    } else if (sideNavContainer) {
                        sideNavContainer.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                        this.classList.add('active');
                    }

                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });

            // Highlight maximum values in each column
            function highlightMaxValues() {
                const tables = document.querySelectorAll('.results-tables .leaderboard-table');

                tables.forEach(table => {
                    const tbody = table.querySelector('tbody');
                    if (!tbody) return;

                    const rows = Array.from(tbody.querySelectorAll('tr'));
                    // Filter out category rows (Proprietary Models, Open-Source Models)
                    const dataRows = rows.filter(row => {
                        const firstCell = row.querySelector('td');
                        return firstCell && !firstCell.querySelector('strong');
                    });

                    if (dataRows.length === 0) return;

                    // Get number of columns (excluding first column which is model name)
                    const numCols = dataRows[0].querySelectorAll('td').length - 1;

                    // For each column (starting from index 1, skipping model name)
                    for (let colIndex = 1; colIndex <= numCols; colIndex++) {
                        const values = [];
                        const cells = [];

                        // Collect all values in this column
                        dataRows.forEach(row => {
                            const cell = row.querySelectorAll('td')[colIndex];
                            if (cell && cell.textContent.trim() !== '') {
                                const value = parseFloat(cell.textContent.trim());
                                if (!isNaN(value)) {
                                    values.push(value);
                                    cells.push({ cell, value });
                                }
                            }
                        });

                        if (values.length === 0) continue;

                        // Find maximum value
                        // For TSR columns (↑), higher is better
                        // For ASR columns (↓), lower is better
                        const header = table.querySelectorAll('thead tr:last-child th')[colIndex];
                        const headerText = header ? header.textContent.trim() : '';
                        const isDescending = headerText.includes('↑');

                        const maxValue = isDescending ? Math.max(...values) : Math.min(...values);

                        // Highlight cells with maximum value
                        cells.forEach(({ cell, value }) => {
                            if (value === maxValue) {
                                cell.style.fontWeight = '700';
                                cell.style.color = '#059669';
                                cell.style.background = 'rgba(5, 150, 105, 0.1)';
                                cell.style.borderRadius = '4px';
                                cell.style.padding = '1rem 0.75rem';
                            }
                        });
                    }
                });
            }

            // Call the function after DOM is loaded
            highlightMaxValues();

            // Calculate weighted averages for Table 7
            function calculateWeightedAverages() {
                // Find the second table (Table 7) specifically
                const tables = document.querySelectorAll('.results-tables .leaderboard-table');
                const table = tables[1]; // Table 7 is the second table
                if (!table) {
                    console.log('Table 7 not found');
                    return;
                }

                // Attack type weights based on the actual task statistics
                const weights = {
                    'CT': 3.67,    // Credential Theft
                    'EPO': 0.41,   // Excessive Privileges Misuse
                    'FO': 9.39,    // Function Overlapping
                    'FRI': 5.71,   // Function Return Injection
                    'MCE': 4.08,   // Malicious Code Execution
                    'PMA': 8.98,   // Preference Manipulation Attack
                    'RAC': 4.08,   // Remote Access Control
                    'RADE': 0.82,  // Retrieval-Agent Deception
                    'RPA': 2.86,   // Rug Pull Attack
                    'CSI': 12.65,  // Tool Poisoning-Command Injection
                    'TFS': 2.86,   // Tool Poisoning-File System Poisoning
                    'TFD': 9.39,   // Tool Poisoning-Function Dependency Poisoning
                    'TNR': 2.45,   // Tool Poisoning-Network Request Poisoning
                    'TPA': 7.35,   // Tool Poisoning-Parameter Poisoning
                    'TTR': 4.49,   // Tool Poisoning-Tool Redirection
                    'TSA': 8.57,   // Tool Shadowing Attack
                    'DI': 3.27,    // Data Injection
                    'IdI': 0.41,   // Identity Injection
                    'II': 4.90,    // Intent Injection
                    'RI': 3.67     // Replay Injection
                };

                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));

                // Filter out category rows
                const dataRows = rows.filter(row => {
                    const firstCell = row.querySelector('td');
                    return firstCell && !firstCell.querySelector('strong');
                });

                console.log('Found data rows:', dataRows.length);

                dataRows.forEach((row, rowIndex) => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    const dataCells = cells.slice(1); // Exclude model name, include all data cells

                    let weightedSum = 0;
                    let totalWeight = 0;

                    console.log(`Processing row ${rowIndex + 1}, cells:`, dataCells.length);

                    dataCells.forEach((cell, index) => {
                        const value = parseFloat(cell.textContent.trim());
                        if (!isNaN(value)) {
                            // Get the attack type abbreviation from the header
                            const header = table.querySelectorAll('thead tr:last-child th')[index + 1];
                            const attackType = header ? header.textContent.trim() : '';

                            if (weights[attackType]) {
                                weightedSum += value * weights[attackType];
                                totalWeight += weights[attackType];
                                console.log(`Attack type: ${attackType}, Value: ${value}, Weight: ${weights[attackType]}`);
                            }
                        }
                    });

                    const weightedAverage = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : '0.00';
                    console.log(`Row ${rowIndex + 1} weighted average: ${weightedAverage}`);

                    // Create new average cell
                    const averageCell = document.createElement('td');
                    averageCell.style.cssText = 'padding: 1rem 0.75rem; text-align: center; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 0.9rem; font-weight: 600; background: rgba(37, 99, 235, 0.05);';
                    averageCell.textContent = weightedAverage;
                    row.appendChild(averageCell);
                });
            }

            // Call the function after DOM is loaded
            calculateWeightedAverages();

            // Calculate composite scores for Table 4
            function calculateCompositeScores() {
                // 权重参数
                const W1 = 0.6;  // 安全条件下任务完成率的权重
                const W2 = 0.4;  // 纯安全性的权重

                // 找到Table 4（第一个表格）
                const tables = document.querySelectorAll('.results-tables .leaderboard-table');
                const table = tables[0]; // Table 4 是第一个表格

                if (!table) {
                    console.log('Table 4 not found');
                    return;
                }

                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));

                // 过滤出数据行（排除分类标题行）
                const dataRows = rows.filter(row => {
                    const firstCell = row.querySelector('td');
                    return firstCell && !firstCell.querySelector('strong');
                });

                console.log('Found data rows:', dataRows.length);

                dataRows.forEach((row, rowIndex) => {
                    const cells = Array.from(row.querySelectorAll('td'));

                    // Overall TSR 是倒数第二列，Overall ASR 是倒数第一列
                    const tsrCell = cells[cells.length - 2];
                    const asrCell = cells[cells.length - 1];

                    if (tsrCell && asrCell) {
                        const tsr = parseFloat(tsrCell.textContent.trim());
                        const asr = parseFloat(asrCell.textContent.trim());

                        if (!isNaN(tsr) && !isNaN(asr)) {
                            // 计算综合分数
                            // Score = TSR × (1 - ASR/100) × w1 + (100 - ASR) × w2
                            const safetyAdjustedTSR = tsr * (1 - asr / 100);
                            const securityScore = 100 - asr;
                            const compositeScore = safetyAdjustedTSR * W1 + securityScore * W2;

                            console.log(`Row ${rowIndex + 1}: TSR=${tsr}, ASR=${asr}, Score=${compositeScore.toFixed(2)}`);

                            // 创建新的分数单元格
                            const scoreCell = document.createElement('td');
                            scoreCell.style.cssText = 'padding: 1rem 0.75rem; text-align: center; border-bottom: 1px solid #e5e7eb; font-weight: 700; background: #eff6ff; font-size: 0.95rem;';
                            scoreCell.textContent = compositeScore.toFixed(2);

                            // 添加到行尾
                            row.appendChild(scoreCell);
                        }
                    }
                });

                console.log('Composite scores calculated for Table 4');
            }

            // 调用综合分数计算函数
            calculateCompositeScores();
        });

// Extracted from inline scripts
// Tasks page functionality
        const domainConfig = {
            'location_navigation': {
                icon: '🗺️',
                title: 'Location Navigation',
                id: 'location-navigation'
            },
            'repository_management': {
                icon: '📁',
                title: 'Repository Management',
                id: 'repository-management'
            },
            'financial_analysis': {
                icon: '💰',
                title: 'Financial Analysis',
                id: 'financial-analysis'
            },
            'browser_automation': {
                icon: '🌐',
                title: 'Browser Automation',
                id: 'browser-automation'
            },
            'web_search': {
                icon: '🔍',
                title: 'Web Search',
                id: 'web-search'
            }
        };

        function initializeTasks() {
            const container = document.getElementById('domains-container');
            const tasksData = window.TASKS_DATA;

            if (!tasksData) {
                container.innerHTML = '<div class="loading"><p>Error: Task data not loaded</p></div>';
                return;
            }

            let totalTasks = 0;
            let attackTasks = 0;
            let html = '';

            // Generate HTML for each domain
            Object.keys(domainConfig).forEach(domainKey => {
                const domain = tasksData[domainKey];
                if (!domain || !domain.tasks) return;

                const tasks = domain.tasks;
                totalTasks += tasks.length;
                attackTasks += tasks.filter(t => t.attack_category).length;

                const config = domainConfig[domainKey];

                html += `
                    <div class="domain-section" id="${config.id}">
                        <div class="domain-header">
                            <span class="domain-icon">${config.icon}</span>
                            <h2 class="domain-title">${config.title}</h2>
                            <span class="domain-count">${tasks.length} tasks</span>
                        </div>
                        <div class="tasks-grid">
                            ${tasks.map((task, index) => createTaskCard(task, domainKey, index)).join('')}
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            // Stats are now static based on paper data

            // Add event listeners to task cards
            document.querySelectorAll('.task-card').forEach(card => {
                card.addEventListener('click', function (e) {
                    // Don't trigger if clicking the button
                    if (e.target.classList.contains('view-btn')) {
                        return;
                    }
                    const domain = this.dataset.domain;
                    const index = parseInt(this.dataset.index);
                    const task = tasksData[domain].tasks[index];
                    showTaskDetails(task);
                });
            });

            // Add event listeners to view buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const card = this.closest('.task-card');
                    const domain = card.dataset.domain;
                    const index = parseInt(card.dataset.index);
                    const task = tasksData[domain].tasks[index];
                    showTaskDetails(task);
                });
            });
        }

        function createTaskCard(task, domain, index) {
            const attackBadge = task.attack_category ?
                `<span class="attack-badge">${task.attack_category}</span>` : '';

            return `
                <div class="task-card" data-domain="${domain}" data-index="${index}">
                    <div class="task-head">
                        <div class="task-id">${task.id || `Task ${index + 1}`}</div>
                        <div class="task-category">${task.category || 'General'}</div>
                    </div>
                    <div class="task-question">${task.question || 'No description available'}</div>
                    <div class="task-footer">
                        ${attackBadge}
                        <button class="view-btn">View Details</button>
                    </div>
                </div>
            `;
        }

        function showTaskDetails(task) {
            const modal = document.getElementById('taskModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');

            modalTitle.textContent = task.id || 'Task Details';
            modalContent.textContent = JSON.stringify(task, null, 2);
            modal.classList.add('active');
        }

        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => {
            document.getElementById('taskModal').classList.remove('active');
        });

        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                document.getElementById('taskModal').classList.remove('active');
            }
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            const taskCards = document.querySelectorAll('.task-card');

            taskCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Navigation
        document.querySelectorAll('.domain-nav-link').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                // Update active state
                document.querySelectorAll('.domain-nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                // Scroll to section
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Scroll spy
        window.addEventListener('scroll', function () {
            const sections = document.querySelectorAll('.domain-section, #overview');
            const navLinks = document.querySelectorAll('.domain-nav-link');

            let current = 'overview';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (window.scrollY >= sectionTop) {
                    current = section.id;
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });

        // Initialize on load
        document.addEventListener('DOMContentLoaded', initializeTasks);