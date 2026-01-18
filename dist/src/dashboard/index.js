import{s as v}from"../../messages.js";function N(t){try{const{hostname:n}=new URL(t);return n.replace("www.","")}catch{return""}}function O(t){const n=Math.floor((Date.now()-t)/1e3);if(n<60)return"Just now";const e=Math.floor(n/60);if(e<60)return`${e}m ago`;const i=Math.floor(e/60);if(i<24)return`${i}h ago`;const a=Math.floor(i/24);if(a<7)return`${a}d ago`;const c=Math.floor(a/7);if(c<4)return`${c}w ago`;const r=Math.floor(a/30);return r<12?`${r}mo ago`:`${Math.floor(a/365)}y ago`}function f(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}const s={items:[],topics:[],intents:[],settings:null,currentFilter:"all",searchQuery:"",viewMode:"grid"};async function H(){await E(),w(),I(),P()}async function E(){try{s.items=await v("GET_ALL_ITEMS"),s.topics=await v("GET_ALL_TOPICS"),s.intents=await v("GET_ALL_INTENTS"),s.settings=await v("GET_SETTINGS"),R()}catch(t){console.error("Failed to load data:",t)}}function w(){document.getElementById("count-all").textContent=String(s.items.length);const t=new Date;t.setHours(0,0,0,0);const n=s.items.filter(a=>a.savedAt>=t.getTime()-7*24*60*60*1e3).length;document.getElementById("count-recent").textContent=String(n);const e=document.getElementById("topics-list");e.innerHTML=s.topics.map(a=>`
    <div class="nav-item-wrapper" data-topic-id="${a.id}">
      <button class="nav-item" data-filter-type="topic" data-filter-id="${a.id}">
        <span class="nav-color-dot" style="background: ${a.color};"></span>
        <span>${f(a.name)}</span>
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
  `).join("");const i=document.getElementById("intents-list");i.innerHTML=s.intents.map(a=>`
    <div class="nav-item-wrapper" data-intent-id="${a.id}">
      <button class="nav-item" data-filter-type="intent" data-filter-id="${a.id}">
        <span>${a.emoji}</span>
        <span>${f(a.name)}</span>
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
  `).join("")}function F(){let t=[...s.items];if(s.currentFilter==="recent"){const n=Date.now()-6048e5;t=t.filter(e=>e.savedAt>=n)}else if(typeof s.currentFilter=="object"&&s.currentFilter!==null){const n=s.currentFilter;n.type==="topic"?t=t.filter(e=>e.topicIds.includes(n.id)):t=t.filter(e=>e.intentIds.includes(n.id))}if(s.searchQuery){const n=s.searchQuery.toLowerCase();t=t.filter(e=>{var i;return e.title.toLowerCase().includes(n)||e.url.toLowerCase().includes(n)||((i=e.referrerQuery)==null?void 0:i.toLowerCase().includes(n))})}return t.sort((n,e)=>e.savedAt-n.savedAt),t}function I(){const t=document.getElementById("items-container"),n=document.getElementById("empty-state"),e=F();if(e.length===0){t.style.display="none",n.style.display="flex";return}t.style.display="grid",n.style.display="none",t.classList.toggle("list-view",s.viewMode==="list"),t.innerHTML=e.map(i=>{const a=s.topics.filter(d=>i.topicIds.includes(d.id)),c=s.intents.filter(d=>i.intentIds.includes(d.id)),r=N(i.url);return`
      <div class="item-card" data-item-id="${i.id}" data-url="${f(i.url)}">
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
            ${i.favicon?`<img src="${f(i.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${r[0].toUpperCase()}'">`:r[0].toUpperCase()}
          </div>
          <div class="item-title">${f(i.title)}</div>
        </div>
        
        <div class="item-url">${f(r)}</div>
        
        <div class="item-tags">
          ${a.map(d=>`
            <span class="item-tag topic" style="background: ${q(d.color,.15)}; color: ${d.color};">
              ${f(d.name)}
            </span>
          `).join("")}
          ${c.map(d=>`
            <span class="item-tag intent">${d.emoji} ${f(d.name)}</span>
          `).join("")}
        </div>
        
        <div class="item-footer">
          <div class="item-context">
            ${i.referrerQuery?`
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <span>"${f(i.referrerQuery)}"</span>
            `:""}
          </div>
          <div class="item-time">${O(i.savedAt)}</div>
        </div>
      </div>
    `}).join("")}function P(){var c,r,d,L,B,x,S,k,C,M,A,D;document.querySelectorAll(".nav-item[data-filter]").forEach(o=>{o.addEventListener("click",()=>{const l=o.getAttribute("data-filter");T(l)})}),(c=document.getElementById("topics-list"))==null||c.addEventListener("click",async o=>{const l=o.target,g=l.closest(".nav-action-btn"),y=l.closest(".nav-item-wrapper");if(g&&y){o.stopPropagation();const p=y.dataset.topicId,h=g.dataset.action,m=s.topics.find(u=>u.id===p);if(h==="edit-topic"&&m){const u=prompt("Edit topic name:",m.name);u!=null&&u.trim()&&u.trim()!==m.name&&(await v("RENAME_TOPIC",{id:p,name:u.trim()}),await E(),w())}else h==="delete-topic"&&confirm(`Delete topic "${m==null?void 0:m.name}"? Items will be untagged from this topic.`)&&(await v("DELETE_TOPIC",{id:p}),await E(),w(),I());return}const b=l.closest(".nav-item");if(b){const p=b.getAttribute("data-filter-id");T({type:"topic",id:p})}}),(r=document.getElementById("intents-list"))==null||r.addEventListener("click",async o=>{const l=o.target,g=l.closest(".nav-action-btn"),y=l.closest(".nav-item-wrapper");if(g&&y){o.stopPropagation();const p=y.dataset.intentId,h=g.dataset.action,m=s.intents.find(u=>u.id===p);if(h==="edit-intent"&&m){const u=prompt("Edit intent name:",m.name);if(u!=null&&u.trim()&&u.trim()!==m.name){const _=prompt("Edit emoji:",m.emoji)||m.emoji;await v("RENAME_INTENT",{id:p,name:u.trim(),emoji:_}),await E(),w()}}else h==="delete-intent"&&confirm(`Delete intent "${m==null?void 0:m.name}"? Items will be untagged from this intent.`)&&(await v("DELETE_INTENT",{id:p}),await E(),w(),I());return}const b=l.closest(".nav-item");if(b){const p=b.getAttribute("data-filter-id");T({type:"intent",id:p})}});const t=document.getElementById("search-input");let n;t.addEventListener("input",()=>{clearTimeout(n),n=setTimeout(()=>{s.searchQuery=t.value,I()},200)}),document.querySelectorAll(".view-btn").forEach(o=>{o.addEventListener("click",()=>{const l=o.getAttribute("data-view");s.viewMode=l,document.querySelectorAll(".view-btn").forEach(g=>g.classList.remove("active")),o.classList.add("active"),I()})}),(d=document.getElementById("items-container"))==null||d.addEventListener("click",async o=>{const l=o.target,g=l.closest(".item-action-btn"),y=l.closest(".item-card");if(!y)return;const b=y.dataset.itemId,p=y.dataset.url;if(g){const h=g.getAttribute("data-action");h==="open"?window.open(p,"_blank"):h==="delete"&&confirm("Delete this item?")&&(await v("DELETE_ITEM",{id:b}),await E(),w(),I())}else window.open(p,"_blank")}),(L=document.getElementById("btn-add-topic"))==null||L.addEventListener("click",async()=>{const o=prompt("Enter topic name:");o!=null&&o.trim()&&(await v("CREATE_TOPIC",{name:o.trim()}),await E(),w())}),(B=document.getElementById("btn-add-intent"))==null||B.addEventListener("click",async()=>{const o=prompt("Enter intent name:");if(o!=null&&o.trim()){const l=prompt("Enter emoji (optional):","📌")||"📌";await v("CREATE_INTENT",{name:o.trim(),emoji:l}),await E(),w()}});const e=document.getElementById("settings-modal");(x=document.getElementById("btn-settings"))==null||x.addEventListener("click",()=>{e&&(R(),j(),e.style.display="flex")}),(S=document.getElementById("btn-export-data"))==null||S.addEventListener("click",V),(k=document.getElementById("btn-import-data"))==null||k.addEventListener("click",()=>{var o;(o=document.getElementById("import-file-input"))==null||o.click()}),(C=document.getElementById("import-file-input"))==null||C.addEventListener("change",U),(M=document.getElementById("btn-close-settings"))==null||M.addEventListener("click",()=>{e&&(e.style.display="none")}),e==null||e.addEventListener("click",o=>{o.target===e&&(e.style.display="none")}),(A=document.getElementById("link-chrome-shortcuts"))==null||A.addEventListener("click",o=>{o.preventDefault(),chrome.tabs.create({url:"chrome://extensions/shortcuts"})});const i=document.getElementById("setting-auto-save"),a=document.getElementById("auto-save-value");i==null||i.addEventListener("input",()=>{a&&(a.textContent=`${i.value}s`)}),(D=document.getElementById("btn-save-settings"))==null||D.addEventListener("click",async()=>{const o=parseInt(i.value)*1e3,l=document.getElementById("setting-show-dropdown").checked;s.settings=await v("UPDATE_SETTINGS",{autoSaveDelay:o,showResurfaceDropdown:l}),e&&(e.style.display="none"),alert("Settings saved successfully!")})}function R(){if(!s.settings)return;const t=document.getElementById("current-shortcut");t&&(t.textContent=s.settings.keyboardShortcut);const n=document.getElementById("setting-auto-save"),e=document.getElementById("auto-save-value");n&&(n.value=String(s.settings.autoSaveDelay/1e3),e&&(e.textContent=`${n.value}s`));const i=document.getElementById("setting-show-dropdown");i&&(i.checked=s.settings.showResurfaceDropdown)}function T(t){var n,e,i;if(s.currentFilter=t,document.querySelectorAll(".nav-item").forEach(a=>{a.classList.remove("active")}),t==="all")(n=document.querySelector('.nav-item[data-filter="all"]'))==null||n.classList.add("active"),document.getElementById("page-title").textContent="All Saved";else if(t==="recent")(e=document.querySelector('.nav-item[data-filter="recent"]'))==null||e.classList.add("active"),document.getElementById("page-title").textContent="Recent";else{const a=`.nav-item[data-filter-type="${t.type}"][data-filter-id="${t.id}"]`;if((i=document.querySelector(a))==null||i.classList.add("active"),t.type==="topic"){const c=s.topics.find(r=>r.id===t.id);document.getElementById("page-title").textContent=(c==null?void 0:c.name)||"Topic"}else{const c=s.intents.find(r=>r.id===t.id);document.getElementById("page-title").textContent=c?`${c.emoji} ${c.name}`:"Intent"}}I()}function q(t,n){const e=parseInt(t.slice(1,3),16),i=parseInt(t.slice(3,5),16),a=parseInt(t.slice(5,7),16);return`rgba(${e}, ${i}, ${a}, ${n})`}function j(){const t=document.getElementById("data-stats");if(!t)return;const e=(JSON.stringify({items:s.items,topics:s.topics,intents:s.intents}).length/1024).toFixed(1);t.innerHTML=`
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
  `}async function V(){try{const t=await v("EXPORT_DATA"),n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),e=URL.createObjectURL(n),a=`resurface-backup-${new Date().toISOString().split("T")[0]}.json`,c=document.createElement("a");c.href=e,c.download=a,document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(e),$("success",`Exported ${t.items.length} pages, ${t.topics.length} topics, ${t.intents.length} intents`)}catch(t){console.error("Export error:",t),$("error","Failed to export data. Please try again.")}}async function U(t){var i;const n=t.target,e=(i=n.files)==null?void 0:i[0];if(e){try{const a=await e.text(),c=JSON.parse(a);if(!c.items||!c.topics||!c.intents)throw new Error("Invalid backup file format");const r=confirm(`Found ${c.items.length} pages, ${c.topics.length} topics, ${c.intents.length} intents.

Click OK to MERGE with existing data (keeps your current pages).
Click Cancel to REPLACE all data (removes current pages).`)?"merge":"replace";if(r==="replace"&&!confirm(`⚠️ WARNING: This will DELETE all your current saved pages and replace them with the backup.

Are you sure you want to continue?`)){n.value="";return}const d=await v("IMPORT_DATA",{data:c,mode:r});if(d.success)$("success",`Imported ${d.imported.items} pages, ${d.imported.topics} topics, ${d.imported.intents} intents`),await E(),w(),I(),j();else throw new Error("Import failed")}catch(a){console.error("Import error:",a),$("error","Failed to import data. Make sure you selected a valid Resurface backup file.")}n.value=""}}function $(t,n){var c,r;const e=document.querySelector(".settings-data-actions");if(!e)return;const i=(c=e.parentElement)==null?void 0:c.querySelector(".data-message");i==null||i.remove();const a=document.createElement("div");a.className=`data-message ${t}`,a.innerHTML=`
    <svg viewBox="0 0 24 24">
      ${t==="success"?'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>':'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
    </svg>
    <span>${f(n)}</span>
  `,(r=e.parentElement)==null||r.appendChild(a),setTimeout(()=>a.remove(),5e3)}document.addEventListener("DOMContentLoaded",H);
