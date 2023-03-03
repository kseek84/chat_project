var socket = io()

// 접속 되었을때 실행
socket.on('connect', () => {
    // 서버에 새로운 유저 알림
    socket.emit('newUser')
})

// 서버에서 데이터 받기
socket.on('update', (data) => {
    console.log(`${data.name}: ${data.message}`)
    var $textarea = document.querySelector('#textarea')
    $textarea.innerHTML += `\n ${data.name}: ${data.message}`
})

// 전체 대화명 받기
socket.on('names', (data) => {
    names = data.names
    setNameList()
})

function setNameList(){
    var $nameList = document.querySelector('#nameList')
    $nameList.innerHTML = ''
    for(var i in names){
        $nameList.innerHTML += `<div onclick='hiddenMessage(event)'>${names[i]}</div><br>`
    }
    console.log(names)
}

// 메시지 전송 함수
function send(){
    // 입력되어있는 데이터 가져오기
    var $input_text = document.getElementById('input-text')
    var message = $input_text.value
    if(!message) return
    $input_text.value = ''
    // 서버로 send 이벤트 전달
    // emit - 전송, on - 수신 (함수의 이름이 같아야 한다)
    // socket.emit('send', function)
    // socket.on('send', function)
    socket.emit('message', {type: 'message', message: message})
}

// 대화명 변경
function changeName(){
    var $input_name = document.getElementById('input-name')
    var name = $input_name.value
    if(!name) return
    $input_name.value = ''
    socket.emit('changeName', {type: 'name', name:name})
}

// 귓속말
var hiddenMessage = (e) => {
    var name = e.target.innerHTML
    var $input_text = document.querySelector("#input-text")
    $input_text.value = "/" + name + " " + $input_text.value
}
//---------------------------------------------------
var names = []
window.onload = function(){
    var $input_text = document.querySelector("#input-text")
    $input_text.addEventListener('keyup', (e) => {
        if(e.keyCode == 13) { send() }
    })
    
    var $input_name = document.querySelector("#input-name")
    $input_name.addEventListener('keyup', (e) => {
        if(e.keyCode == 13) { changeName() }
    })
}
