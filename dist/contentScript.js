var mockiato=function(l){"use strict";const d="Mockiato",m="mockiato_intercept_script",c="mockiato_store",p=(e,t)=>{window.postMessage({message:t,type:e,extensionName:d},"*")},h=(e,t)=>{window.addEventListener("message",o=>{const{data:n,source:s}=o;s!==window||typeof n!="object"||n.type!==e||n.extensionName!==d||t(n.message)})},g=(e,t,o)=>{const n=e.startsWith("http")?e:`${o}${e}`,s=t.startsWith("http")?t:`${o}${t}`;return n.startsWith(s)},S=e=>{const{url:t,method:o,origin:n,mocks:s}=e;return s.filter(r=>!r.isActive||r.httpMethod!==o?!1:g(t,r.url,n))},N=e=>{const{headerProfiles:t,url:o,method:n,type:s,origin:r}=e,U=Object.values(t).filter(i=>i.status==="enabled"&&i.headers.length>0),E={};return U.forEach(i=>{i.headers.forEach(a=>{let b=!0;a.url&&(b=a.httpMethod===n&&g(o,a.url,r)),a.isActive&&a.type===s&&b&&(E[a.key]=a.value)})}),E},I=e=>typeof e=="object"&&e!==null&&Object.prototype.toString.call(e)==="[object Object]"&&Object.getPrototypeOf(e)===Object.prototype;var f={BASE_URL:"/",MODE:"production",DEV:!1,PROD:!0,SSR:!1};const k={mocks:[],mockGroups:[],logs:[],headersProfiles:{},network:[],settings:{showNotifications:!0,excludedHosts:[]}},M=()=>{const e=localStorage.getItem(c);return e?JSON.parse(e):void 0},O=async()=>(await chrome.storage.local.get(c))[c],u=async()=>{let e;return f.VITE_NODE_ENV==="development"?e=M():e=await O(),e??k},T=async e=>{f.VITE_NODE_ENV==="development"?localStorage.setItem(c,JSON.stringify(e)):await chrome.storage.local.set({[c]:e})},_=async()=>{const e=structuredClone(k),t=await u();return Object.keys(e).forEach(o=>{const n=o,s=t[n];s&&n!=="network"&&(I(s)?e[n]={...e[n],...s}:e[n]=s)}),await T(e),e};let C=(e=21)=>crypto.getRandomValues(new Uint8Array(e)).reduce((t,o)=>(o&=63,o<36?t+=o.toString(36):o<62?t+=(o-26).toString(36).toUpperCase():o>62?t+="-":t+="_",t),"");const V=1e4,w="mockiato-alert-stack",j='<svg role="button" tabindex="0" aria-hidden="false" data-icon="close" viewBox="0 0 24 24" class="mockiato-alert-close"><path d="M18.7 5.3a1 1 0 0 0-1.4 0L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3a1 1 0 0 0 1.4-1.42L13.42 12l5.3-5.3a1 1 0 0 0 0-1.4Z"></path></svg>',L=()=>{const e=`
        @keyframes mockiatoDFadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        .mockiato-alert-stack {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 99999;
            color: #000000;
        }
        .mockiato-alert {
            font-family: Arial, serif
            font-size: 14px;
            display: flex;
            width: 400px;
            background: #fff4e6;
            padding: 8px 16px;
            padding-right: 8px;
            border-radius: 5px;
            gap: 8px;
            white-space: break-spaces;
            animation: fadeIn .5s;
            box-sizing: border-box;
        }
        .mockiato-alert-text {
            flex: 1;
            overflow: hidden;
        }
        .mockiato-alert-close {
            fill: currentcolor;
            align-self: center;
            vertical-align: middle;
            flex-shrink: 0;
            height: 16px;
            user-select: none;
            cursor: pointer;
            transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0s;
            border-radius: 100px;
            display: inline-block;
            box-sizing: content-box;
            padding: 8px;
        }
        .mockiato-alert-close:hover {
            background-color: rgba(0, 0, 0, 0.08);
        }
        .mockiato-alert-url {
            color: #fd7e14;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .mockiato-alert-spoiler {
            margin-top: 8px;
            color: #909296;
            font-size: 12px;
        }
    `,t=document.head||document.getElementsByTagName("head")[0],o=document.createElement("style");t.appendChild(o),o.appendChild(document.createTextNode(e))},D=()=>{L();const e=document.createElement("div");e.id=w,e.className="mockiato-alert-stack",document.getElementsByTagName("body")[0].appendChild(e)},y=e=>{const t=document.getElementById(e);t==null||t.remove()},P=e=>{const t=C(),o=document.createElement("div"),n=document.createElement("div");return o.innerHTML=`<div class="mockiato-alert-text"><span>Mockiato intercepted request</span><div class="mockiato-alert-url" title="${e}">${e}</div><div class="mockiato-alert-spoiler">See logs in the «Mockiato» tab in Dev Tools.</div></div>`,o.className="mockiato-alert",o.id=t,n.innerHTML=j,n.onclick=()=>y(t),o.appendChild(n),o},A=e=>{const t=`${d} intercepted request ${e}. See logs in the «Mockiato» tab in Dev Tools.`;console.warn(t)},R=e=>{A(e);const t=P(e),o=document.getElementById(w);if(!o){console.warn("Mockiato stack node wasn't found.");return}o.appendChild(t),setTimeout(()=>{y(t.id)},V)},q=e=>{console.warn(e)},x=e=>{console.error("An error has occurred in the Mockiato extension. Please report it in issues on github https://github.com/avivasyuta/mockiato/issues"),console.error(e)},$=async(e,t)=>{await chrome.storage.local.set({[c]:{...e,network:[...e.network??[],t]}})},B=async(e,t,o)=>{e.settings.showNotifications&&R(t.url);const n={url:t.url,method:t.method,date:new Date().toISOString(),host:window.location.hostname,mock:o};await chrome.storage.local.set({[c]:{...e,logs:[...e.logs??[],n]}})},H=(e,t)=>{const{origin:o}=window.location;if(!(e!=null&&e.mocks))return null;const n=S({mocks:e.mocks,url:t.url,method:t.method,origin:o});return n.length===0?null:n[0]};h("requestIntercepted",async e=>{try{const t=await u(),o=N({headerProfiles:t.headersProfiles,origin:window.location.origin,url:e.url,method:e.method,type:"request"}),n=H(t,e);p("requestChecked",{messageId:e.messageId,headers:o,mock:n}),n&&await B(t,e,n)}catch(t){x(t),p("requestChecked",{messageId:e.messageId,headers:{}})}}),h("responseIntercepted",async e=>{try{const t=await u();await $(t,e.event)}catch(t){x(t)}});const z=()=>{var t;const e=document.getElementById(m);(t=e==null?void 0:e.parentNode)==null||t.removeChild(e)},v=async()=>{if(z(),(await _()).settings.excludedHosts.map(n=>n.value).includes(window.location.host))return;const o=document.createElement("script");o.type="module",o.id=m,o.src=chrome.runtime.getURL("mockiato.js"),o.onload=()=>{q("The Mockiato extension has created a request interceptor! Now all requests are proxies through it to implement mocks.")},(document.head||document.documentElement).appendChild(o)};return document.addEventListener("DOMContentLoaded",()=>{D()}),v(),l.main=v,Object.defineProperty(l,Symbol.toStringTag,{value:"Module"}),l}({});
