// Client Send Message
const formSendData = document.querySelector('.chat-window .inner-form')
console.log('formSendData', formSendData)

if (formSendData) {
    formSendData.addEventListener('submit', (e) => {
        e.preventDefault()
        const content = e.target.elements.content.value.trim()
        console.log('Sending message:', content)
        if(content){
            socket.emit('client-send-message',  content)
            e.target.elements.content.value = ''
        }
    })
}

//End Client Send Message

// server-return-message
socket.on('server-return-message', (data) => {
    const myID = document.querySelector('.chat-window').getAttribute('my-id')
    const chatWindow = document.querySelector('.chat-window .inner-body')

    const messageDiv = document.createElement('div')

    let htmlFullName = ''

    if(data.userID == myID){
        messageDiv.classList.add('inner-outgoing')
    }else{
        htmlFullName = `<div class=''inner-name'>${data.fullName}</div>`
        messageDiv.classList.add('inner-incoming')
    }

    messageDiv.innerHTML = `
        ${htmlFullName}
        <div class='inner-content'>${data.content}</div> 
    `
    chatWindow.appendChild(messageDiv)
    chatWindowBody.scrollTop = chatWindowBody.scrollHeight
})

// End server-return-message

// scroll to bottom chat window
const chatWindowBody = document.querySelector('.chat-window .inner-body')
if (chatWindowBody) {
        chatWindowBody.scrollTop = chatWindowBody.scrollHeight
}

// End croll to bottom chat window

// icon chat
// show popup
const buttonIcon = document.querySelector('.button-icon')
if (buttonIcon) {
    const tooltip = document.querySelector('.tooltip')
    Popper.createPopper(buttonIcon, tooltip)

    buttonIcon.onclick = () => {
        tooltip.classList.toggle('show')
    }
}
// End show popup

// insert icon to input
const emojiPicker = document.querySelector('emoji-picker')
if (emojiPicker) {
    const inputChat = document.querySelector('.inner-form input[name="content"]')

    emojiPicker.addEventListener('emoji-click', event => {
        const icon = event.detail.unicode
        inputChat.value += icon
    })
}

// End insert icon to input
// End Emoji Picker