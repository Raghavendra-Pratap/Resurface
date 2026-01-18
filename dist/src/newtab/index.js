import{s as y}from"../../messages.js";let w=[],g=[],C=[],f=[],h=[],d="none",l=-1;document.addEventListener("DOMContentLoaded",async()=>{await H(),B(),z(),M(),A()});async function M(){try{const t=await chrome.commands.getAll(),e=document.querySelector(".newtab-hints");if(!e)return;const s=t.find(o=>o.name==="save-tab"),a=t.find(o=>o.name==="resurface"),i=(s==null?void 0:s.shortcut)||"Not set",n=(a==null?void 0:a.shortcut)||"Not set";e.innerHTML=`
      <span class="newtab-hint-item" title="Click to customize">
        ${L(i)} Save current tab
      </span>
      <span class="newtab-hint-item" title="Click to customize">
        ${L(n)} Search saved tabs
      </span>
      <a href="chrome://extensions/shortcuts" class="newtab-hint-customize" id="customize-shortcuts">
        Customize shortcuts
      </a>
    `;const r=document.getElementById("customize-shortcuts");r==null||r.addEventListener("click",o=>{o.preventDefault(),x()})}catch(t){console.error("Error fetching shortcuts:",t)}}function L(t){return!t||t==="Not set"?'<span class="newtab-shortcut-notset">Not set</span>':t.replace("Command","⌘").replace("Cmd","⌘").replace("MacCtrl","⌃").replace("Ctrl","⌃").replace("Alt","⌥").replace("Shift","⇧").split("+").map(s=>`<kbd>${s.trim()}</kbd>`).join("")}function x(){var s,a,i;const t=document.createElement("div");t.className="newtab-shortcut-modal",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("visible"));const e=()=>{t.classList.remove("visible"),setTimeout(()=>t.remove(),200)};(s=t.querySelector("#close-modal"))==null||s.addEventListener("click",e),(a=t.querySelector("#close-modal-btn"))==null||a.addEventListener("click",e),t.addEventListener("click",n=>{n.target===t&&e()}),(i=t.querySelector("#copy-url"))==null||i.addEventListener("click",()=>{navigator.clipboard.writeText("chrome://extensions/shortcuts");const n=t.querySelector("#copy-url");n&&(n.textContent="Copied!",setTimeout(()=>n.textContent="Copy URL",2e3))})}function A(){const t=document.getElementById("search-input");if(!t)return;const e=()=>{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",code:"Escape",keyCode:27,which:27,bubbles:!0,cancelable:!0}))},s=()=>{t.focus(),t.select()};e(),s(),requestAnimationFrame(()=>{e(),s()}),requestAnimationFrame(()=>requestAnimationFrame(s)),[0,10,20,50,100,150,200,300,500].forEach(o=>setTimeout(()=>{e(),s()},o));let i=0;const n=10,r=setInterval(()=>{i++,document.activeElement!==t&&(e(),s()),i>=n&&clearInterval(r)},100);window.addEventListener("focus",()=>{e(),setTimeout(s,0),setTimeout(s,50)}),document.addEventListener("click",o=>{o.target.closest("a, button, input, select, textarea, .newtab-result-item, .newtab-history-item, .newtab-quick-link")||s()}),document.addEventListener("keydown",o=>{o.key.length===1&&!o.ctrlKey&&!o.metaKey&&!o.altKey&&document.activeElement!==t&&s()})}async function H(){try{w=await y("GET_ALL_ITEMS")||[],g=await y("GET_ALL_TOPICS")||[],C=await y("GET_ALL_INTENTS")||[]}catch(t){console.error("Error loading data:",t)}}function B(){const t=document.getElementById("search-input"),e=document.getElementById("results-tray"),s=document.getElementById("history-tray"),a=document.getElementById("open-dashboard");a.href=chrome.runtime.getURL("src/dashboard/index.html");let i=null;t.addEventListener("input",()=>{i&&clearTimeout(i),i=setTimeout(()=>{const n=t.value.trim();k(n)},100)}),t.addEventListener("keydown",n=>{const r=s.querySelectorAll(".newtab-history-item"),o=e.querySelectorAll(".newtab-result-item"),p=r.length,v=o.length;switch(n.key){case"ArrowUp":n.preventDefault(),d==="none"?p>0&&(d="history",l=0):d==="history"?l<p-1&&l++:d==="saved"&&(l===0?(d="none",l=-1):l--),E(r,o);break;case"ArrowDown":n.preventDefault(),d==="none"?v>0&&(d="saved",l=0):d==="history"?l>0?l--:(d="none",l=-1):d==="saved"&&l<v-1&&l++,E(r,o);break;case"Enter":n.preventDefault();const c=t.value.trim();if($(c)){window.location.href=D(c);return}d==="history"&&h[l]?window.location.href=h[l].url:d==="saved"&&f[l]?window.location.href=f[l].url:c&&(window.location.href=`https://www.google.com/search?q=${encodeURIComponent(c)}`);break;case"Escape":t.value="",k(""),d="none",l=-1;break}}),s.addEventListener("click",n=>{const r=n.target.closest(".newtab-history-item");if(r){const o=r.dataset.url;o&&(window.location.href=o)}}),e.addEventListener("click",n=>{const r=n.target.closest(".newtab-result-item");if(r){const o=r.dataset.url;o&&(window.location.href=o)}})}function $(t){return t.includes(" ")?!1:!!(/^https?:\/\//i.test(t)||/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/.test(t)||/^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?/.test(t))}function D(t){return/^https?:\/\//i.test(t)?t:`https://${t}`}async function k(t){const e=document.getElementById("results-tray"),s=document.getElementById("results-list"),a=document.getElementById("results-count"),i=document.getElementById("results-header"),n=document.getElementById("history-tray"),r=document.getElementById("history-list"),o=document.getElementById("search-hint");if(d="none",l=-1,!t||t.length<1){e.classList.remove("visible"),n.classList.remove("visible"),o.innerHTML="<kbd>↵</kbd> Google",f=[],h=[];return}if($(t)){e.classList.remove("visible"),n.classList.remove("visible"),o.innerHTML="<kbd>↵</kbd> Go to site",f=[],h=[];return}try{const c=await chrome.history.search({text:t,maxResults:5,startTime:Date.now()-2592e6});if(c.length>0){h=c.filter(u=>u.url&&u.title).map(u=>({id:u.id||String(Date.now()),title:u.title||u.url||"",url:u.url||"",domain:T(u.url||""),visitTime:u.lastVisitTime?I(u.lastVisitTime):""}));const m=[...h].reverse();r.innerHTML=m.map((u,S)=>q(u,S)).join(""),n.classList.add("visible"),requestAnimationFrame(()=>{r.scrollTop=r.scrollHeight})}else n.classList.remove("visible"),h=[]}catch(c){console.error("Error searching history:",c),n.classList.remove("visible"),h=[]}const p=t.toLowerCase(),v=w.filter(c=>{var m;return c.title.toLowerCase().includes(p)||c.url.toLowerCase().includes(p)||((m=c.searchText)==null?void 0:m.toLowerCase().includes(p))}).slice(0,6);v.length>0?(f=v.map(c=>({id:c.id,title:c.title,url:c.url,favicon:c.favicon,domain:T(c.url),savedAt:I(c.savedAt),topics:g.filter(m=>c.topicIds.includes(m.id)),intents:C.filter(m=>c.intentIds.includes(m.id))})),a.textContent=String(v.length),s.innerHTML=f.map((c,m)=>R(c,m)).join(""),i.style.display="flex",e.classList.add("visible")):(e.classList.remove("visible"),f=[]),h.length>0&&f.length>0?o.innerHTML="<kbd>↑</kbd> history &nbsp; <kbd>↓</kbd> saved &nbsp; <kbd>↵</kbd> open":h.length>0?o.innerHTML="<kbd>↑</kbd> history &nbsp; <kbd>↵</kbd> open or Google":f.length>0?o.innerHTML="<kbd>↓</kbd> saved &nbsp; <kbd>↵</kbd> open or Google":o.innerHTML="<kbd>↵</kbd> Google"}function q(t,e){return`
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
  `}function R(t,e){const s=t.favicon?`<img src="${b(t.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${t.domain[0].toUpperCase()}'">`:t.domain[0].toUpperCase();return`
    <div class="newtab-result-item" data-url="${b(t.url)}" data-index="${e}" data-section="saved">
      <div class="newtab-result-favicon">
        ${s}
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
        ${t.topics.slice(0,2).map(a=>`
          <span class="newtab-result-tag" style="background: ${U(a.color,.15)}; color: ${a.color};">
            ${b(a.name)}
          </span>
        `).join("")}
      </div>
    </div>
  `}function E(t,e){var s,a,i,n;if(t.forEach(r=>r.classList.remove("selected")),e.forEach(r=>r.classList.remove("selected")),d!=="none")if(d==="history"&&l>=0){const r=t.length-1-l;(s=t[r])==null||s.classList.add("selected"),(a=t[r])==null||a.scrollIntoView({block:"nearest"})}else d==="saved"&&l>=0&&((i=e[l])==null||i.classList.add("selected"),(n=e[l])==null||n.scrollIntoView({block:"nearest"}))}function z(){const t=document.getElementById("stat-total"),e=document.getElementById("stat-topics");t.textContent=String(w.length),e.textContent=String(g.length)}function T(t){try{return new URL(t).hostname.replace("www.","")}catch{return t}}function I(t){const e=Math.floor((Date.now()-t)/1e3);if(e<60)return"Just now";const s=Math.floor(e/60);if(s<60)return`${s}m ago`;const a=Math.floor(s/60);if(a<24)return`${a}h ago`;const i=Math.floor(a/24);if(i<7)return`${i}d ago`;const n=Math.floor(i/7);if(n<4)return`${n}w ago`;const r=Math.floor(i/30);return r<12?`${r}mo ago`:`${Math.floor(i/365)}y ago`}function b(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function U(t,e){const s=parseInt(t.slice(1,3),16),a=parseInt(t.slice(3,5),16),i=parseInt(t.slice(5,7),16);return`rgba(${s}, ${a}, ${i}, ${e})`}
