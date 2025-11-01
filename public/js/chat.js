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