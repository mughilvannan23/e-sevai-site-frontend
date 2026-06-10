import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{c as t,f as n,l as r,t as i}from"./vendor-react-Xk2KUJ6o.js";import{c as a,n as o}from"./Toast-B_kO4Gmq.js";import{t as s}from"./Loading-7rYGz6mv.js";import{t as c}from"./workStyles-kVPq_TP8.js";import{t as l}from"./Pagination-CapWP8zF.js";import{t as u}from"./formatters-BK7-yNFJ.js";import{t as d}from"./WorkList-VdtBEftY.js";var f=e(n(),1),p=i(),m=()=>{let e=t(),n=(0,f.useRef)(null),i=r(),[m,h]=(0,f.useState)(!1),[g,_]=(0,f.useState)([]),[v,y]=(0,f.useState)([]),[b,x]=(0,f.useState)(!0),[S,C]=(0,f.useState)({}),[w,T]=(0,f.useState)({page:1,limit:10,date:``,status:``,searchName:``,searchPhone:``,paymentStatus:``}),{success:E,error:D}=o();(0,f.useEffect)(()=>{k(),O()},[w.page,w.limit,w.status,w.paymentStatus]),(0,f.useEffect)(()=>{m&&!b&&g.length>0&&(n.current?.scrollIntoView({behavior:`smooth`}),h(!1))},[g,b,m]),(0,f.useEffect)(()=>{let t=e.state;if(t){let e={page:1,limit:10,date:``,status:t.status||``,paymentStatus:t.paymentStatus||``,searchName:``,searchPhone:``};T(e),A(e),h(!0)}},[e.state]);let O=async()=>{try{let e=await a.getActiveWorkItems();e.data.success&&y(e.data.workItems)}catch(e){console.error(`Error fetching work items:`,e)}},k=async()=>{try{x(!0);let e={};Object.keys(w).forEach(t=>{w[t]&&t!==`page`&&t!==`limit`&&(e[t]=w[t])}),e.page=w.page,e.limit=w.limit;let t=await a.getMyWorks(e);t.data.success&&(_(t.data.works),C(t.data.pagination))}catch(e){console.error(`Error fetching works:`,e),D(`Failed to fetch works`)}finally{x(!1)}},A=async e=>{try{x(!0);let t={};Object.keys(e).forEach(n=>{e[n]&&n!==`page`&&n!==`limit`&&(t[n]=e[n])}),t.page=e.page,t.limit=e.limit;let n=await a.getMyWorks(t);n.data.success&&(_(n.data.works),C(n.data.pagination))}catch(e){console.error(`Error fetching works:`,e),D(`Failed to fetch works`)}finally{x(!1)}},j=e=>{let{name:t,value:n}=e.target;T(e=>({...e,[t]:n,page:1}))};return b&&g.length===0?(0,p.jsx)(s,{text:`Loading works...`}):(0,p.jsxs)(`div`,{className:`container-fluid p-0`,children:[(0,p.jsxs)(`div`,{className:`mb-4`,children:[(0,p.jsx)(`h1`,{style:{color:`#3b8132`,fontWeight:`700`,margin:`0 0 8px 0`,letterSpacing:`0.5px`},className:`fs-3`,children:`My Sales Entries`}),(0,p.jsx)(`p`,{style:{color:`#666`,margin:0},className:`mb-0`,children:`Manage and track your work entries`})]}),(0,p.jsx)(`div`,{className:`d-flex justify-content-end mb-4`,children:(0,p.jsx)(`button`,{className:`btn`,style:{backgroundColor:`#3b8132`,color:`white`,borderRadius:`10px`,fontWeight:`700`,padding:`10px 24px`,boxShadow:`0 4px 10px rgba(59, 129, 50, 0.2)`},onClick:()=>i(`/add-work`),children:`➕ Add New Work`})}),(0,p.jsx)(`div`,{style:c.filtersCard,className:`p-3 p-md-4 mb-4`,children:(0,p.jsxs)(`form`,{onSubmit:e=>{e.preventDefault(),k()},className:`d-flex flex-column gap-3`,children:[(0,p.jsxs)(`div`,{className:`row g-3`,children:[(0,p.jsxs)(`div`,{className:`col-12 col-md-4 d-flex flex-column gap-2`,children:[(0,p.jsx)(`label`,{style:c.label,children:`Date`}),(0,p.jsx)(`input`,{type:`date`,name:`date`,value:w.date,onChange:j,className:`form-control`})]}),(0,p.jsxs)(`div`,{className:`col-12 col-md-4 d-flex flex-column gap-2`,children:[(0,p.jsx)(`label`,{style:c.label,children:`Work Status`}),(0,p.jsxs)(`select`,{name:`status`,value:w.status,onChange:j,className:`form-select`,children:[(0,p.jsx)(`option`,{value:``,children:`All`}),(0,p.jsx)(`option`,{value:`Completed`,children:`Completed`}),(0,p.jsx)(`option`,{value:`Pending`,children:`Pending`})]})]}),(0,p.jsxs)(`div`,{className:`col-12 col-md-4 d-flex flex-column gap-2`,children:[(0,p.jsx)(`label`,{style:c.label,children:`Payment Status`}),(0,p.jsxs)(`select`,{name:`paymentStatus`,value:w.paymentStatus,onChange:j,className:`form-select`,children:[(0,p.jsx)(`option`,{value:``,children:`All`}),(0,p.jsx)(`option`,{value:`Paid`,children:`Paid`}),(0,p.jsx)(`option`,{value:`Pending`,children:`Pending`})]})]}),(0,p.jsxs)(`div`,{className:`col-12 col-md-6 d-flex flex-column gap-2`,children:[(0,p.jsx)(`label`,{style:c.label,children:`Customer Name`}),(0,p.jsx)(`input`,{type:`text`,name:`searchName`,value:w.searchName,onChange:j,className:`form-control`,placeholder:`Search customer name...`})]}),(0,p.jsxs)(`div`,{className:`col-12 col-md-6 d-flex flex-column gap-2`,children:[(0,p.jsx)(`label`,{style:c.label,children:`Customer Phone`}),(0,p.jsx)(`input`,{type:`text`,name:`searchPhone`,value:w.searchPhone,onChange:j,className:`form-control`,placeholder:`Search phone number...`})]})]}),(0,p.jsxs)(`div`,{className:`d-flex flex-column flex-sm-row gap-2 mt-1`,children:[(0,p.jsx)(`button`,{type:`submit`,style:c.searchBtn,className:`btn w-100 w-sm-auto text-white`,children:`Search`}),(0,p.jsx)(`button`,{type:`button`,style:c.filterResetBtn,className:`btn w-100 w-sm-auto text-white`,onClick:()=>T({page:1,limit:10,date:``,status:``,searchName:``,searchPhone:``,paymentStatus:``}),children:`Reset`})]})]})}),(0,p.jsx)(d,{works:g.filter(e=>!(w.searchName&&!e.customerName?.toLowerCase().includes(w.searchName.toLowerCase())||w.searchPhone&&!e.customerPhone?.includes(w.searchPhone)||w.paymentStatus&&e.paymentStatus!==w.paymentStatus)),loading:b,onEdit:()=>{},onDelete:()=>{},onPrint:e=>{let t=window.open(``,`_blank`),n=e.items?.reduce((e,t)=>e+(t.presetChargeType===`AEPS`?0:t.presetAmount||0),0)||0,r=e.items?.reduce((e,t)=>e+(t.presetChargeType===`AEPS`&&t.presetAmount||0),0)||0,i=e.items?.length?e.items.map(e=>{let t=e.quantity||1,n=(e.workChargeAtTime||0)+(e.serviceChargeAtTime||0),r=e.presetAmount||0,i=e.otherCharges||0,a=e.discount||0,o=e.presetChargeType===`AEPS`,s=t*n+(o?0:r)+i-a,c=e.presetChargeType&&e.presetChargeType!==`None`?e.presetChargeType:`Amt`;return`
          <div class="row">
            <span class="bold">${e.title}</span>
            <span class="bold">₹${s.toLocaleString()}</span>
          </div>
          ${n>0?`<div class="row small-text"><span>Rate:</span><span>${t} x ₹${n} = ₹${t*n}</span></div>`:``}
          ${r>0?`<div class="row small-text"><span>${c}:</span><span>₹${r.toLocaleString()}</span></div>`:``}
          ${i>0?`<div class="row small-text"><span>Other:</span><span>₹${i.toLocaleString()}</span></div>`:``}
          ${a>0?`<div class="row small-text"><span>Discount:</span><span>-₹${a.toLocaleString()}</span></div>`:``}
          ${e.applicationNumber?`<div class="row small-text"><span>App No:</span><span>${e.applicationNumber}</span></div>`:``}
        `}).join(``):``,a=`
  <html>
  <head>
    <style>
      body { width: 280px; font-family: 'Courier New', Courier, monospace; font-size: 12px; padding: 10px; color: #000; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .line { border-top: 1px dashed #000; margin: 8px 0; }
      .row { display: flex; justify-content: space-between; margin: 4px 0; }
      .header-title { font-size: 16px; font-weight: bold; text-align: center; line-height: 1.2; }
      .small-text { font-size: 11px; color: #333; }
      .total-section { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
    </style>
  </head>
  <body>
    <div class="header-title">SEVAGAN CSC &<br/>E-SEVA CENTRE</div>
    <div class="center small-text">Tiruchirappalli, Tamil Nadu</div>
    <div class="line"></div>

    <div class="row">
      <span>Date: ${new Date(e.date).toLocaleDateString(`en-IN`)}</span>
      <span>Time: ${new Date(e.date).toLocaleTimeString(`en-IN`,{hour:`2-digit`,minute:`2-digit`})}</span>
    </div>

    <div class="line"></div>
    <div><span class="bold">Customer:</span> ${e.customerName}</div>
    ${e.customerPhone?`<div><span class="bold">Phone:</span> ${e.customerPhone}</div>`:``}

    <div class="line"></div>
    <div class="bold row"><span>Description</span><span>Amount</span></div>
    <div class="line" style="margin-top: 2px;"></div>

    ${i}

    <div class="total-section">
      ${n>0?`<div class="row"><span>Recharge/Transfer Total:</span><span>₹${n.toLocaleString()}</span></div>`:``}
      ${e.totalDiscount>0?`<div class="row"><span>Total Discount:</span><span>-₹${e.totalDiscount.toLocaleString()}</span></div>`:``}
      ${r>0?`<div class="row" style="color: #444;"><span>AEPS Withdrawal:</span><span>₹${r.toLocaleString()}</span></div>`:``}
      <div class="row bold" style="font-size: 14px; margin-top: 5px;"><span>FINAL PAYABLE</span><span>₹${(e.totalAmount||e.amount||0).toLocaleString()}</span></div>
    </div>

    <div class="line"></div>
    

    <div class="line"></div>
    <div class="center bold">Thank You! Visit Again 🙏</div>

  </body>
  </html>`;t.document.write(a),t.document.close(),t.print()},onSendWhatsApp:async e=>{let t=g.find(t=>t._id===e);try{E(`Sending WhatsApp bill...`);let t=await a.sendWhatsAppBill(e);t.data.success?E(`WhatsApp bill sent successfully`):D(t.data.message||`Failed to send WhatsApp bill`)}catch(e){console.error(e),D(e.response?.data?.error||e.response?.data?.message||`Failed to send WhatsApp bill`)}finally{if(t&&t.customerPhone){let e=String(t.customerPhone).replace(/[^0-9]/g,``);if(e){let n=``;t.items&&t.items.length>0&&(n=t.items.map(e=>{let t=e.quantity||1,n=(e.workChargeAtTime||0)+(e.serviceChargeAtTime||0),r=e.presetAmount||0,i=e.otherCharges||0,a=e.discount||0,o=e.presetChargeType===`AEPS`,s=t*n+(o?0:r)+i-a;return`- ${e.title}: ₹${s.toLocaleString()}`}).join(`
`));let r=`Hello ${t.customerName||``},

Here are your bill details:
${n}

*Total Amount: ₹${(t.totalAmount||t.amount||0).toLocaleString()}*

Thank You! 🙏`,i=`https://wa.me/91${e}?text=${encodeURIComponent(r)}`;window.open(i,`whatsapp_window`)}}}},formatDateTime:e=>e?new Date(e).toLocaleString(`en-IN`,{day:`2-digit`,month:`2-digit`,year:`numeric`,hour:`2-digit`,minute:`2-digit`,hour12:!0}).replace(/\//g,`-`).replace(/, /g,` `).replace(/am/i,`AM`).replace(/pm/i,`PM`):`-`,getStatusBadge:(e,t)=>{let n=t===`payment`,r=n?e===`Paid`:e===`Completed`;return(0,p.jsx)(`span`,{style:{...c.badge,backgroundColor:r?`var(--success-color)`:n?e===`None`?`#95a5a6`:`var(--danger-color)`:`var(--warning-color)`,color:`white`},children:t===`work`?u(e):e})},isAdmin:!1,isEmployee:!0,tableRef:n}),S.totalWorks>0&&(0,p.jsx)(`div`,{className:`p-3 d-flex justify-content-center`,children:(0,p.jsx)(l,{currentPage:S.currentPage,totalPages:S.totalPages,totalItems:S.totalWorks,itemsPerPage:S.limit,onPageChange:e=>T(t=>({...t,page:e}))})})]})};export{m as default};