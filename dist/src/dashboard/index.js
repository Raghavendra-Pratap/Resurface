import{s as v}from"../../messages.js";function k(t){try{const{hostname:n}=new URL(t);return n.replace("www.","")}catch{return""}}function A(t){const n=Math.floor((Date.now()-t)/1e3);if(n<60)return"Just now";const e=Math.floor(n/60);if(e<60)return`${e}m ago`;const i=Math.floor(e/60);if(i<24)return`${i}h ago`;const s=Math.floor(i/24);if(s<7)return`${s}d ago`;const r=Math.floor(s/7);if(r<4)return`${r}w ago`;const l=Math.floor(s/30);return l<12?`${l}mo ago`:`${Math.floor(s/365)}y ago`}function u(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}const o={items:[],topics:[],intents:[],settings:null,currentFilter:"all",searchQuery:"",viewMode:"grid"};async function x(){await y(),g(),p(),D()}async function y(){try{o.items=await v("GET_ALL_ITEMS"),o.topics=await v("GET_ALL_TOPICS"),o.intents=await v("GET_ALL_INTENTS"),o.settings=await v("GET_SETTINGS"),S()}catch(t){console.error("Failed to load data:",t)}}function g(){document.getElementById("count-all").textContent=String(o.items.length);const t=new Date;t.setHours(0,0,0,0);const n=o.items.filter(s=>s.savedAt>=t.getTime()-7*24*60*60*1e3).length;document.getElementById("count-recent").textContent=String(n);const e=document.getElementById("topics-list");e.innerHTML=o.topics.map(s=>`
    <button class="nav-item" data-filter-type="topic" data-filter-id="${s.id}">
      <span class="nav-color-dot" style="background: ${s.color};"></span>
      <span>${u(s.name)}</span>
      <span class="nav-count">${s.itemCount}</span>
    </button>
  `).join("");const i=document.getElementById("intents-list");i.innerHTML=o.intents.map(s=>`
    <button class="nav-item" data-filter-type="intent" data-filter-id="${s.id}">
      <span>${s.emoji}</span>
      <span>${u(s.name)}</span>
      <span class="nav-count">${s.itemCount}</span>
    </button>
  `).join("")}function M(){let t=[...o.items];if(o.currentFilter==="recent"){const n=Date.now()-6048e5;t=t.filter(e=>e.savedAt>=n)}else if(typeof o.currentFilter=="object"&&o.currentFilter!==null){const n=o.currentFilter;n.type==="topic"?t=t.filter(e=>e.topicIds.includes(n.id)):t=t.filter(e=>e.intentIds.includes(n.id))}if(o.searchQuery){const n=o.searchQuery.toLowerCase();t=t.filter(e=>{var i;return e.title.toLowerCase().includes(n)||e.url.toLowerCase().includes(n)||((i=e.referrerQuery)==null?void 0:i.toLowerCase().includes(n))})}return t.sort((n,e)=>e.savedAt-n.savedAt),t}function p(){const t=document.getElementById("items-container"),n=document.getElementById("empty-state"),e=M();if(e.length===0){t.style.display="none",n.style.display="flex";return}t.style.display="grid",n.style.display="none",t.classList.toggle("list-view",o.viewMode==="list"),t.innerHTML=e.map(i=>{const s=o.topics.filter(d=>i.topicIds.includes(d.id)),r=o.intents.filter(d=>i.intentIds.includes(d.id)),l=k(i.url);return`
      <div class="item-card" data-item-id="${i.id}" data-url="${u(i.url)}">
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
            ${i.favicon?`<img src="${u(i.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${l[0].toUpperCase()}'">`:l[0].toUpperCase()}
          </div>
          <div class="item-title">${u(i.title)}</div>
        </div>
        
        <div class="item-url">${u(l)}</div>
        
        <div class="item-tags">
          ${s.map(d=>`
            <span class="item-tag topic" style="background: ${_(d.color,.15)}; color: ${d.color};">
              ${u(d.name)}
            </span>
          `).join("")}
          ${r.map(d=>`
            <span class="item-tag intent">${d.emoji} ${u(d.name)}</span>
          `).join("")}
        </div>
        
        <div class="item-footer">
          <div class="item-context">
            ${i.referrerQuery?`
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <span>"${u(i.referrerQuery)}"</span>
            `:""}
          </div>
          <div class="item-time">${A(i.savedAt)}</div>
        </div>
      </div>
    `}).join("")}function D(){var r,l,d,w,I,h,L,$,b;document.querySelectorAll(".nav-item[data-filter]").forEach(a=>{a.addEventListener("click",()=>{const c=a.getAttribute("data-filter");E(c)})}),(r=document.getElementById("topics-list"))==null||r.addEventListener("click",a=>{const c=a.target.closest(".nav-item");if(c){const m=c.getAttribute("data-filter-id");E({type:"topic",id:m})}}),(l=document.getElementById("intents-list"))==null||l.addEventListener("click",a=>{const c=a.target.closest(".nav-item");if(c){const m=c.getAttribute("data-filter-id");E({type:"intent",id:m})}});const t=document.getElementById("search-input");let n;t.addEventListener("input",()=>{clearTimeout(n),n=setTimeout(()=>{o.searchQuery=t.value,p()},200)}),document.querySelectorAll(".view-btn").forEach(a=>{a.addEventListener("click",()=>{const c=a.getAttribute("data-view");o.viewMode=c,document.querySelectorAll(".view-btn").forEach(m=>m.classList.remove("active")),a.classList.add("active"),p()})}),(d=document.getElementById("items-container"))==null||d.addEventListener("click",async a=>{const c=a.target,m=c.closest(".item-action-btn"),f=c.closest(".item-card");if(!f)return;const C=f.dataset.itemId,B=f.dataset.url;if(m){const T=m.getAttribute("data-action");T==="open"?window.open(B,"_blank"):T==="delete"&&confirm("Delete this item?")&&(await v("DELETE_ITEM",{id:C}),await y(),g(),p())}else window.open(B,"_blank")}),(w=document.getElementById("btn-add-topic"))==null||w.addEventListener("click",async()=>{const a=prompt("Enter topic name:");a!=null&&a.trim()&&(await v("CREATE_TOPIC",{name:a.trim()}),await y(),g())}),(I=document.getElementById("btn-add-intent"))==null||I.addEventListener("click",async()=>{const a=prompt("Enter intent name:");if(a!=null&&a.trim()){const c=prompt("Enter emoji (optional):","📌")||"📌";await v("CREATE_INTENT",{name:a.trim(),emoji:c}),await y(),g()}});const e=document.getElementById("settings-modal");(h=document.getElementById("btn-settings"))==null||h.addEventListener("click",()=>{e&&(S(),e.style.display="flex")}),(L=document.getElementById("btn-close-settings"))==null||L.addEventListener("click",()=>{e&&(e.style.display="none")}),e==null||e.addEventListener("click",a=>{a.target===e&&(e.style.display="none")}),($=document.getElementById("link-chrome-shortcuts"))==null||$.addEventListener("click",a=>{a.preventDefault(),chrome.tabs.create({url:"chrome://extensions/shortcuts"})});const i=document.getElementById("setting-auto-save"),s=document.getElementById("auto-save-value");i==null||i.addEventListener("input",()=>{s&&(s.textContent=`${i.value}s`)}),(b=document.getElementById("btn-save-settings"))==null||b.addEventListener("click",async()=>{const a=parseInt(i.value)*1e3,c=document.getElementById("setting-show-dropdown").checked;o.settings=await v("UPDATE_SETTINGS",{autoSaveDelay:a,showResurfaceDropdown:c}),e&&(e.style.display="none"),alert("Settings saved successfully!")})}function S(){if(!o.settings)return;const t=document.getElementById("current-shortcut");t&&(t.textContent=o.settings.keyboardShortcut);const n=document.getElementById("setting-auto-save"),e=document.getElementById("auto-save-value");n&&(n.value=String(o.settings.autoSaveDelay/1e3),e&&(e.textContent=`${n.value}s`));const i=document.getElementById("setting-show-dropdown");i&&(i.checked=o.settings.showResurfaceDropdown)}function E(t){var n,e,i;if(o.currentFilter=t,document.querySelectorAll(".nav-item").forEach(s=>{s.classList.remove("active")}),t==="all")(n=document.querySelector('.nav-item[data-filter="all"]'))==null||n.classList.add("active"),document.getElementById("page-title").textContent="All Saved";else if(t==="recent")(e=document.querySelector('.nav-item[data-filter="recent"]'))==null||e.classList.add("active"),document.getElementById("page-title").textContent="Recent";else{const s=`.nav-item[data-filter-type="${t.type}"][data-filter-id="${t.id}"]`;if((i=document.querySelector(s))==null||i.classList.add("active"),t.type==="topic"){const r=o.topics.find(l=>l.id===t.id);document.getElementById("page-title").textContent=(r==null?void 0:r.name)||"Topic"}else{const r=o.intents.find(l=>l.id===t.id);document.getElementById("page-title").textContent=r?`${r.emoji} ${r.name}`:"Intent"}}p()}function _(t,n){const e=parseInt(t.slice(1,3),16),i=parseInt(t.slice(3,5),16),s=parseInt(t.slice(5,7),16);return`rgba(${e}, ${i}, ${s}, ${n})`}document.addEventListener("DOMContentLoaded",x);
