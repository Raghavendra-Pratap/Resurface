import{s as v}from"../../messages.js";function N(t){try{const{hostname:n}=new URL(t);return n.replace("www.","")}catch{return""}}function O(t){const n=Math.floor((Date.now()-t)/1e3);if(n<60)return"Just now";const e=Math.floor(n/60);if(e<60)return`${e}m ago`;const a=Math.floor(e/60);if(a<24)return`${a}h ago`;const i=Math.floor(a/24);if(i<7)return`${i}d ago`;const o=Math.floor(i/7);if(o<4)return`${o}w ago`;const r=Math.floor(i/30);return r<12?`${r}mo ago`:`${Math.floor(i/365)}y ago`}function f(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}const s={items:[],topics:[],intents:[],settings:null,currentFilter:"all",searchQuery:"",viewMode:"grid"};async function H(){await E(),h(),I(),q()}async function E(){try{s.items=await v("GET_ALL_ITEMS"),s.topics=await v("GET_ALL_TOPICS"),s.intents=await v("GET_ALL_INTENTS"),s.settings=await v("GET_SETTINGS"),R()}catch(t){console.error("Failed to load data:",t)}}function h(){document.getElementById("count-all").textContent=String(s.items.length);const t=new Date;t.setHours(0,0,0,0);const n=s.items.filter(i=>i.savedAt>=t.getTime()-7*24*60*60*1e3).length;document.getElementById("count-recent").textContent=String(n);const e=document.getElementById("topics-list");e.innerHTML=s.topics.map(i=>`
    <div class="nav-item-wrapper" data-topic-id="${i.id}">
    <button class="nav-item" data-filter-type="topic" data-filter-id="${i.id}">
      <span class="nav-color-dot" style="background: ${i.color};"></span>
      <span>${f(i.name)}</span>
      <span class="nav-count">${i.itemCount}</span>
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
  `).join("");const a=document.getElementById("intents-list");a.innerHTML=s.intents.map(i=>`
    <div class="nav-item-wrapper" data-intent-id="${i.id}">
    <button class="nav-item" data-filter-type="intent" data-filter-id="${i.id}">
      <span>${i.emoji}</span>
      <span>${f(i.name)}</span>
      <span class="nav-count">${i.itemCount}</span>
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
  `).join("")}function F(){let t=[...s.items];if(s.currentFilter==="recent"){const n=Date.now()-6048e5;t=t.filter(e=>e.savedAt>=n)}else if(typeof s.currentFilter=="object"&&s.currentFilter!==null){const n=s.currentFilter;n.type==="topic"?t=t.filter(e=>e.topicIds.includes(n.id)):t=t.filter(e=>e.intentIds.includes(n.id))}if(s.searchQuery){const n=s.searchQuery.toLowerCase();t=t.filter(e=>{var a;return e.title.toLowerCase().includes(n)||e.url.toLowerCase().includes(n)||((a=e.referrerQuery)==null?void 0:a.toLowerCase().includes(n))})}return t.sort((n,e)=>e.savedAt-n.savedAt),t}function I(){const t=document.getElementById("items-container"),n=document.getElementById("empty-state"),e=F();if(e.length===0){t.style.display="none",n.style.display="flex";return}t.style.display="grid",n.style.display="none",t.classList.toggle("list-view",s.viewMode==="list"),t.innerHTML=e.map(a=>{const i=s.topics.filter(d=>a.topicIds.includes(d.id)),o=s.intents.filter(d=>a.intentIds.includes(d.id)),r=N(a.url);return`
      <div class="item-card" data-item-id="${a.id}" data-url="${f(a.url)}">
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
            ${a.favicon?`<img src="${f(a.favicon)}" alt="" data-fallback="${r[0].toUpperCase()}">`:r[0].toUpperCase()}
          </div>
          <div class="item-title">${f(a.title)}</div>
        </div>
        
        <div class="item-url">${f(r)}</div>
        
        <div class="item-tags">
          ${i.map(d=>`
            <span class="item-tag topic" style="background: ${P(d.color,.15)}; color: ${d.color};">
              ${f(d.name)}
            </span>
          `).join("")}
          ${o.map(d=>`
            <span class="item-tag intent">${d.emoji} ${f(d.name)}</span>
          `).join("")}
        </div>
        
        <div class="item-footer">
          <div class="item-context">
            ${a.referrerQuery?`
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <span>"${f(a.referrerQuery)}"</span>
            `:""}
          </div>
          <div class="item-time">${O(a.savedAt)}</div>
        </div>
      </div>
    `}).join(""),t.querySelectorAll("img[data-fallback]").forEach(a=>{a.addEventListener("error",function(){var d;const o=this.getAttribute("data-fallback")||"";this.style.display="none";const r=this.parentElement;r&&!((d=r.textContent)!=null&&d.trim())&&(r.textContent=o)})})}function q(){var o,r,d,L,B,k,x,S,C,M,A,D;document.querySelectorAll(".nav-item[data-filter]").forEach(c=>{c.addEventListener("click",()=>{const l=c.getAttribute("data-filter");T(l)})}),(o=document.getElementById("topics-list"))==null||o.addEventListener("click",async c=>{const l=c.target,g=l.closest(".nav-action-btn"),y=l.closest(".nav-item-wrapper");if(g&&y){c.stopPropagation();const p=y.dataset.topicId,w=g.dataset.action,m=s.topics.find(u=>u.id===p);if(w==="edit-topic"&&m){const u=prompt("Edit topic name:",m.name);u!=null&&u.trim()&&u.trim()!==m.name&&(await v("RENAME_TOPIC",{id:p,name:u.trim()}),await E(),h())}else w==="delete-topic"&&confirm(`Delete topic "${m==null?void 0:m.name}"? Items will be untagged from this topic.`)&&(await v("DELETE_TOPIC",{id:p}),await E(),h(),I());return}const b=l.closest(".nav-item");if(b){const p=b.getAttribute("data-filter-id");T({type:"topic",id:p})}}),(r=document.getElementById("intents-list"))==null||r.addEventListener("click",async c=>{const l=c.target,g=l.closest(".nav-action-btn"),y=l.closest(".nav-item-wrapper");if(g&&y){c.stopPropagation();const p=y.dataset.intentId,w=g.dataset.action,m=s.intents.find(u=>u.id===p);if(w==="edit-intent"&&m){const u=prompt("Edit intent name:",m.name);if(u!=null&&u.trim()&&u.trim()!==m.name){const _=prompt("Edit emoji:",m.emoji)||m.emoji;await v("RENAME_INTENT",{id:p,name:u.trim(),emoji:_}),await E(),h()}}else w==="delete-intent"&&confirm(`Delete intent "${m==null?void 0:m.name}"? Items will be untagged from this intent.`)&&(await v("DELETE_INTENT",{id:p}),await E(),h(),I());return}const b=l.closest(".nav-item");if(b){const p=b.getAttribute("data-filter-id");T({type:"intent",id:p})}});const t=document.getElementById("search-input");let n;t.addEventListener("input",()=>{clearTimeout(n),n=setTimeout(()=>{s.searchQuery=t.value,I()},200)}),document.querySelectorAll(".view-btn").forEach(c=>{c.addEventListener("click",()=>{const l=c.getAttribute("data-view");s.viewMode=l,document.querySelectorAll(".view-btn").forEach(g=>g.classList.remove("active")),c.classList.add("active"),I()})}),(d=document.getElementById("items-container"))==null||d.addEventListener("click",async c=>{const l=c.target,g=l.closest(".item-action-btn"),y=l.closest(".item-card");if(!y)return;const b=y.dataset.itemId,p=y.dataset.url;if(g){const w=g.getAttribute("data-action");w==="open"?window.open(p,"_blank"):w==="delete"&&confirm("Delete this item?")&&(await v("DELETE_ITEM",{id:b}),await E(),h(),I())}else window.open(p,"_blank")}),(L=document.getElementById("btn-add-topic"))==null||L.addEventListener("click",async()=>{const c=prompt("Enter topic name:");c!=null&&c.trim()&&(await v("CREATE_TOPIC",{name:c.trim()}),await E(),h())}),(B=document.getElementById("btn-add-intent"))==null||B.addEventListener("click",async()=>{const c=prompt("Enter intent name:");if(c!=null&&c.trim()){const l=prompt("Enter emoji (optional):","📌")||"📌";await v("CREATE_INTENT",{name:c.trim(),emoji:l}),await E(),h()}});const e=document.getElementById("settings-modal");(k=document.getElementById("btn-settings"))==null||k.addEventListener("click",()=>{e&&(R(),j(),e.style.display="flex")}),(x=document.getElementById("btn-export-data"))==null||x.addEventListener("click",U),(S=document.getElementById("btn-import-data"))==null||S.addEventListener("click",()=>{var c;(c=document.getElementById("import-file-input"))==null||c.click()}),(C=document.getElementById("import-file-input"))==null||C.addEventListener("change",V),(M=document.getElementById("btn-close-settings"))==null||M.addEventListener("click",()=>{e&&(e.style.display="none")}),e==null||e.addEventListener("click",c=>{c.target===e&&(e.style.display="none")}),(A=document.getElementById("link-chrome-shortcuts"))==null||A.addEventListener("click",c=>{c.preventDefault(),chrome.tabs.create({url:"chrome://extensions/shortcuts"})});const a=document.getElementById("setting-auto-save"),i=document.getElementById("auto-save-value");a==null||a.addEventListener("input",()=>{i&&(i.textContent=`${a.value}s`)}),(D=document.getElementById("btn-save-settings"))==null||D.addEventListener("click",async()=>{const c=parseInt(a.value)*1e3,l=document.getElementById("setting-show-dropdown").checked;s.settings=await v("UPDATE_SETTINGS",{autoSaveDelay:c,showResurfaceDropdown:l}),e&&(e.style.display="none"),alert("Settings saved successfully!")})}function R(){if(!s.settings)return;const t=document.getElementById("current-shortcut");t&&(t.textContent=s.settings.keyboardShortcut);const n=document.getElementById("setting-auto-save"),e=document.getElementById("auto-save-value");n&&(n.value=String(s.settings.autoSaveDelay/1e3),e&&(e.textContent=`${n.value}s`));const a=document.getElementById("setting-show-dropdown");a&&(a.checked=s.settings.showResurfaceDropdown)}function T(t){var n,e,a;if(s.currentFilter=t,document.querySelectorAll(".nav-item").forEach(i=>{i.classList.remove("active")}),t==="all")(n=document.querySelector('.nav-item[data-filter="all"]'))==null||n.classList.add("active"),document.getElementById("page-title").textContent="All Saved";else if(t==="recent")(e=document.querySelector('.nav-item[data-filter="recent"]'))==null||e.classList.add("active"),document.getElementById("page-title").textContent="Recent";else{const i=`.nav-item[data-filter-type="${t.type}"][data-filter-id="${t.id}"]`;if((a=document.querySelector(i))==null||a.classList.add("active"),t.type==="topic"){const o=s.topics.find(r=>r.id===t.id);document.getElementById("page-title").textContent=(o==null?void 0:o.name)||"Topic"}else{const o=s.intents.find(r=>r.id===t.id);document.getElementById("page-title").textContent=o?`${o.emoji} ${o.name}`:"Intent"}}I()}function P(t,n){const e=parseInt(t.slice(1,3),16),a=parseInt(t.slice(3,5),16),i=parseInt(t.slice(5,7),16);return`rgba(${e}, ${a}, ${i}, ${n})`}function j(){const t=document.getElementById("data-stats");if(!t)return;const e=(JSON.stringify({items:s.items,topics:s.topics,intents:s.intents}).length/1024).toFixed(1);t.innerHTML=`
    <div class="stat-row">
      <span>Saved pages</span>
      <strong>${s.items.length}</strong>
    </div>
    <div class="stat-row">
      <span>Topics</span>
      <strong>${s.topics.length}</strong>
    </div>
    <div class="stat-row">
      <span>Intents</span>
      <strong>${s.intents.length}</strong>
    </div>
    <div class="stat-row">
      <span>Data size</span>
      <strong>${e} KB</strong>
    </div>
  `}async function U(){try{const t=await v("EXPORT_DATA"),n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),e=URL.createObjectURL(n),i=`resurface-backup-${new Date().toISOString().split("T")[0]}.json`,o=document.createElement("a");o.href=e,o.download=i,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(e),$("success",`Exported ${t.items.length} pages, ${t.topics.length} topics, ${t.intents.length} intents`)}catch(t){console.error("Export error:",t),$("error","Failed to export data. Please try again.")}}async function V(t){var a;const n=t.target,e=(a=n.files)==null?void 0:a[0];if(e){try{const i=await e.text(),o=JSON.parse(i);if(!o.items||!o.topics||!o.intents)throw new Error("Invalid backup file format");const r=confirm(`Found ${o.items.length} pages, ${o.topics.length} topics, ${o.intents.length} intents.

Click OK to MERGE with existing data (keeps your current pages).
Click Cancel to REPLACE all data (removes current pages).`)?"merge":"replace";if(r==="replace"&&!confirm(`⚠️ WARNING: This will DELETE all your current saved pages and replace them with the backup.

Are you sure you want to continue?`)){n.value="";return}const d=await v("IMPORT_DATA",{data:o,mode:r});if(d.success)$("success",`Imported ${d.imported.items} pages, ${d.imported.topics} topics, ${d.imported.intents} intents`),await E(),h(),I(),j();else throw new Error("Import failed")}catch(i){console.error("Import error:",i),$("error","Failed to import data. Make sure you selected a valid Resurface backup file.")}n.value=""}}function $(t,n){var o,r;const e=document.querySelector(".settings-data-actions");if(!e)return;const a=(o=e.parentElement)==null?void 0:o.querySelector(".data-message");a==null||a.remove();const i=document.createElement("div");i.className=`data-message ${t}`,i.innerHTML=`
    <svg viewBox="0 0 24 24">
      ${t==="success"?'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>':'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
    </svg>
    <span>${f(n)}</span>
  `,(r=e.parentElement)==null||r.appendChild(i),setTimeout(()=>i.remove(),5e3)}document.addEventListener("DOMContentLoaded",H);
