checkAuth();

// Comprehensive 18 category infrastructure object layout mapping
const categoryDefinitions = [
    "Web Frontend", "Node API Ecosystems", "Python Pipeline Utilities", "UI/UX High Fidelity",
    "Data Infrastructure", "Cloud Scaling", "Cyber Audit Profiles", "Mobile Swift Modules",
    "Devops Provisioning", "Embedded Systems C", "Technical Copywriting", "Quality Manual Automation",
    "Business Analytics", "Search Strategy Vectors", "Graphics Engine Assets", "Database Tuning Protocols",
    "Machine Optimization Models", "System Architecture Blueprints"
];

const sampleDataPool = [
    { id: "p1", title: "Automated Data Ingestion Pipeline", category: "Python Pipeline Utilities", type: "Automation", stipend: 350, outcome: "JSON Validation Schema Scripting" },
    { id: "p2", title: "Responsive Admin Panel Component", category: "Web Frontend", type: "Frontend", stipend: 180, outcome: "Clean CSS Grid View Layout Specs" },
    { id: "p3", title: "Express Server Auth Core Middleware", category: "Node API Ecosystems", type: "Backend", stipend: 600, outcome: "Stateless JWT Session Verification Matrix" }
];

function initBrowseView() {
    // Populate the 18 static design grid array blocks
    const catGrid = document.getElementById('allCategoriesGrid');
    catGrid.innerHTML = categoryDefinitions.map(cat => `
        <div class="category-icon-card" onclick="filterByDirectCategory('${cat}')">
          <div style="background: var(--soft-purple); width:24px; height:24px; border-radius:4px; margin:0 auto 8px auto;"></div>
          <span>${cat}</span>
        </div>
    `).join('');

    // Populate recommendation slots
    const recGrid = document.getElementById('recommendedGrid');
    recGrid.innerHTML = sampleDataPool.slice(0, 2).map(item => `
        <div class="sb-card" style="border: 1px solid var(--primary);">
            <span class="badge" style="background:var(--soft-blue); color:var(--dark-bg);">${item.category}</span>
            <h4 style="margin: 10px 0 6px 0;">${item.title}</h4>
            <p style="font-size:0.85rem; color:#555;">Stipend Allocation: <strong>$${item.stipend}</strong></p>
        </div>
    `).join('');

    renderMasterProjectList(sampleDataPool);
    attachFilters();
}

function renderMasterProjectList(data) {
    const grid = document.getElementById('projectsMasterGrid');
    if(data.length === 0) {
        grid.innerHTML = `<p style="padding:20px; color:#666;">No valid open sprint architectures matched your request filters.</p>`;
        return;
    }

    grid.innerHTML = data.map(project => `
        <div class="sb-card" style="display:flex; justify-content:between; align-items:center; flex-wrap:wrap; gap:15px;">
          <div style="flex:2; min-width:250px;">
             <span class="badge" style="background: var(--soft-purple); color:#333;">${project.category}</span>
             <h4 style="margin: 8px 0 4px 0; color:var(--dark-bg);">${project.title}</h4>
             <p style="font-size:0.9rem; color:#444;"><strong>Outcome Obligation:</strong> ${project.outcome}</p>
          </div>
          <div style="flex:1; text-align:right; min-width:120px;">
             <h3 style="color:var(--primary); margin-bottom:10px;">$${project.stipend}</h3>
             <a href="agreements.html?id=${project.id}" class="btn-primary" style="padding:8px 16px; border-radius:6px; text-decoration:none; font-size:0.9rem; display:inline-block;">Review Commitment</a>
          </div>
        </div>
    `).join('');
}

function attachFilters() {
    const search = document.getElementById('projectSearch');
    const typeF = document.getElementById('typeFilter');
    const stipF = document.getElementById('stipendFilter');

    const executeFilterQuery = () => {
        const query = search.value.toLowerCase();
        const selectedType = typeF.value;
        const minStipend = parseInt(stipF.value || 0);

        const filtered = sampleDataPool.filter(p => {
            const matchTxt = p.title.toLowerCase().includes(query) || p.outcome.toLowerCase().includes(query);
            const matchType = selectedType === "" || p.type === selectedType;
            const matchStipend = p.stipend >= minStipend;
            return matchTxt && matchType && matchStipend;
        });
        renderMasterProjectList(filtered);
    };

    search.addEventListener('input', executeFilterQuery);
    typeF.addEventListener('change', executeFilterQuery);
    stipF.addEventListener('change', executeFilterQuery);
}

function filterByDirectCategory(catName) {
    document.getElementById('projectSearch').value = "";
    const filtered = sampleDataPool.filter(p => p.category === catName);
    renderMasterProjectList(filtered);
}

document.addEventListener('DOMContentLoaded', initBrowseView);