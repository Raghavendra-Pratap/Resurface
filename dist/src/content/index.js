(function(){"use strict";function j(e,t){return{type:e,payload:t}}async function w(e,t){return chrome.runtime.sendMessage(j(e,t))}function W(e){try{const{hostname:t}=new URL(e);return t.replace("www.","")}catch{return""}}function V(e){if(!e)return null;try{const t=new URL(e);return t.hostname.includes("google.")||t.hostname.includes("bing.")||t.hostname.includes("duckduckgo.")?t.searchParams.get("q"):t.hostname.includes("yahoo.")?t.searchParams.get("p"):null}catch{return null}}function u(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function M(e=""){const t=`bgGrad${e||Math.random().toString(36).substr(2,9)}`;return`<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${t}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#8b5cf6"/>
        <stop offset="100%" style="stop-color:#7c3aed"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#${t})"/>
    <rect x="22" y="58" width="84" height="56" rx="8" fill="rgba(255,255,255,0.2)" transform="rotate(-3 64 86)"/>
    <rect x="22" y="50" width="84" height="56" rx="8" fill="rgba(255,255,255,0.4)" transform="rotate(2 64 78)"/>
    <rect x="20" y="28" width="88" height="60" rx="8" fill="white"/>
    <line x1="32" y1="46" x2="96" y2="46" stroke="#7c3aed" stroke-width="4" stroke-linecap="round"/>
    <line x1="32" y1="60" x2="76" y2="60" stroke="#c4b5fd" stroke-width="4" stroke-linecap="round"/>
    <line x1="32" y1="74" x2="60" y2="74" stroke="#c4b5fd" stroke-width="4" stroke-linecap="round"/>
    <circle cx="98" cy="22" r="7" fill="#fbbf24"/>
    <path d="M98 12 L98 8 M108 22 L112 22 M98 32 L98 28" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`}async function z(){const e=window.location.href,t=document.title||e,n=document.referrer||null,a=V(n),o=await F(e);return{url:e,title:t,favicon:o.data,faviconType:o.type,referrerUrl:n,referrerQuery:a}}async function F(e){const t=document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');let n=null;for(const a of t)if(a.href&&(n=a.href,a.rel.includes("apple-touch-icon")))break;n||(n=`https://www.google.com/s2/favicons?domain=${W(e)}&sz=64`);try{const o=await(await fetch(n)).blob();return new Promise(l=>{const s=new FileReader;s.onloadend=()=>{l({data:s.result,type:"base64"})},s.onerror=()=>{l({data:n,type:"url"})},s.readAsDataURL(o)})}catch{return{data:n,type:"url"}}}let g=null,$=null,O=5e3,p=null,k=null;function K(e){return new Promise(t=>{_(),p=t,O=e.autoSaveDelay;const n=document.createElement("div");n.id="tabmind-toast-container",n.innerHTML=B(e),document.body.appendChild(n),g=n,Q(n,e),N(),n.addEventListener("click",a=>{a.target===n&&I()}),k=()=>{g&&p&&X()},window.addEventListener("beforeunload",k)})}function _(){$&&(clearTimeout($),$=null),k&&(window.removeEventListener("beforeunload",k),k=null),g&&(g.remove(),g=null),p=null}function B(e){const{pageData:t,suggestedTopics:n,intents:a}=e;return`
    <div class="tabmind-toast">
      <div class="tabmind-toast-header">
        <div class="tabmind-toast-icon">
          ${M("toast")}
        </div>
        <div>
          <div class="tabmind-toast-header-text">Add to Resurface</div>
          <div class="tabmind-toast-header-subtitle">${e.autoSaveDelay>0?`Auto-saves in ${e.autoSaveDelay/1e3} seconds`:"Manual save only"}</div>
        </div>
      </div>
      
      <div class="tabmind-toast-body">
        <div class="tabmind-field">
          <label class="tabmind-label">Title</label>
          <input 
            id="tabmind-title" 
            type="text" 
            class="tabmind-input" 
            value="${u(t.title)}"
          >
        </div>
        
        <div class="tabmind-field">
          <label class="tabmind-label">Topics</label>
          <div class="tabmind-tags" id="tabmind-topics">
            ${n.map(o=>J(o)).join("")}
            <button class="tabmind-tag-add" id="tabmind-add-topic">+ Add</button>
          </div>
        </div>
        
        <div class="tabmind-field">
          <label class="tabmind-label">Intent (optional)</label>
          <select id="tabmind-intent" class="tabmind-select">
            <option value="">Select intent...</option>
            ${a.map(o=>`
              <option value="${o.id}">${o.emoji} ${u(o.name)}</option>
            `).join("")}
          </select>
        </div>
      </div>
      
      <div class="tabmind-toast-footer">
        <button id="tabmind-cancel" class="tabmind-btn tabmind-btn-secondary">Cancel</button>
        <button id="tabmind-save" class="tabmind-btn tabmind-btn-primary">Save</button>
      </div>
      
      ${e.autoSaveDelay>0?`<div class="tabmind-timer-bar" id="tabmind-timer" style="animation-duration: ${e.autoSaveDelay}ms"></div>`:""}
    </div>
  `}function J(e){return`
    <span class="tabmind-tag" data-topic-id="${e.id}" style="background: ${Z(e.color,.15)}; color: ${e.color};">
      ${u(e.name)}
      <span class="tabmind-tag-remove" data-topic-id="${e.id}">×</span>
    </span>
  `}function Q(e,t){const n=e.querySelector("#tabmind-save"),a=e.querySelector("#tabmind-cancel"),o=e.querySelector("#tabmind-title"),l=e.querySelector("#tabmind-topics"),s=e.querySelector("#tabmind-add-topic"),v=e.querySelector("#tabmind-timer"),m=new Set(t.suggestedTopics.map(c=>c.id));n==null||n.addEventListener("click",()=>I()),a==null||a.addEventListener("click",()=>Y()),document.addEventListener("keydown",f),o==null||o.addEventListener("focus",()=>r()),o==null||o.addEventListener("blur",()=>h()),l==null||l.addEventListener("click",c=>{var d;const i=c.target;if(i.classList.contains("tabmind-tag-remove")){const y=i.dataset.topicId;y&&(m.delete(y),(d=i.parentElement)==null||d.remove())}}),s==null||s.addEventListener("click",()=>{const c=prompt("Enter topic name:");if(c&&c.trim()){const i=`temp-${Date.now()}`;m.add(i);const d=document.createElement("span");d.className="tabmind-tag",d.dataset.topicId=i,d.dataset.topicName=c.trim(),d.style.background="rgba(99, 102, 241, 0.15)",d.style.color="#818cf8",d.innerHTML=`
        ${u(c.trim())}
        <span class="tabmind-tag-remove" data-topic-id="${i}">×</span>
      `,s.before(d)}}),e.collectData=()=>{const c=(o==null?void 0:o.value)||t.pageData.title,i=e.querySelector("#tabmind-intent"),d=(i==null?void 0:i.value)||"",y=[];return e.querySelectorAll(".tabmind-tag[data-topic-id]").forEach(b=>{const T=b.dataset.topicId;T&&y.push(T)}),{title:c,topicIds:y,intentIds:d?[d]:[]}};function r(){v==null||v.classList.add("tabmind-paused"),$&&(clearTimeout($),$=null)}function h(){v==null||v.classList.remove("tabmind-paused"),N()}function f(c){const i=c.target,d=i.tagName==="INPUT"||i.tagName==="TEXTAREA"||i.tagName==="SELECT";c.key==="Escape"?I():c.key==="Enter"&&(!d||c.metaKey||c.ctrlKey)&&(c.preventDefault(),I())}}function I(){if(console.log("Resurface Toast: save() called"),!g||!p){console.log("Resurface Toast: No toast or resolve promise",{currentToast:!!g,resolvePromise:!!p});return}const e=g.collectData,t=e();console.log("Resurface Toast: Collected data:",t);const n=g.querySelector(".tabmind-toast");n==null||n.classList.add("tabmind-closing"),setTimeout(()=>{console.log("Resurface Toast: Resolving promise with result"),p==null||p(t),_()},200)}function X(){if(console.log("Resurface Toast: saveSync() called (tab closing)"),!g||!p)return;const e=g.collectData,t=e();console.log("Resurface Toast: Saving before tab close:",t),p(t),k&&(window.removeEventListener("beforeunload",k),k=null),p=null}function Y(){if(!p)return;const e=g==null?void 0:g.querySelector(".tabmind-toast");e==null||e.classList.add("tabmind-closing"),setTimeout(()=>{p==null||p(null),_()},200)}function N(){$&&clearTimeout($),$=setTimeout(()=>{I()},O)}function Z(e,t){const n=parseInt(e.slice(1,3),16),a=parseInt(e.slice(3,5),16),o=parseInt(e.slice(5,7),16);return`rgba(${n}, ${a}, ${o}, ${t})`}let S=null,R=null;function U(e){if(D(),e.length===0)return;const t=document.createElement("div");t.id="tabmind-dropdown",t.innerHTML=ee(e),t.style.top="80px",t.style.right="20px",t.style.position="fixed",document.body.appendChild(t),S=t,t.querySelectorAll(".tabmind-dropdown-item").forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.url;a&&(window.location.href=a)})}),setTimeout(()=>{R=n=>{S&&!S.contains(n.target)&&D()},document.addEventListener("click",R)},100),setTimeout(()=>{D()},1e4)}function D(){S&&(S.remove(),S=null),R&&(document.removeEventListener("click",R),R=null)}function ee(e){return`
    <div class="tabmind-dropdown-header">
      ${M("dropdown")}
      <span><strong>${e.length} saved page${e.length>1?"s":""}</strong> match your search</span>
    </div>
    <div class="tabmind-dropdown-items">
      ${e.map(t=>te(t)).join("")}
    </div>
  `}function te(e){const t=e.favicon?`<img src="${u(e.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${e.domain[0].toUpperCase()}'">`:e.domain[0].toUpperCase();return`
    <div class="tabmind-dropdown-item" data-url="${u(e.url)}">
      <div class="tabmind-dropdown-favicon">
        ${t}
      </div>
      <div class="tabmind-dropdown-info">
        <div class="tabmind-dropdown-title">${u(e.title)}</div>
        <div class="tabmind-dropdown-meta">
          <span>${u(e.domain)}</span>
          <span>•</span>
          <span>${e.savedAt}</span>
        </div>
      </div>
      <div class="tabmind-dropdown-tags">
        ${e.topics.slice(0,2).map(n=>`
          <span class="tabmind-mini-tag topic" style="background: ${ne(n.color,.15)}; color: ${n.color};">
            ${u(n.name)}
          </span>
        `).join("")}
        ${e.intents.slice(0,1).map(n=>`
          <span class="tabmind-mini-tag intent">${n.emoji}</span>
        `).join("")}
      </div>
    </div>
  `}function ne(e,t){const n=parseInt(e.slice(1,3),16),a=parseInt(e.slice(3,5),16),o=parseInt(e.slice(5,7),16);return`rgba(${n}, ${a}, ${o}, ${t})`}let H=null,q=[];function ae(e){x(),q=e;const t=document.createElement("div");t.id="tabmind-search-modal",t.innerHTML=oe(e),document.body.appendChild(t),H=t,ie(t);const n=t.querySelector("#tabmind-search-input");setTimeout(()=>n==null?void 0:n.focus(),50)}function x(){H&&(H.remove(),H=null),q=[]}function oe(e){return`
    <div class="tabmind-search-overlay" id="tabmind-search-overlay">
      <div class="tabmind-search-container">
        <div class="tabmind-search-header">
          <div class="tabmind-search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input 
            type="text" 
            id="tabmind-search-input"
            class="tabmind-search-input" 
            placeholder="Search your saved tabs..."
            autocomplete="off"
            spellcheck="false"
          >
          <div class="tabmind-search-shortcut">
            <kbd>esc</kbd> to close
          </div>
        </div>
        
        <div class="tabmind-search-results" id="tabmind-search-results">
          ${G(e)}
        </div>
        
        <div class="tabmind-search-footer">
          <div class="tabmind-search-footer-left">
            <span class="tabmind-result-count" id="tabmind-result-count">${e.length} saved pages</span>
          </div>
          <div class="tabmind-search-footer-right">
            <span class="tabmind-footer-hint">
              <kbd>↑</kbd><kbd>↓</kbd> navigate
              <kbd>↵</kbd> open
            </span>
          </div>
        </div>
      </div>
    </div>
  `}function G(e){return e.length===0?`
      <div class="tabmind-search-empty">
        <div class="tabmind-search-empty-icon">
          ${M("searchEmpty")}
        </div>
        <div class="tabmind-search-empty-text">No saved pages found</div>
        <div class="tabmind-search-empty-hint">Press <kbd>⌘+Shift+S</kbd> to save pages</div>
      </div>
    `:e.map((t,n)=>se(t,n)).join("")}function se(e,t){const n=e.favicon?`<img src="${u(e.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${e.domain[0].toUpperCase()}'">`:e.domain[0].toUpperCase();return`
    <div class="tabmind-search-item ${t===0?"selected":""}" data-url="${u(e.url)}" data-index="${t}">
      <div class="tabmind-search-item-favicon">
        ${n}
      </div>
      <div class="tabmind-search-item-content">
        <div class="tabmind-search-item-title">${u(e.title)}</div>
        <div class="tabmind-search-item-meta">
          <span class="tabmind-search-item-domain">${u(e.domain)}</span>
          <span class="tabmind-search-item-separator">•</span>
          <span class="tabmind-search-item-time">${e.savedAt}</span>
        </div>
      </div>
      <div class="tabmind-search-item-tags">
        ${e.topics.slice(0,2).map(a=>`
          <span class="tabmind-search-tag topic" style="background: ${ce(a.color,.15)}; color: ${a.color};">
            ${u(a.name)}
          </span>
        `).join("")}
        ${e.intents.slice(0,1).map(a=>`
          <span class="tabmind-search-tag intent">${a.emoji}</span>
        `).join("")}
      </div>
    </div>
  `}function ie(e){const t=e.querySelector("#tabmind-search-overlay"),n=e.querySelector("#tabmind-search-input"),a=e.querySelector("#tabmind-search-results");let o=0,l=null;t==null||t.addEventListener("click",m=>{m.target===t&&x()}),document.addEventListener("keydown",s),n==null||n.addEventListener("input",()=>{l&&clearTimeout(l),l=setTimeout(async()=>{const m=n.value.trim();if(m.length===0)v(q);else try{const r=await w("SEARCH_ITEMS",{query:m}),h=await w("GET_ALL_TOPICS"),f=await w("GET_ALL_INTENTS"),c=r.map(i=>({id:i.id,title:i.title,url:i.url,favicon:i.favicon,faviconType:i.faviconType,domain:new URL(i.url).hostname.replace("www.",""),savedAt:re(i.savedAt),topics:h.filter(d=>i.topicIds.includes(d.id)),intents:f.filter(d=>i.intentIds.includes(d.id))}));v(c)}catch(r){console.error("Search error:",r)}},150)}),a==null||a.addEventListener("click",m=>{const r=m.target.closest(".tabmind-search-item");if(r){const h=r.dataset.url;h&&(window.location.href=h,x())}});function s(m){var h,f,c,i,d,y;const r=e.querySelectorAll(".tabmind-search-item");switch(m.key){case"Escape":x(),document.removeEventListener("keydown",s);break;case"ArrowDown":m.preventDefault(),r.length>0&&((h=r[o])==null||h.classList.remove("selected"),o=(o+1)%r.length,(f=r[o])==null||f.classList.add("selected"),(c=r[o])==null||c.scrollIntoView({block:"nearest"}));break;case"ArrowUp":m.preventDefault(),r.length>0&&((i=r[o])==null||i.classList.remove("selected"),o=(o-1+r.length)%r.length,(d=r[o])==null||d.classList.add("selected"),(y=r[o])==null||y.scrollIntoView({block:"nearest"}));break;case"Enter":const b=r[o];if(b){const T=b.dataset.url;T&&(window.location.href=T,x())}document.removeEventListener("keydown",s);break}}function v(m){if(a){a.innerHTML=G(m),o=0;const r=e.querySelector("#tabmind-result-count");r&&(r.textContent=`${m.length} saved page${m.length!==1?"s":""}`)}}}function re(e){const t=Math.floor((Date.now()-e)/1e3);if(t<60)return"Just now";const n=Math.floor(t/60);if(n<60)return`${n}m ago`;const a=Math.floor(n/60);if(a<24)return`${a}h ago`;const o=Math.floor(a/24);if(o<7)return`${o}d ago`;const l=Math.floor(o/7);if(l<4)return`${l}w ago`;const s=Math.floor(o/30);return s<12?`${s}mo ago`:`${Math.floor(o/365)}y ago`}function ce(e,t){const n=parseInt(e.slice(1,3),16),a=parseInt(e.slice(3,5),16),o=parseInt(e.slice(5,7),16);return`rgba(${n}, ${a}, ${o}, ${t})`}let L=null,E=!1;function le(e,t){if(C(),e.length===0)return;const n=document.createElement("div");n.id="tabmind-google-overlay",n.innerHTML=de(e,t),document.body.appendChild(n),L=n,ue(n,t),requestAnimationFrame(()=>{n.classList.add("visible")})}function C(){L&&(L.classList.remove("visible"),setTimeout(()=>{L==null||L.remove(),L=null},200))}function de(e,t){return`
    <div class="tabmind-google-overlay-container ${E?"minimized":""}">
      <div class="tabmind-google-overlay-header">
        <div class="tabmind-google-overlay-header-left">
          <div class="tabmind-google-overlay-icon">
            ${M("overlay")}
          </div>
          <span class="tabmind-google-overlay-title">
            <strong>${e.length} saved page${e.length>1?"s":""}</strong> match your search
          </span>
        </div>
        <div class="tabmind-google-overlay-header-right">
          <button class="tabmind-google-overlay-toggle" id="tabmind-toggle-overlay" title="${E?"Expand":"Minimize"}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${E?'<polyline points="6 9 12 15 18 9"/>':'<polyline points="18 15 12 9 6 15"/>'}
            </svg>
          </button>
          <button class="tabmind-google-overlay-close" id="tabmind-close-overlay" title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="tabmind-google-overlay-body" id="tabmind-overlay-body">
        <div class="tabmind-google-overlay-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            id="tabmind-google-search-input"
            placeholder="Search your saved tabs..."
            value="${u(t)}"
            autocomplete="off"
            spellcheck="false"
          >
        </div>
        
        <div class="tabmind-google-overlay-items" id="tabmind-overlay-items">
          ${P(e)}
        </div>
      </div>
      
      <div class="tabmind-google-overlay-footer">
        <span class="tabmind-google-overlay-hint">
          <kbd>⌘</kbd><kbd>⇧</kbd><kbd>F</kbd> to search all
        </span>
        <a href="${chrome.runtime.getURL("src/dashboard/index.html")}" class="tabmind-google-overlay-dashboard" target="_blank">
          Open Dashboard →
        </a>
      </div>
    </div>
  `}function P(e){return e.map((t,n)=>`
    <div class="tabmind-google-overlay-item" data-url="${u(t.url)}" data-index="${n}">
      <div class="tabmind-google-overlay-item-favicon">
        ${t.favicon?`<img src="${u(t.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${t.domain[0].toUpperCase()}'">`:t.domain[0].toUpperCase()}
      </div>
      <div class="tabmind-google-overlay-item-info">
        <div class="tabmind-google-overlay-item-row1">
          <div class="tabmind-google-overlay-item-title">${u(t.title)}</div>
          <div class="tabmind-google-overlay-item-meta">
            <span>${u(t.domain)}</span>
            <span class="tabmind-separator">•</span>
            <span>${t.savedAt}</span>
          </div>
        </div>
        ${t.topics.length>0?`
          <div class="tabmind-google-overlay-item-row2">
            ${t.topics.slice(0,3).map(a=>`
              <span class="tabmind-overlay-tag" style="background: ${ve(a.color,.15)}; color: ${a.color};">
                ${u(a.name)}
              </span>
            `).join("")}
          </div>
        `:""}
      </div>
    </div>
  `).join("")}function ue(e,t){const n=e.querySelector("#tabmind-close-overlay"),a=e.querySelector("#tabmind-toggle-overlay"),o=e.querySelector("#tabmind-google-search-input"),l=e.querySelector("#tabmind-overlay-items"),s=e.querySelector(".tabmind-google-overlay-container");let v=null;n==null||n.addEventListener("click",()=>{C(),document.removeEventListener("keydown",r),document.removeEventListener("click",m)});function m(f){s&&!s.contains(f.target)&&(C(),document.removeEventListener("keydown",r),document.removeEventListener("click",m))}function r(f){f.key==="Escape"&&(C(),document.removeEventListener("keydown",r),document.removeEventListener("click",m))}setTimeout(()=>{document.addEventListener("keydown",r),document.addEventListener("click",m)},100),a==null||a.addEventListener("click",()=>{E=!E,s==null||s.classList.toggle("minimized",E),a&&(a.innerHTML=`
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${E?'<polyline points="6 9 12 15 18 9"/>':'<polyline points="18 15 12 9 6 15"/>'}
        </svg>
      `,a.title=E?"Expand":"Minimize")}),o==null||o.addEventListener("input",()=>{v&&clearTimeout(v),v=setTimeout(async()=>{const f=o.value.trim();f.length===0?await h(t):await h(f)},150)}),l==null||l.addEventListener("click",f=>{const c=f.target.closest(".tabmind-google-overlay-item");if(c){const i=c.dataset.url;i&&window.open(i,"_blank")}});async function h(f){try{const c=await w("SEARCH_ITEMS",{query:f}),i=await w("GET_ALL_TOPICS"),d=await w("GET_ALL_INTENTS"),y=c.slice(0,5).map(b=>({id:b.id,title:b.title,url:b.url,favicon:b.favicon,faviconType:b.faviconType,domain:new URL(b.url).hostname.replace("www.",""),savedAt:me(b.savedAt),topics:i.filter(T=>b.topicIds.includes(T.id)),intents:d.filter(T=>b.intentIds.includes(T.id))}));l&&(y.length===0?l.innerHTML=`
            <div class="tabmind-google-overlay-empty">
              No saved pages match "${u(f)}"
            </div>
          `:l.innerHTML=P(y))}catch(c){console.error("Error updating results:",c)}}}function me(e){const t=Math.floor((Date.now()-e)/1e3);if(t<60)return"Just now";const n=Math.floor(t/60);if(n<60)return`${n}m ago`;const a=Math.floor(n/60);if(a<24)return`${a}h ago`;const o=Math.floor(a/24);if(o<7)return`${o}d ago`;const l=Math.floor(o/7);if(l<4)return`${l}w ago`;const s=Math.floor(o/30);return s<12?`${s}mo ago`:`${Math.floor(o/365)}y ago`}function ve(e,t){const n=parseInt(e.slice(1,3),16),a=parseInt(e.slice(3,5),16),o=parseInt(e.slice(5,7),16);return`rgba(${n}, ${a}, ${o}, ${t})`}chrome.runtime.onMessage.addListener((e,t,n)=>e.type==="PING"?(n({pong:!0}),!0):(fe(e).then(n).catch(a=>{console.error("Resurface content script error:",a),n({error:a.message})}),!0));async function fe(e){switch(e.type){case"EXTRACT_PAGE":return z();case"SHOW_TOAST":return be(e.payload),{received:!0};case"SHOW_ALREADY_SAVED":return he(e.payload);case"SHOW_CONFIRMATION":return ye(e.payload);case"SHOW_DROPDOWN":return we(e.payload);case"HIDE_DROPDOWN":D();return;case"SHOW_GOOGLE_HINT":return $e(e.payload);case"SHOW_SEARCH_MODAL":return ge(e.payload);case"SHOW_GOOGLE_OVERLAY":return pe(e.payload);default:console.warn("Resurface: Unknown message type:",e.type)}}async function pe(e){le(e.items,e.query)}async function ge(e){ae(e.items)}async function be(e){console.log("Resurface: Showing toast with data:",e);try{const t=await K(e);if(console.log("Resurface: Toast result:",t),t){console.log("Resurface: User saved, sending SAVE_ITEM to background...");const n={pageData:e.pageData,toastResult:t,siblingTabUrls:e.siblingTabUrls};console.log("Resurface: SAVE_ITEM payload:",n);const a=await w("SAVE_ITEM",n);console.log("Resurface: Save successful! Saved item:",a),A("Saved to Resurface","success")}else console.log("Resurface: User cancelled (result was null/undefined)"),A("Not saved","muted")}catch(t){console.error("Resurface: Error in handleShowToast:",t),A("Error saving","muted")}}async function he(e){A("Already in your library","info")}async function ye(e){A(e.message,"success")}async function we(e){U(e.items)}async function $e(e){if(document.getElementById("tabmind-google-hint"))return;const t=document.createElement("div");t.id="tabmind-google-hint",t.className="tabmind-google-hint",t.innerHTML=`
    <div class="tabmind-google-hint-icon">
      ${M("hint")}
    </div>
    <div class="tabmind-google-hint-text">
      <strong>${e.count}</strong> saved page${e.count>1?"s":""} match "${u(e.query)}"
    </div>
  `,document.body.appendChild(t),t.addEventListener("click",async()=>{const n=await w("SEARCH_ITEMS",{query:e.query});if(n&&n.length>0){const a=await w("GET_ALL_TOPICS"),o=await w("GET_ALL_INTENTS"),l=n.map(s=>({id:s.id,title:s.title,url:s.url,favicon:s.favicon,faviconType:s.faviconType,domain:new URL(s.url).hostname.replace("www.",""),savedAt:Te(s.savedAt),topics:a.filter(v=>s.topicIds.includes(v.id)),intents:o.filter(v=>s.intentIds.includes(v.id))}));U(l)}t.remove()}),setTimeout(()=>{t.remove()},8e3)}function A(e,t){const n=document.querySelector(".tabmind-mini-toast");n&&n.remove();const a=document.createElement("div");a.className="tabmind-mini-toast";const o=t==="success"?'<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>':t==="info"?'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>':'<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>';a.innerHTML=`
    <div class="tabmind-mini-toast-icon ${t}">
      ${o}
    </div>
    <div class="tabmind-mini-toast-text">${u(e)}</div>
  `,document.body.appendChild(a),setTimeout(()=>{a.classList.add("tabmind-closing"),setTimeout(()=>a.remove(),200)},3e3)}function Te(e){const t=Math.floor((Date.now()-e)/1e3);if(t<60)return"Just now";const n=Math.floor(t/60);if(n<60)return`${n}m ago`;const a=Math.floor(n/60);if(a<24)return`${a}h ago`;const o=Math.floor(a/24);if(o<7)return`${o}d ago`;const l=Math.floor(o/7);if(l<4)return`${l}w ago`;const s=Math.floor(o/30);return s<12?`${s}mo ago`:`${Math.floor(o/365)}y ago`}console.log("Resurface content script loaded")})();
