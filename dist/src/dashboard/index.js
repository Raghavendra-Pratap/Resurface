import{s as u}from"../../messages.js";function Q(t){try{const{hostname:n}=new URL(t);return n.replace("www.","")}catch{return""}}function O(t){const n=Math.floor((Date.now()-t)/1e3);if(n<60)return"Just now";const e=Math.floor(n/60);if(e<60)return`${e}m ago`;const s=Math.floor(e/60);if(s<24)return`${s}h ago`;const a=Math.floor(s/24);if(a<7)return`${a}d ago`;const o=Math.floor(a/7);if(o<4)return`${o}w ago`;const r=Math.floor(a/30);return r<12?`${r}mo ago`:`${Math.floor(a/365)}y ago`}function h(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}const i={items:[],topics:[],intents:[],settings:null,currentFilter:"all",searchQuery:"",viewMode:"grid"};async function N(){await y(),E(),I(),F()}async function y(){try{i.items=await u("GET_ALL_ITEMS"),i.topics=await u("GET_ALL_TOPICS"),i.intents=await u("GET_ALL_INTENTS"),i.settings=await u("GET_SETTINGS"),U()}catch(t){console.error("Failed to load data:",t)}}function E(){document.getElementById("count-all").textContent=String(i.items.length);const t=new Date;t.setHours(0,0,0,0);const n=i.items.filter(a=>a.savedAt>=t.getTime()-7*24*60*60*1e3).length;document.getElementById("count-recent").textContent=String(n);const e=document.getElementById("topics-list");e.innerHTML=i.topics.map(a=>`
    <div class="nav-item-wrapper" data-topic-id="${a.id}">
    <button class="nav-item" data-filter-type="topic" data-filter-id="${a.id}">
      <span class="nav-color-dot" style="background: ${a.color};"></span>
      <span>${h(a.name)}</span>
      <span class="nav-count">${a.itemCount}</span>
    </button>
      <div class="nav-item-actions">
        <button class="nav-action-btn edit" data-action="edit-topic" title="Edit">
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="nav-action-btn delete" data-action="delete-topic" title="Delete">
          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  `).join("");const s=document.getElementById("intents-list");s.innerHTML=i.intents.map(a=>`
    <div class="nav-item-wrapper" data-intent-id="${a.id}">
    <button class="nav-item" data-filter-type="intent" data-filter-id="${a.id}">
      <span>${a.emoji}</span>
      <span>${h(a.name)}</span>
      <span class="nav-count">${a.itemCount}</span>
    </button>
      <div class="nav-item-actions">
        <button class="nav-action-btn edit" data-action="edit-intent" title="Edit">
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="nav-action-btn delete" data-action="delete-intent" title="Delete">
          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  `).join("")}function P(){let t=[...i.items];if(i.currentFilter==="recent"){const n=Date.now()-6048e5;t=t.filter(e=>e.savedAt>=n)}else if(typeof i.currentFilter=="object"&&i.currentFilter!==null){const n=i.currentFilter;n.type==="topic"?t=t.filter(e=>e.topicIds.includes(n.id)):t=t.filter(e=>e.intentIds.includes(n.id))}if(i.searchQuery){const n=i.searchQuery.toLowerCase();t=t.filter(e=>{var s;return e.title.toLowerCase().includes(n)||e.url.toLowerCase().includes(n)||((s=e.referrerQuery)==null?void 0:s.toLowerCase().includes(n))})}return t.sort((n,e)=>e.savedAt-n.savedAt),t}function I(){const t=document.getElementById("items-container"),n=document.getElementById("empty-state"),e=P();if(e.length===0){t.style.display="none",n.style.display="flex";return}t.style.display="grid",n.style.display="none",t.classList.toggle("list-view",i.viewMode==="list"),t.innerHTML=e.map(s=>{const a=i.topics.filter(d=>s.topicIds.includes(d.id)),o=i.intents.filter(d=>s.intentIds.includes(d.id)),r=Q(s.url);return`
      <div class="item-card" data-item-id="${s.id}" data-url="${h(s.url)}">
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
          <div class="item-favicon" data-fallback="${r[0].toUpperCase()}">
            ${s.favicon?`<img src="${h(s.favicon)}" alt="" data-fallback="${r[0].toUpperCase()}">`:r[0].toUpperCase()}
          </div>
          <div class="item-title">${h(s.title)}</div>
        </div>
        
        <div class="item-url">${h(r)}</div>
        
        <div class="item-tags">
          ${a.map(d=>`
            <span class="item-tag topic" style="background: ${K(d.color,.15)}; color: ${d.color};">
              ${h(d.name)}
            </span>
          `).join("")}
          ${o.map(d=>`
            <span class="item-tag intent">${d.emoji} ${h(d.name)}</span>
          `).join("")}
        </div>
        
        <div class="item-footer">
          <div class="item-context">
            ${s.referrerQuery?`
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <span>"${h(s.referrerQuery)}"</span>
            `:""}
          </div>
          <div class="item-time">${O(s.savedAt)}</div>
        </div>
      </div>
    `}).join(""),t.querySelectorAll("img[data-fallback]").forEach(s=>{s.addEventListener("error",function(){var d;const o=this.getAttribute("data-fallback")||"";this.style.display="none";const r=this.parentElement;r&&!((d=r.textContent)!=null&&d.trim())&&(r.textContent=o)})})}function F(){var o,r,d,S,T,B,C,x,A,D,M,R,_,q;document.querySelectorAll(".nav-item[data-filter]").forEach(c=>{c.addEventListener("click",()=>{const l=c.getAttribute("data-filter");$(l)})}),(o=document.getElementById("topics-list"))==null||o.addEventListener("click",async c=>{const l=c.target,v=l.closest(".nav-action-btn"),f=l.closest(".nav-item-wrapper");if(v&&f){c.stopPropagation();const g=f.dataset.topicId,w=v.dataset.action,m=i.topics.find(p=>p.id===g);if(w==="edit-topic"&&m){const p=prompt("Edit topic name:",m.name);p!=null&&p.trim()&&p.trim()!==m.name&&(await u("RENAME_TOPIC",{id:g,name:p.trim()}),await y(),E())}else w==="delete-topic"&&confirm(`Delete topic "${m==null?void 0:m.name}"? Items will be untagged from this topic.`)&&(await u("DELETE_TOPIC",{id:g}),await y(),E(),I());return}const b=l.closest(".nav-item");if(b){const g=b.getAttribute("data-filter-id");$({type:"topic",id:g})}}),(r=document.getElementById("intents-list"))==null||r.addEventListener("click",async c=>{const l=c.target,v=l.closest(".nav-action-btn"),f=l.closest(".nav-item-wrapper");if(v&&f){c.stopPropagation();const g=f.dataset.intentId,w=v.dataset.action,m=i.intents.find(p=>p.id===g);if(w==="edit-intent"&&m){const p=prompt("Edit intent name:",m.name);if(p!=null&&p.trim()&&p.trim()!==m.name){const H=prompt("Edit emoji:",m.emoji)||m.emoji;await u("RENAME_INTENT",{id:g,name:p.trim(),emoji:H}),await y(),E()}}else w==="delete-intent"&&confirm(`Delete intent "${m==null?void 0:m.name}"? Items will be untagged from this intent.`)&&(await u("DELETE_INTENT",{id:g}),await y(),E(),I());return}const b=l.closest(".nav-item");if(b){const g=b.getAttribute("data-filter-id");$({type:"intent",id:g})}});const t=document.getElementById("search-input");let n;t.addEventListener("input",()=>{clearTimeout(n),n=setTimeout(()=>{i.searchQuery=t.value,I()},200)}),document.querySelectorAll(".view-btn").forEach(c=>{c.addEventListener("click",()=>{const l=c.getAttribute("data-view");i.viewMode=l,document.querySelectorAll(".view-btn").forEach(v=>v.classList.remove("active")),c.classList.add("active"),I()})}),(d=document.getElementById("items-container"))==null||d.addEventListener("click",async c=>{const l=c.target,v=l.closest(".item-action-btn"),f=l.closest(".item-card");if(!f)return;const b=f.dataset.itemId,g=f.dataset.url;if(v){const w=v.getAttribute("data-action");w==="open"?window.open(g,"_blank"):w==="delete"&&confirm("Delete this item?")&&(await u("DELETE_ITEM",{id:b}),await y(),E(),I())}else window.open(g,"_blank")}),(S=document.getElementById("btn-add-topic"))==null||S.addEventListener("click",async()=>{const c=prompt("Enter topic name:");c!=null&&c.trim()&&(await u("CREATE_TOPIC",{name:c.trim()}),await y(),E())}),(T=document.getElementById("btn-add-intent"))==null||T.addEventListener("click",async()=>{const c=prompt("Enter intent name:");if(c!=null&&c.trim()){const l=prompt("Enter emoji (optional):","📌")||"📌";await u("CREATE_INTENT",{name:c.trim(),emoji:l}),await y(),E()}});const e=document.getElementById("settings-modal");(B=document.getElementById("btn-settings"))==null||B.addEventListener("click",()=>{e&&(U(),j(),e.style.display="flex")}),(C=document.getElementById("btn-export-data"))==null||C.addEventListener("click",J),(x=document.getElementById("btn-import-data"))==null||x.addEventListener("click",()=>{var c;(c=document.getElementById("import-file-input"))==null||c.click()}),(A=document.getElementById("import-file-input"))==null||A.addEventListener("change",W),(D=document.getElementById("btn-close-settings"))==null||D.addEventListener("click",()=>{e&&(e.style.display="none")}),e==null||e.addEventListener("click",c=>{c.target===e&&(e.style.display="none")}),(M=document.getElementById("link-chrome-shortcuts"))==null||M.addEventListener("click",c=>{c.preventDefault(),chrome.tabs.create({url:"chrome://extensions/shortcuts"})});const s=document.getElementById("setting-auto-save"),a=document.getElementById("auto-save-value");s==null||s.addEventListener("input",()=>{a&&(a.textContent=`${s.value}s`)}),(R=document.getElementById("setting-show-shortcuts"))==null||R.addEventListener("change",async c=>{const l=c.target;i.settings&&(await u("UPDATE_QUICK_SHORTCUTS",{showQuickShortcuts:l.checked,quickShortcuts:i.settings.quickShortcuts}),i.settings.showQuickShortcuts=l.checked)}),(_=document.getElementById("btn-add-custom-shortcut"))==null||_.addEventListener("click",z),(q=document.getElementById("btn-save-settings"))==null||q.addEventListener("click",async()=>{const c=parseInt(s.value)*1e3,l=document.getElementById("setting-show-dropdown").checked;i.settings=await u("UPDATE_SETTINGS",{autoSaveDelay:c,showResurfaceDropdown:l}),e&&(e.style.display="none"),alert("Settings saved successfully!")})}function U(){if(!i.settings)return;const t=document.getElementById("current-shortcut");t&&(t.textContent=i.settings.keyboardShortcut);const n=document.getElementById("setting-auto-save"),e=document.getElementById("auto-save-value");n&&(n.value=String(i.settings.autoSaveDelay/1e3),e&&(e.textContent=`${n.value}s`));const s=document.getElementById("setting-show-dropdown");s&&(s.checked=i.settings.showResurfaceDropdown);const a=document.getElementById("setting-show-shortcuts");a&&(a.checked=i.settings.showQuickShortcuts??!0),L()}function L(){const t=document.getElementById("shortcuts-list");if(!t||!i.settings)return;const n=i.settings.quickShortcuts||[];t.innerHTML=n.map(e=>`
    <div class="shortcut-item" data-shortcut-id="${e.id}">
      <label class="checkbox-label" style="margin: 0; flex: 1;">
        <input type="checkbox" class="shortcut-toggle" data-id="${e.id}" ${e.enabled?"checked":""}>
        <span style="margin-left: 8px;">
          <strong>${e.title}</strong>
          <span style="color: var(--text-muted); font-size: 12px; display: block; margin-top: 2px;">${e.url}</span>
        </span>
      </label>
      ${e.isCustom?`
        <button class="btn-icon shortcut-delete" data-id="${e.id}" title="Delete">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </button>
      `:""}
    </div>
  `).join(""),t.querySelectorAll(".shortcut-toggle").forEach(e=>{e.addEventListener("change",async s=>{const a=s.target,o=a.dataset.id;await V(o,a.checked)})}),t.querySelectorAll(".shortcut-delete").forEach(e=>{e.addEventListener("click",async s=>{var r;const o=(r=s.target.closest(".shortcut-delete"))==null?void 0:r.getAttribute("data-id");confirm("Delete this custom shortcut?")&&await G(o)})})}async function V(t,n){if(!i.settings)return;const e=i.settings.quickShortcuts.map(s=>s.id===t?{...s,enabled:n}:s);await u("UPDATE_QUICK_SHORTCUTS",{showQuickShortcuts:i.settings.showQuickShortcuts,quickShortcuts:e}),i.settings.quickShortcuts=e}async function G(t){if(!i.settings)return;const n=i.settings.quickShortcuts.filter(e=>e.id!==t);await u("UPDATE_QUICK_SHORTCUTS",{showQuickShortcuts:i.settings.showQuickShortcuts,quickShortcuts:n}),i.settings.quickShortcuts=n,L()}async function z(){const t=prompt("Enter shortcut title:");if(!t)return;const n=prompt("Enter URL:");if(!n)return;try{new URL(n)}catch{alert("Please enter a valid URL (e.g., https://example.com)");return}if(!i.settings)return;const e={id:`custom-${Date.now()}`,url:n,title:t,enabled:!0,isCustom:!0},s=[...i.settings.quickShortcuts,e];await u("UPDATE_QUICK_SHORTCUTS",{showQuickShortcuts:i.settings.showQuickShortcuts,quickShortcuts:s}),i.settings.quickShortcuts=s,L()}function $(t){var n,e,s;if(i.currentFilter=t,document.querySelectorAll(".nav-item").forEach(a=>{a.classList.remove("active")}),t==="all")(n=document.querySelector('.nav-item[data-filter="all"]'))==null||n.classList.add("active"),document.getElementById("page-title").textContent="All Saved";else if(t==="recent")(e=document.querySelector('.nav-item[data-filter="recent"]'))==null||e.classList.add("active"),document.getElementById("page-title").textContent="Recent";else{const a=`.nav-item[data-filter-type="${t.type}"][data-filter-id="${t.id}"]`;if((s=document.querySelector(a))==null||s.classList.add("active"),t.type==="topic"){const o=i.topics.find(r=>r.id===t.id);document.getElementById("page-title").textContent=(o==null?void 0:o.name)||"Topic"}else{const o=i.intents.find(r=>r.id===t.id);document.getElementById("page-title").textContent=o?`${o.emoji} ${o.name}`:"Intent"}}I()}function K(t,n){const e=parseInt(t.slice(1,3),16),s=parseInt(t.slice(3,5),16),a=parseInt(t.slice(5,7),16);return`rgba(${e}, ${s}, ${a}, ${n})`}function j(){const t=document.getElementById("data-stats");if(!t)return;const e=(JSON.stringify({items:i.items,topics:i.topics,intents:i.intents}).length/1024).toFixed(1);t.innerHTML=`
    <div class="stat-row">
      <span>Saved pages</span>
      <strong>${i.items.length}</strong>
    </div>
    <div class="stat-row">
      <span>Topics</span>
      <strong>${i.topics.length}</strong>
    </div>
    <div class="stat-row">
      <span>Intents</span>
      <strong>${i.intents.length}</strong>
    </div>
    <div class="stat-row">
      <span>Data size</span>
      <strong>${e} KB</strong>
    </div>
  `}async function J(){try{const t=await u("EXPORT_DATA"),n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),e=URL.createObjectURL(n),a=`resurface-backup-${new Date().toISOString().split("T")[0]}.json`,o=document.createElement("a");o.href=e,o.download=a,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(e),k("success",`Exported ${t.items.length} pages, ${t.topics.length} topics, ${t.intents.length} intents`)}catch(t){console.error("Export error:",t),k("error","Failed to export data. Please try again.")}}async function W(t){var s;const n=t.target,e=(s=n.files)==null?void 0:s[0];if(e){try{const a=await e.text(),o=JSON.parse(a);if(!o.items||!o.topics||!o.intents)throw new Error("Invalid backup file format");const r=confirm(`Found ${o.items.length} pages, ${o.topics.length} topics, ${o.intents.length} intents.

Click OK to MERGE with existing data (keeps your current pages).
Click Cancel to REPLACE all data (removes current pages).`)?"merge":"replace";if(r==="replace"&&!confirm(`⚠️ WARNING: This will DELETE all your current saved pages and replace them with the backup.

Are you sure you want to continue?`)){n.value="";return}const d=await u("IMPORT_DATA",{data:o,mode:r});if(d.success)k("success",`Imported ${d.imported.items} pages, ${d.imported.topics} topics, ${d.imported.intents} intents`),await y(),E(),I(),j();else throw new Error("Import failed")}catch(a){console.error("Import error:",a),k("error","Failed to import data. Make sure you selected a valid Resurface backup file.")}n.value=""}}function k(t,n){var o,r;const e=document.querySelector(".settings-data-actions");if(!e)return;const s=(o=e.parentElement)==null?void 0:o.querySelector(".data-message");s==null||s.remove();const a=document.createElement("div");a.className=`data-message ${t}`,a.innerHTML=`
    <svg viewBox="0 0 24 24">
      ${t==="success"?'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>':'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
    </svg>
    <span>${h(n)}</span>
  `,(r=e.parentElement)==null||r.appendChild(a),setTimeout(()=>a.remove(),5e3)}document.addEventListener("DOMContentLoaded",N);
