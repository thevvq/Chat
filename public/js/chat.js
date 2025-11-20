// file-upload-with-preview
// const upload = new FileUploadWithPreview.FileUploadWithPreview('upload-images',{
//     multiFile: true,
//     maxFileCount: 5,
// });
// end file-upload-with-preview

// Join room khi page load (nếu đang ở trang chat)
document.addEventListener('DOMContentLoaded', () => {
    const chatBody = document.querySelector('.content-view .inner-body');
    if (chatBody) {
        const userID = chatBody.getAttribute('my-id');
        const fullName = chatBody.getAttribute('my-name') || 'User';
        // Lấy roomChatID từ URL (pathname: /{roomChatID})
        const pathParts = window.location.pathname.split('/');
        const roomChatID = pathParts[1]; // Phần tử thứ 1 sau '/'
        
        if (roomChatID && userID) {
            console.log(`[join] Joining room ${roomChatID} as user ${userID}`);
            joinRoom(roomChatID, userID, fullName);
        }
    }
});
// End Join room

// add class active cho sidebar
// public/js/chat.js
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const currentRoomId = pathParts[1] || '';
    const sidebarLinks = document.querySelectorAll('.sidebar .chat-list li a');

    // Kiểm tra xem URL hiện tại có phải là 1 room không bằng cách
    // đối chiếu với data-room-id trong danh sách conversation
    const convElements = document.querySelectorAll('.content-list .conversation');
    const isRoomPath = currentRoomId && Array.from(convElements).some(el => el.getAttribute('data-room-id') === currentRoomId);

    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Nếu link là '/' (Tin nhắn) thì active khi:
        // - đang ở '/' hoặc
        // - đang ở 1 room (isRoomPath === true)
        if (href === '/') {
            if (currentPath === '/' || isRoomPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
            return;
        }

        // Nếu link là social dashboard (bất kỳ đường dẫn bắt đầu bằng '/socialDashboard')
        if (href && href.startsWith('/socialDashboard')) {
            if (currentPath.startsWith('/socialDashboard')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }

            // Xử lý click
            link.addEventListener('click', function(e) {
                sidebarLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
            return;
        }

        // ngược lại, match chính xác theo pathname
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }

        // Xử lý click
        link.addEventListener('click', function(e) {
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
// end add class active cho sidebar

// add class active cho conversation list (danh sách phòng)
document.addEventListener('DOMContentLoaded', () => {
    const convLinks = document.querySelectorAll('.content-list .conversation');

    // Lấy roomId từ URL (ví dụ '/<roomId>') để dùng làm nguồn chân thực
    const pathParts = window.location.pathname.split('/');
    const currentRoomId = pathParts[1] || '';

    convLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const dataRoomId = link.getAttribute('data-room-id') || '';

        // Tự động active theo data-room-id (ưu tiên) hoặc theo href nếu không có data
        const shouldActive = (dataRoomId && dataRoomId === currentRoomId) || (href === window.location.pathname);

        if (shouldActive) {
            link.classList.add('active');
            console.log('[chat] set active conversation:', { href, dataRoomId, currentRoomId });
        } else {
            link.classList.remove('active');
        }

        // Xử lý click: đảm bảo active chỉ trên conversation được chọn
        link.addEventListener('click', function(e) {
            convLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
// end add class active cho conversation list

// add class active cho menu social
document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.social-menu a');
    const currentPath = window.location.pathname;

    // Hàm xóa active
    const removeActive = () => {
        menuLinks.forEach(link => link.classList.remove('active'));
    };

    // Hàm thêm active
    const addActive = (link) => {
        removeActive();
        link.classList.add('active');
    };

    // Tự động active theo URL
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath.startsWith(href) && href !== '/')) {
            addActive(link);
        }

        // Bắt click
        link.addEventListener('click', function(e) {
            // Nếu dùng route không reload (SPA), bỏ preventDefault
            // e.preventDefault();
            addActive(this);

            // Nếu dùng route thật (reload), không cần làm gì thêm
        });
    });
});
// end add class active cho menu social

// Client Send Message
const formSendData = document.querySelector('.content-view .inner-form');

let justSent = false;

formSendData.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = e.target.elements.content.value.trim();
    if (!content) return;

    socket.emit('client-send-message', {
        content,
        images: []
    });

    socket.emit('client-typing', 'hidden'); // ẩn typing
    e.target.elements.content.value = '';

    justSent = true;
    setTimeout(() => { justSent = false }, 500); // 0.5s sau mới cho phép show typing
});

// End Client Send Message


// Server Return Message
socket.on('server-return-message', (data) => {
    const myID = document.querySelector('.content-view .inner-body').getAttribute('my-id');
    const chatBody = document.querySelector('.content-view .inner-body');
    const boxTyping = document.querySelector('.content-view .inner-list-typing');

    const messageDiv = document.createElement('div');
    let html = "";

    if (data.userID === myID) {
        // Tin nhắn của mình
        messageDiv.classList.add('inner-outgoing');

        html = `
            <div class="message-group">
                <div class="inner-content">${data.content}</div>

                ${
                    data.images?.length
                    ? `<div class="inner-images">
                        ${data.images.map(img => `<img src="${img}" class="chat-image"/>`).join("")}
                       </div>`
                    : ""
                }
            </div>
        `;
    } else {
        // Tin nhắn của người khác
        messageDiv.classList.add('inner-incoming');

        html = `
            <img src="${data.avatar}" class="chat-avatar" />

            <div class="message-group">
                <div class="inner-name">${data.fullName}</div>

                <div class="inner-content">${data.content}</div>

                ${
                    data.images?.length
                    ? `<div class="inner-images">
                        ${data.images.map(img => `<img src="${img}" class="chat-image"/>`).join("")}
                       </div>`
                    : ""
                }
            </div>
        `;
    }

    messageDiv.innerHTML = html;

    chatBody.insertBefore(messageDiv, boxTyping);
    chatBody.scrollTop = chatBody.scrollHeight;
});
// End Server Return Message


// Scroll to Bottom Chat Window
const chatBody = document.querySelector('.content-view .inner-body');
if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight;
}
// End Scroll

// Icon Chat - Show Popup
const buttonIcon = document.querySelector('.button-icon');
if (buttonIcon) {
    const tooltip = document.querySelector('.tooltip');
    Popper.createPopper(buttonIcon, tooltip);

    buttonIcon.onclick = () => {
        tooltip.classList.toggle('show');
    };
}
// End Show Popup

// Show Typing
let timeOut
const showTyping = () => {
    if (justSent) return; // nếu vừa gửi, đừng báo typing

    socket.emit('client-typing', 'show');

    clearTimeout(timeOut);

    timeOut = setTimeout(() => {
        socket.emit('client-typing', 'hidden');
    }, 3000);
};

// End Show Typing

// Emoji Picker
const emojiPicker = document.querySelector('emoji-picker');
if (emojiPicker) {
    const inputChat = document.querySelector('.inner-form input[name="content"]');

    emojiPicker.addEventListener('emoji-click', event => {
        const icon = event.detail.unicode;
        inputChat.value += icon;

        const end = inputChat.value.length
        inputChat.setSelectionRange(end, end);
        inputChat.focus();

        showTyping()
    });

    // input keyup - typing indicator

    inputChat.addEventListener('keyup', showTyping);

}
// End Emoji Picker


// Server Return Typing
const elementListTyping = document.querySelector('.content-view .inner-list-typing');
if (elementListTyping) {
    socket.on('server-return-typing', (data) => {
        if (data.type == 'show') {
            const existTyping = elementListTyping.querySelector(`[user-id='${data.user_id}']`);
            const chatBody = document.querySelector('.content-view .inner-body');

            if (!existTyping) {
                const boxTyping = document.createElement('div');
                boxTyping.classList.add('box-typing');
                boxTyping.setAttribute('user-id', data.user_id);

                boxTyping.innerHTML = `
                    <div class='inner-name'>${data.fullName}</div>
                    <div class='inner-dots'>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                `;

                elementListTyping.appendChild(boxTyping);
            }
            chatBody.scrollTop = chatBody.scrollHeight;

        }
        else{
            const boxTypingRemove = elementListTyping.querySelector(`[user-id='${data.user_id}']`)
            if (boxTypingRemove) {
                elementListTyping.removeChild(boxTypingRemove);
            }
        }
    });
}
// End Server Return Typing


// Confirm hủy kết bạn
document.querySelectorAll('[btn-cancel-friend], [btn-deleted-friend], [btn-refuse-friend]').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (!confirm('Bạn có chắc chắn muốn hủy kết bạn không?')) {
            e.preventDefault();
        }
    });
});
// End Confirm hủy kết bạn