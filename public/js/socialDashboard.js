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