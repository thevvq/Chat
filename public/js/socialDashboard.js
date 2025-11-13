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

// server-return-info-friend-accept
const dataUserAccept = document.querySelector('[data-users-accept]')
if (dataUserAccept){
    const userID = dataUserAccept.getAttribute('data-users-accept')
    socket.on('server-return-info-friend-accept', data => {
        if (userID === data.userID){
            // Vẽ user ra giao diện
            const div = document.createElement('div')
            div.classList.add('box-user')
            div.setAttribute('user-id', data.infoUserA._id)
            
            div.innerHTML = `
                <div class="inner-avatar">
                    <img src="${data.infoUserA.avatar}" alt="${data.infoUserA.fullName}">
                </div>

                <div class="inner-info">
                    <div class="inner-name">${data.infoUserA.fullName}</div>

                    <div class="inner-buttons">
                        <button
                            class="btn btn-sm btn-primary mr-1"
                            btn-accept-friend="${data.infoUserA._id}">
                            Chấp nhận
                        </button>

                        <button
                            class="btn btn-sm btn-secondary mr-1"
                            btn-refuse-friend="${data.infoUserA._id}">
                            Xóa
                        </button>

                        <button
                            class="btn btn-sm btn-secondary mr-1"
                            btn-deleted-friend=""
                            disabled>
                            Đã xóa
                        </button>

                        <button
                            class="btn btn-sm btn-primary mr-1"
                            btn-accepted-friend=""
                            disabled>
                            Đã chấp nhận
                        </button>
                    </div>
                </div>
            `
            dataUserAccept.appendChild(div)
            // Hết vẽ user ra giao diện

            // Hủy lời mời kết bạn
            const btnRefuse = div.querySelector('[btn-refuse-friend]')
            btnRefuse.addEventListener('click', () => {
                btnRefuse.closest('.box-user').classList.add('refuse')
                const userID = btnRefuse.getAttribute('btn-refuse-friend')
                
                socket.emit('client-refuse-friend', userID)
            })           
            // Hết hủy lời mời kết bạn
            
            // Chấp nhận lời mời kết bạn
            const btnAccept = div.querySelector('[btn-accept-friend]')
            btnAccept.addEventListener('click', () => {
                btnAccept.closest('.box-user').classList.add('accepted')
                const userID = btn.getAttribute('btn-accept-friend')
                
                socket.emit('client-accept-friend', userID)
            })
            // Hết chấp nhận lời mời kết bạn
        }
        
    })
}
// end server-return-info-friend-accept

// server-return-user-cancel-friend
socket.on('server-return-user-cancel-friend', data => {
    const userIDA = data.userIDA
    const myUserID = document.querySelector('[data-users-accept]').getAttribute('data-users-accept')
    if (data.userID == myUserID){
        const boxUserRemove = document.querySelector(`[user-id='${userIDA}']`)
        if (boxUserRemove){
            const dataUserAccept = document.querySelector('[data-users-accept]')
            dataUserAccept.removeChild(boxUserRemove)
        }
    }
})
// end server-return-user-cancel-friend