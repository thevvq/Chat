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

// refuse friend requests
const listBtnRefuseFriend = document.querySelectorAll('[btn-refuse-friend]')
if (listBtnRefuseFriend.length > 0){
    listBtnRefuseFriend.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.box-user').classList.add('refuse')
            const userID = btn.getAttribute('btn-refuse-friend')
            
            socket.emit('client-refuse-friend', userID)
        })
    })
}
// end refuse friend requests

// accept friend requests
const listBtnAcceptFriend = document.querySelectorAll('[btn-accept-friend]')
if (listBtnAcceptFriend.length > 0){
    listBtnAcceptFriend.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.box-user').classList.add('accepted')
            const userID = btn.getAttribute('btn-accept-friend')
            
            socket.emit('client-accept-friend', userID)
        })
    })
}
// end accept friend requests

// server-return-length-friend-accept
const badgeUserAccept = document.querySelector('[badge-user-accept]')
if (badgeUserAccept){
    socket.on('server-return-length-friend-accept', data => {
        const userID = badgeUserAccept.getAttribute('badge-user-accept')
        if (userID === data.userID){
            badgeUserAccept.innerHTML = data.lengthFriendAccepts
        }
})
}
// end server-return-length-friend-accept