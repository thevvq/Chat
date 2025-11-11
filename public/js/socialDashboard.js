// send friend requests
const listBtnAddFriend = document.querySelectorAll('[btn-add-friend]')
if (listBtnAddFriend.length > 0){
    listBtnAddFriend.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.box-user').classList.add('add')
            const userID = btn.getAttribute('btn-add-friend')
            
            socket.emit('client-add-friend', userID)
        })
    })
}
// end send friend requests

// cancel friend requests
const listBtnCancelFriend = document.querySelectorAll('[btn-cancel-friend]')
if (listBtnCancelFriend.length > 0){
    listBtnCancelFriend.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.box-user').classList.remove('add')
            const userID = btn.getAttribute('btn-cancel-friend')
            
            socket.emit('client-cancel-friend', userID)
        })
    })
}
// cancel send friend requests