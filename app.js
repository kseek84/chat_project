// Node.js 기본 내장 모듈 불러오기
// File System module 
const fs = require('fs')

// express 모듈 불러오기
const express = require('express')

// socket.io 모듈 불러오기
const socket = require('socket.io')

// Node.js 기본 내장 모듈 불러오기
const http = require('http')

// express 객체 생성
const app = express()

// express http 서버 생성
const server = http.createServer(app)

// 생성된 서버를 socket.io에 바인딩
const io = socket(server)

app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

var no = 0
var names = []

function getName(){
    no += 1
    names.push('익명' + no)
    return '익명' + no
}

function changeName(preName, nextName){
    var idx = -1
    for(var i in names){
        if(names[i] == nextName){
            return false
        }
        if(names[i] == preName){
            idx = i
        }
    }
    names[idx] = nextName
    return true
}

// Get 방식으로 / 경로에 접속하면 실행 됨
app.get('/', (request, response) => {
    fs.readFile('./static/index.html', (err, data) => {
        if(err){
            response.send('에러')
        } else {
            response.writeHead(200, {'Content-Type':'text/html'})
            response.write(data)
            response.end()
        }
    })
})

// io.sockets => 모든 소켓
// on (이벤트 발생시 콜백함수 실행)
// socket => 접속된 소켓
io.sockets.on('connection', (socket) => {
    
    // 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌
    socket.on('newUser', () => {
        var name = getName();
        var msg = name + ' 님이 접속하였습니다.'
        console.log(msg)
        
        // 소켓에 이름 저장
        socket.name = name
        
        io.sockets.emit('names', {names:names})
        
        // 모든 소켓에 전송
        io.sockets.emit('update', {type:'connect', name: 'SERVER', message: msg})
    })
    
    // 전송한 메시지 받기
    socket.on('message', (data) => {
        // 받은 데이터에 누가 보냈는지 이름을 추가
        data.name = socket.name
        
        console.log(data)
        
        // 모든 유저에게 메시지 전송
        io.sockets.emit('update', data)
    })
    
    // 대화명 변경
    socket.on('changeName', (data) => {
        var preName = socket.name
        var nextName = data.name
        if(!changeName(preName, nextName)){
            socket.emit('update', {type:'message', name: 'SERVER', message: '대화명 변경 불가 (같은 이름이 있습니다)'})
            return
        }
        socket.name = nextName
        var msg = `[대화명 변경] - ${preName} => ${nextName}`
        io.sockets.emit('update', {type:'changeName', name: 'SERVER', message: msg})
        io.sockets.emit('names', {names:names})
    })
    
    // 접속종료
    socket.on('disconnect', () => {
        var msg = socket.name + ' 님이 나가셨습니다.'
        
        console.log(msg)
        
        for(var i in names){
            if(names[i] == socket.name){
                names.splice(i, 1)
                break
            }
        }
        
        io.sockets.emit('names', {names:names})
        
        // 나가는 사람을 제외한 나머지 유저에게 메시지 전송
        socket.broadcast.emit('update', {type:'disconnect', name: 'SERVER', message:msg})
    })
})

// 서버를 80 포트로 listen
server.listen(80, () => {
    console.log('서버 ON : localhost(:80)')
})