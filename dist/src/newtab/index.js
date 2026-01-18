import{s as w}from"../../messages.js";let k=[],g=[],M=[],p=[],y=[],u="none",c=-1;document.addEventListener("DOMContentLoaded",async()=>{await B(),D(),N(),z(),await U(),q()});async function z(){try{const t=await chrome.commands.getAll(),e=document.querySelector(".newtab-hints");if(!e)return;const n=t.find(h=>h.name==="save-tab"),a=t.find(h=>h.name==="resurface"),i=(n==null?void 0:n.shortcut)||"Not set",s=(a==null?void 0:a.shortcut)||"Not set";e.innerHTML=`
      <a href="#" class="newtab-hint-customize" id="open-dashboard-btn">
        Open dashboard
      </a>
      <span class="newtab-hint-item" title="Click to customize">
        ${C(i)} Save current tab
      </span>
      <span class="newtab-hint-item" title="Click to customize">
        ${C(s)} Search saved tabs
      </span>
      <a href="chrome://extensions/shortcuts" class="newtab-hint-customize" id="customize-shortcuts">
        Customize shortcuts
      </a>
    `;const o=document.getElementById("open-dashboard-btn");o==null||o.addEventListener("click",async h=>{h.preventDefault(),await w("OPEN_DASHBOARD")});const r=document.getElementById("customize-shortcuts");r==null||r.addEventListener("click",h=>{h.preventDefault(),A()})}catch(t){console.error("Error fetching shortcuts:",t)}}function C(t){return!t||t==="Not set"?'<span class="newtab-shortcut-notset">Not set</span>':t.replace("Command","⌘").replace("Cmd","⌘").replace("MacCtrl","⌃").replace("Ctrl","⌃").replace("Alt","⌥").replace("Shift","⇧").split("+").map(n=>`<kbd>${n.trim()}</kbd>`).join("")}function A(){var n,a,i;const t=document.createElement("div");t.className="newtab-shortcut-modal",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("visible"));const e=()=>{t.classList.remove("visible"),setTimeout(()=>t.remove(),200)};(n=t.querySelector("#close-modal"))==null||n.addEventListener("click",e),(a=t.querySelector("#close-modal-btn"))==null||a.addEventListener("click",e),t.addEventListener("click",s=>{s.target===t&&e()}),(i=t.querySelector("#copy-url"))==null||i.addEventListener("click",()=>{navigator.clipboard.writeText("chrome://extensions/shortcuts");const s=t.querySelector("#copy-url");s&&(s.textContent="Copied!",setTimeout(()=>s.textContent="Copy URL",2e3))})}function q(){const t=document.getElementById("search-input");if(!t)return;const e=()=>{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",code:"Escape",keyCode:27,which:27,bubbles:!0,cancelable:!0}))},n=()=>{t.focus(),t.select()};e(),n(),requestAnimationFrame(()=>{e(),n()}),requestAnimationFrame(()=>requestAnimationFrame(n)),[0,10,20,50,100,150,200,300,500].forEach(r=>setTimeout(()=>{e(),n()},r));let i=0;const s=10,o=setInterval(()=>{i++,document.activeElement!==t&&(e(),n()),i>=s&&clearInterval(o)},100);window.addEventListener("focus",()=>{e(),setTimeout(n,0),setTimeout(n,50)}),document.addEventListener("click",r=>{r.target.closest("a, button, input, select, textarea, .newtab-result-item, .newtab-history-item, .newtab-quick-link")||n()}),document.addEventListener("keydown",r=>{r.key.length===1&&!r.ctrlKey&&!r.metaKey&&!r.altKey&&document.activeElement!==t&&n()})}async function B(){try{k=await w("GET_ALL_ITEMS")||[],g=await w("GET_ALL_TOPICS")||[],M=await w("GET_ALL_INTENTS")||[]}catch(t){console.error("Error loading data:",t)}}function D(){const t=document.getElementById("search-input"),e=document.getElementById("results-tray"),n=document.getElementById("history-tray"),a=document.getElementById("open-dashboard");a.href=chrome.runtime.getURL("src/dashboard/index.html");let i=null;t.addEventListener("input",()=>{i&&clearTimeout(i),i=setTimeout(()=>{const s=t.value.trim();x(s)},100)}),t.addEventListener("keydown",s=>{const o=n.querySelectorAll(".newtab-history-item"),r=e.querySelectorAll(".newtab-result-item"),h=o.length,b=r.length;switch(s.key){case"ArrowUp":s.preventDefault(),u==="none"?h>0&&(u="history",c=0):u==="history"?c<h-1&&c++:u==="saved"&&(c===0?(u="none",c=-1):c--),T(o,r);break;case"ArrowDown":s.preventDefault(),u==="none"?b>0&&(u="saved",c=0):u==="history"?c>0?c--:(u="none",c=-1):u==="saved"&&c<b-1&&c++,T(o,r);break;case"Enter":s.preventDefault();const l=t.value.trim();if(S(l)){window.location.href=V(l);return}u==="history"&&y[c]?window.location.href=y[c].url:u==="saved"&&p[c]?window.location.href=p[c].url:l&&(window.location.href=`https://www.google.com/search?q=${encodeURIComponent(l)}`);break;case"Escape":t.value="",x(""),u="none",c=-1;break}}),n.addEventListener("click",s=>{const o=s.target.closest(".newtab-history-item");if(o){const r=o.dataset.url;r&&(window.location.href=r)}}),e.addEventListener("click",s=>{const o=s.target.closest(".newtab-result-item");if(o){const r=o.dataset.url;r&&(window.location.href=r)}})}function E(t){t.querySelectorAll("img[data-fallback]").forEach(e=>{e.addEventListener("error",function(){var s;const a=this.getAttribute("data-fallback")||"";this.style.display="none";const i=this.parentElement;i&&!((s=i.textContent)!=null&&s.trim())&&(i.textContent=a)})})}function S(t){return t.includes(" ")?!1:!!(/^https?:\/\//i.test(t)||/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/.test(t)||/^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?/.test(t))}function V(t){return/^https?:\/\//i.test(t)?t:`https://${t}`}async function x(t){const e=document.getElementById("results-tray"),n=document.getElementById("results-list"),a=document.getElementById("results-count"),i=document.getElementById("results-header"),s=document.getElementById("history-tray"),o=document.getElementById("history-list"),r=document.getElementById("search-hint");if(u="none",c=-1,!t||t.length<1){e.classList.remove("visible"),s.classList.remove("visible"),r.innerHTML="<kbd>↵</kbd> Google",p=[],y=[];return}if(S(t)){e.classList.remove("visible"),s.classList.remove("visible"),r.innerHTML="<kbd>↵</kbd> Go to site",p=[],y=[];return}try{const l=await chrome.history.search({text:t,maxResults:50,startTime:Date.now()-2592e6});if(l.length>0){const m=new Map;for(const d of l){if(!d.url||!d.title)continue;const f=m.get(d.url);f?(f.count+=d.visitCount||1,d.lastVisitTime&&d.lastVisitTime>f.lastVisitTime&&(f.lastVisitTime=d.lastVisitTime,f.item=d)):m.set(d.url,{item:d,count:d.visitCount||1,lastVisitTime:d.lastVisitTime||0})}y=Array.from(m.values()).sort((d,f)=>f.lastVisitTime-d.lastVisitTime).slice(0,5).map(({item:d,count:f,lastVisitTime:L})=>({id:d.id||String(Date.now()),title:d.title||d.url||"",url:d.url||"",domain:$(d.url||""),visitTime:L?I(L):"",visitCount:f}));const H=[...y].reverse();o.innerHTML=H.map((d,f)=>R(d,f)).join(""),E(o),s.classList.add("visible"),requestAnimationFrame(()=>{o.scrollTop=o.scrollHeight})}else s.classList.remove("visible"),y=[]}catch(l){console.error("Error searching history:",l),s.classList.remove("visible"),y=[]}const h=t.toLowerCase(),b=k.filter(l=>{var m;return l.title.toLowerCase().includes(h)||l.url.toLowerCase().includes(h)||((m=l.searchText)==null?void 0:m.toLowerCase().includes(h))}).slice(0,6);b.length>0?(p=b.map(l=>({id:l.id,title:l.title,url:l.url,favicon:l.favicon,domain:$(l.url),savedAt:I(l.savedAt),topics:g.filter(m=>l.topicIds.includes(m.id)),intents:M.filter(m=>l.intentIds.includes(m.id))})),a.textContent=String(b.length),n.innerHTML=p.map((l,m)=>G(l,m)).join(""),E(n),i.style.display="flex",e.classList.add("visible")):(e.classList.remove("visible"),p=[]),y.length>0&&p.length>0?r.innerHTML="<kbd>↑</kbd> history &nbsp; <kbd>↓</kbd> saved &nbsp; <kbd>↵</kbd> open":y.length>0?r.innerHTML="<kbd>↑</kbd> history &nbsp; <kbd>↵</kbd> open or Google":p.length>0?r.innerHTML="<kbd>↓</kbd> saved &nbsp; <kbd>↵</kbd> open or Google":r.innerHTML="<kbd>↵</kbd> Google"}function R(t,e){const n=t.visitCount>1?`<span class="newtab-history-visits">${t.visitCount}×</span>`:"";return`
    <div class="newtab-history-item" data-url="${v(t.url)}" data-index="${e}" data-section="history">
      <div class="newtab-history-favicon">
        ${t.domain[0].toUpperCase()}
      </div>
      <div class="newtab-history-content">
        <div class="newtab-history-title">${v(t.title)}</div>
        <div class="newtab-history-meta">
          <span class="newtab-history-domain">${v(t.domain)}</span>
          ${t.visitTime?`<span class="newtab-history-separator">•</span><span class="newtab-history-time">${t.visitTime}</span>`:""}
          ${n}
        </div>
      </div>
    </div>
  `}function G(t,e){const n=t.favicon?`<img src="${v(t.favicon)}" alt="" data-fallback="${t.domain[0].toUpperCase()}">`:t.domain[0].toUpperCase();return`
    <div class="newtab-result-item" data-url="${v(t.url)}" data-index="${e}" data-section="saved">
      <div class="newtab-result-favicon">
        ${n}
      </div>
      <div class="newtab-result-content">
        <div class="newtab-result-title">${v(t.title)}</div>
        <div class="newtab-result-meta">
          <span class="newtab-result-domain">${v(t.domain)}</span>
          <span class="newtab-result-separator">•</span>
          <span class="newtab-result-time">${t.savedAt}</span>
        </div>
      </div>
      <div class="newtab-result-tags">
        ${t.topics.slice(0,2).map(a=>`
          <span class="newtab-result-tag" style="background: ${F(a.color,.15)}; color: ${a.color};">
            ${v(a.name)}
          </span>
        `).join("")}
      </div>
    </div>
  `}function T(t,e){var n,a,i,s;if(t.forEach(o=>o.classList.remove("selected")),e.forEach(o=>o.classList.remove("selected")),u!=="none")if(u==="history"&&c>=0){const o=t.length-1-c;(n=t[o])==null||n.classList.add("selected"),(a=t[o])==null||a.scrollIntoView({block:"nearest"})}else u==="saved"&&c>=0&&((i=e[c])==null||i.classList.add("selected"),(s=e[c])==null||s.scrollIntoView({block:"nearest"}))}async function U(){try{const t=await w("GET_SETTINGS"),e=document.getElementById("quick-links"),n=e==null?void 0:e.parentElement;if(!e||!n)return;if(!t.showQuickShortcuts){e.style.display="none",n.style.display="none";return}e.style.display="flex",n.style.display="flex";const a=t.quickShortcuts.filter(s=>s.enabled),i={gemini:'<path d="M12 2L2 12l10 10 10-10L12 2zm0 3.5L18.5 12 12 18.5 5.5 12 12 5.5z" fill="currentColor"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',gmail:'<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>',drive:'<path d="M7.71 3.5L1.15 15l3.43 6h13.71l3.43-6L15.15 3.5H7.71zm.79 1.5h5.57l5.15 9h-5.57l-5.15-9zm-1.58 9.5L2.73 15l2.29 4h10.58l-2.29-4H6.92z" fill="currentColor"/>',docs:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M14 2v6h6" stroke="currentColor" stroke-width="2" fill="none"/><line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" stroke-width="2"/><line x1="8" y1="17" x2="13" y2="17" stroke="currentColor" stroke-width="2"/>',sheets:'<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="2"/><line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" stroke-width="2"/><line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" stroke-width="2"/>',slides:'<rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><polygon points="10,9 10,15 15,12" fill="currentColor"/>',youtube:'<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" fill="currentColor"/>',maps:'<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>',calendar:'<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>',translate:'<path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="currentColor"/>',images:'<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><polyline points="21 15 16 10 5 21" stroke="currentColor" stroke-width="2" fill="none"/>',news:'<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" fill="none"/><line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" stroke-width="2"/><line x1="4" y1="12" x2="12" y2="12" stroke="currentColor" stroke-width="2"/><line x1="4" y1="16" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>'};e.innerHTML=a.map(s=>{const o=i[s.id]||'<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>',r=s.id;return`
        <a href="${s.url}" class="newtab-quick-link" title="${s.title}">
          <div class="newtab-quick-icon ${r}">
            <svg viewBox="0 0 24 24">
              ${o}
            </svg>
          </div>
          <span>${s.title}</span>
        </a>
      `}).join("")}catch(t){console.error("Error loading quick shortcuts:",t)}}function N(){const t=document.getElementById("stat-total"),e=document.getElementById("stat-topics");t.textContent=String(k.length),e.textContent=String(g.length)}function $(t){try{return new URL(t).hostname.replace("www.","")}catch{return t}}function I(t){const e=Math.floor((Date.now()-t)/1e3);if(e<60)return"Just now";const n=Math.floor(e/60);if(n<60)return`${n}m ago`;const a=Math.floor(n/60);if(a<24)return`${a}h ago`;const i=Math.floor(a/24);if(i<7)return`${i}d ago`;const s=Math.floor(i/7);if(s<4)return`${s}w ago`;const o=Math.floor(i/30);return o<12?`${o}mo ago`:`${Math.floor(i/365)}y ago`}function v(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function F(t,e){const n=parseInt(t.slice(1,3),16),a=parseInt(t.slice(3,5),16),i=parseInt(t.slice(5,7),16);return`rgba(${n}, ${a}, ${i}, ${e})`}
