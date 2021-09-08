const path=require('path');
const http=require('http')
const express=require('express')
const socketio=require('socket.io');
const app=express()
const server=http.createServer(app)
const io=socketio(server);
const port=3000
const Filter=require('bad-words');
const {generateMessage,generateLocationMessage}=require('../utils/messages');
const {addUser,removeUser,getUser,getUserInRoom}=require('../utils/users')
const publicDirectoryPath=path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));
let msg='Welcome'
io.on('connection',(socket)=>{
    console.log('New web socket connection');
    socket.on('join',(username,room,callback)=>{
        const {error,user}=addUser(socket.id,username,room);
        if(error)
        {
            return callback(error)
        }
        socket.join(user.room);
        socket.emit('message',generateMessage('Admin','Welcome'));
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`));
    io.to(user.room).emit('roomData',{
        room:user.room,
        listOfUsers:getUserInRoom(user.room)
    })

    })
    socket.on('sendMessage',(message,callback)=>{
        const filter=new Filter()
        if(filter.isProfane(message))
         return callback('Profanity not allowed!!')
         const messageRoom=getUser(socket.id);
        io.to(messageRoom.desiredUser.room).emit("message",generateMessage(messageRoom.desiredUser.username,message));
        callback();
    })
    socket.on('sendlocation',(latitude,longitude,callback)=>{
        const messageRoom=getUser(socket.id);
       io.to(messageRoom.desiredUser.room).emit('locationMessage',generateLocationMessage(messageRoom.desiredUser.username,`https://google.com/maps?q=${latitude},${longitude}`)) 
       callback();
    })
    socket.on('disconnect',()=>{
        const disconnecteduser=removeUser(socket.id)
        if(disconnecteduser)
        {
        io.to(disconnecteduser.room).emit('message',generateMessage('Admin',`${disconnecteduser.username} has left`))
        io.to(disconnecteduser.room).emit('roomData',{
        room:disconnecteduser.room,
        listOfUsers:getUserInRoom(disconnecteduser.room)
    })
        }
    })
})

server.listen(port,()=>{
    console.log('Server is running');
})