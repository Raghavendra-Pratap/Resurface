import{s as y}from"../../messages.js";let w=[],g=[],$=[],f=[],h=[],d="none",c=-1;document.addEventListener("DOMContentLoaded",async()=>{await H(),B(),z(),M(),A()});async function M(){try{const t=await chrome.commands.getAll(),e=document.querySelector(".newtab-hints");if(!e)return;const r=t.find(a=>a.name==="save-tab"),o=t.find(a=>a.name==="resurface"),l=(r==null?void 0:r.shortcut)||"Not set",n=(o==null?void 0:o.shortcut)||"Not set";e.innerHTML=`
      <span class="newtab-hint-item" title="Click to customize">
        ${L(l)} Save current tab
      </span>
      <span class="newtab-hint-item" title="Click to customize">
        ${L(n)} Search saved tabs
      </span>
      <a href="chrome://extensions/shortcuts" class="newtab-hint-customize" id="customize-shortcuts">
        Customize shortcuts
      </a>
    `;const s=document.getElementById("customize-shortcuts");s==null||s.addEventListener("click",a=>{a.preventDefault(),x()})}catch(t){console.error("Error fetching shortcuts:",t)}}function L(t){return!t||t==="Not set"?'<span class="newtab-shortcut-notset">Not set</span>':t.replace("Command","⌘").replace("Cmd","⌘").replace("MacCtrl","⌃").replace("Ctrl","⌃").replace("Alt","⌥").replace("Shift","⇧").split("+").map(r=>`<kbd>${r.trim()}</kbd>`).join("")}function x(){var r,o,l;const t=document.createElement("div");t.className="newtab-shortcut-modal",t.innerHTML=`
    <div class="newtab-shortcut-modal-content">
      <div class="newtab-shortcut-modal-header">
        <h3>Customize Keyboard Shortcuts</h3>
        <button class="newtab-shortcut-modal-close" id="close-modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="newtab-shortcut-modal-body">
        <p>To customize Resurface's keyboard shortcuts:</p>
        <ol>
          <li>Open Chrome and go to <code>chrome://extensions</code></li>
          <li>Click the <strong>menu icon</strong> (☰) in the top-left</li>
          <li>Select <strong>"Keyboard shortcuts"</strong></li>
          <li>Find <strong>Resurface</strong> and set your preferred shortcuts</li>
        </ol>
        <div class="newtab-shortcut-modal-actions">
          <button class="newtab-btn newtab-btn-secondary" id="copy-url">
            Copy URL
          </button>
          <button class="newtab-btn newtab-btn-primary" id="close-modal-btn">
            Got it
          </button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("visible"));const e=()=>{t.classList.remove("visible"),setTimeout(()=>t.remove(),200)};(r=t.querySelector("#close-modal"))==null||r.addEventListener("click",e),(o=t.querySelector("#close-modal-btn"))==null||o.addEventListener("click",e),t.addEventListener("click",n=>{n.target===t&&e()}),(l=t.querySelector("#copy-url"))==null||l.addEventListener("click",()=>{navigator.clipboard.writeText("chrome://extensions/shortcuts");const n=t.querySelector("#copy-url");n&&(n.textContent="Copied!",setTimeout(()=>n.textContent="Copy URL",2e3))})}function A(){const t=document.getElementById("search-input");if(!t)return;const e=()=>{t.focus(),t.select()};e(),requestAnimationFrame(e),requestAnimationFrame(()=>requestAnimationFrame(e)),[0,10,20,50,100,150,200,300,500].forEach(s=>setTimeout(e,s));let o=0;const l=10,n=setInterval(()=>{o++,document.activeElement!==t&&e(),o>=l&&clearInterval(n)},100);window.addEventListener("focus",()=>{setTimeout(e,0),setTimeout(e,50)}),document.addEventListener("click",s=>{s.target.closest("a, button, input, select, textarea, .newtab-result-item, .newtab-history-item")||e()}),document.addEventListener("keydown",s=>{s.key.length===1&&!s.ctrlKey&&!s.metaKey&&!s.altKey&&document.activeElement!==t&&e()})}async function H(){try{w=await y("GET_ALL_ITEMS")||[],g=await y("GET_ALL_TOPICS")||[],$=await y("GET_ALL_INTENTS")||[]}catch(t){console.error("Error loading data:",t)}}function B(){const t=document.getElementById("search-input"),e=document.getElementById("results-tray"),r=document.getElementById("history-tray"),o=document.getElementById("open-dashboard");o.href=chrome.runtime.getURL("src/dashboard/index.html");let l=null;t.addEventListener("input",()=>{l&&clearTimeout(l),l=setTimeout(()=>{const n=t.value.trim();k(n)},100)}),t.addEventListener("keydown",n=>{const s=r.querySelectorAll(".newtab-history-item"),a=e.querySelectorAll(".newtab-result-item"),v=s.length,p=a.length;switch(n.key){case"ArrowUp":n.preventDefault(),d==="none"?v>0&&(d="history",c=0):d==="history"?c<v-1&&c++:d==="saved"&&(c===0?(d="none",c=-1):c--),T(s,a);break;case"ArrowDown":n.preventDefault(),d==="none"?p>0&&(d="saved",c=0):d==="history"?c>0?c--:(d="none",c=-1):d==="saved"&&c<p-1&&c++,T(s,a);break;case"Enter":n.preventDefault();const i=t.value.trim();if(C(i)){window.location.href=D(i);return}d==="history"&&h[c]?window.location.href=h[c].url:d==="saved"&&f[c]?window.location.href=f[c].url:i&&(window.location.href=`https://www.google.com/search?q=${encodeURIComponent(i)}`);break;case"Escape":t.value="",k(""),d="none",c=-1;break}}),r.addEventListener("click",n=>{const s=n.target.closest(".newtab-history-item");if(s){const a=s.dataset.url;a&&(window.location.href=a)}}),e.addEventListener("click",n=>{const s=n.target.closest(".newtab-result-item");if(s){const a=s.dataset.url;a&&(window.location.href=a)}})}function C(t){return t.includes(" ")?!1:!!(/^https?:\/\//i.test(t)||/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/.test(t)||/^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?/.test(t))}function D(t){return/^https?:\/\//i.test(t)?t:`https://${t}`}async function k(t){const e=document.getElementById("results-tray"),r=document.getElementById("results-list"),o=document.getElementById("results-count"),l=document.getElementById("results-header"),n=document.getElementById("history-tray"),s=document.getElementById("history-list"),a=document.getElementById("search-hint");if(d="none",c=-1,!t||t.length<1){e.classList.remove("visible"),n.classList.remove("visible"),a.innerHTML="<kbd>↵</kbd> Google",f=[],h=[];return}if(C(t)){e.classList.remove("visible"),n.classList.remove("visible"),a.innerHTML="<kbd>↵</kbd> Go to site",f=[],h=[];return}try{const i=await chrome.history.search({text:t,maxResults:5,startTime:Date.now()-2592e6});if(i.length>0){h=i.filter(u=>u.url&&u.title).map(u=>({id:u.id||String(Date.now()),title:u.title||u.url||"",url:u.url||"",domain:E(u.url||""),visitTime:u.lastVisitTime?I(u.lastVisitTime):""}));const m=[...h].reverse();s.innerHTML=m.map((u,S)=>R(u,S)).join(""),n.classList.add("visible"),requestAnimationFrame(()=>{s.scrollTop=s.scrollHeight})}else n.classList.remove("visible"),h=[]}catch(i){console.error("Error searching history:",i),n.classList.remove("visible"),h=[]}const v=t.toLowerCase(),p=w.filter(i=>{var m;return i.title.toLowerCase().includes(v)||i.url.toLowerCase().includes(v)||((m=i.searchText)==null?void 0:m.toLowerCase().includes(v))}).slice(0,6);p.length>0?(f=p.map(i=>({id:i.id,title:i.title,url:i.url,favicon:i.favicon,domain:E(i.url),savedAt:I(i.savedAt),topics:g.filter(m=>i.topicIds.includes(m.id)),intents:$.filter(m=>i.intentIds.includes(m.id))})),o.textContent=String(p.length),r.innerHTML=f.map((i,m)=>q(i,m)).join(""),l.style.display="flex",e.classList.add("visible")):(e.classList.remove("visible"),f=[]),h.length>0&&f.length>0?a.innerHTML="<kbd>↑</kbd> history &nbsp; <kbd>↓</kbd> saved &nbsp; <kbd>↵</kbd> open":h.length>0?a.innerHTML="<kbd>↑</kbd> history &nbsp; <kbd>↵</kbd> open or Google":f.length>0?a.innerHTML="<kbd>↓</kbd> saved &nbsp; <kbd>↵</kbd> open or Google":a.innerHTML="<kbd>↵</kbd> Google"}function R(t,e){return`
    <div class="newtab-history-item" data-url="${b(t.url)}" data-index="${e}" data-section="history">
      <div class="newtab-history-favicon">
        ${t.domain[0].toUpperCase()}
      </div>
      <div class="newtab-history-content">
        <div class="newtab-history-title">${b(t.title)}</div>
        <div class="newtab-history-meta">
          <span class="newtab-history-domain">${b(t.domain)}</span>
          ${t.visitTime?`<span class="newtab-history-separator">•</span><span class="newtab-history-time">${t.visitTime}</span>`:""}
        </div>
      </div>
    </div>
  `}function q(t,e){const r=t.favicon?`<img src="${b(t.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${t.domain[0].toUpperCase()}'">`:t.domain[0].toUpperCase();return`
    <div class="newtab-result-item" data-url="${b(t.url)}" data-index="${e}" data-section="saved">
      <div class="newtab-result-favicon">
        ${r}
      </div>
      <div class="newtab-result-content">
        <div class="newtab-result-title">${b(t.title)}</div>
        <div class="newtab-result-meta">
          <span class="newtab-result-domain">${b(t.domain)}</span>
          <span class="newtab-result-separator">•</span>
          <span class="newtab-result-time">${t.savedAt}</span>
        </div>
      </div>
      <div class="newtab-result-tags">
        ${t.topics.slice(0,2).map(o=>`
          <span class="newtab-result-tag" style="background: ${U(o.color,.15)}; color: ${o.color};">
            ${b(o.name)}
          </span>
        `).join("")}
      </div>
    </div>
  `}function T(t,e){var r,o,l,n;if(t.forEach(s=>s.classList.remove("selected")),e.forEach(s=>s.classList.remove("selected")),d!=="none")if(d==="history"&&c>=0){const s=t.length-1-c;(r=t[s])==null||r.classList.add("selected"),(o=t[s])==null||o.scrollIntoView({block:"nearest"})}else d==="saved"&&c>=0&&((l=e[c])==null||l.classList.add("selected"),(n=e[c])==null||n.scrollIntoView({block:"nearest"}))}function z(){const t=document.getElementById("stat-total"),e=document.getElementById("stat-topics");t.textContent=String(w.length),e.textContent=String(g.length)}function E(t){try{return new URL(t).hostname.replace("www.","")}catch{return t}}function I(t){const e=Math.floor((Date.now()-t)/1e3);if(e<60)return"Just now";const r=Math.floor(e/60);if(r<60)return`${r}m ago`;const o=Math.floor(r/60);if(o<24)return`${o}h ago`;const l=Math.floor(o/24);if(l<7)return`${l}d ago`;const n=Math.floor(l/7);if(n<4)return`${n}w ago`;const s=Math.floor(l/30);return s<12?`${s}mo ago`:`${Math.floor(l/365)}y ago`}function b(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function U(t,e){const r=parseInt(t.slice(1,3),16),o=parseInt(t.slice(3,5),16),l=parseInt(t.slice(5,7),16);return`rgba(${r}, ${o}, ${l}, ${e})`}
