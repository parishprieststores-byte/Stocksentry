const KEY='stocksentry-items-v1', LOG='stocksentry-log-v1';
let items=JSON.parse(localStorage.getItem(KEY)||'[]');
let logs=JSON.parse(localStorage.getItem(LOG)||'[]');
let editingId=null;

const $=id=>document.getElementById(id);
const save=()=>localStorage.setItem(KEY,JSON.stringify(items));
const saveLogs=()=>localStorage.setItem(LOG,JSON.stringify(logs));
function addLog(text){logs.unshift({text,time:new Date().toLocaleString()});logs=logs.slice(0,100);saveLogs();renderLog()}
function daysTo(date){return Math.ceil((new Date(date)-new Date())/86400000)}
function render(){
  const q=$('search').value.toLowerCase();
  const visible=items.filter(x=>(x.name+' '+(x.category||'')).toLowerCase().includes(q));
  $('totalItems').textContent=items.length;
  $('lowItems').textContent=items.filter(x=>x.qty<=x.min).length;
  $('expiringItems').textContent=items.filter(x=>x.expiry&&daysTo(x.expiry)<=30&&daysTo(x.expiry)>=0).length;
  $('items').innerHTML=visible.length?visible.map(card).join('<'):'<div class="empty">No stock items yet. Tap “Add item” to begin.</div>';
  // Fix the separator intentionally without relying on innerHTML whitespace.
  $('items').innerHTML=visible.length?visible.map(card).join(''):'<div class="empty">No stock items yet. Tap “Add item” to begin.</div>';
  const alerts=items.filter(x=>x.qty<=x.min || (x.expiry&&daysTo(x.expiry)<=30&&daysTo(x.expiry)>=0));
  $('alerts').classList.toggle('hidden',!alerts.length);
  $('alerts').innerHTML=alerts.length?'⚠️ <strong>Attention:</strong> '+alerts.map(x=>x.qty<=x.min?`${x.name} is low (${x.qty})`: `${x.name} expires in ${daysTo(x.expiry)} day(s)`).join(' · '):'';
}
function card(x){
  const low=x.qty<=x.min, exp=x.expiry&&daysTo(x.expiry)<=30&&daysTo(x.expiry)>=0;
  return `<article class="card"><h3>${esc(x.name)}</h3><div class="meta">${esc(x.category||'Uncategorized')}</div>
  <p><span class="badge ${low?'low':''}">${low?'Low stock':'Stock OK'}</span> ${exp?'<span class="badge exp">Expiring soon</span>':''}</p>
  <div class="qtyrow"><div><div class="qty">${x.qty}</div><div class="meta">Minimum ${x.min}${x.expiry?` · Expiry ${x.expiry}`:''}</div></div>
  <div class="stepper"><button onclick="changeQty('${x.id}',-1)">−</button><button onclick="changeQty('${x.id}',1)">＋</button></div></div>
  <div class="card-actions"><button onclick="editItem('${x.id}')">Edit</button><button onclick="deleteItem('${x.id}')">Delete</button></div></article>`;
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function changeQty(id,delta){const x=items.find(a=>a.id===id);if(!x)return;const old=x.qty;x.qty=Math.max(0,x.qty+delta);save();addLog(`${x.name}: ${old} → ${x.qty} (${delta>0?'received/added':'issued/removed'})`);render()}
function openNew(){editingId=null;$('dialogTitle').textContent='Add stock item';$('itemForm').reset();$('qty').value=0;$('min').value=5;$('itemDialog').showModal()}
function editItem(id){const x=items.find(a=>a.id===id);if(!x)return;editingId=id;$('dialogTitle').textContent='Edit stock item';$('name').value=x.name;$('category').value=x.category||'';$('qty').value=x.qty;$('min').value=x.min;$('expiry').value=x.expiry||'';$('itemDialog').showModal()}
function deleteItem(id){const x=items.find(a=>a.id===id);if(!x)return;if(confirm(`Delete ${x.name}?`)){items=items.filter(a=>a.id!==id);save();addLog(`${x.name} deleted`);render()}}
$('itemForm').addEventListener('submit',e=>{e.preventDefault();const data={name:$('name').value.trim(),category:$('category').value.trim(),qty:+$('qty').value,min:+$('min').value,expiry:$('expiry').value};if(!data.name)return;
 if(editingId){const x=items.find(a=>a.id===editingId);Object.assign(x,data);addLog(`${x.name} updated`)}else{data.id=crypto.randomUUID?crypto.randomUUID():Date.now().toString();items.unshift(data);addLog(`${data.name} added (${data.qty})`)}save();$('itemDialog').close();render()});
$('addBtn').onclick=openNew;$('search').oninput=render;
$('exportBtn').onclick=()=>{const rows=[['Name','Category','Quantity','Minimum','Expiry'],...items.map(x=>[x.name,x.category,x.qty,x.min,x.expiry||''])];const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='stocksentry-inventory.csv';a.click();URL.revokeObjectURL(a.href)};
$('clearLogBtn').onclick=()=>{if(confirm('Clear movement log?')){logs=[];saveLogs();renderLog()}};
function renderLog(){$('log').innerHTML=logs.length?logs.map(l=>`<div class="log-entry"><strong>${esc(l.text)}</strong><div class="meta">${esc(l.time)}</div></div>`).join(''):'<div class="empty">No movements recorded.</div>'}
function online(){document.querySelector('.status').classList.toggle('offline',!navigator.onLine);$('onlineText').textContent=navigator.onLine?'Online':'Offline'}window.addEventListener('online',online);window.addEventListener('offline',online);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
online();renderLog();render();
