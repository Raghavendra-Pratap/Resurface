import{s as m}from"../../messages.js";function R(t){try{const{hostname:n}=new URL(t);return n.replace("www.","")}catch{return""}}function j(t){const n=Math.floor((Date.now()-t)/1e3);if(n<60)return"Just now";const e=Math.floor(n/60);if(e<60)return`${e}m ago`;const s=Math.floor(e/60);if(s<24)return`${s}h ago`;const i=Math.floor(s/24);if(i<7)return`${i}d ago`;const o=Math.floor(i/7);if(o<4)return`${o}w ago`;const r=Math.floor(i/30);return r<12?`${r}mo ago`:`${Math.floor(i/365)}y ago`}function u(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}const a={items:[],topics:[],intents:[],settings:null,currentFilter:"all",searchQuery:"",viewMode:"grid"};async function _(){await v(),y(),g(),O()}async function v(){try{a.items=await m("GET_ALL_ITEMS"),a.topics=await m("GET_ALL_TOPICS"),a.intents=await m("GET_ALL_INTENTS"),a.settings=await m("GET_SETTINGS"),A()}catch(t){console.error("Failed to load data:",t)}}function y(){document.getElementById("count-all").textContent=String(a.items.length);const t=new Date;t.setHours(0,0,0,0);const n=a.items.filter(i=>i.savedAt>=t.getTime()-7*24*60*60*1e3).length;document.getElementById("count-recent").textContent=String(n);const e=document.getElementById("topics-list");e.innerHTML=a.topics.map(i=>`
    <button class="nav-item" data-filter-type="topic" data-filter-id="${i.id}">
      <span class="nav-color-dot" style="background: ${i.color};"></span>
      <span>${u(i.name)}</span>
      <span class="nav-count">${i.itemCount}</span>
    </button>
  `).join("");const s=document.getElementById("intents-list");s.innerHTML=a.intents.map(i=>`
    <button class="nav-item" data-filter-type="intent" data-filter-id="${i.id}">
      <span>${i.emoji}</span>
      <span>${u(i.name)}</span>
      <span class="nav-count">${i.itemCount}</span>
    </button>
  `).join("")}function F(){let t=[...a.items];if(a.currentFilter==="recent"){const n=Date.now()-6048e5;t=t.filter(e=>e.savedAt>=n)}else if(typeof a.currentFilter=="object"&&a.currentFilter!==null){const n=a.currentFilter;n.type==="topic"?t=t.filter(e=>e.topicIds.includes(n.id)):t=t.filter(e=>e.intentIds.includes(n.id))}if(a.searchQuery){const n=a.searchQuery.toLowerCase();t=t.filter(e=>{var s;return e.title.toLowerCase().includes(n)||e.url.toLowerCase().includes(n)||((s=e.referrerQuery)==null?void 0:s.toLowerCase().includes(n))})}return t.sort((n,e)=>e.savedAt-n.savedAt),t}function g(){const t=document.getElementById("items-container"),n=document.getElementById("empty-state"),e=F();if(e.length===0){t.style.display="none",n.style.display="flex";return}t.style.display="grid",n.style.display="none",t.classList.toggle("list-view",a.viewMode==="list"),t.innerHTML=e.map(s=>{const i=a.topics.filter(l=>s.topicIds.includes(l.id)),o=a.intents.filter(l=>s.intentIds.includes(l.id)),r=R(s.url);return`
      <div class="item-card" data-item-id="${s.id}" data-url="${u(s.url)}">
        <div class="item-actions">
          <button class="item-action-btn" data-action="open" title="Open">
            <svg viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>
          <button class="item-action-btn delete" data-action="delete" title="Delete">
            <svg viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
        
        <div class="item-card-header">
          <div class="item-favicon">
            ${s.favicon?`<img src="${u(s.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${r[0].toUpperCase()}'">`:r[0].toUpperCase()}
          </div>
          <div class="item-title">${u(s.title)}</div>
        </div>
        
        <div class="item-url">${u(r)}</div>
        
        <div class="item-tags">
          ${i.map(l=>`
            <span class="item-tag topic" style="background: ${N(l.color,.15)}; color: ${l.color};">
              ${u(l.name)}
            </span>
          `).join("")}
          ${o.map(l=>`
            <span class="item-tag intent">${l.emoji} ${u(l.name)}</span>
          `).join("")}
        </div>
        
        <div class="item-footer">
          <div class="item-context">
            ${s.referrerQuery?`
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <span>"${u(s.referrerQuery)}"</span>
            `:""}
          </div>
          <div class="item-time">${j(s.savedAt)}</div>
        </div>
      </div>
    `}).join("")}function O(){var o,r,l,E,I,$,L,b,T,B,S,k;document.querySelectorAll(".nav-item[data-filter]").forEach(c=>{c.addEventListener("click",()=>{const d=c.getAttribute("data-filter");w(d)})}),(o=document.getElementById("topics-list"))==null||o.addEventListener("click",c=>{const d=c.target.closest(".nav-item");if(d){const p=d.getAttribute("data-filter-id");w({type:"topic",id:p})}}),(r=document.getElementById("intents-list"))==null||r.addEventListener("click",c=>{const d=c.target.closest(".nav-item");if(d){const p=d.getAttribute("data-filter-id");w({type:"intent",id:p})}});const t=document.getElementById("search-input");let n;t.addEventListener("input",()=>{clearTimeout(n),n=setTimeout(()=>{a.searchQuery=t.value,g()},200)}),document.querySelectorAll(".view-btn").forEach(c=>{c.addEventListener("click",()=>{const d=c.getAttribute("data-view");a.viewMode=d,document.querySelectorAll(".view-btn").forEach(p=>p.classList.remove("active")),c.classList.add("active"),g()})}),(l=document.getElementById("items-container"))==null||l.addEventListener("click",async c=>{const d=c.target,p=d.closest(".item-action-btn"),h=d.closest(".item-card");if(!h)return;const D=h.dataset.itemId,x=h.dataset.url;if(p){const C=p.getAttribute("data-action");C==="open"?window.open(x,"_blank"):C==="delete"&&confirm("Delete this item?")&&(await m("DELETE_ITEM",{id:D}),await v(),y(),g())}else window.open(x,"_blank")}),(E=document.getElementById("btn-add-topic"))==null||E.addEventListener("click",async()=>{const c=prompt("Enter topic name:");c!=null&&c.trim()&&(await m("CREATE_TOPIC",{name:c.trim()}),await v(),y())}),(I=document.getElementById("btn-add-intent"))==null||I.addEventListener("click",async()=>{const c=prompt("Enter intent name:");if(c!=null&&c.trim()){const d=prompt("Enter emoji (optional):","📌")||"📌";await m("CREATE_INTENT",{name:c.trim(),emoji:d}),await v(),y()}});const e=document.getElementById("settings-modal");($=document.getElementById("btn-settings"))==null||$.addEventListener("click",()=>{e&&(A(),M(),e.style.display="flex")}),(L=document.getElementById("btn-export-data"))==null||L.addEventListener("click",q),(b=document.getElementById("btn-import-data"))==null||b.addEventListener("click",()=>{var c;(c=document.getElementById("import-file-input"))==null||c.click()}),(T=document.getElementById("import-file-input"))==null||T.addEventListener("change",H),(B=document.getElementById("btn-close-settings"))==null||B.addEventListener("click",()=>{e&&(e.style.display="none")}),e==null||e.addEventListener("click",c=>{c.target===e&&(e.style.display="none")}),(S=document.getElementById("link-chrome-shortcuts"))==null||S.addEventListener("click",c=>{c.preventDefault(),chrome.tabs.create({url:"chrome://extensions/shortcuts"})});const s=document.getElementById("setting-auto-save"),i=document.getElementById("auto-save-value");s==null||s.addEventListener("input",()=>{i&&(i.textContent=`${s.value}s`)}),(k=document.getElementById("btn-save-settings"))==null||k.addEventListener("click",async()=>{const c=parseInt(s.value)*1e3,d=document.getElementById("setting-show-dropdown").checked;a.settings=await m("UPDATE_SETTINGS",{autoSaveDelay:c,showResurfaceDropdown:d}),e&&(e.style.display="none"),alert("Settings saved successfully!")})}function A(){if(!a.settings)return;const t=document.getElementById("current-shortcut");t&&(t.textContent=a.settings.keyboardShortcut);const n=document.getElementById("setting-auto-save"),e=document.getElementById("auto-save-value");n&&(n.value=String(a.settings.autoSaveDelay/1e3),e&&(e.textContent=`${n.value}s`));const s=document.getElementById("setting-show-dropdown");s&&(s.checked=a.settings.showResurfaceDropdown)}function w(t){var n,e,s;if(a.currentFilter=t,document.querySelectorAll(".nav-item").forEach(i=>{i.classList.remove("active")}),t==="all")(n=document.querySelector('.nav-item[data-filter="all"]'))==null||n.classList.add("active"),document.getElementById("page-title").textContent="All Saved";else if(t==="recent")(e=document.querySelector('.nav-item[data-filter="recent"]'))==null||e.classList.add("active"),document.getElementById("page-title").textContent="Recent";else{const i=`.nav-item[data-filter-type="${t.type}"][data-filter-id="${t.id}"]`;if((s=document.querySelector(i))==null||s.classList.add("active"),t.type==="topic"){const o=a.topics.find(r=>r.id===t.id);document.getElementById("page-title").textContent=(o==null?void 0:o.name)||"Topic"}else{const o=a.intents.find(r=>r.id===t.id);document.getElementById("page-title").textContent=o?`${o.emoji} ${o.name}`:"Intent"}}g()}function N(t,n){const e=parseInt(t.slice(1,3),16),s=parseInt(t.slice(3,5),16),i=parseInt(t.slice(5,7),16);return`rgba(${e}, ${s}, ${i}, ${n})`}function M(){const t=document.getElementById("data-stats");if(!t)return;const e=(JSON.stringify({items:a.items,topics:a.topics,intents:a.intents}).length/1024).toFixed(1);t.innerHTML=`
    <div class="stat-row">
      <span>Saved pages</span>
      <strong>${a.items.length}</strong>
    </div>
    <div class="stat-row">
      <span>Topics</span>
      <strong>${a.topics.length}</strong>
    </div>
    <div class="stat-row">
      <span>Intents</span>
      <strong>${a.intents.length}</strong>
    </div>
    <div class="stat-row">
      <span>Data size</span>
      <strong>${e} KB</strong>
    </div>
  `}async function q(){try{const t=await m("EXPORT_DATA"),n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),e=URL.createObjectURL(n),i=`resurface-backup-${new Date().toISOString().split("T")[0]}.json`,o=document.createElement("a");o.href=e,o.download=i,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(e),f("success",`Exported ${t.items.length} pages, ${t.topics.length} topics, ${t.intents.length} intents`)}catch(t){console.error("Export error:",t),f("error","Failed to export data. Please try again.")}}async function H(t){var s;const n=t.target,e=(s=n.files)==null?void 0:s[0];if(e){try{const i=await e.text(),o=JSON.parse(i);if(!o.items||!o.topics||!o.intents)throw new Error("Invalid backup file format");const r=confirm(`Found ${o.items.length} pages, ${o.topics.length} topics, ${o.intents.length} intents.

Click OK to MERGE with existing data (keeps your current pages).
Click Cancel to REPLACE all data (removes current pages).`)?"merge":"replace";if(r==="replace"&&!confirm(`⚠️ WARNING: This will DELETE all your current saved pages and replace them with the backup.

Are you sure you want to continue?`)){n.value="";return}const l=await m("IMPORT_DATA",{data:o,mode:r});if(l.success)f("success",`Imported ${l.imported.items} pages, ${l.imported.topics} topics, ${l.imported.intents} intents`),await v(),y(),g(),M();else throw new Error("Import failed")}catch(i){console.error("Import error:",i),f("error","Failed to import data. Make sure you selected a valid Resurface backup file.")}n.value=""}}function f(t,n){var o,r;const e=document.querySelector(".settings-data-actions");if(!e)return;const s=(o=e.parentElement)==null?void 0:o.querySelector(".data-message");s==null||s.remove();const i=document.createElement("div");i.className=`data-message ${t}`,i.innerHTML=`
    <svg viewBox="0 0 24 24">
      ${t==="success"?'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>':'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
    </svg>
    <span>${u(n)}</span>
  `,(r=e.parentElement)==null||r.appendChild(i),setTimeout(()=>i.remove(),5e3)}document.addEventListener("DOMContentLoaded",_);
