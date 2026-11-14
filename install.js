/* Native home-screen prompt owned by the top-level domain; no employee data. */
(()=>{
 'use strict';
 const CHANNEL='seri-install-v1',$=id=>document.getElementById(id),dialog=$('installDialog'),confirm=$('installConfirm'),cancel=$('installCancel'),help=$('installHelp'),status=$('installStatus');
 let deferred=null,pending=false,installed=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true,client=null,origin='',requestId='';
 const ios=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
 function reply(type){if(client)try{client.postMessage({channel:CHANNEL,type,requestId},origin);}catch(e){}}
 function close(){if(pending)return;if(dialog.open)dialog.close();else finish();}
 function finish(){reply('closed');client=null;}
 function modal(){help.replaceChildren();help.hidden=true;status.textContent='';confirm.hidden=installed;confirm.disabled=pending;cancel.disabled=pending;cancel.textContent=installed?'Đóng':'Để sau';$('installTitle').textContent=installed?'Đã có ứng dụng trên màn hình chính':'Thêm YEN BAI SERI vào màn hình chính?';if(!dialog.open)dialog.showModal();}
 function manual(){
  help.replaceChildren();help.hidden=false;const list=document.createElement('ol');
  const steps=ios()?['Mở yenbaiseri.id.vn bằng Safari.','Chọn Chia sẻ → Thêm vào Màn hình chính.','Bật Mở dưới dạng ứng dụng web nếu có, rồi chọn Thêm.']:['Tiếp tục sử dụng trang trong Chrome; nút cài trực tiếp xuất hiện khi trình duyệt sẵn sàng.','Hoặc mở menu ⋮ → Cài đặt / Thêm vào màn hình chính và xác nhận.'];
  steps.forEach(text=>{const item=document.createElement('li');item.textContent=text;list.append(item);});help.append(list);status.textContent=ios()?'iPhone yêu cầu xác nhận trong menu Chia sẻ.':'Chrome chưa cấp hộp cài trực tiếp. Nếu đang ở Zalo/Facebook, hãy mở bằng Chrome trước.';confirm.hidden=true;cancel.textContent='Đóng';
 }
 async function nativePrompt(){
  if(pending)return;if(installed){modal();return;}if(!deferred){modal();manual();return;}
  const event=deferred;deferred=null;pending=true;confirm.disabled=true;cancel.disabled=true;
  try{
   // Invoke immediately while the top-level click still has transient user activation.
   const promise=event.prompt();
   const result=await promise,choice=result&&result.outcome?result:await event.userChoice;
   if(!installed){modal();confirm.hidden=true;status.textContent=choice&&choice.outcome==='accepted'?'Đã xác nhận. Điện thoại đang hoàn tất thêm biểu tượng; vui lòng chờ thông báo của trình duyệt.':'Bạn đã chọn chưa thêm. Có thể thử lại bằng nút cài khi trình duyệt cho phép.';cancel.textContent='Đóng';}
  }catch(error){
   // Some browsers refuse activation forwarded from a nested iframe. One top-level confirmation retries.
   if(error&&error.name==='NotAllowedError'){deferred=event;modal();status.textContent='Nhấn Cài vào màn hình chính để mở hộp xác nhận của điện thoại.';}
   else{modal();manual();}
  }finally{pending=false;confirm.disabled=false;cancel.disabled=false;}
 }
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event;if(dialog.open&&!installed&&!pending){help.hidden=true;confirm.hidden=false;confirm.disabled=false;status.textContent='Đã sẵn sàng. Nhấn Cài vào màn hình chính để tiếp tục.';}});
 window.addEventListener('appinstalled',()=>{installed=true;deferred=null;pending=false;modal();$('installTitle').textContent='Đã thêm vào màn hình chính';$('installText').textContent='Mở bảng chấm công bằng biểu tượng logo công ty trên điện thoại.';confirm.hidden=true;cancel.disabled=false;});
 window.addEventListener('message',event=>{
  const data=event.data;if(!/^https:\/\/(?:[a-z0-9-]+-script\.googleusercontent\.com|script\.googleusercontent\.com|script\.google\.com)$/.test(event.origin)||!event.source||!data||data.channel!==CHANNEL||data.type!=='open'||typeof data.requestId!=='string'||!/^[a-z0-9-]{8,80}$/i.test(data.requestId)||pending)return;
  client=event.source;origin=event.origin;requestId=data.requestId;reply('ready');
  if(deferred&&navigator.userActivation&&navigator.userActivation.isActive)nativePrompt();else modal();
 });
 // This top-level menu button is always present and provides a direct user gesture, outside Google's iframe.
 $('installTop').onclick=nativePrompt;confirm.onclick=nativePrompt;cancel.onclick=close;
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',finish);
})();
