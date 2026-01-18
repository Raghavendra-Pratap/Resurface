import{s as g}from"../../messages.js";function H(t){try{const{hostname:i}=new URL(t);return i.replace("www.","")}catch{return""}}function _(t){const i=Math.floor((Date.now()-t)/1e3);if(i<60)return"Just now";const e=Math.floor(i/60);if(e<60)return`${e}m ago`;const n=Math.floor(e/60);if(n<24)return`${n}h ago`;const a=Math.floor(n/24);if(a<7)return`${a}d ago`;const c=Math.floor(a/7);if(c<4)return`${c}w ago`;const r=Math.floor(a/30);return r<12?`${r}mo ago`:`${Math.floor(a/365)}y ago`}function y(t){const i=document.createElement("div");return i.textContent=t,i.innerHTML}const s={items:[],topics:[],intents:[],settings:null,currentFilter:"all",searchQuery:"",viewMode:"grid"};async function q(){await w(),b(),I(),V()}async function w(){try{s.items=await g("GET_ALL_ITEMS"),s.topics=await g("GET_ALL_TOPICS"),s.intents=await g("GET_ALL_INTENTS"),s.settings=await g("GET_SETTINGS"),j()}catch(t){console.error("Failed to load data:",t)}}function b(){document.getElementById("count-all").textContent=String(s.items.length);const t=new Date;t.setHours(0,0,0,0);const i=s.items.filter(a=>a.savedAt>=t.getTime()-7*24*60*60*1e3).length;document.getElementById("count-recent").textContent=String(i);const e=document.getElementById("topics-list");e.innerHTML=s.topics.map(a=>`
    <div class="nav-item-wrapper" data-topic-id="${a.id}">
      <button class="nav-item" data-filter-type="topic" data-filter-id="${a.id}">
        <span class="nav-color-dot" style="background: ${a.color};"></span>
        <span>${y(a.name)}</span>
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
  `).join("");const n=document.getElementById("intents-list");n.innerHTML=s.intents.map(a=>`
    <div class="nav-item-wrapper" data-intent-id="${a.id}">
      <button class="nav-item" data-filter-type="intent" data-filter-id="${a.id}">
        <span>${a.emoji}</span>
        <span>${y(a.name)}</span>
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
  `).join("")}function O(){let t=[...s.items];if(s.currentFilter==="recent"){const i=Date.now()-6048e5;t=t.filter(e=>e.savedAt>=i)}else if(typeof s.currentFilter=="object"&&s.currentFilter!==null){const i=s.currentFilter;i.type==="topic"?t=t.filter(e=>e.topicIds.includes(i.id)):t=t.filter(e=>e.intentIds.includes(i.id))}if(s.searchQuery){const i=s.searchQuery.toLowerCase();t=t.filter(e=>{var n;return e.title.toLowerCase().includes(i)||e.url.toLowerCase().includes(i)||((n=e.referrerQuery)==null?void 0:n.toLowerCase().includes(i))})}return t.sort((i,e)=>e.savedAt-i.savedAt),t}function I(){const t=document.getElementById("items-container"),i=document.getElementById("empty-state"),e=O();if(e.length===0){t.style.display="none",i.style.display="flex";return}t.style.display="grid",i.style.display="none",t.classList.toggle("list-view",s.viewMode==="list"),t.innerHTML=e.map(n=>{const a=s.topics.filter(d=>n.topicIds.includes(d.id)),c=s.intents.filter(d=>n.intentIds.includes(d.id)),r=H(n.url);return`
      <div class="item-card" data-item-id="${n.id}" data-url="${y(n.url)}">
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
            ${n.favicon?`<img src="${y(n.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${r[0].toUpperCase()}'">`:r[0].toUpperCase()}
          </div>
          <div class="item-title">${y(n.title)}</div>
        </div>
        
        <div class="item-url">${y(r)}</div>
        
        <div class="item-tags">
          ${a.map(d=>`
            <span class="item-tag topic" style="background: ${Q(d.color,.15)}; color: ${d.color};">
              ${y(d.name)}
            </span>
          `).join("")}
          ${c.map(d=>`
            <span class="item-tag intent">${d.emoji} ${y(d.name)}</span>
          `).join("")}
        </div>
        
        <div class="item-footer">
          <div class="item-context">
            ${n.referrerQuery?`
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <span>"${y(n.referrerQuery)}"</span>
            `:""}
          </div>
          <div class="item-time">${_(n.savedAt)}</div>
        </div>
      </div>
    `}).join("")}function V(){var c,r,d,$,B,S,x,C,M,D,A,R;document.querySelectorAll(".nav-item[data-filter]").forEach(o=>{o.addEventListener("click",()=>{const u=o.getAttribute("data-filter");T(u)})}),(c=document.getElementById("topics-list"))==null||c.addEventListener("click",async o=>{const u=o.target,f=u.closest(".nav-action-btn"),h=u.closest(".nav-item-wrapper");if(f&&h){o.stopPropagation();const l=h.dataset.topicId,v=f.dataset.action,p=s.topics.find(m=>m.id===l);if(v==="edit-topic"&&p){const m=prompt("Edit topic name:",p.name);m!=null&&m.trim()&&m.trim()!==p.name&&(await g("RENAME_TOPIC",{id:l,name:m.trim()}),await w(),b())}else v==="delete-topic"&&confirm(`Delete topic "${p==null?void 0:p.name}"? Items will be untagged from this topic.`)&&(await g("DELETE_TOPIC",{id:l}),await w(),b(),I());return}const E=u.closest(".nav-item");if(E){const l=E.getAttribute("data-filter-id");T({type:"topic",id:l})}}),(r=document.getElementById("intents-list"))==null||r.addEventListener("click",async o=>{const u=o.target,f=u.closest(".nav-action-btn"),h=u.closest(".nav-item-wrapper");if(f&&h){o.stopPropagation();const l=h.dataset.intentId,v=f.dataset.action,p=s.intents.find(m=>m.id===l);if(v==="edit-intent"&&p){const m=prompt("Edit intent name:",p.name);if(m!=null&&m.trim()&&m.trim()!==p.name){const k=prompt("Edit emoji:",p.emoji)||p.emoji;await g("RENAME_INTENT",{id:l,name:m.trim(),emoji:k}),await w(),b()}}else v==="delete-intent"&&confirm(`Delete intent "${p==null?void 0:p.name}"? Items will be untagged from this intent.`)&&(await g("DELETE_INTENT",{id:l}),await w(),b(),I());return}const E=u.closest(".nav-item");if(E){const l=E.getAttribute("data-filter-id");T({type:"intent",id:l})}});const t=document.getElementById("search-input");let i;t.addEventListener("input",()=>{clearTimeout(i),i=setTimeout(()=>{s.searchQuery=t.value,I()},200)}),document.querySelectorAll(".view-btn").forEach(o=>{o.addEventListener("click",()=>{const u=o.getAttribute("data-view");s.viewMode=u,document.querySelectorAll(".view-btn").forEach(f=>f.classList.remove("active")),o.classList.add("active"),I()})}),(d=document.getElementById("items-container"))==null||d.addEventListener("click",async o=>{const u=o.target,f=u.closest(".item-action-btn"),h=u.closest(".item-card");if(!h)return;const E=h.dataset.itemId,l=h.dataset.url;if(f){const v=f.getAttribute("data-action");v==="open"?window.open(l,"_blank"):v==="delete"&&confirm("Delete this item?")&&(await g("DELETE_ITEM",{id:E}),await w(),b(),I())}else window.open(l,"_blank")}),($=document.getElementById("btn-add-topic"))==null||$.addEventListener("click",async()=>{const o=prompt("Enter topic name:");o!=null&&o.trim()&&(await g("CREATE_TOPIC",{name:o.trim()}),await w(),b())}),(B=document.getElementById("btn-add-intent"))==null||B.addEventListener("click",async()=>{const o=prompt("Enter intent name:");if(o!=null&&o.trim()){const u=prompt("Enter emoji (optional):","📌")||"📌";await g("CREATE_INTENT",{name:o.trim(),emoji:u}),await w(),b()}});const e=document.getElementById("settings-modal");(S=document.getElementById("btn-settings"))==null||S.addEventListener("click",()=>{e&&(j(),N(),e.style.display="flex")}),(x=document.getElementById("btn-export-data"))==null||x.addEventListener("click",z),(C=document.getElementById("btn-import-data"))==null||C.addEventListener("click",()=>{var o;(o=document.getElementById("import-file-input"))==null||o.click()}),(M=document.getElementById("import-file-input"))==null||M.addEventListener("change",J),(D=document.getElementById("btn-close-settings"))==null||D.addEventListener("click",()=>{e&&(e.style.display="none")}),e==null||e.addEventListener("click",o=>{o.target===e&&(e.style.display="none")}),(A=document.getElementById("link-chrome-shortcuts"))==null||A.addEventListener("click",o=>{o.preventDefault(),chrome.tabs.create({url:"chrome://extensions/shortcuts"})});const n=document.getElementById("setting-auto-save"),a=document.getElementById("auto-save-value");n==null||n.addEventListener("input",()=>{a&&(a.textContent=`${n.value}s`)}),F(),(R=document.getElementById("btn-save-settings"))==null||R.addEventListener("click",async()=>{const o=parseInt(n.value)*1e3,u=document.getElementById("setting-show-dropdown").checked,f=document.getElementById("setting-newtab-show-logo").checked,h=[];document.querySelectorAll('#shortcuts-checkboxes input[type="checkbox"]:checked').forEach(l=>{const v=l.dataset.shortcutId;v&&h.push(v)});const E=[];document.querySelectorAll(".custom-link-item").forEach(l=>{const v=l.querySelector(".custom-link-name"),p=l.querySelector(".custom-link-url"),m=l.querySelector(".custom-link-icon"),k=l.dataset.linkId;v&&p&&k&&E.push({id:k,name:v.value.trim(),url:p.value.trim(),icon:(m==null?void 0:m.value.trim())||void 0})}),s.settings=await g("UPDATE_SETTINGS",{autoSaveDelay:o,showResurfaceDropdown:u,newTabShowLogo:f,newTabEnabledShortcuts:h,newTabCustomLinks:E}),e&&(e.style.display="none"),alert("Settings saved successfully!")})}function j(){if(!s.settings)return;const t=document.getElementById("current-shortcut");t&&(t.textContent=s.settings.keyboardShortcut);const i=document.getElementById("setting-auto-save"),e=document.getElementById("auto-save-value");i&&(i.value=String(s.settings.autoSaveDelay/1e3),e&&(e.textContent=`${i.value}s`));const n=document.getElementById("setting-show-dropdown");n&&(n.checked=s.settings.showResurfaceDropdown);const a=document.getElementById("setting-newtab-show-logo");a&&(a.checked=s.settings.newTabShowLogo!==!1),U(),P()}function F(){var t;(t=document.getElementById("btn-add-custom-link"))==null||t.addEventListener("click",()=>{G()})}function U(){const t=document.getElementById("shortcuts-checkboxes");if(!t||!s.settings)return;const i=[{id:"gemini",name:"Gemini"},{id:"gmail",name:"Gmail"},{id:"drive",name:"Drive"},{id:"docs",name:"Docs"},{id:"sheets",name:"Sheets"},{id:"slides",name:"Slides"},{id:"youtube",name:"YouTube"},{id:"maps",name:"Maps"},{id:"calendar",name:"Calendar"},{id:"translate",name:"Translate"}],e=s.settings.newTabEnabledShortcuts||[];t.innerHTML=i.map(n=>`
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        data-shortcut-id="${n.id}"
        ${e.includes(n.id)?"checked":""}
      >
      ${n.name}
    </label>
  `).join("")}function P(){const t=document.getElementById("custom-links-list");if(!t||!s.settings)return;const i=s.settings.newTabCustomLinks||[];if(i.length===0){t.innerHTML='<p class="settings-hint" style="margin: 0;">No custom links yet.</p>';return}t.innerHTML=i.map(e=>`
    <div class="custom-link-item" data-link-id="${e.id}">
      <input type="text" class="custom-link-name" placeholder="Name" value="${y(e.name)}">
      <input type="url" class="custom-link-url" placeholder="URL" value="${y(e.url)}">
      <input type="text" class="custom-link-icon" placeholder="Icon (emoji or URL)" value="${e.icon?y(e.icon):""}">
      <button class="btn-icon delete" data-action="delete-custom-link" title="Delete">
        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  `).join(""),t.querySelectorAll('[data-action="delete-custom-link"]').forEach(e=>{e.addEventListener("click",()=>{const n=e.closest(".custom-link-item");n==null||n.remove()})})}function G(){var n;const t=document.getElementById("custom-links-list");if(!t)return;const i=`custom-${Date.now()}`,e=document.createElement("div");e.className="custom-link-item",e.dataset.linkId=i,e.innerHTML=`
    <input type="text" class="custom-link-name" placeholder="Name">
    <input type="url" class="custom-link-url" placeholder="URL">
    <input type="text" class="custom-link-icon" placeholder="Icon (emoji or URL)">
    <button class="btn-icon delete" data-action="delete-custom-link" title="Delete">
      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </button>
  `,t.appendChild(e),(n=e.querySelector('[data-action="delete-custom-link"]'))==null||n.addEventListener("click",()=>{e.remove()})}function T(t){var i,e,n;if(s.currentFilter=t,document.querySelectorAll(".nav-item").forEach(a=>{a.classList.remove("active")}),t==="all")(i=document.querySelector('.nav-item[data-filter="all"]'))==null||i.classList.add("active"),document.getElementById("page-title").textContent="All Saved";else if(t==="recent")(e=document.querySelector('.nav-item[data-filter="recent"]'))==null||e.classList.add("active"),document.getElementById("page-title").textContent="Recent";else{const a=`.nav-item[data-filter-type="${t.type}"][data-filter-id="${t.id}"]`;if((n=document.querySelector(a))==null||n.classList.add("active"),t.type==="topic"){const c=s.topics.find(r=>r.id===t.id);document.getElementById("page-title").textContent=(c==null?void 0:c.name)||"Topic"}else{const c=s.intents.find(r=>r.id===t.id);document.getElementById("page-title").textContent=c?`${c.emoji} ${c.name}`:"Intent"}}I()}function Q(t,i){const e=parseInt(t.slice(1,3),16),n=parseInt(t.slice(3,5),16),a=parseInt(t.slice(5,7),16);return`rgba(${e}, ${n}, ${a}, ${i})`}function N(){const t=document.getElementById("data-stats");if(!t)return;const e=(JSON.stringify({items:s.items,topics:s.topics,intents:s.intents}).length/1024).toFixed(1);t.innerHTML=`
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
  `}async function z(){try{const t=await g("EXPORT_DATA"),i=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),e=URL.createObjectURL(i),a=`resurface-backup-${new Date().toISOString().split("T")[0]}.json`,c=document.createElement("a");c.href=e,c.download=a,document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(e),L("success",`Exported ${t.items.length} pages, ${t.topics.length} topics, ${t.intents.length} intents`)}catch(t){console.error("Export error:",t),L("error","Failed to export data. Please try again.")}}async function J(t){var n;const i=t.target,e=(n=i.files)==null?void 0:n[0];if(e){try{const a=await e.text(),c=JSON.parse(a);if(!c.items||!c.topics||!c.intents)throw new Error("Invalid backup file format");const r=confirm(`Found ${c.items.length} pages, ${c.topics.length} topics, ${c.intents.length} intents.

Click OK to MERGE with existing data (keeps your current pages).
Click Cancel to REPLACE all data (removes current pages).`)?"merge":"replace";if(r==="replace"&&!confirm(`⚠️ WARNING: This will DELETE all your current saved pages and replace them with the backup.

Are you sure you want to continue?`)){i.value="";return}const d=await g("IMPORT_DATA",{data:c,mode:r});if(d.success)L("success",`Imported ${d.imported.items} pages, ${d.imported.topics} topics, ${d.imported.intents} intents`),await w(),b(),I(),N();else throw new Error("Import failed")}catch(a){console.error("Import error:",a),L("error","Failed to import data. Make sure you selected a valid Resurface backup file.")}i.value=""}}function L(t,i){var c,r;const e=document.querySelector(".settings-data-actions");if(!e)return;const n=(c=e.parentElement)==null?void 0:c.querySelector(".data-message");n==null||n.remove();const a=document.createElement("div");a.className=`data-message ${t}`,a.innerHTML=`
    <svg viewBox="0 0 24 24">
      ${t==="success"?'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>':'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
    </svg>
    <span>${y(i)}</span>
  `,(r=e.parentElement)==null||r.appendChild(a),setTimeout(()=>a.remove(),5e3)}document.addEventListener("DOMContentLoaded",q);
