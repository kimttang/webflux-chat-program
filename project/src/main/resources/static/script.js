let lastMessageInfo = {sender: null, timestamp: null};
let searchResults = [];
let currentSearchIndex = -1;

const DOM = {
    authScreen: document.getElementById('auth-screen'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    mainScreen: document.getElementById('main-screen'),
    chatScreen: document.getElementById('chat-screen'),
    languageSelectorAuth: document.getElementById('language-selector-auth'),
    loginTitle: document.getElementById('login-title'),
    loginUsernameInput: document.getElementById('login-username'),
    loginPasswordInput: document.getElementById('login-password'),
    loginButton: document.getElementById('login-button'),
    loginError: document.getElementById('login-error'),
    signupPrompt: document.getElementById('signup-prompt'),
    showSignup: document.getElementById('show-signup'),
    signupTitle: document.getElementById('signup-title'),
    signupNicknameInput: document.getElementById('signup-nickname'),
    signupUsernameInput: document.getElementById('signup-username'),
    signupPasswordInput: document.getElementById('signup-password'),
    signupButton: document.getElementById('signup-button'),
    signupError: document.getElementById('signup-error'),
    loginPrompt: document.getElementById('login-prompt'),
    showLogin: document.getElementById('show-login'),
    userProfileClickable: document.getElementById('user-profile-clickable'),
    profilePicture: document.getElementById('profile-picture'),
    usernameDisplay: document.getElementById('username-display'),
    logoutButton: document.getElementById('logout-button'),
    tabs: document.querySelectorAll('.tab'),
    friendList: document.getElementById('friend-list'),
    roomList: document.getElementById('room-list'),
    friendsActionArea: document.getElementById('friends-action-area'),
    chatroomsActionArea: document.getElementById('chatrooms-action-area'),
    friendNameInput: document.getElementById('friend-name-input'),
    addFriendButton: document.getElementById('add-friend-button'),
    roomNameInput: document.getElementById('room-name-input'),
    createRoomButton: document.getElementById('create-room-button'),
    backToMain: document.getElementById('back-to-main'),
    chatTitle: document.getElementById('chat-title'),
    chatWindow: document.getElementById('chat-window'),
    messageInput: document.getElementById('message-input'),
    sendButton: document.getElementById('send-button'),
     inviteButton: document.getElementById('invite-user-button'),
     leaveButton: document.getElementById('leave-room-button'),
    languageSelect: document.getElementById('language-select'),
    typingIndicator: document.getElementById('typing-indicator'),
    uploadButton: document.getElementById('upload-button'),
    fileInput: document.getElementById('file-input'),
    profileEditOverlay: document.getElementById('profile-edit-overlay'),
    profileEditModal: document.getElementById('profile-edit-modal'),
    profileEditPreview: document.getElementById('profile-edit-preview'),
    profileEditFileInput: document.getElementById('profile-edit-file-input'),
    profileEditPictureButton: document.getElementById('profile-edit-picture-button'),
    profileEditNickname: document.getElementById('profile-edit-nickname'),
    profileEditSave: document.getElementById('profile-edit-save'),
    profileEditCancel: document.getElementById('profile-edit-cancel'),
     participantsOverlay: document.getElementById('participants-overlay'),
     participantsModal: document.getElementById('participants-modal'),
     closeParticipantsModal: document.getElementById('close-participants-modal'),
     participantsList: document.getElementById('participants-list'),
    replyBar: document.getElementById('reply-bar'),
    replyToUser: document.getElementById('reply-to-user'),
    replyToMessage: document.getElementById('reply-to-message'),
    cancelReplyButton: document.getElementById('cancel-reply-button'),
    searchNav: document.getElementById('search-nav'),
    searchCount: document.getElementById('search-count'),
    searchPrevButton: document.getElementById('search-prev-button'),
    searchNextButton: document.getElementById('search-next-button'),
    searchIcon: document.getElementById('search-icon'),
    searchInput: document.getElementById('search-input'),
    searchBar: document.getElementById('search-bar'),
};
    const translations = {
    // --- 로그인/회원가입 화면 번역 추가 ---
    loginTitle: { ko: '로그인', en: 'Login', ja: 'ログイン', zh: '登录', ar: 'تسجيل الدخول' },
    nicknamePlaceholder: { ko: '닉네임', en: 'Nickname', ja: 'ニックネーム', zh: '昵称', ar: 'اللقب' },
    usernamePlaceholder: { ko: '아이디', en: 'ID', ja: 'ID', zh: '用户名', ar: 'اسم المستخدم' },
    passwordPlaceholder: { ko: '비밀번호', en: 'Password', ja: 'パスワード', zh: '密码', ar: 'كلمة المرور' },
    loginButton: { ko: '로그인', en: 'Login', ja: 'ログイン', zh: '登录', ar: 'تسجيل الدخول' },
    signupPrompt: { ko: '계정이 없으신가요?', en: "Don't have an account?", ja: 'アカウントをお持ちではありませんか？', zh: '没有帐户？', ar: 'ليس لديك حساب؟' },
    showSignup: { ko: '회원가입', en: 'Sign up', ja: '会員登録', zh: '注册', ar: 'اشتراك' },
    signupTitle: { ko: '회원가입', en: 'Sign Up', ja: '会員登録', zh: '注册', ar: 'اشتراك' },
    signupButton: { ko: '가입하기', en: 'Sign Up', ja: '登録する', zh: '注册', ar: 'اشتراك' },
    loginPrompt: { ko: '이미 계정이 있으신가요?', en: 'Already have an account?', ja: 'すでにアカウントをお持ちですか？', zh: '已有帐户？', ar: 'هل لديك حساب بالفعل؟' },
    showLogin: { ko: '로그인', en: 'Login', ja: 'ログイン', zh: '登录', ar: 'تسجيل الدخول' },

    // ---  메인 화면 번역 ---
    logoutButton: { ko: '로그아웃', en: 'Logout', ja: 'ログアウト', zh: '登出', ar: 'تسجيل خروج' },
    friendsTab: { ko: '친구', en: 'Friends', ja: '友達', zh: '朋友', ar: 'الأصدقاء' },
    chatroomsTab: { ko: '채팅방', en: 'Chat Rooms', ja: 'チャットルーム', zh: '聊天室', ar: 'غرف الدردشة' },
    friendNamePlaceholder: { ko: '친구 아이디 입력', en: "Enter friend's ID", ja: '友達のIDを入力', zh: '输入好友ID', ar: 'أدخل معرف الصديق' },
    addButton: { ko: '추가', en: 'Add', ja: '追加', zh: '添加', ar: 'إضافة' },
    dmButton: { ko: 'DM', en: 'DM', ja: 'DM', zh: '私信', ar: 'رسالة خاصة' },
    roomNamePlaceholder: { ko: '채팅방 이름 입력', en: 'Enter chat room name', ja: 'チャットルーム名を入力', zh: '输入聊天室名称', ar: 'أدخل اسم غرفة الدردشة' },
    createButton: { ko: '생성', en: 'Create', ja: '作成', zh: '创建', ar: 'إنشاء' },

    // ---  채팅 화면 번역 (이전 답변에 포함된 내용) ---
    typingIndicator: { ko: '님이 입력 중...', en: ' is typing...', ja: 'さんが入力中...', zh: '正在输入...', ar: 'يكتب...' },
    langNone: { ko: '번역 안함', en: 'No Translation', ja: '翻訳しない', zh: '不翻译', ar: 'بدون ترجمة' },
    langEn: { ko: '영어', en: 'English', ja: '英語', zh: '英语', ar: 'الإنجليزية' },
    langJa: { ko: '일본어', en: 'Japanese', ja: '日本語', zh: '日语', ar: 'اليابانية' },
    langZh: { ko: '중국어', en: 'Chinese', ja: '中国語', zh: '中文', ar: 'الصينية' },
    langAr: { ko: '아랍어', en: 'Arabic', ja: 'アラビア語', zh: '阿拉伯语', ar: 'العربية' },
    messagePlaceholder: { ko: '메시지 입력...', en: 'Enter message...', ja: 'メッセージを入力...', zh: '输入消息...', ar: 'أدخل رسالة...' },
    sendButton: { ko: '전송', en: 'Send', ja: '送信', zh: '发送', ar: 'إرسال' },
    inviteButton: { ko: '초대', en: 'Invite', ja: '招待', zh: '邀请', ar: 'دعوة' },
    leaveButton: { ko: '나가기', en: 'Leave', ja: '退出', zh: '离开', ar: 'مغادرة' },

    // ---  알림 메시지 번역 ---
    alertSignupSuccess: { ko: '회원가입 성공! 로그인해주세요.', en: 'Sign up successful! Please log in.', ja: '会員登録が成功しました！ログインしてください。', zh: '注册成功！请登录。', ar: 'تم التسجيل بنجاح! الرجاء تسجيل الدخول.' },
    alertAddFriendSuccess: { ko: '친구 추가 성공!', en: 'Friend added successfully!', ja: '友達追加が成功しました！', zh: '添加好友成功！', ar: 'تمت إضافة الصديق بنجاح!' },
    alertAddFriendFail: { ko: '친구 추가 실패: {error}', en: 'Failed to add friend: {error}', ja: '友達追加に失敗しました: {error}', zh: '添加好友失败: {error}', ar: 'فشل إضافة صديق: {error}' },
    alertFileUploadFail: { ko: '파일 업로드에 실패했습니다.', en: 'File upload failed.', ja: 'ファイルのアップロードに失敗しました。', zh: '文件上传失败。', ar: 'فشل تحميل الملف.' }
};
const DEFAULT_PROFILE_PICTURE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
let currentLanguage = 'ko';
let currentUser = null;
let currentUserNickname = null;
let currentUserObject = null;
let currentRoomId = null;
let websocket = null;
let roomEventSource = null;
let presenceEventSource = null;
let typingTimeout = null;
let currentRoomMembers = [];
let intersectionObserver;
let currentReplyToId = null;

function changeLanguage(lang) {
    currentLanguage = lang;

    // 도우미 함수: 요소가 존재할 때만 텍스트/플레이스홀더를 설정합니다.
    const setText = (element, textKey) => {
        if (element && translations[textKey] && translations[textKey][lang]) {
            element.textContent = translations[textKey][lang];
        }
    };
    const setPlaceholder = (element, placeholderKey) => {
        if (element && translations[placeholderKey] && translations[placeholderKey][lang]) {
            element.placeholder = translations[placeholderKey][lang];
        }
    };

    // --- 인증 화면 ---
    setText(DOM.loginTitle, 'loginTitle');
    setPlaceholder(DOM.loginUsernameInput, 'usernamePlaceholder');
    setPlaceholder(DOM.loginPasswordInput, 'passwordPlaceholder');
    setText(DOM.loginButton, 'loginButton');
    setText(DOM.signupPrompt, 'signupPrompt');
    setText(DOM.showSignup, 'showSignup');
    setText(DOM.signupTitle, 'signupTitle');
    setPlaceholder(DOM.signupNicknameInput, 'nicknamePlaceholder');
    setPlaceholder(DOM.signupUsernameInput, 'usernamePlaceholder');
    setPlaceholder(DOM.signupPasswordInput, 'passwordPlaceholder');
    setText(DOM.signupButton, 'signupButton');
    setText(DOM.loginPrompt, 'loginPrompt');
    setText(DOM.showLogin, 'showLogin');

    // --- 메인 화면 (사이드바) ---
    setText(DOM.logoutButton, 'logoutButton');
    if (DOM.tabs) {
        DOM.tabs.forEach(tab => {
            if (tab.id === 'friends-tab-button') setText(tab, 'friendsTab');
            if (tab.id === 'chatrooms-tab-button') setText(tab, 'chatroomsTab');
        });
    }
    setPlaceholder(DOM.friendNameInput, 'friendNamePlaceholder');
    setText(DOM.addFriendButton, 'addButton');
    setPlaceholder(DOM.roomNameInput, 'roomNamePlaceholder');
    setText(DOM.createRoomButton, 'createButton');

    // --- 채팅 화면 ---
    setPlaceholder(DOM.messageInput, 'messagePlaceholder');
    setText(DOM.sendButton, 'sendButton');
    setText(DOM.inviteButton, 'inviteButton');
    setText(DOM.leaveButton, 'leaveButton');

    // --- 언어 선택 드롭다운 (getElementById는 직접 체크) ---
    setText(document.getElementById('lang-none'), 'langNone');
    setText(document.getElementById('lang-en'), 'langEn');
    setText(document.getElementById('lang-ja'), 'langJa');
    setText(document.getElementById('lang-zh'), 'langZh');
    setText(document.getElementById('lang-ar'), 'langAr');

    // 이 부분은 UI 업데이트와 직접 관련 없으므로 그대로 둡니다.
    if (currentUser) {
        loadFriends();
    }
}

    function showAlert(key, replacements = {}) { let message = translations[key][currentLanguage]; for (const placeholder in replacements) { message = message.replace(`{${placeholder}}`, replacements[placeholder]); } alert(message); }
    function showAuthScreen() { DOM.authScreen.classList.remove('hidden'); DOM.mainScreen.classList.add('hidden'); DOM.chatScreen.classList.add('hidden'); currentUser = null; currentUserNickname = null; if (websocket) websocket.close(); if (roomEventSource) roomEventSource.close(); if (presenceEventSource) presenceEventSource.close(); }
    function showMainScreen() {
    DOM.authScreen.classList.add('hidden');
    DOM.mainScreen.classList.remove('hidden');
    DOM.chatScreen.classList.add('hidden');
    fetch(`/api/users/${currentUser}/details`).then(response => response.ok ? response.json() : Promise.reject('User not found')).then(user => { currentUser = user.username; currentUserNickname = user.nickname; DOM.usernameDisplay.textContent = user.nickname; DOM.profilePicture.src = user.profilePictureUrl || DEFAULT_PROFILE_PICTURE; loadFriends(); listenToRoomUpdates(); listenToPresenceUpdates(); fetchUnreadCounts(); }).catch(error => { console.error("Failed to fetch user details:", error); showAuthScreen(); });
}
async function showChatScreen(roomId, roomName) {
     currentRoomId = roomId;
     DOM.mainScreen.classList.add('hidden');
     DOM.chatScreen.classList.remove('hidden');
     DOM.chatTitle.textContent = roomName;

     const header = DOM.chatTitle.parentElement;
     const existingButtons = header.querySelector('.chat-header-buttons');
     if (existingButtons) { header.removeChild(existingButtons); }

     const buttonContainer = document.createElement('div');
     buttonContainer.className = 'chat-header-buttons';

     // 참가자 목록 버튼 (사람들 모양 아이콘)
     const participantsButton = document.createElement('button');
     participantsButton.id = 'participants-button';
     participantsButton.className = 'icon-button';
     participantsButton.innerHTML = '<i class="fas fa-users"></i>';
     participantsButton.title = "참가자 보기"; // 툴팁
     buttonContainer.appendChild(participantsButton);

     // 초대 버튼 (사람 모양 아이콘)
     const inviteButton = document.createElement('button');
     inviteButton.id = 'invite-user-button'; // 새로운 ID 할당
     inviteButton.className = 'icon-button'; // 새로운 클래스 추가
     inviteButton.innerHTML = '<i class="fas fa-user-plus"></i>'; // Font Awesome 아이콘 사용
     inviteButton.title = translations.inviteButton[currentLanguage]; // 툴팁 추가

     // 나가기 버튼 (문 모양 아이콘)
     const leaveButton = document.createElement('button');
     leaveButton.id = 'leave-room-button'; // 새로운 ID 할당
     leaveButton.className = 'icon-button'; // 새로운 클래스 추가
     leaveButton.innerHTML = '<i class="fas fa-door-open"></i>'; // Font Awesome 아이콘 사용
     leaveButton.title = translations.leaveButton[currentLanguage]; // 툴팁 추가

     buttonContainer.appendChild(inviteButton);
     buttonContainer.appendChild(leaveButton);
     header.appendChild(buttonContainer);

     participantsButton.addEventListener('click', openParticipantsModal);
    inviteButton.addEventListener('click', () => openInviteFriendModal(currentRoomId));
     leaveButton.addEventListener('click', leaveCurrentRoom);

     DOM.chatWindow.innerHTML = '';
    await fetchParticipants(roomId);
    setupIntersectionObserver();
    connectWebSocket(roomId);
    loadPreviousMessages();
     resetUnreadCount(currentRoomId);
 }
    DOM.languageSelectorAuth.addEventListener('change', (e) => changeLanguage(e.target.value));
    DOM.showSignup.addEventListener('click', (e) => { e.preventDefault(); DOM.loginForm.classList.add('hidden'); DOM.signupForm.classList.remove('hidden'); });
    DOM.showLogin.addEventListener('click', (e) => { e.preventDefault(); DOM.signupForm.classList.add('hidden'); DOM.loginForm.classList.remove('hidden'); });
    DOM.logoutButton.addEventListener('click', showAuthScreen);
    DOM.loginButton.addEventListener('click', async () => {
    const username = DOM.loginUsernameInput.value; const password = DOM.loginPasswordInput.value;
    try {
    const response = await fetch('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }), });
    if (response.ok) { const user = await response.json(); currentUser = user.username; currentUserObject = user; showMainScreen(); } else { const error = await response.text(); DOM.loginError.textContent = error; DOM.loginError.classList.remove('hidden'); }
} catch (error) { DOM.loginError.textContent = '로그인 중 오류 발생'; DOM.loginError.classList.remove('hidden'); }
});
    DOM.signupButton.addEventListener('click', async () => {
    const nickname = DOM.signupNicknameInput.value; const username = DOM.signupUsernameInput.value; const password = DOM.signupPasswordInput.value;
    try {
    const response = await fetch('/api/users/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, nickname }), });
    if (response.ok) { showAlert('alertSignupSuccess'); DOM.signupForm.classList.add('hidden'); DOM.loginForm.classList.remove('hidden'); DOM.loginUsernameInput.value = username; DOM.loginPasswordInput.value = ''; } else { const error = await response.text(); DOM.signupError.textContent = error; DOM.signupError.classList.remove('hidden'); }
} catch (error) { DOM.signupError.textContent = '회원가입 중 오류 발생'; DOM.signupError.classList.remove('hidden'); }
});
    DOM.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        DOM.tabs.forEach(t => t.classList.remove('active')); tab.classList.add('active'); const tabName = tab.dataset.tab;
        if (tabName === 'friends') { DOM.friendList.classList.remove('hidden'); DOM.friendsActionArea.classList.remove('hidden'); DOM.roomList.classList.add('hidden'); DOM.chatroomsActionArea.classList.add('hidden'); } else { DOM.friendList.classList.add('hidden'); DOM.friendsActionArea.classList.add('hidden'); DOM.roomList.classList.remove('hidden'); DOM.chatroomsActionArea.classList.remove('hidden'); }
    });
});
    DOM.addFriendButton.addEventListener('click', async () => {
    const friendUsername = DOM.friendNameInput.value; if (!friendUsername) return;
    try {
    const response = await fetch('/api/friends/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentUsername: currentUser, friendUsername }), });
    if (response.ok) { showAlert('alertAddFriendSuccess'); DOM.friendNameInput.value = ''; loadFriends(); } else { const error = await response.text(); showAlert('alertAddFriendFail', { error: error }); }
} catch (error) { showAlert('alertAddFriendFail', { error: 'Network error' }); }
});
    async function loadFriends() {
    try {
    const response = await fetch(`/api/friends/${currentUser}`); const friends = await response.json();
    const onlineFriendsResponse = await fetch(`/api/presence/${currentUser}/friends/online`); const onlineFriendUsernames = await onlineFriendsResponse.json();
    DOM.friendList.innerHTML = '';
    friends.forEach(friend => {
    const isOnline = onlineFriendUsernames.includes(friend.username); const li = document.createElement('li');
    li.innerHTML = ` <div class="friend-info"> <div class="friend-avatar-container"> <img src="${friend.profilePictureUrl || DEFAULT_PROFILE_PICTURE}" class="friend-avatar" alt="Friend Avatar"> <span class="status-circle ${isOnline ? 'online' : ''}" data-username="${friend.username}"></span> </div> <span>${friend.nickname}</span> </div> <button class="button">${translations.dmButton[currentLanguage]}</button> `;
    li.querySelector('button').addEventListener('click', () => startDM(friend.username)); DOM.friendList.appendChild(li);
});
} catch (error) { console.error('친구 목록 로딩 실패:', error); }
}
    async function startDM(friendUsername) {
    try {
    const response = await fetch('/api/dm/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromUser: currentUser, toUser: friendUsername }), });
    const room = await response.json();
    const friendResponse = await fetch(`/api/users/${friendUsername}/details`); const friend = await friendResponse.json();
    showChatScreen(room.id, friend.nickname);
} catch (error) { console.error('DM 시작 실패:', error); }
}
    function listenToRoomUpdates() {
    if (roomEventSource) roomEventSource.close();
    roomEventSource = new EventSource(`/api/chatrooms/${currentUser}`);
    roomEventSource.onmessage = (event) => {
    try {
    if (event.data.startsWith('{') || event.data.startsWith('[')) {
    const rooms = JSON.parse(event.data);
    DOM.roomList.innerHTML = '';
    rooms.forEach(room => {
    const li = document.createElement('li');
    li.dataset.roomId = room.id;
    let roomDisplayName = room.name;
        if (room.name.includes(' & ')) {
            const nicknames = room.name.split(' & ');
            // 현재 사용자의 닉네임이 아닌 다른 닉네임을 찾습니다.
            const otherNickname = nicknames.find(n => n !== currentUserNickname);
            // 다른 닉네임을 찾았다면 그것을 표시하고, 아니면 원래 이름을 표시합니다.
            roomDisplayName = otherNickname || room.name;
        }
    li.innerHTML = `<span>${roomDisplayName}</span><span class="unread-badge hidden" data-room-id="${room.id}">0</span>`;
    li.addEventListener('click', () => showChatScreen(room.id, roomDisplayName));
    DOM.roomList.appendChild(li);
});
    fetchUnreadCounts();
}
} catch (e) { console.warn("Received non-JSON message from room stream, ignoring.", event.data); }
};
    roomEventSource.onerror = () => { console.error('Room SSE error. Reconnecting...'); };
}
    function listenToPresenceUpdates() {
    if (presenceEventSource) presenceEventSource.close();
    presenceEventSource = new EventSource(`/api/presence/${currentUser}/subscribe`);
    presenceEventSource.onmessage = (event) => {
    try {
    if (event.data.startsWith('{')) {
    const { username, status } = JSON.parse(event.data);
    const statusCircle = document.querySelector(`.status-circle[data-username="${username}"]`);
    if (statusCircle) { statusCircle.classList.toggle('online', status === 'ONLINE'); }
}
} catch (e) { console.warn("Received non-JSON message from presence stream, ignoring.", event.data); }
};
    presenceEventSource.onerror = (e) => { console.error('Presence SSE error:', e); };
}
    DOM.createRoomButton.addEventListener('click', async () => {
    const name = DOM.roomNameInput.value; if (!name) return;
    await fetch('/api/chatrooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, username: currentUser }), });
    DOM.roomNameInput.value = '';
});
    DOM.backToMain.addEventListener('click', () => { if (websocket) websocket.close(); showMainScreen(); });
    function connectWebSocket() {
        if (websocket) websocket.close();
        const wsUrl = `ws://${window.location.host}/chat/${currentRoomId}?username=${encodeURIComponent(currentUser)}`;
        websocket = new WebSocket(wsUrl);
        websocket.onopen = () => console.log('WebSocket connected');
        websocket.onclose = () => console.log('WebSocket disconnected');

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'MESSAGE') {

                    const totalMembers = currentRoomMembers.length;
                    const msg = data.messagePayload;
                    const readByCount = msg.readBy ? msg.readBy.length : 1;
                    msg.unreadCount = totalMembers - readByCount;
                    if (msg.unreadCount < 0) msg.unreadCount = 0;
                    const newMessageElement = displayMessage(msg);
                    DOM.chatWindow.appendChild(newMessageElement);
                    DOM.chatWindow.scrollTop = DOM.chatWindow.scrollHeight;

                } else if (data.type === 'MESSAGE_UPDATE') {
                    updateMessageInUI(data.messagePayload);
                } else if (data.type === 'TRANSLATE_RESULT') {
                    displayTranslatedMessage(data.content, data.originalMessageId);
                } else if (data.type === 'TYPING_START') {
                    if (data.sender !== currentUserNickname) {
                        DOM.typingIndicator.textContent = data.sender + translations.typingIndicator[currentLanguage];
                    }
                } else if (data.type === 'TYPING_STOP') {
                    const currentTypingUser = DOM.typingIndicator.textContent.replace(translations.typingIndicator[currentLanguage], '').trim();
                    if (data.sender === currentTypingUser) {
                        DOM.typingIndicator.textContent = '';
                    }
                } else if (data.type === 'READ_RECEIPT_UPDATE') {
                    const messageElement = document.querySelector(`.message-container[data-message-id="${data.messageId}"]`);
                    if (messageElement) {
                        const unreadSpan = messageElement.querySelector('.unread-count');
                        if (unreadSpan) {
                            if (data.unreadCount > 0) {
                                unreadSpan.textContent = data.unreadCount;
                                unreadSpan.classList.remove('hidden');
                            } else {
                                unreadSpan.textContent = '';
                                unreadSpan.classList.add('hidden');
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Error parsing websocket message:", e);
            }
        };
    }
function startReply(messageId, senderNickname, content) {
    currentReplyToId = messageId;
    DOM.replyToUser.textContent = `${senderNickname}님에게 답장`;
    DOM.replyToMessage.textContent = content;
    DOM.replyBar.classList.remove('hidden');
    DOM.messageInput.focus();
}


function cancelReply() {
    currentReplyToId = null;
    DOM.replyBar.classList.add('hidden');
}


function sendMessage() {
    // 1. 기존과 동일하게 메시지 내용과 번역 언어를 가져옵니다.
    const message = DOM.messageInput.value.trim(); // .trim()을 추가하여 양 끝 공백 제거
    const targetLang = DOM.languageSelect.value;

    if (message === '') return; // 비어있는 메시지는 보내지 않음

    // 2. ✨ [핵심 수정] payload 객체에 'replyToMessageId'를 추가합니다.
    const payload = {
        type: 'MESSAGE',
        nickname: currentUserNickname,
        message: message,
        targetLang: targetLang,
        replyToMessageId: currentReplyToId // 현재 답장 중인 메시지 ID 추가
    };

    // 3. 기존과 동일하게 웹소켓으로 메시지를 전송합니다.
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(payload));
    }

    // 4. 입력창을 비우고, ✨ [핵심 수정] 답장 상태를 초기화합니다.
    DOM.messageInput.value = '';
    cancelReply(); // 답장 바를 숨기고 ID를 초기화하는 함수 호출

    // 5. 기존과 동일하게 타이핑 종료 이벤트를 처리합니다.
    clearTimeout(typingTimeout);
    sendTypingEnd();
}
    DOM.sendButton.addEventListener('click', sendMessage);
    DOM.cancelReplyButton.addEventListener('click', cancelReply);
    DOM.messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } });
    DOM.messageInput.addEventListener('input', () => { clearTimeout(typingTimeout); if (DOM.messageInput.value.trim() !== '') { sendTypingStart(); typingTimeout = setTimeout(sendTypingEnd, 3000); } else { sendTypingEnd(); } });
    function sendTypingStart() { if (websocket?.readyState === WebSocket.OPEN) websocket.send(JSON.stringify({ type: 'TYPING_START', nickname: currentUserNickname })); }
    function sendTypingEnd() { if (websocket?.readyState === WebSocket.OPEN) websocket.send(JSON.stringify({ type: 'TYPING_STOP', nickname: currentUserNickname })); }

async function loadPreviousMessages() {
    try {
        const response = await fetch(`/api/rooms/${currentRoomId}/messages`, {
            headers: { 'X-Username': currentUser }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to load messages:', errorText);
            alert(`메시지를 불러오는 데 실패했습니다: ${errorText}`);
            showMainScreen();
            return;
        }
        const messages = await response.json();
        DOM.chatWindow.innerHTML = '';

        messages.forEach(msgDto => {
            const messageElement = displayMessage(msgDto);
            DOM.chatWindow.appendChild(messageElement);
        });

        setTimeout(() => {
            DOM.chatWindow.scrollTop = DOM.chatWindow.scrollHeight;
            markVisibleMessagesAsRead();
        }, 0);
    } catch (error) {
        console.error('Error in loadPreviousMessages:', error);
    }
}

    function displayTranslatedMessage(translatedText, originalMessageId) {
    const originalMessageElement = document.getElementById(`message-${originalMessageId}`);
    if (originalMessageElement) {
    const messageBubble = originalMessageElement.querySelector('.message-bubble');
    if (messageBubble) {
    let translatedDiv = messageBubble.querySelector('.translated-message');
    if (!translatedDiv) { translatedDiv = document.createElement('div'); translatedDiv.className = 'translated-message'; messageBubble.appendChild(translatedDiv); }
    translatedDiv.textContent = translatedText;
    DOM.chatWindow.scrollTop = DOM.chatWindow.scrollHeight;
}
}
}
    async function fetchUnreadCounts() {
    if (!currentUser) return;
    try {
    const response = await fetch(`/api/unread/${currentUser}`); const unreadCounts = await response.json();
    document.querySelectorAll('.unread-badge').forEach(b => { b.textContent = '0'; b.classList.add('hidden'); });
    unreadCounts.forEach(uc => {
    if (uc.count > 0) {
    const badge = document.querySelector(`.unread-badge[data-room-id="${uc.roomId}"]`);
    if (badge) { badge.textContent = uc.count; badge.classList.remove('hidden'); }
}
});
} catch (error) { console.error("Failed to fetch unread counts:", error); }
}
    async function resetUnreadCount(roomId) {
    if (!currentUser || !roomId) return;
    try {
    await fetch('/api/unread/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser, roomId: roomId }), });
    const badge = document.querySelector(`.unread-badge[data-room-id="${roomId}"]`);
    if (badge) { badge.textContent = '0'; badge.classList.add('hidden'); }
} catch (error) { console.error("Failed to reset unread count:", error); }
}

function displayMessage(msg, parentElement = DOM.chatWindow) {
    const { id, sender, senderNickname, content, createdAt, messageType, fileUrl, edited, deleted, readBy, repliedMessageInfo } = msg;
    const isMyMessage = sender === currentUser;

    const isContinuous = shouldGroupWithMessage(msg);
    const messageContainer = document.createElement('div');
    messageContainer.id = `message-${msg.id}`;

    messageContainer.className = `message-container ${isMyMessage ? 'my-message' : 'other-message'} ${isContinuous ? 'continuous' : 'initial'}`;
    messageContainer.id = `message-${id}`;
    messageContainer.dataset.sender = sender;
    messageContainer.dataset.messageId = id;

    if (!isMyMessage && !isContinuous) {
        const profilePic = document.createElement('img');
        profilePic.src = msg.senderProfileUrl || DEFAULT_PROFILE_PICTURE;
        profilePic.className = 'avatar';
        messageContainer.appendChild(profilePic);
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.className = 'bubble-wrapper';
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';

    if (deleted) {
        messageBubble.classList.add('deleted-message');
        messageBubble.textContent = "삭제된 메시지입니다.";
    } else {
        // 2. ✨ [추가] 답장 UI를 렌더링하는 코드 블록
        if (repliedMessageInfo) {
            const reply = repliedMessageInfo;
            const replyContainer = document.createElement('div');
            replyContainer.className = 'message-reply-container';

            let replyContent = reply.content;
            if (reply.messageType === 'IMAGE') replyContent = '사진';
            else if (reply.messageType === 'FILE') replyContent = '파일';

            replyContainer.innerHTML = `
                <strong>${reply.senderNickname}</strong>
                <p>${replyContent}</p>
            `;
            messageBubble.appendChild(replyContainer); // 메시지 버블의 자식으로 추가
        }

        // 기존 메시지 내용(이미지, 파일, 텍스트) 렌더링 로직은 그대로 유지
        if (messageType === 'IMAGE') { const img = document.createElement('img'); img.src = fileUrl; img.className = 'chat-image'; messageBubble.appendChild(img); }
        else if (messageType === 'FILE') { const link = document.createElement('a'); link.href = fileUrl; link.target = '_blank'; link.download = content; link.className = 'chat-file-link'; link.innerHTML = `📄 <span>${content}</span>`; messageBubble.appendChild(link); }
        else {
            // 텍스트 내용은 div에 담아서 추가 (답장 UI와 분리하기 위함)
            const textContent = document.createElement('div');
            textContent.className = 'message-text-content';
            textContent.textContent = content;
            messageBubble.appendChild(textContent);
        }
    }

    const metaContainer = document.createElement('div');
    metaContainer.className = 'message-meta';

    const unreadCountSpan = document.createElement('span');
    unreadCountSpan.className = 'unread-count';
    if (msg.unreadCount > 0) {
        unreadCountSpan.textContent = msg.unreadCount;
    } else {
        unreadCountSpan.classList.add('hidden');
    }
    metaContainer.appendChild(unreadCountSpan);

    if (edited && !deleted) {
        const editedIndicator = document.createElement('span');
        editedIndicator.className = 'edited-indicator';
        editedIndicator.textContent = '(수정됨)';
        metaContainer.appendChild(editedIndicator);
    }

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    metaContainer.appendChild(timeSpan);

    if (isMyMessage) {
        if (!deleted) {
            const menuContainer = document.createElement('div'); menuContainer.className = 'message-menu-container';
            const gearIcon = document.createElement('span'); gearIcon.className = 'menu-gear-icon'; gearIcon.innerHTML = '⚙️'; gearIcon.onclick = (event) => { event.stopPropagation(); toggleOptionsMenu(id); };
            const optionsPopup = document.createElement('div'); optionsPopup.className = 'menu-options-popup hidden'; optionsPopup.id = `options-${id}`;
            const editIcon = document.createElement('span'); editIcon.className = 'menu-option-icon'; editIcon.innerHTML = '✏️'; editIcon.onclick = () => showEditInput(id, messageBubble);
            const deleteIcon = document.createElement('span'); deleteIcon.className = 'menu-option-icon'; deleteIcon.innerHTML = '🗑️'; deleteIcon.onclick = () => sendDeleteMessage(id);
            optionsPopup.appendChild(editIcon); optionsPopup.appendChild(deleteIcon); menuContainer.appendChild(gearIcon); menuContainer.appendChild(optionsPopup);
            bubbleWrapper.appendChild(menuContainer);
        }
        bubbleWrapper.appendChild(metaContainer);
        bubbleWrapper.appendChild(messageBubble);
        messageContent.appendChild(bubbleWrapper);
    } else { // 상대방 메시지
        if (!isContinuous) {
            const senderSpan = document.createElement('div');
            senderSpan.className = 'message-sender';
            senderSpan.textContent = senderNickname || sender;
            messageContent.appendChild(senderSpan);
        }

        // [핵심] 답장/번역 버튼을 '메뉴' 형태로 변경합니다.
        if (!deleted) {
            const menuContainer = document.createElement('div');
            menuContainer.className = 'message-menu-container'; // 내 메시지와 동일한 클래스

            const gearIcon = document.createElement('span');
            gearIcon.className = 'menu-gear-icon';
            gearIcon.innerHTML = '⚙️';
            gearIcon.onclick = (event) => { event.stopPropagation(); toggleOptionsMenu(id); };

            const optionsPopup = document.createElement('div');
            optionsPopup.className = 'menu-options-popup hidden';
            optionsPopup.id = `options-${id}`;

            // 1. '답장' 아이콘
            const replyIcon = document.createElement('span');
            replyIcon.className = 'menu-option-icon';
            replyIcon.innerHTML = '↩️';
            replyIcon.title = '답장하기';
            replyIcon.onclick = () => startReply(id, senderNickname, content);

            // 2. '번역 불러오기' 아이콘
            const translateIcon = document.createElement('span');
            translateIcon.className = 'menu-option-icon';
            translateIcon.innerHTML = '🌐'; // 지구본 아이콘 또는 'T' 등
            translateIcon.title = '번역 불러오기';
            translateIcon.onclick = () => toggleSavedTranslation(id, msg);

            optionsPopup.appendChild(replyIcon);

            // 번역된 내용이 있을 경우에만 버튼을 추가
            if (msg.translations && Object.keys(msg.translations).length > 0) {
                optionsPopup.appendChild(translateIcon);
            }

            menuContainer.appendChild(gearIcon);
            menuContainer.appendChild(optionsPopup);
            bubbleWrapper.appendChild(menuContainer); // 메뉴를 버블 래퍼에 추가
        }

        bubbleWrapper.appendChild(messageBubble);
        bubbleWrapper.appendChild(metaContainer);
        messageContent.appendChild(bubbleWrapper);
    }

    messageContainer.appendChild(messageContent);
    //parentElement.appendChild(messageContainer);

    lastMessageInfo = {
        sender: sender,
        timestamp: new Date(createdAt)
    };
    observeMessage(messageContainer);
    return messageContainer;
}
    function markVisibleMessagesAsRead() {
    if (!websocket || websocket.readyState !== WebSocket.OPEN) return;
    const messageIdsToMark = [];
    const messages = DOM.chatWindow.querySelectorAll('.message-container');
    messages.forEach(msgElement => {
    if (!msgElement.classList.contains('my-message') && !msgElement.dataset.readSent) {
    const messageId = msgElement.id.replace('message-', '');
    messageIdsToMark.push(messageId);
    msgElement.dataset.readSent = 'true';
}
});
    if (messageIdsToMark.length > 0) { websocket.send(JSON.stringify({ type: 'MESSAGES_READ', messageIds: messageIdsToMark })); }
}
    function toggleOptionsMenu(messageId) {
    document.querySelectorAll('.menu-options-popup').forEach(popup => { if (popup.id !== `options-${messageId}`) { popup.classList.add('hidden'); } });
    const targetPopup = document.getElementById(`options-${messageId}`);
    if(targetPopup) targetPopup.classList.toggle('hidden');
}
    function showEditInput(messageId, messageBubbleElement) {
    toggleOptionsMenu(messageId);
    const currentText = messageBubbleElement.textContent;
    messageBubbleElement.style.display = 'none';
    const editContainer = document.createElement('div'); editContainer.className = 'edit-container';
    const editInput = document.createElement('input'); editInput.type = 'text'; editInput.value = currentText;
    const saveBtn = document.createElement('button'); saveBtn.textContent = '저장'; saveBtn.onclick = () => sendEditMessage(messageId, editInput.value);
    const cancelBtn = document.createElement('button'); cancelBtn.textContent = '취소';
    cancelBtn.onclick = () => { messageBubbleElement.parentElement.removeChild(editContainer); messageBubbleElement.style.display = 'block'; };
    editContainer.appendChild(editInput); editContainer.appendChild(saveBtn); editContainer.appendChild(cancelBtn);
    messageBubbleElement.parentElement.appendChild(editContainer);
    editInput.focus();
}
function sendEditMessage(messageId, newContent) {
    // 1. 웹소켓 연결이 열려있고, 내용이 비어있지 않은지 확인
    if (websocket?.readyState === WebSocket.OPEN && newContent.trim() !== '') {
        const targetLang = DOM.languageSelect.value;

        // 2. [핵심] 서버로 보낼 데이터에 'roomId'를 추가합니다.
        const messageData = {
            type: 'EDIT_MESSAGE',
            roomId: currentRoomId, // ⬅️ 바로 이 부분이 추가되었습니다!
            messageId: messageId,
            message: newContent,
            targetLang: targetLang
        };

        // --- 디버깅을 위해 콘솔에 로그를 출력합니다 ---
        console.log("서버로 EDIT_MESSAGE 신호를 보냅니다:", messageData);
        // ----------------------------------------

        websocket.send(JSON.stringify(messageData));

        // 3. [개선] 저장 후에는 수정 입력창을 숨기고 원래 메시지를 다시 보여줍니다.
        const messageBubbleElement = document.getElementById(`message-${messageId}`).querySelector('.message-bubble');
        const editContainer = messageBubbleElement.parentElement.querySelector('.edit-container');
        if (editContainer) {
            messageBubbleElement.parentElement.removeChild(editContainer);
        }
        messageBubbleElement.style.display = 'block';
    }
}
    function sendDeleteMessage(messageId) {
    if (confirm('메시지를 삭제하시겠습니까?')) {
    if (websocket?.readyState === WebSocket.OPEN) { websocket.send(JSON.stringify({ type: 'DELETE_MESSAGE', messageId: messageId })); }
}
}
    async function inviteUserToCurrentRoom() {
    const usernameToInvite = prompt("초대할 사용자의 아이디를 입력하세요:");
    if (!usernameToInvite || !currentRoomId) return;
    try {
    const response = await fetch(`/api/chatrooms/${currentRoomId}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameToInvite: usernameToInvite, invitedBy: currentUser })
});
    if (response.ok) { alert(`${usernameToInvite}님을 채팅방에 초대했습니다.`); }
    else { const error = await response.text(); alert(`초대 실패: ${error}`); }
} catch (error) { console.error("Invite failed:", error); alert("초대 중 오류가 발생했습니다."); }
}
    async function leaveCurrentRoom() {
    if (!currentRoomId) return;
    if (confirm('이 채팅방을 정말로 나가시겠습니까?')) {
    try {
    const response = await fetch(`/api/chatrooms/${currentRoomId}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser })
});
    if (response.ok) { showMainScreen(); }
    else { const errorText = await response.text(); alert(`나가기 실패: ${errorText}`); }
} catch (error) { console.error("Leave room failed:", error); alert("채팅방을 나가는 중 오류가 발생했습니다."); }
}
}
    window.addEventListener('click', (event) => { if (!event.target.matches('.menu-gear-icon')) { document.querySelectorAll('.menu-options-popup:not(.hidden)').forEach(popup => { popup.classList.add('hidden'); }); } });
    DOM.uploadButton.addEventListener('click', () => DOM.fileInput.click());
    DOM.fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0]; if (!file || !currentRoomId) return;
    const formData = new FormData(); formData.append('file', file);
    try {
    const response = await fetch(`/api/upload/${currentRoomId}`, { method: 'POST', headers: { 'sender': encodeURIComponent(currentUser) }, body: formData });
    if (!response.ok) showAlert('alertFileUploadFail');
} catch (error) { console.error('File upload error:', error); showAlert('alertFileUploadFail'); }
    finally { DOM.fileInput.value = ''; }
});
    DOM.userProfileClickable.addEventListener('click', () => { DOM.profileEditPreview.src = DOM.profilePicture.src; DOM.profileEditNickname.value = DOM.usernameDisplay.textContent; DOM.profileEditOverlay.classList.remove('hidden'); });
    DOM.profileEditCancel.addEventListener('click', () => DOM.profileEditOverlay.classList.add('hidden'));
    DOM.profileEditOverlay.addEventListener('click', (e) => { if (e.target === DOM.profileEditOverlay) DOM.profileEditOverlay.classList.add('hidden'); });
    DOM.profileEditPictureButton.addEventListener('click', () => DOM.profileEditFileInput.click());
    DOM.profileEditFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) { const reader = new FileReader(); reader.onload = (e) => { DOM.profileEditPreview.src = e.target.result; }; reader.readAsDataURL(file); }
});
    DOM.profileEditSave.addEventListener('click', async () => {
    const newNickname = DOM.profileEditNickname.value; const profileImageFile = DOM.profileEditFileInput.files[0];
    const formData = new FormData(); formData.append('newNickname', newNickname); if (profileImageFile) { formData.append('profileImage', profileImageFile); }
    try {
    const response = await fetch(`/api/users/${currentUser}/profile`, { method: 'POST', body: formData });
    if (response.ok) {
    const updatedUser = await response.json();
    currentUser = updatedUser.username; currentUserNickname = updatedUser.nickname;
    DOM.usernameDisplay.textContent = updatedUser.nickname; DOM.profilePicture.src = updatedUser.profilePictureUrl || DEFAULT_PROFILE_PICTURE;
    DOM.profileEditOverlay.classList.add('hidden');
    await loadFriends();
} else { alert('프로필 업데이트 실패: 오류가 발생했습니다.'); }
} catch (error) { console.error('Profile update error:', error); alert('프로필 업데이트 중 오류가 발생했습니다.'); }
});
async function openParticipantsModal() {
    if (!currentRoomId) return;

    DOM.participantsList.innerHTML = '불러오는 중...';
    DOM.participantsOverlay.classList.remove('hidden');

    // 1. 위에서 만든 fetchParticipants 함수를 호출하여 멤버 정보를 가져오고 전역 변수를 채웁니다.
    await fetchParticipants(currentRoomId);

    // 2. 전역 변수에 저장된 멤버 정보를 사용하여 화면에 목록을 그립니다.
    DOM.participantsList.innerHTML = ''; // 기존 목록 비우기
    if (currentRoomMembers.length > 0) {
        currentRoomMembers.forEach(member => {
            const item = document.createElement('div');
            item.className = 'participant-item';
            item.innerHTML = `
               <img src="${member.profilePictureUrl || DEFAULT_PROFILE_PICTURE}" alt="${member.nickname}">
               <span>${member.nickname}</span>
           `;
            DOM.participantsList.appendChild(item);
        });
    } else {
        DOM.participantsList.innerHTML = '참가자 정보를 불러오는 데 실패했습니다.';
    }
}

 // 참가자 목록 모달 닫기 이벤트 리스너
 DOM.closeParticipantsModal.addEventListener('click', () => {
     DOM.participantsOverlay.classList.add('hidden');
 });

 DOM.participantsOverlay.addEventListener('click', (event) => {
     if (event.target === DOM.participantsOverlay) {
         DOM.participantsOverlay.classList.add('hidden');
     }
 });

    changeLanguage(DOM.languageSelectorAuth.value);
    showAuthScreen();

function setupIntersectionObserver() {
    if (intersectionObserver) {
        intersectionObserver.disconnect();
    }
    const options = { root: DOM.chatWindow, rootMargin: '0px', threshold: 1.0 };
    intersectionObserver = new IntersectionObserver((entries, observer) => {
        const messagesToMarkAsRead = [];
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const messageEl = entry.target;
                const messageId = messageEl.dataset.messageId;
                const sender = messageEl.dataset.sender;
                const unreadSpan = messageEl.querySelector('.unread-count');
                if (sender !== currentUser && unreadSpan && !unreadSpan.classList.contains('hidden')) {
                    messagesToMarkAsRead.push(messageId);
                }
                observer.unobserve(messageEl);
            }
        });
        if (messagesToMarkAsRead.length > 0) {
            // sendMessage 함수 대신, websocket.send를 직접 사용합니다.
            if (websocket && websocket.readyState === WebSocket.OPEN) {
                websocket.send(JSON.stringify({ type: 'MESSAGES_READ', messageIds: messagesToMarkAsRead, nickname: currentUserNickname }));
            }
        }
    }, options);
}

function observeMessage(messageElement) {
    if (intersectionObserver) {
        intersectionObserver.observe(messageElement);
    }
}
async function fetchParticipants(roomId) {
    try {
        const response = await fetch(`/api/chatrooms/${roomId}/members`);
        if (response.ok) {
            const members = await response.json();
            currentRoomMembers = members; // 가져온 멤버 목록을 전역 변수에 저장
        } else {
            console.error('참가자 정보를 불러오는 데 실패했습니다.');
            currentRoomMembers = []; // 실패 시 빈 배열로 초기화
        }
    } catch (error) {
        console.error('Error fetching participants:', error);
        currentRoomMembers = []; // 오류 발생 시 빈 배열로 초기화
    }
}
// 연속 메시지인지 판단하는 함수
function shouldGroupWithMessage(newMessage) {
    if (!lastMessageInfo.sender || !lastMessageInfo.timestamp) {
        return false; // 첫 메시지
    }
    const timeDifference = (new Date(newMessage.createdAt) - lastMessageInfo.timestamp) / (1000 * 60); // 분 단위 시간 차이 계산
    return newMessage.sender === lastMessageInfo.sender && timeDifference < 2;
}

//채팅방 변경 시 메시지 그룹핑 정보를 초기화하는 함수
function resetMessageGrouping() {
    lastMessageInfo = {
        sender: null,
        timestamp: null
    };
}
function updateMessageInUI(updatedMsg) {
    const oldMessageElement = document.getElementById(`message-${updatedMsg.id}`);

    if (oldMessageElement) {
        // 기존 메시지가 있던 위치를 정확히 기억합니다.
        const parent = oldMessageElement.parentNode;
        const nextSibling = oldMessageElement.nextSibling;
        // 화면에서 기존 요소를 완전히 제거합니다.
        oldMessageElement.remove();
        // displayMessage를 호출해 최신 데이터로 완벽한 새 요소를 다시 만듭니다.
        const newMessageElement = displayMessage(updatedMsg);
        // 기억해둔 원래 위치에 새 요소를 정확히 다시 끼워넣습니다.
        if (nextSibling) {
            parent.insertBefore(newMessageElement, nextSibling);
        } else {
            parent.appendChild(newMessageElement);
        }
    }
}

const inviteFriendOverlay = document.getElementById('invite-friend-overlay');
const inviteFriendList = document.getElementById('invite-friend-list');
const closeInviteModalButton = document.getElementById('close-invite-modal-button');
const inviteFriendTitle = document.getElementById('invite-friend-title');

/**
 * 친구 초대 모달을 열고, API를 호출하여 내용을 채우는 메인 함수
 */
async function openInviteFriendModal(roomId) {
    // 1. 함수가 호출되는 시점과 필요한 값들을 로그로 확인합니다. (디버깅용)
    console.log(`🚀 친구 초대 모달 열기 시도. Room ID: ${roomId}, User: ${currentUser}`);

    if (!currentUser) {
        alert("로그인 정보가 유효하지 않습니다.");
        return;
    }

    inviteFriendOverlay.classList.remove('hidden');
    inviteFriendTitle.textContent = '친구 초대';
    inviteFriendList.innerHTML = `<li>친구 목록을 불러오는 중...</li>`;

    try {
        // 2. 친구 목록과 채팅방 멤버 목록 API를 동시에 호출합니다.
        const [friendsResponse, membersResponse] = await Promise.all([
            fetch(`/api/friends/${currentUser}`),
            fetch(`/api/chatrooms/${roomId}/members`)
        ]);

        // 3. [핵심] 각 API 응답이 '성공'했는지 명확하게 확인합니다.
        if (!friendsResponse.ok) {
            // 실패했다면, 서버가 보낸 에러 메시지를 포함하여 즉시 에러를 발생시킵니다.
            throw new Error(`친구 목록 로딩 실패: 서버가 ${friendsResponse.status} 코드로 응답했습니다.`);
        }
        if (!membersResponse.ok) {
            throw new Error(`채팅방 멤버 로딩 실패: 서버가 ${membersResponse.status} 코드로 응답했습니다.`);
        }

        // 4. 두 응답이 모두 성공했을 때만, 안전하게 JSON 데이터를 추출합니다.
        const myFriends = await friendsResponse.json();
        const roomMembers = await membersResponse.json();

        console.log("✅ API 호출 성공. 친구 목록:", myFriends, "채팅방 멤버:", roomMembers);

        // 5. 기존 로직을 수행하여 초대 가능한 친구 목록을 계산합니다.
        const memberUsernames = new Set(roomMembers.map(member => member.username));
        const availableFriends = myFriends.filter(friend => !memberUsernames.has(friend.username));

        // 6. 계산된 목록을 화면에 그려줍니다.
        renderInviteFriendList(availableFriends);

    } catch (error) {
        // 7. 위 try 블록 내에서 발생한 모든 에러(네트워크 실패 포함)는 여기서 잡힙니다.
        console.error("❌ 친구 초대 모달 처리 중 오류 발생:", error);
        inviteFriendList.innerHTML = `<li class="no-results">목록을 불러오는 데 실패했습니다.</li>`;
    }
}

/**
 * 초대 가능한 친구 목록을 받아와 모달의 UI를 생성하는 함수
 */
function renderInviteFriendList(friends) {
    inviteFriendList.innerHTML = ''; // 기존 목록을 깨끗이 비웁니다.

    if (friends.length === 0) {
        inviteFriendList.innerHTML = `<li class="no-results">초대할 친구가 없습니다.</li>`;
        return;
    }

    friends.forEach(friend => {
        const li = document.createElement('li');
        li.className = 'invite-friend-item';
        li.innerHTML = `
            <div class="invite-user-info">
                <img src="${friend.profilePictureUrl || DEFAULT_PROFILE_PICTURE}" class="avatar">
                <span class="nickname">${friend.nickname}</span>
            </div>
            <button class="invite-action-button" data-username="${friend.username}">초대</button>
        `;
        inviteFriendList.appendChild(li);
    });
}

/**
 * 모달 안에서 '초대' 버튼을 클릭했을 때의 동작을 처리
 */
inviteFriendList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('invite-action-button')) {
        const button = e.target;
        const usernameToInvite = button.dataset.username;

        button.disabled = true;
        button.textContent = '초대 중...';

        try {
            const response = await fetch(`/api/chatrooms/${currentRoomId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usernameToInvite: usernameToInvite,
                    invitedBy: currentUser
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            button.textContent = '초대됨';

        } catch (error) {
            console.error('친구 초대에 실패했습니다:', error);
            alert(`초대 중 오류가 발생했습니다: ${error.message}`);
            button.textContent = '초대';
            button.disabled = false;
        }
    }
});

/**
 * 모달의 닫기 버튼과 바깥 영역 클릭 이벤트를 처리
 */
closeInviteModalButton.addEventListener('click', () => inviteFriendOverlay.classList.add('hidden'));
inviteFriendOverlay.addEventListener('click', (e) => {
    if (e.target === inviteFriendOverlay) {
        inviteFriendOverlay.classList.add('hidden');
    }
});


function toggleSavedTranslation(messageId, msg) {
    const messageContainer = document.getElementById(`message-${messageId}`);
    // 1. 클래스 이름으로 텍스트가 있는 div를 정확히 찾아냅니다.
    const textElement = messageContainer.querySelector('.message-text-content');
    if (!textElement || !msg.translations) return;

    // 2. 사용자의 현재 언어 설정을 가져옵니다.
    const userLang = DOM.languageSelect.value;
    const savedTranslation = msg.translations[userLang];

    // 3. 현재 언어에 맞는 저장된 번역이 없으면 사용자에게 알립니다.
    if (!savedTranslation) {
        alert(`'${userLang.toUpperCase()}' 언어로 저장된 번역이 없습니다.`);
        toggleOptionsMenu(messageId); // 메뉴 닫기
        return;
    }

    // 4. [핵심] 원본 텍스트를 'data-' 속성에 저장해두어 잃어버리지 않게 합니다.
    if (!textElement.dataset.originalText) {
        textElement.dataset.originalText = msg.content;
    }

    // 5. [핵심] 현재 내용이 원문인지 번역문인지 확인하고 서로 교체합니다.
    if (textElement.textContent === textElement.dataset.originalText) {
        // 현재 원문 -> 번역문으로 변경
        textElement.textContent = savedTranslation;
    } else {
        // 현재 번역문 -> 원문으로 변경
        textElement.textContent = textElement.dataset.originalText;
    }

    // 6. 마지막으로 메뉴를 닫아줍니다.
    toggleOptionsMenu(messageId);
}
DOM.searchIcon.onclick = () => {

    DOM.searchBar.classList.toggle('hidden');

    if (!DOM.searchBar.classList.contains('hidden')) {
        DOM.searchInput.focus();
    } else {
        clearSearch();
    }
};

DOM.searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const keyword = DOM.searchInput.value.trim();
        if (keyword) {
            searchMessages(keyword);
        } else {
            clearSearch();
        }
    }
});

DOM.searchNextButton.onclick = () => navigateSearchResults(-1); // 아래로(이전 메시지)
DOM.searchPrevButton.onclick = () => navigateSearchResults(1);  // 위로(다음 메시지)


// 검색 기능을 처리하는 새로운 함수들

// 검색을 초기화하는 함수
function clearSearch() {
    searchResults = [];
    currentSearchIndex = -1;
    DOM.searchNav.classList.add('hidden');
    // 모든 하이라이트 제거
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
}

// 백엔드에 검색을 요청하고 결과를 저장하는 함수
async function searchMessages(keyword) {
    try {
        const response = await fetch(`/api/rooms/${currentRoomId}/messages/search?keyword=${keyword}`);
        if (!response.ok) throw new Error('검색 실패');

        searchResults = await response.json();

        if (searchResults.length > 0) {
            currentSearchIndex = 0; // 첫 번째 결과부터 시작
            DOM.searchNav.classList.remove('hidden');
            navigateSearchResults(0); // 첫 번째 결과로 이동
        } else {
            DOM.searchNav.classList.remove('hidden');
            DOM.searchCount.textContent = "0 / 0";
            alert('검색 결과가 없습니다.');
        }
    } catch (error) {
        console.error('검색 중 오류 발생:', error);
    }
}

// 검색 결과 사이를 이동하는 함수
function navigateSearchResults(direction) {
    if (searchResults.length === 0) return;

    // 현재 하이라이트 제거
    const currentMessageId = searchResults[currentSearchIndex]?.id;
    if (currentMessageId) {
        document.getElementById(`message-${currentMessageId}`)?.classList.remove('highlight');
    }

    currentSearchIndex += direction;

    // 인덱스 순환
    if (currentSearchIndex < 0) currentSearchIndex = searchResults.length - 1;
    if (currentSearchIndex >= searchResults.length) currentSearchIndex = 0;

    const messageId = searchResults[currentSearchIndex].id;
    scrollToMessage(messageId);

    // 카운트 업데이트
    DOM.searchCount.textContent = `${currentSearchIndex + 1} / ${searchResults.length}`;
}

// 특정 메시지로 스크롤하고 하이라이트하는 함수
function scrollToMessage(messageId) {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.classList.add('highlight');
    }
}