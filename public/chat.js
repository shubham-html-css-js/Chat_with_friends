const socket=io();
 const $messageForm=document.querySelector("#messageForm");
 const $messageFormInput=$messageForm.querySelector("input");
 const $messageFormButton=$messageForm.querySelector("button");
 const $sendLocationButton=document.querySelector("#Send-location");
 const $messages=document.querySelector("#messages")
 const messagetemplate=document.querySelector("#message-template").innerHTML
 const locationtemplate=document.querySelector("#location-template").innerHTML
 const sidebartemplate=document.querySelector("#sidebar-template").innerHTML
 const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
 const autoscroll=()=>{
     const $newMessage=$messages.lastElementChild;
     const newMessageStyle=getComputedStyle($newMessage);
     const newMessageMargin=parseInt(newMessageStyle.marginBottom)
     const newMessageHeight=$newMessage.offsetHeight+newMessageMargin;
     const visibleHeight=$messages.offsetHeight;
     const containerHeight=$messages.scrollHeight;
     const scrollOffset=$messages.scrollTop+visibleHeight;
     if(containerHeight-newMessageHeight<=scrollOffset)
     {
         $messages.scrollTop=$messages.scrollHeight;
     }

 }
 socket.on('message',(generateMessage)=>{
     const html=Mustache.render(messagetemplate,{
         username:generateMessage.username,
         message:generateMessage.text,
         createdAt:moment(generateMessage.createdAt).format('h:mm A')
     })
     $messages.insertAdjacentHTML('beforeend',html)
     autoscroll()
})
socket.on('locationMessage',(generateLocationMessage)=>{
    console.log(generateLocationMessage.url);
    const html=Mustache.render(locationtemplate,{
        username:generateLocationMessage.username,
        url:generateLocationMessage.url,
        createdAt:moment(generateLocationMessage.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomData',({room,listOfUsers})=>{
    const html=Mustache.render(sidebartemplate,{
        room,
        listOfUsers
    })
    document.querySelector("#sidebar").innerHTML=html
})
 $messageForm.addEventListener('submit',(e)=>{
     e.preventDefault();
     $messageFormButton.setAttribute('disabled','disabled');
     const message=e.target.elements.messageUser.value
     socket.emit('sendMessage',message,(error)=>{
         $messageFormButton.removeAttribute('disabled');
         $messageFormInput.value=''
         $messageFormInput.focus();
         if(error)
         return console.log(error);
         console.log('Message Delivered')
     });
      })
$sendLocationButton.addEventListener('click',(e)=>{

  if(!navigator.geolocation)
  {
      return alert('Geolocation is not supported by your browser');
  }
  $sendLocationButton.setAttribute('disabled','disabled')
  navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit("sendlocation",position.coords.latitude,position.coords.longitude,()=>{
        $sendLocationButton.removeAttribute('disabled');
        console.log("location shared");
    })
  })
})
socket.emit('join',username,room,(error)=>{
    alert(error);
    location.href='/'
});