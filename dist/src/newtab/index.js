import{s as w}from"../../messages.js";let g=[],L=[],M=[],b=[],f=[],u="none",l=-1;document.addEventListener("DOMContentLoaded",async()=>{await D(),R(),G(),H(),q()});async function H(){try{const t=await chrome.commands.getAll(),e=document.querySelector(".newtab-hints");if(!e)return;const s=t.find(o=>o.name==="save-tab"),r=t.find(o=>o.name==="resurface"),i=(s==null?void 0:s.shortcut)||"Not set",n=(r==null?void 0:r.shortcut)||"Not set";e.innerHTML=`
      <span class="newtab-hint-item" title="Click to customize">
        ${E(i)} Save current tab
      </span>
      <span class="newtab-hint-item" title="Click to customize">
        ${E(n)} Search saved tabs
      </span>
      <a href="chrome://extensions/shortcuts" class="newtab-hint-customize" id="customize-shortcuts">
        Customize shortcuts
      </a>
    `;const a=document.getElementById("customize-shortcuts");a==null||a.addEventListener("click",o=>{o.preventDefault(),B()})}catch(t){console.error("Error fetching shortcuts:",t)}}function E(t){return!t||t==="Not set"?'<span class="newtab-shortcut-notset">Not set</span>':t.replace("Command","⌘").replace("Cmd","⌘").replace("MacCtrl","⌃").replace("Ctrl","⌃").replace("Alt","⌥").replace("Shift","⇧").split("+").map(s=>`<kbd>${s.trim()}</kbd>`).join("")}function B(){var s,r,i;const t=document.createElement("div");t.className="newtab-shortcut-modal",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("visible"));const e=()=>{t.classList.remove("visible"),setTimeout(()=>t.remove(),200)};(s=t.querySelector("#close-modal"))==null||s.addEventListener("click",e),(r=t.querySelector("#close-modal-btn"))==null||r.addEventListener("click",e),t.addEventListener("click",n=>{n.target===t&&e()}),(i=t.querySelector("#copy-url"))==null||i.addEventListener("click",()=>{navigator.clipboard.writeText("chrome://extensions/shortcuts");const n=t.querySelector("#copy-url");n&&(n.textContent="Copied!",setTimeout(()=>n.textContent="Copy URL",2e3))})}function q(){const t=document.getElementById("search-input");if(!t)return;const e=()=>{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",code:"Escape",keyCode:27,which:27,bubbles:!0,cancelable:!0}))},s=()=>{t.focus(),t.select()};e(),s(),requestAnimationFrame(()=>{e(),s()}),requestAnimationFrame(()=>requestAnimationFrame(s)),[0,10,20,50,100,150,200,300,500].forEach(o=>setTimeout(()=>{e(),s()},o));let i=0;const n=10,a=setInterval(()=>{i++,document.activeElement!==t&&(e(),s()),i>=n&&clearInterval(a)},100);window.addEventListener("focus",()=>{e(),setTimeout(s,0),setTimeout(s,50)}),document.addEventListener("click",o=>{o.target.closest("a, button, input, select, textarea, .newtab-result-item, .newtab-history-item, .newtab-quick-link")||s()}),document.addEventListener("keydown",o=>{o.key.length===1&&!o.ctrlKey&&!o.metaKey&&!o.altKey&&document.activeElement!==t&&s()})}async function D(){try{g=await w("GET_ALL_ITEMS")||[],L=await w("GET_ALL_TOPICS")||[],M=await w("GET_ALL_INTENTS")||[]}catch(t){console.error("Error loading data:",t)}}function R(){const t=document.getElementById("search-input"),e=document.getElementById("results-tray"),s=document.getElementById("history-tray"),r=document.getElementById("open-dashboard");r.href=chrome.runtime.getURL("src/dashboard/index.html");let i=null;t.addEventListener("input",()=>{i&&clearTimeout(i),i=setTimeout(()=>{const n=t.value.trim();C(n)},100)}),t.addEventListener("keydown",n=>{const a=s.querySelectorAll(".newtab-history-item"),o=e.querySelectorAll(".newtab-result-item"),p=a.length,y=o.length;switch(n.key){case"ArrowUp":n.preventDefault(),u==="none"?p>0&&(u="history",l=0):u==="history"?l<p-1&&l++:u==="saved"&&(l===0?(u="none",l=-1):l--),I(a,o);break;case"ArrowDown":n.preventDefault(),u==="none"?y>0&&(u="saved",l=0):u==="history"?l>0?l--:(u="none",l=-1):u==="saved"&&l<y-1&&l++,I(a,o);break;case"Enter":n.preventDefault();const c=t.value.trim();if(A(c)){window.location.href=z(c);return}u==="history"&&f[l]?window.location.href=f[l].url:u==="saved"&&b[l]?window.location.href=b[l].url:c&&(window.location.href=`https://www.google.com/search?q=${encodeURIComponent(c)}`);break;case"Escape":t.value="",C(""),u="none",l=-1;break}}),s.addEventListener("click",n=>{const a=n.target.closest(".newtab-history-item");if(a){const o=a.dataset.url;o&&(window.location.href=o)}}),e.addEventListener("click",n=>{const a=n.target.closest(".newtab-result-item");if(a){const o=a.dataset.url;o&&(window.location.href=o)}})}function T(t){t.querySelectorAll("img[data-fallback]").forEach(e=>{e.addEventListener("error",function(){var n;const r=this.getAttribute("data-fallback")||"";this.style.display="none";const i=this.parentElement;i&&!((n=i.textContent)!=null&&n.trim())&&(i.textContent=r)})})}function A(t){return t.includes(" ")?!1:!!(/^https?:\/\//i.test(t)||/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/.test(t)||/^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?/.test(t))}function z(t){return/^https?:\/\//i.test(t)?t:`https://${t}`}async function C(t){const e=document.getElementById("results-tray"),s=document.getElementById("results-list"),r=document.getElementById("results-count"),i=document.getElementById("results-header"),n=document.getElementById("history-tray"),a=document.getElementById("history-list"),o=document.getElementById("search-hint");if(u="none",l=-1,!t||t.length<1){e.classList.remove("visible"),n.classList.remove("visible"),o.innerHTML="<kbd>↵</kbd> Google",b=[],f=[];return}if(A(t)){e.classList.remove("visible"),n.classList.remove("visible"),o.innerHTML="<kbd>↵</kbd> Go to site",b=[],f=[];return}try{const c=await chrome.history.search({text:t,maxResults:50,startTime:Date.now()-2592e6});if(c.length>0){const m=new Map;for(const d of c){if(!d.url||!d.title)continue;const h=m.get(d.url);h?(h.count+=d.visitCount||1,d.lastVisitTime&&d.lastVisitTime>h.lastVisitTime&&(h.lastVisitTime=d.lastVisitTime,h.item=d)):m.set(d.url,{item:d,count:d.visitCount||1,lastVisitTime:d.lastVisitTime||0})}f=Array.from(m.values()).sort((d,h)=>h.lastVisitTime-d.lastVisitTime).slice(0,5).map(({item:d,count:h,lastVisitTime:k})=>({id:d.id||String(Date.now()),title:d.title||d.url||"",url:d.url||"",domain:$(d.url||""),visitTime:k?S(k):"",visitCount:h}));const x=[...f].reverse();a.innerHTML=x.map((d,h)=>U(d,h)).join(""),T(a),n.classList.add("visible"),requestAnimationFrame(()=>{a.scrollTop=a.scrollHeight})}else n.classList.remove("visible"),f=[]}catch(c){console.error("Error searching history:",c),n.classList.remove("visible"),f=[]}const p=t.toLowerCase(),y=g.filter(c=>{var m;return c.title.toLowerCase().includes(p)||c.url.toLowerCase().includes(p)||((m=c.searchText)==null?void 0:m.toLowerCase().includes(p))}).slice(0,6);y.length>0?(b=y.map(c=>({id:c.id,title:c.title,url:c.url,favicon:c.favicon,domain:$(c.url),savedAt:S(c.savedAt),topics:L.filter(m=>c.topicIds.includes(m.id)),intents:M.filter(m=>c.intentIds.includes(m.id))})),r.textContent=String(y.length),s.innerHTML=b.map((c,m)=>V(c,m)).join(""),T(s),i.style.display="flex",e.classList.add("visible")):(e.classList.remove("visible"),b=[]),f.length>0&&b.length>0?o.innerHTML="<kbd>↑</kbd> history &nbsp; <kbd>↓</kbd> saved &nbsp; <kbd>↵</kbd> open":f.length>0?o.innerHTML="<kbd>↑</kbd> history &nbsp; <kbd>↵</kbd> open or Google":b.length>0?o.innerHTML="<kbd>↓</kbd> saved &nbsp; <kbd>↵</kbd> open or Google":o.innerHTML="<kbd>↵</kbd> Google"}function U(t,e){const s=t.visitCount>1?`<span class="newtab-history-visits">${t.visitCount}×</span>`:"";return`
    <div class="newtab-history-item" data-url="${v(t.url)}" data-index="${e}" data-section="history">
      <div class="newtab-history-favicon">
        ${t.domain[0].toUpperCase()}
      </div>
      <div class="newtab-history-content">
        <div class="newtab-history-title">${v(t.title)}</div>
        <div class="newtab-history-meta">
          <span class="newtab-history-domain">${v(t.domain)}</span>
          ${t.visitTime?`<span class="newtab-history-separator">•</span><span class="newtab-history-time">${t.visitTime}</span>`:""}
          ${s}
        </div>
      </div>
    </div>
  `}function V(t,e){const s=t.favicon?`<img src="${v(t.favicon)}" alt="" data-fallback="${t.domain[0].toUpperCase()}">`:t.domain[0].toUpperCase();return`
    <div class="newtab-result-item" data-url="${v(t.url)}" data-index="${e}" data-section="saved">
      <div class="newtab-result-favicon">
        ${s}
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
        ${t.topics.slice(0,2).map(r=>`
          <span class="newtab-result-tag" style="background: ${F(r.color,.15)}; color: ${r.color};">
            ${v(r.name)}
          </span>
        `).join("")}
      </div>
    </div>
  `}function I(t,e){var s,r,i,n;if(t.forEach(a=>a.classList.remove("selected")),e.forEach(a=>a.classList.remove("selected")),u!=="none")if(u==="history"&&l>=0){const a=t.length-1-l;(s=t[a])==null||s.classList.add("selected"),(r=t[a])==null||r.scrollIntoView({block:"nearest"})}else u==="saved"&&l>=0&&((i=e[l])==null||i.classList.add("selected"),(n=e[l])==null||n.scrollIntoView({block:"nearest"}))}function G(){const t=document.getElementById("stat-total"),e=document.getElementById("stat-topics");t.textContent=String(g.length),e.textContent=String(L.length)}function $(t){try{return new URL(t).hostname.replace("www.","")}catch{return t}}function S(t){const e=Math.floor((Date.now()-t)/1e3);if(e<60)return"Just now";const s=Math.floor(e/60);if(s<60)return`${s}m ago`;const r=Math.floor(s/60);if(r<24)return`${r}h ago`;const i=Math.floor(r/24);if(i<7)return`${i}d ago`;const n=Math.floor(i/7);if(n<4)return`${n}w ago`;const a=Math.floor(i/30);return a<12?`${a}mo ago`:`${Math.floor(i/365)}y ago`}function v(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function F(t,e){const s=parseInt(t.slice(1,3),16),r=parseInt(t.slice(3,5),16),i=parseInt(t.slice(5,7),16);return`rgba(${s}, ${r}, ${i}, ${e})`}
