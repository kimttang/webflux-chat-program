import translations from './translations.js';

import {
    getCharTypePriority,
    sortFriends,
    formatMessageTime,
    getKSTDateString,
    createDateSeparatorElement
} from './utils.js';

// ===================================================================
// 1. 전역 변수, 상태, 설정값
// ===================================================================
let lastMessageInfo = {sender: null, timestamp: null};
let searchResults = [];
let currentSearchIndex = -1;
let currentLanguage = 'ko';
let currentUser = null;
let currentUserNickname = null;
let currentUserObject = null;
let currentRoomId = null;
let roomCalendarInstance = null;
let websocket = null;
let roomEventSource = null;
let presenceEventSource = null;
let typingTimeout = null;
let currentRoomMembers = [];
let intersectionObserver;
let currentReplyToId = null;
let currentRoomList = [];
let currentChatRoomFilter = 'all';
let allFriendsCache = [];
let onlineFriendsCache = new Set();
let currentRoomAnnouncement = null;
let messageToAnnounce = null;
let isAnnouncementManuallyHidden = false;
let currentLastDisplayedDate = null;


const DEFAULT_PROFILE_PICTURE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const userCache = new Map();

// ===================================================================
// 2. 메인 실행 코드 (DOMContentLoaded)
// ===================================================================
const DOM = {
    authScreen: document.getElementById('auth-screen'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    mainScreen: document.getElementById('main-screen'),
    chatScreen: document.getElementById('chat-screen'),
    languageSelectorAuth: document.getElementById('language-selector-auth'),
    loginUsernameInput: document.getElementById('login-username'),
    loginPasswordInput: document.getElementById('login-password'),
    loginButton: document.getElementById('login-button'),
    loginError: document.getElementById('login-error'),
    announcementBar: document.getElementById('announcement-bar'),
    announcementContent: document.getElementById('announcement-content'),
    removeAnnouncementBtn: document.getElementById('remove-announcement-btn'),
    announceConfirmOverlay: document.getElementById('announce-confirm-overlay'),
    announceConfirmModal: document.getElementById('announce-confirm-modal'),
    closeAnnounceConfirmModal: document.getElementById('close-announce-confirm-modal'),
    announceConfirmContent: document.getElementById('announce-confirm-content'),
    announceConfirmCancel: document.getElementById('announce-confirm-cancel'),
    announceConfirmPost: document.getElementById('announce-confirm-post'),
    signupPrompt: document.getElementById('signup-prompt'),
    showSignup: document.getElementById('show-signup'),
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
    chatFilterButtons: document.getElementById('chat-filter-buttons'),
    showAllChatsButton: document.getElementById('show-all-chats-button'),
    showUnreadChatsButton: document.getElementById('show-unread-chats-button'),
    friendsActionArea: document.getElementById('friends-action-area'),
    chatroomsActionArea: document.getElementById('chatrooms-action-area'),
    friendNameInput: document.getElementById('friend-name-input'),
    addFriendButton: document.getElementById('add-friend-button'),
    roomNameInput: document.getElementById('room-name-input'),
    createRoomButton: document.getElementById('create-room-button'),
    backToMain: document.getElementById('back-to-main'),
    chatWindow: document.getElementById('chat-window'),
    messageInput: document.getElementById('message-input'),
    sendButton: document.getElementById('send-button'),
    translateButton: document.getElementById('translate-button'),
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
    closeProfileEditModal: document.getElementById('close-profile-edit-modal'),
     participantsModal: document.getElementById('participants-modal'),
     closeParticipantsModal: document.getElementById('close-participants-modal'),

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
    chatHeaderInfo: document.getElementById('chat-header-info'),
    roomEditOverlay: document.getElementById('room-edit-overlay'),
    roomEditModal: document.getElementById('room-edit-modal'),
    closeRoomEditModal: document.getElementById('close-room-edit-modal'),
    roomEditPreview: document.getElementById('room-edit-preview'),
    roomEditFileInput: document.getElementById('room-edit-file-input'),
    roomEditPictureButton: document.getElementById('room-edit-picture-button'),
    roomEditName: document.getElementById('room-edit-name'),
    roomEditCancelButton: document.getElementById('room-edit-cancel-button'),
    roomEditSaveButton: document.getElementById('room-edit-save-button'),
    chatRoomProfileHeader: document.getElementById('chat-room-profile-header'),
    chatRoomNameHeader: document.getElementById('chat-room-name-header'),
    headerIconsRight: document.querySelector('.header-icons-right'),
    defaultHeaderIcons: document.getElementById('default-header-icons'),
    showFriendSearchButton: document.getElementById('show-friend-search-button'),
    friendSearchInput: document.getElementById('friend-search-input'),
    hideAnnouncementBtn: document.getElementById('hide-announcement-btn'),
    showAnnouncementBtn: document.getElementById('show-announcement-btn'),
    accountDeleteButton: document.getElementById('account-delete-button'),
    calendarPanel: document.getElementById('calendar-panel'),
    roomCalendarButton: document.getElementById('room-calendar-button'),
    roomCalendarOverlay: document.getElementById('room-calendar-overlay'),
    closeRoomCalendarModal: document.getElementById('close-room-calendar-modal'),
    roomCalendarView: document.getElementById('room-calendar-view'),
    personalEventOverlay: document.getElementById('personal-event-overlay'),
    closePersonalEventModal: document.getElementById('close-personal-event-modal'),
    personalEventTitle: document.getElementById('personal-event-title'),
    personalEventDate: document.getElementById('personal-event-date'),
    personalEventTime: document.getElementById('personal-event-time'),
    calendarActionArea: document.getElementById('calendar-action-area'),
    cancelPersonalEventButton: document.getElementById('cancel-personal-event-button'),
    savePersonalEventButton: document.getElementById('save-personal-event-button'),
    headerMenuButton: document.getElementById('header-menu-btn'),
    headerMenuPopup: document.getElementById('header-menu-popup'),
    openMembersBtn: document.getElementById('open-members-btn'),
    openInviteBtn: document.getElementById('open-invite-btn'),
    leaveRoomBtn: document.getElementById('leave-room-btn'),
    participantsOverlay: document.getElementById('participants-overlay'),
    inviteFriendOverlay: document.getElementById('invite-friend-overlay'),
    participantsList: document.getElementById('participants-list'),
    inviteFriendList: document.getElementById('invite-friend-list'),
    roomGalleryButton: document.getElementById('room-gallery-button'),
    roomGalleryOverlay: document.getElementById('room-gallery-overlay'),
    closeRoomGalleryModal: document.getElementById('close-room-gallery-modal'),
    galleryImagesContent: document.getElementById('gallery-images-content'),
    galleryFilesContent: document.getElementById('gallery-files-content'),
    galleryTabImages: document.querySelector('#room-gallery-modal .tab-link[data-tab="gallery-images"]'),
    galleryTabFiles: document.querySelector('#room-gallery-modal .tab-link[data-tab="gallery-files"]'),
};

DOM.chatHeaderInfo.addEventListener('click', openRoomEditModal);
DOM.closeRoomEditModal.addEventListener('click', closeRoomEditModal);
DOM.roomEditOverlay.addEventListener('click', (e) => { if(e.target === DOM.roomEditOverlay) closeRoomEditModal(); });
DOM.roomEditCancelButton.addEventListener('click', closeRoomEditModal);
DOM.roomEditPictureButton.addEventListener('click', () => DOM.roomEditFileInput.click());
DOM.roomEditFileInput.addEventListener('change', previewRoomImage);
DOM.roomEditSaveButton.addEventListener('click', saveRoomProfileChanges);
DOM.languageSelectorAuth.addEventListener('change', (e) => changeLanguage(e.target.value));
DOM.showSignup.addEventListener('click', (e) => { e.preventDefault(); DOM.loginForm.classList.add('hidden'); DOM.signupForm.classList.remove('hidden'); });
DOM.showLogin.addEventListener('click', (e) => { e.preventDefault(); DOM.signupForm.classList.add('hidden'); DOM.loginForm.classList.remove('hidden'); });
DOM.logoutButton.addEventListener('click', showAuthScreen);
DOM.hideAnnouncementBtn.addEventListener('click', hideAnnouncementBar);
DOM.showAnnouncementBtn.addEventListener('click', showAnnouncementBar);
const updateSendButtonVisibility = () => {
    if (DOM.messageInput.value.trim().length > 0) {
        DOM.sendButton.classList.add('visible'); // 내용이 있으면 .visible 추가
    } else {
        DOM.sendButton.classList.remove('visible'); // 내용이 없으면 .visible 제거
    }
};
if (DOM.messageInput) {
    DOM.messageInput.addEventListener('input', updateSendButtonVisibility);
    updateSendButtonVisibility();
}
if (DOM.headerMenuButton) {
    DOM.headerMenuButton.addEventListener('click', (event) => {
        event.stopPropagation();
        DOM.headerMenuPopup.classList.toggle('hidden');
    });
}
document.addEventListener('click', (event) => {
    if (DOM.headerMenuPopup && !DOM.headerMenuPopup.classList.contains('hidden')) {
        if (!DOM.headerMenuPopup.contains(event.target) && !DOM.headerMenuButton.contains(event.target)) {
            DOM.headerMenuPopup.classList.add('hidden');
        }
    }
});
if (DOM.openMembersBtn) {
    DOM.openMembersBtn.addEventListener('click', () => {
        DOM.participantsOverlay.classList.remove('hidden');
        DOM.headerMenuPopup.classList.add('hidden');
        openParticipantsModal();
    });
}
if (DOM.openInviteBtn) {
    DOM.openInviteBtn.addEventListener('click', () => {
        DOM.inviteFriendOverlay.classList.remove('hidden'); // 초대 모달 열기
        DOM.headerMenuPopup.classList.add('hidden'); // 팝업은 닫음
        openInviteFriendModal(currentRoomId);
    });
}
if (DOM.leaveRoomBtn) {
    DOM.leaveRoomBtn.addEventListener('click', async () => {
        const action = await showChoiceModal(
            translations['modalLeaveRoomTitle'][currentLanguage],
            translations['modalLeaveRoomDesc'][currentLanguage],
            translations['btnCancel'][currentLanguage],
            translations['leaveButton'][currentLanguage]
        );
        if (action === '2') {
            //  '나가기' API 호출
            leaveCurrentRoom();
        }
    });
}
DOM.loginButton.addEventListener('click', async () => {
    const username = DOM.loginUsernameInput.value; const password = DOM.loginPasswordInput.value;
    try {
        const response = await fetch('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }), });
        if (response.ok) { const user = await response.json(); currentUser = user.username; currentUserObject = user; showMainScreen();switchTab('friends'); }
        else {
            const errorKey = await response.text(); // (Java가 "LOGIN_INVALID_CREDENTIALS" 등을 보냄)

            if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                DOM.loginError.textContent = translations[errorKey][currentLanguage];
            } else {
                DOM.loginError.textContent = errorKey;
            }
            DOM.loginError.classList.remove('hidden');
        }
    } catch (error) { DOM.loginError.textContent = translations['errorLoginFallback'][currentLanguage]; DOM.loginError.classList.remove('hidden'); }
});

DOM.signupButton.addEventListener('click', async () => {
    const nickname = DOM.signupNicknameInput.value; const username = DOM.signupUsernameInput.value; const password = DOM.signupPasswordInput.value;
    try {
        const response = await fetch('/api/users/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, nickname }), });
        if (response.ok) { showAlert('alertSignupSuccess'); DOM.signupForm.classList.add('hidden'); DOM.loginForm.classList.remove('hidden'); DOM.loginUsernameInput.value = username; DOM.loginPasswordInput.value = ''; }
        else {
            const errorKey = await response.text(); // (Java가 "SIGNUP_USERNAME_EXISTS"를 보냄)

            // translations.js에 이 키가 있는지, 그리고 현재 언어 번역이 있는지 확인
            if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                // 번역된 메시지를 보여줌
                DOM.signupError.textContent = translations[errorKey][currentLanguage];
            } else {
                // (만약의 경우) 번역 키가 없으면 그냥 서버가 준 키(코드)를 보여줌
                DOM.signupError.textContent = errorKey;
            }
            DOM.signupError.classList.remove('hidden');
        }
    } catch (error) { DOM.signupError.textContent = translations['errorSignupFallback'][currentLanguage]; DOM.signupError.classList.remove('hidden'); }
});
if (DOM.translateButton) {
    DOM.translateButton.addEventListener('click', () => {
        DOM.languageSelect?.classList.toggle('visible');
        DOM.translateButton.classList.toggle('active');
    });
}
DOM.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // 1. 모든 탭에서 'active' 클래스 제거
        DOM.tabs.forEach(t => t.classList.remove('active'));
        // 2. 클릭된 탭에 'active' 클래스 추가
        tab.classList.add('active');
        // 3. 탭 이름 가져오기
        const tabName = tab.dataset.tab;
        // 4. [핵심] 위에서 만든 switchTab 함수 호출
        switchTab(tabName);
    });
});
DOM.closeAnnounceConfirmModal.addEventListener('click', closeAnnounceConfirmModal);
DOM.announceConfirmCancel.addEventListener('click', closeAnnounceConfirmModal);
DOM.announceConfirmPost.addEventListener('click', postAnnouncement);

DOM.announceConfirmOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'announce-confirm-overlay') {
        closeAnnounceConfirmModal();
    }
});

DOM.removeAnnouncementBtn.addEventListener('click', removeAnnouncement);
DOM.showAddFriendButton = document.getElementById('show-add-friend-button');
DOM.friendsActionArea = document.getElementById('friends-action-area');
DOM.showCreateRoomButton = document.getElementById('show-create-room-button');
DOM.chatroomsActionArea = document.getElementById('chatrooms-action-area');
if (DOM.showAddFriendButton) {
    DOM.showAddFriendButton.addEventListener('click', () => {
        if (DOM.friendsActionArea) {
            DOM.friendsActionArea.classList.toggle('hidden');
        }
    });
}
if (DOM.showCreateRoomButton) {
    DOM.showCreateRoomButton.addEventListener('click', () => {
        DOM.chatroomsActionArea.classList.toggle('hidden');
    });
}
DOM.showFriendSearchButton.addEventListener('click', () => {

    console.log("돋보기 아이콘 클릭됨! 검색창을 엽니다."); // (디버깅용)
    DOM.defaultHeaderIcons.classList.add('hidden');
    // 입력창을 보여줌
    DOM.friendSearchInput.classList.remove('hidden');
    DOM.friendSearchInput.focus(); // 입력창에 바로 포커스
});

// [추가] 친구 검색 입력창에서 포커스를 잃었을 때 (blur)
DOM.friendSearchInput.addEventListener('blur', () => {
    // 입력창에 값이 없으면 다시 원래대로 복구
    if (DOM.friendSearchInput.value === '') {
        resetFriendSearch();
    }
});

// [추가] 검색창에서 Enter 키를 누르면 포커스 잃기(blur)
DOM.friendSearchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        DOM.friendSearchInput.blur(); // 포커스를 잃게 하여 blur 이벤트 트리거
    }
});
DOM.friendSearchInput.addEventListener('input', () => {
    const searchText = DOM.friendSearchInput.value.toLowerCase(); // 입력값을 소문자로 변경

    // 1. 캐시된 전체 친구 목록(allFriendsCache)에서 닉네임 필터링
    const filteredFriends = allFriendsCache.filter(friend =>
        friend.nickname.toLowerCase().includes(searchText)
    );

    // 2. 필터링된 결과로 친구 목록 다시 그리기
    renderFriendList(filteredFriends);
});

DOM.addFriendButton.addEventListener('click', async () => {
    const friendUsername = DOM.friendNameInput.value; if (!friendUsername) return;
    try {
        const response = await fetch('/api/friends/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentUsername: currentUser, friendUsername }), });
        if (response.ok) { showAlert('alertAddFriendSuccess'); DOM.friendNameInput.value = ''; loadFriends(); } else {
            const errorKey = await response.text();
            showAlert(errorKey);
        }
    } catch (error) { showAlert('alertAddFriendFail', { error: 'Network error' }); }
});

DOM.createRoomButton.addEventListener('click', async () => {
    const name = DOM.roomNameInput.value; if (!name) return;
    await fetch('/api/chatrooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, username: currentUser }), });
    DOM.roomNameInput.value = '';
});

DOM.backToMain.addEventListener('click', () => { if (websocket) websocket.close(); showMainScreen(); });
if (DOM.sendButton) {
    DOM.sendButton.addEventListener('click', sendMessage);
}
DOM.cancelReplyButton.addEventListener('click', cancelReply);
DOM.messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } });
DOM.messageInput.addEventListener('input', () => { clearTimeout(typingTimeout); if (DOM.messageInput.value.trim() !== '') { sendTypingStart(); typingTimeout = setTimeout(sendTypingEnd, 3000); } else { sendTypingEnd(); } });
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

DOM.closeProfileEditModal.addEventListener('click', closeProfileEditModal);
DOM.userProfileClickable.addEventListener('click', () => { DOM.profileEditPreview.src = DOM.profilePicture.src; DOM.profileEditNickname.value = DOM.usernameDisplay.textContent; DOM.profileEditOverlay.classList.remove('hidden'); });
DOM.profileEditCancel.addEventListener('click', closeProfileEditModal);
DOM.profileEditOverlay.addEventListener('click', (e) => { if (e.target === DOM.profileEditOverlay) DOM.profileEditOverlay.classList.add('hidden'); });
DOM.profileEditPictureButton.addEventListener('click', () => DOM.profileEditFileInput.click());
DOM.accountDeleteButton.addEventListener('click', handleDeleteAccount);
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
            // [성공]
            const updatedUser = await response.json();
            currentUser = updatedUser.username; currentUserNickname = updatedUser.nickname;
            DOM.usernameDisplay.textContent = updatedUser.nickname; DOM.profilePicture.src = updatedUser.profilePictureUrl || DEFAULT_PROFILE_PICTURE;
            DOM.profileEditOverlay.classList.add('hidden');

            // (성공 알림 추가)
            showToast(translations['toastProfileUpdateSuccess'][currentLanguage], 'success');

            await loadFriends();
        } else {
            // [실패] (로그인/친구추가와 동일한 로직)
            const errorKey = await response.text(); // Java가 "LOGIN_USER_NOT_FOUND" 등을 보냄

            if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                // (Case 1) 번역 키가 있으면 (예: "프로필 업로드 폴더...")
                showToast(translations[errorKey][currentLanguage], 'error');
            } else {
                // (Case 2) 번역 키가 없으면
                const errorTemplate = translations['toastProfileUpdateFail'][currentLanguage]; // '프로필 업데이트 실패'
                showToast(`${errorTemplate}: ${errorKey}`, 'error');
            }
        }
    } catch (error) {
        // [네트워크 오류]
        console.error('Profile update error:', error);
        showToast(translations['toastProfileUpdateError'][currentLanguage], 'error');
    }
});

// 참가자 목록 모달 닫기 이벤트 리스너
DOM.closeParticipantsModal.addEventListener('click', () => {
    DOM.participantsOverlay.classList.add('hidden');
});

DOM.participantsOverlay.addEventListener('click', (event) => {
    if (event.target === DOM.participantsOverlay) {
        DOM.participantsOverlay.classList.add('hidden');
    }
});

const inviteFriendOverlay = document.getElementById('invite-friend-overlay');
const inviteFriendList = document.getElementById('invite-friend-list');
const closeInviteModalButton = document.getElementById('close-invite-modal-button');
const inviteFriendTitle = document.getElementById('invite-friend-title');

if (closeInviteModalButton && inviteFriendOverlay) {
    closeInviteModalButton.addEventListener('click', () => {
        inviteFriendOverlay.classList.add('hidden');
    });
}
//모달 안에서 '초대' 버튼을 클릭했을 때의 동작을 처리
inviteFriendList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('invite-action-button')) {
        const button = e.target;
        const usernameToInvite = button.dataset.username;

        button.disabled = true;
        button.textContent = translations['inviting'][currentLanguage];

        try {
            const response = await fetch(`/api/chatrooms/${currentRoomId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usernameToInvite: usernameToInvite,
                    invitedBy: currentUser
                })
            });

            // [변경] (로그인/프로필수정과 동일한 로직)
            if (response.ok) {
                // [성공]
                button.textContent = translations['invited'][currentLanguage];
            } else {
                // [실패]
                const errorKey = await response.text(); // Java가 "INVITE_PERMISSION_DENIED_ERROR" 등을 보냄

                if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                    // (Case 1) 번역 키가 있으면 (예: "초대 권한이 없습니다.")
                    showToast(translations[errorKey][currentLanguage], 'error');
                } else {
                    // (Case 2) 번역 키가 없으면
                    showToast(errorKey, 'error'); // 그냥 서버가 준 코드를 보여줌
                }

                // 실패 시 버튼 원상 복구
                button.textContent = translations['inviteButton'][currentLanguage];
                button.disabled = false;
            }

        } catch (error) {
            // [네트워크 오류]
            console.error('친구 초대에 실패했습니다:', error);
            // [변경] 번역 키 사용
            const errorTemplate = translations['toastInviteError'][currentLanguage];
            showToast(`${errorTemplate}: ${error.message}`, 'error');

            // 오류 시 버튼 원상 복구
            button.textContent = translations['inviteButton'][currentLanguage];
            button.disabled = false;
        }
    }
});

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

if (DOM.showAllChatsButton) {
    DOM.showAllChatsButton.addEventListener('click', () => {
        currentChatRoomFilter = 'all';
        DOM.showAllChatsButton.classList.add('active');
        DOM.showUnreadChatsButton.classList.remove('active');
        applyChatRoomFilter();
    });
}
if (DOM.showUnreadChatsButton) {
    DOM.showUnreadChatsButton.addEventListener('click', () => {
        currentChatRoomFilter = 'unread';
        DOM.showUnreadChatsButton.classList.add('active');
        DOM.showAllChatsButton.classList.remove('active');
        applyChatRoomFilter();
    });
}
//캘린더
DOM.roomCalendarButton.addEventListener('click', () => {
    // (모달을 열고)
    DOM.roomCalendarOverlay.classList.remove('hidden');

    // "현재 채팅방 ID"를 넘겨서 "두 번째" 캘린더를 그리는 새 함수 호출
    renderRoomCalendar(currentRoomId);
});

//  채팅방 캘린더 닫기 함수
function closeRoomCalendarModal() {
    DOM.roomCalendarOverlay.classList.add('hidden');

    // 모달을 닫을 때 캘린더 인스턴스를 파괴(destroy (이유: 다른 채팅방에 들어갔을 때 새 캘린더를 그려야 하므로)
    if (roomCalendarInstance) {
        roomCalendarInstance.destroy();
        roomCalendarInstance = null;
    }
}

// 닫기 버튼과 오버레이에 닫기 함수 연결
DOM.closeRoomCalendarModal.addEventListener('click', closeRoomCalendarModal);
DOM.roomCalendarOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.roomCalendarOverlay) {
        closeRoomCalendarModal();
    }
});
function openPersonalEventModal() {
    // 1. 폼 초기화
    DOM.personalEventTitle.value = '';

    // 2. 기본 날짜/시간을 '현재'로 설정 (공용 캘린더와 동일한 로직)
    const now = new Date();
    DOM.personalEventDate.value = now.toLocaleDateString('sv-SE'); // YYYY-MM-DD 형식
    DOM.personalEventTime.value = now.toTimeString().substring(0, 5); // HH:mm 형식

    // 3. 모달 열기
    DOM.personalEventOverlay.classList.remove('hidden');
}

// 모달 닫기 함수
function closePersonalEventModal() {
    DOM.personalEventOverlay.classList.add('hidden');
}

// 취소/닫기 버튼 클릭 시 모달 닫기
DOM.cancelPersonalEventButton.addEventListener('click', closePersonalEventModal);
DOM.closePersonalEventModal.addEventListener('click', closePersonalEventModal);
DOM.personalEventOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.personalEventOverlay) closePersonalEventModal();
});

// "저장하기" 버튼 클릭 시 API 호출
DOM.savePersonalEventButton.addEventListener('click', async () => {
    const title = DOM.personalEventTitle.value;
    const date = DOM.personalEventDate.value;
    const time = DOM.personalEventTime.value;

    // 1. (방어 코드)
    if (!title || !date || !time || !currentUser) {
        showToast(translations['toastNeedTitleDate'][currentLanguage], 'error');
        return;
    }

    // 2. [핵심] 날짜(date)와 시간(time)을 ISO 8601 문자열(UTC)로 변환
    // 예: "2025-10-30" + "14:00" -> "2025-10-30T14:00:00" -> UTC로 변환
    const localDateTime = new Date(`${date}T${time}`);
    const startISOString = localDateTime.toISOString();

    // 3. API로 보낼 데이터 DTO
    const eventData = {
        title: title,
        start: startISOString,
        userId: currentUser // 로그인한 유저 ID
    };

    // 4. 1단계에서 만든 "직접 생성" API 호출
    try {
        const response = await fetch('/api/calendar/personal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            // [변경] 번역 키 사용
            showToast(translations['toastPersonalCalendarSaveSuccess'][currentLanguage], 'success');
            closePersonalEventModal(); // 모달 닫기

            // [중요] 메인 캘린더(개인용)를 새로고침하여 방금 추가한 일정을 표시
            if (calendarInstance) {
                calendarInstance.refetchEvents();
            }
        } else {
            // [변경] 번역 키 사용
            showToast(translations['toastPersonalCalendarSaveFail'][currentLanguage], 'error');
        }
    } catch (error) {
        console.error('Error saving personal event:', error);
        // [변경] 번역 키 사용
        showToast(translations['toastPersonalCalendarSaveError'][currentLanguage], 'error');
    }
});

// ✨ [신규 4-2] 갤러리 모달 열기
DOM.roomGalleryButton.addEventListener('click', () => {
    // (모달을 열 때 "현재 채팅방 ID"로 2단계 API 호출)
    openGalleryModal(currentRoomId);
});

// ✨ [신규 4-2] 갤러리 모달 닫기 함수
function closeGalleryModal() {
    DOM.roomGalleryOverlay.classList.add('hidden');
    // (모달을 닫을 때 내용을 비움)
    DOM.galleryImagesContent.innerHTML = '';
    DOM.galleryFilesContent.innerHTML = '';
}

// (닫기 버튼/오버레이에 닫기 함수 연결)
DOM.closeRoomGalleryModal.addEventListener('click', closeGalleryModal);
DOM.roomGalleryOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.roomGalleryOverlay) closeGalleryModal();
});

// ✨ [신규 4-2] 갤러리 "탭" 전환 로직
DOM.galleryTabImages.addEventListener('click', () => {
    DOM.galleryTabImages.classList.add('active');
    DOM.galleryTabFiles.classList.remove('active');
    DOM.galleryImagesContent.classList.remove('hidden');
    DOM.galleryFilesContent.classList.add('hidden');
});
DOM.galleryTabFiles.addEventListener('click', () => {
    DOM.galleryTabImages.classList.remove('active');
    DOM.galleryTabFiles.classList.add('active');
    DOM.galleryImagesContent.classList.add('hidden');
    DOM.galleryFilesContent.classList.remove('hidden');
});


//갤러리 모달을 열고, 2단계 API를 호출하는 메인 함수
async function openGalleryModal(roomId) {
    if (!roomId) return;

    // (기존 내용 비우기 및 초기 탭 설정)
    DOM.galleryImagesContent.innerHTML = '';
    DOM.galleryFilesContent.innerHTML = '';
    DOM.galleryTabImages.click(); // (항상 이미지 탭을 기본으로)

    try {
        // 2단계 API 호출 (ChatMessageController에 추가한 것)
        const response = await fetch(`/api/rooms/${roomId}/gallery`);
        const messages = await response.json(); // (ChatMessageDto 목록)

        let imageCount = 0;
        let fileCount = 0;

        if (messages.length === 0) {
            DOM.galleryImagesContent.innerHTML = `<p>${translations['galleryNoFilesFound'][currentLanguage]}</p>`;
            DOM.roomGalleryOverlay.classList.remove('hidden');
            return;
        }

        // [핵심] 메시지를 "이미지"와 "파일"로 분류
        messages.forEach(msg => {

            // ChatMessage.java의 MessageType.IMAGE
            if (msg.messageType === 'IMAGE') {
                imageCount++;
                const imgLink = document.createElement('a');
                imgLink.href = msg.fileUrl;
                imgLink.target = '_blank';
                imgLink.title = msg.content || translations['galleryImageFallbackTitle'][currentLanguage];

                const img = document.createElement('img');
                img.src = msg.fileUrl; // (썸네일이 필요하면 썸네일 URL 사용)

                imgLink.appendChild(img);
                DOM.galleryImagesContent.appendChild(imgLink);

                // ChatMessage.java의 MessageType.FILE
            } else if (msg.messageType === 'FILE') {
                fileCount++;
                const fileDiv = document.createElement('div');
                fileDiv.className = 'file-list-item'; // (CSS로 꾸며야 함)

                const link = document.createElement('a');
                link.href = msg.fileUrl;
                // ChatMessage.java의 content (파일 업로드 시 원본 파일명 저장)
                link.textContent = msg.content || translations['galleryDownloadFallbackText'][currentLanguage];
                link.target = '_blank';
                link.download = msg.content || ''; // 원본 파일명으로 다운로드

                // (보낸 사람, 날짜 등 추가 정보)
                //    const senderSpan = document.createElement('span');
                //    senderSpan.className = 'file-sender';
                //   senderSpan.textContent = ` | by ${msg.sender.senderNickname}`;

                const dateSpan = document.createElement('span');
                dateSpan.className = 'file-date';
                dateSpan.textContent = ` | ${new Date(msg.createdAt).toLocaleDateString()}`;

                fileDiv.appendChild(link);
            //    fileDiv.appendChild(senderSpan);
                fileDiv.appendChild(dateSpan);
                DOM.galleryFilesContent.appendChild(fileDiv);
            }
        });

        // 탭에 카운트 표시 (선택 사항)
        DOM.galleryTabImages.textContent = `${translations['galleryTabImages'][currentLanguage]} (${imageCount})`;
        DOM.galleryTabFiles.textContent = `${translations['galleryTabFiles'][currentLanguage]} (${fileCount})`;

        // (방어 코드) 만약 이미지/파일이 하나도 없으면 메시지 표시
        if (imageCount === 0) DOM.galleryImagesContent.innerHTML = `<p>${translations['galleryNoImagesFound'][currentLanguage]}</p>`;
        if (fileCount === 0) DOM.galleryFilesContent.innerHTML = `<p>${translations['galleryNoFilesFound'][currentLanguage]}</p>`;

        // 분류가 끝나면 모달 표시
        DOM.roomGalleryOverlay.classList.remove('hidden');

    } catch (error) {
        console.error('갤러리 로딩 실패:', error);
        showToast(translations['toastGalleryLoadFailed'][currentLanguage], 'error');
    }
}

changeLanguage(DOM.languageSelectorAuth.value);
showAuthScreen();

// ===================================================================
// 3. 함수 선언 (Function Declarations)
// ===================================================================
function resetFriendSearch() {
    // 검색창이 열려있는지(.hidden이 없는지) 확인
    if (!DOM.friendSearchInput.classList.contains('hidden')) {
        DOM.defaultHeaderIcons.classList.remove('hidden');
        // 검색창을 숨김
        DOM.friendSearchInput.classList.add('hidden');
        DOM.friendSearchInput.value = ''; // 검색창 내용 비우기
    }
}
// [2. switchTab 함수 덮어쓰기]
function switchTab(tabName) {

    // 1. [핵심] 모든 패널과 액션 영역을 일단 다 숨깁니다.
    DOM.friendList.classList.add('hidden');
    DOM.friendsActionArea.classList.add('hidden');
    DOM.roomList.classList.add('hidden');
    DOM.chatroomsActionArea.classList.add('hidden');
    DOM.calendarPanel.classList.add('hidden');
    DOM.calendarActionArea.classList.add('hidden');

    // 2. [핵심] 모든 헤더 아이콘도 일단 다 숨깁니다.
    DOM.chatFilterButtons.classList.add('hidden');
    DOM.showFriendSearchButton.classList.add('hidden');
    DOM.showAddFriendButton.classList.add('hidden');
    DOM.showCreateRoomButton.classList.add('hidden');

    // resetFriendSearch() 함수가 있다면 호출
    if (typeof resetFriendSearch === 'function') {
        resetFriendSearch();
    }

    // 3. 탭 이름에 맞는 것만 골라서 "다시 켭니다".
    if (tabName === 'friends') {
        // 친구 탭 UI 보이기
        DOM.friendList.classList.remove('hidden');
        DOM.showFriendSearchButton.classList.remove('hidden');
        DOM.showAddFriendButton.classList.remove('hidden');

    } else if (tabName === 'chatrooms') {
        // 채팅 탭 UI 보이기
        DOM.roomList.classList.remove('hidden');
        DOM.chatFilterButtons.classList.remove('hidden');
        DOM.showCreateRoomButton.classList.remove('hidden');
    } else if (tabName === 'calendar') {
        DOM.calendarPanel.classList.remove('hidden');
        DOM.calendarActionArea.classList.remove('hidden');

        if (typeof renderCalendar === 'function') {
            renderCalendar();
        }
    }
}

function showChoiceModal(title, description, btn1Text, btn2Text) {
    // 1. DOM 요소 가져오기
    const overlay = document.getElementById('choice-overlay');
    const titleEl = document.getElementById('choice-title');
    const descEl = document.getElementById('choice-description');
    const btn1 = document.getElementById('choice-btn-1');
    const btn2 = document.getElementById('choice-btn-2');
    const cancelBtn = document.getElementById('choice-cancel-btn');

    // 2. Promise 생성
    return new Promise((resolve) => {
        // 3. 모달 내용 채우기
        titleEl.textContent = title;
        descEl.textContent = description;
        btn1.textContent = btn1Text;
        btn2.textContent = btn2Text;
        overlay.classList.remove('hidden');

        // 4. 리스너 함수 (한 번만 실행되도록)
        const handleBtn1 = () => { cleanup(); resolve('1'); };
        const handleBtn2 = () => { cleanup(); resolve('2'); };
        const handleCancel = () => { cleanup(); resolve(null); };

        // 5. 리스너 연결
        btn1.onclick = handleBtn1;
        btn2.onclick = handleBtn2;
        cancelBtn.onclick = handleCancel;

        // 6. 모달 닫고 리스너 제거하는 정리 함수
        const cleanup = () => {
            overlay.classList.add('hidden');
            btn1.onclick = null;
            btn2.onclick = null;
            cancelBtn.onclick = null;
        };
    });
}

async function getUserDetails(username) {
    if (userCache.has(username)) {
        return userCache.get(username);
    }
    try {
        const response = await fetch(`/api/users/${username}/details`);
        if (!response.ok) return null;
        const user = await response.json();
        userCache.set(username, user); // 조회한 정보를 캐시에 저장
        return user;
    } catch (error) {
        console.error(`Failed to fetch user details for ${username}`, error);
        return null;
    }
}
// 언어
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
    setPlaceholder(DOM.loginUsernameInput, 'usernamePlaceholder');
    setPlaceholder(DOM.loginPasswordInput, 'passwordPlaceholder');
    setText(DOM.loginButton, 'loginButton');
    setText(DOM.signupPrompt, 'signupPrompt');
    setText(DOM.showSignup, 'showSignup');
    setPlaceholder(DOM.signupNicknameInput, 'nicknamePlaceholder');
    setPlaceholder(DOM.signupUsernameInput, 'usernamePlaceholder');
    setPlaceholder(DOM.signupPasswordInput, 'passwordPlaceholder');
    setText(DOM.signupButton, 'signupButton');
    setText(DOM.loginPrompt, 'loginPrompt');
    setText(DOM.showLogin, 'showLogin');

    // --- 메인 화면 (사이드바) ---
    setText(DOM.logoutButton, 'logoutButton');
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

    function showAlert(key, replacements = {}) { let message = translations[key][currentLanguage]; for (const placeholder in replacements) { message = message.replace(`{${placeholder}}`, replacements[placeholder]); } showToast(message, 'success'); }
    function showAuthScreen() { DOM.authScreen.classList.remove('hidden'); DOM.mainScreen.classList.add('hidden'); DOM.chatScreen.classList.add('hidden'); currentUser = null; currentUserNickname = null; if (websocket) websocket.close(); if (roomEventSource) roomEventSource.close(); if (presenceEventSource) presenceEventSource.close(); }
    function showMainScreen() {
    DOM.authScreen.classList.add('hidden');
    DOM.mainScreen.classList.remove('hidden');
    DOM.chatScreen.classList.add('hidden');
    fetch(`/api/users/${currentUser}/details`)
        .then(response => response.ok ? response.json() : Promise.reject('User not found'))
        .then(user => {
            currentUser = user.username;
            currentUserNickname = user.nickname;
            DOM.usernameDisplay.textContent = user.nickname;
            DOM.profilePicture.src = user.profilePictureUrl || DEFAULT_PROFILE_PICTURE;
            loadFriends();
            listenToRoomUpdates();
            listenToPresenceUpdates();
            fetchUnreadCounts();
        })
        .catch(error => { console.error("Failed to fetch user details:", error);
            showAuthScreen();
        });
}
async function showChatScreen(roomId, roomName, announcement) {
    if (currentRoomId !== roomId) {
        isAnnouncementManuallyHidden = false;
    }
    currentRoomId = roomId;
    DOM.mainScreen.classList.add('hidden');
    DOM.chatScreen.classList.remove('hidden');

    const room = findRoomById(roomId);
    updateAnnouncementBar(announcement);
    let displayRoomName = roomName; // 기본값은 클릭한 목록의 이름

    if (currentUser && currentRoomId) {
        fetch('/api/unread/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser, // 현재 로그인한 사용자 ID
                roomId: currentRoomId  // 현재 입장한 채팅방 ID
            })
        }).catch(error => {
            console.error('읽음 처리 API 호출 중 오류 발생:', error);
        });
    }

    // ✅ 이름 표시 로직 수정
    if (room && room.name.includes('&')) {
        const allNicknames = room.name.split(' & ');
        const otherNicknames = allNicknames.filter(nickname => nickname !== currentUserNickname);
        if (otherNicknames.length > 0) {
            displayRoomName = otherNicknames.join(', ');
        }
    }

    DOM.chatRoomNameHeader.textContent = displayRoomName;

    // DM 방일 경우 상대방 프로필 사진으로 설정
    if (room && room.members.length === 2 && room.id.includes('-')) {
        const otherUsername = room.members.find(member => member !== currentUser);
        const otherUser = await getUserDetails(otherUsername);
        if (otherUser) {
            DOM.chatRoomProfileHeader.src = otherUser.profilePictureUrl || DEFAULT_PROFILE_PICTURE;
        }
    } else if (room) { // 그룹 채팅방 프로필 사진
        DOM.chatRoomProfileHeader.src = room.profilePictureUrl || DEFAULT_PROFILE_PICTURE;
    } else { // 예외 처리
        DOM.chatRoomProfileHeader.src = DEFAULT_PROFILE_PICTURE;
    }

    const header = DOM.chatHeaderInfo.parentElement;
    const existingButtons = header.querySelector('.chat-header-buttons');
    if (existingButtons) { header.removeChild(existingButtons); }


    DOM.chatWindow.innerHTML = '';
    resetMessageGrouping(); //  (메시지 연속성 초기화)
    currentLastDisplayedDate = null; // (날짜 구분선 초기화)
    await fetchParticipants(roomId);
    setupIntersectionObserver();
    connectWebSocket(roomId);
    loadPreviousMessages();
    resetUnreadCount(currentRoomId);
}
function findRoomById(roomId) {
    return currentRoomList.find(r => r.id === roomId);
}

async function loadFriends() {
    try {
        const response = await fetch(`/api/friends/${currentUser}`);
        const friends = await response.json();
        const onlineFriendsResponse = await fetch(`/api/presence/${currentUser}/friends/online`);
        const onlineFriendUsernames = await onlineFriendsResponse.json();
        // [핵심] API 응답을 전역 캐시에 저장
        allFriendsCache = friends;
        onlineFriendsCache = new Set(onlineFriendUsernames);
        // [핵심] 렌더링 함수를 호출하여 전체 목록을 그림
        renderFriendList(allFriendsCache);
    } catch (error) {console.error('친구 목록 로딩 실패:', error);
    }
}
function renderFriendList(friendsToRender) {
    DOM.friendList.innerHTML = ''; // 목록 비우기
    // [수정] 'ko' 대신, 넘겨받은 lang을 사용
    friendsToRender.sort((a, b) => sortFriends(a, b, currentLanguage)); // <--- (1) 이렇게 수정
    // 목록 생성
    friendsToRender.forEach(friend => {
        const isOnline = onlineFriendsCache.has(friend.username);
        const li = document.createElement('li');

        //  li에 data-friend와 class 추가
        li.setAttribute('data-friend', JSON.stringify(friend));
        li.classList.add('friend-list-item'); // 👈 모달 열기용 식별자
        li.innerHTML = `
            <div class="friend-info">
                <div class="friend-avatar-container">
                    <img src="${friend.profilePictureUrl || DEFAULT_PROFILE_PICTURE}" class="friend-avatar" alt="Friend Avatar">
                    <span class="status-circle ${isOnline ? 'online' : ''}" data-username="${friend.username}"></span>
                </div>
                <span>${friend.nickname}</span>
            </div>
            
            <button class="button friend-list-dm-btn" data-username="${friend.username}">
                ${translations.dmButton[currentLanguage]}
            </button>
        `;
        DOM.friendList.appendChild(li);
    });
}

DOM.friendList.addEventListener('click', (e) => {

    // [1] 'DM 버튼'을 눌렀는지 먼저 확인
    const dmButton = e.target.closest('.friend-list-dm-btn');
    if (dmButton) {
        // DM 버튼 클릭 -> DM 시작
        const username = dmButton.dataset.username;
        startDM(username);
        return; // 👈 모달이 열리지 않도록 여기서 종료
    }

    // [2] '친구 항목(li)'의 나머지 부분을 눌렀는지 확인
    const friendItem = e.target.closest('.friend-list-item');
    if (friendItem) {
        // 친구 항목 클릭 -> 프로필 모달 열기
        const friend = JSON.parse(friendItem.dataset.friend);
        openFriendProfileModal(friend);
    }
});
function openFriendProfileModal(friend) {
    // 1. DOM 요소 가져오기
    const overlay = document.getElementById('friend-profile-overlay');
    const nameEl = document.getElementById('friend-profile-name');
    const picEl = document.getElementById('friend-profile-pic');
    const dmBtn = document.getElementById('friend-profile-dm-btn');
    const deleteBtn = document.getElementById('friend-profile-delete-btn');
    const closeBtn = document.getElementById('friend-profile-close-btn');

    // 2. 모달에 친구 정보 채우기
    nameEl.textContent = friend.nickname;
    picEl.src = friend.profilePictureUrl || DEFAULT_PROFILE_PICTURE;

    // 3. (중요) 리스너 중복 방지를 위해 버튼을 복제해서 교체
    const newDmBtn = dmBtn.cloneNode(true);
    dmBtn.parentNode.replaceChild(newDmBtn, dmBtn);
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);

    // 4. [DM 버튼] 클릭 리스너 설정 (모달 안의 버튼)
    newDmBtn.addEventListener('click', () => {
        startDM(friend.username);
        overlay.classList.add('hidden'); // 모달 닫기
    });

    // 5. [친구 삭제 버튼] 클릭 리스너 설정
    newDeleteBtn.addEventListener('click', async () => {
        // (1) 재확인 (번역 키 적용)
        const desc = translations['modalDeleteFriendDesc'][currentLanguage].replace('{nickname}', friend.nickname);
        const action = await showChoiceModal(
            translations['modalDeleteFriendTitle'][currentLanguage], // '친구 삭제'
            desc,                                                   // '정말로... 삭제하시겠습니까?'
            translations['btnCancel'][currentLanguage],             // '취소' (재사용)
            translations['btnDelete'][currentLanguage]              // '삭제'
        );

        // (2) '삭제'를 선택(action === '2')했을 때만 API 호출
        if (action === '2') {
            try {
                // (3) 백엔드 API 호출
                const response = await fetch(`/api/users/${currentUser}/friends/${friend.username}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // [성공] 번역 키 사용
                    showToast(translations['toastDeleteFriendSuccess'][currentLanguage], 'success');
                    overlay.classList.add('hidden'); // 모달 닫기
                    loadFriends(); // [중요] 친구 목록 새로고침
                } else {
                    // [실패] (로그인/친구추가와 동일한 로직)
                    const errorKey = await response.text(); // Java가 "LOGIN_USER_NOT_FOUND" 등을 보냄

                    if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                        // (Case 1) 번역 키가 있으면 (예: "삭제할 친구를 찾을 수 없습니다.")
                        showToast(translations[errorKey][currentLanguage], 'error');
                    } else {
                        // (Case 2) 번역 키가 없으면 (예: "UNKNOWN_ERROR")
                        const errorTemplate = translations['toastDeleteFriendFail'][currentLanguage]; // '삭제 실패'
                        showToast(`${errorTemplate}: ${errorKey}`, 'error'); // "삭제 실패: UNKNOWN_ERROR"
                    }
                }
            } catch (error) {
                console.error('친구 삭제 중 오류:', error);
                // [네트워크 오류] 번역 키 사용
                showToast(translations['toastDeleteFriendError'][currentLanguage], 'error');
            }
        }
    });

    // 6. [닫기 버튼]
    closeBtn.onclick = () => {
        overlay.classList.add('hidden');
    };

    // 7. 모달 열기
    overlay.classList.remove('hidden');
}

async function startDM(friendUsername) {
    try {
        const response = await fetch('/api/dm/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromUser: currentUser, toUser: friendUsername }),
        });

        // [추가] response.ok 체크
        if (response.ok) {
            // [성공]
            const room = await response.json();
            const friendResponse = await fetch(`/api/users/${friendUsername}/details`);
            const friend = await friendResponse.json();

            // (친구 프로필 모달 닫기 - 만약 열려있다면)
            closeModal(DOM.friendProfileOverlay);

            showChatScreen(room.id, friend.nickname);
        } else {
            // [실패] (로그인/프로필수정과 동일한 로직)
            const errorKey = await response.text(); // Java가 "DM_CREATE_USER_NOT_FOUND_ERROR" 등을 보냄

            if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                // (Case 1) 번역 키가 있으면 (예: "1:1 채팅 생성 실패...")
                showToast(translations[errorKey][currentLanguage], 'error');
            } else {
                // (Case 2) 번역 키가 없으면
                const errorTemplate = translations['toastDMStartFail'][currentLanguage]; // 'DM 생성 실패'
                showToast(`${errorTemplate}: ${errorKey}`, 'error');
            }
        }
    } catch (error) {
        // [네트워크 오류]
        console.error('DM 시작 실패:', error);
        showToast(translations['toastDMStartError'][currentLanguage], 'error');
    }
}


function listenToRoomUpdates() {
    if (roomEventSource) roomEventSource.close();
    roomEventSource = new EventSource(`/api/chatrooms/${currentUser}`);
    roomEventSource.onmessage = (event) => {
        try {
            if (event.data.startsWith('{') || event.data.startsWith('[')) {
                const rooms = JSON.parse(event.data);
                currentRoomList = rooms;
                DOM.roomList.innerHTML = '';

                rooms.forEach(room => {
                    const li = document.createElement('li');
                    // CSS 스타일 적용을 위해 클래스 이름 추가/수정
                    li.className = 'chat-room-item';
                    li.dataset.roomId = room.id;

                    // 안 읽은 메시지 수를 data 속성과 뱃지 변수로 저장
                    li.dataset.unreadCount = room.unreadCount;
                    const unreadBadge = room.unreadCount > 0 ? `<span class="unread-badge">${room.unreadCount}</span>` : '';

                    let roomDisplayName = room.name;
                    // [변경] 번역 키 사용
                    let lastMessageHtml = `<p class="last-message">${translations['roomListNoMessage'][currentLanguage]}</p>`;
                    let formattedTime = '';
                    let profilePicSrc = room.profilePictureUrl || DEFAULT_PROFILE_PICTURE;

                    if (room.name.includes(' & ')) {
                        const allNicknames = room.name.split(' & ');
                        const otherNicknames = allNicknames.filter(nickname => nickname !== currentUserNickname);
                        if (otherNicknames.length > 0) {
                            roomDisplayName = otherNicknames.join(', ');
                        }
                    }

                    const isTrueDM = room.members.length === 2 && room.id.includes('-');
                    if (isTrueDM) {
                        const otherUsername = room.members.find(member => member !== currentUser);
                        (async () => {
                            const otherUser = await getUserDetails(otherUsername);
                            if (otherUser) {
                                const imgTag = li.querySelector('.list-profile-pic');
                                if (imgTag) imgTag.src = otherUser.profilePictureUrl || DEFAULT_PROFILE_PICTURE;
                            }
                        })();
                    }

                    if (room.lastMessage) {
                        let content = '';

                        // [수정] 1. [먼저] 삭제된 메시지인지 확인
                        if (room.lastMessage.deleted) {
                            content = translations['deletedMessage'][currentLanguage];
                        } else {
                            // 2. [그 다음] 메시지 타입(사진/파일) 확인
                            switch (room.lastMessage.messageType) {
                                case 'IMAGE':
                                    content = translations['roomListImageSent'][currentLanguage];
                                    break;
                                case 'FILE':
                                    content = translations['roomListFileSent'][currentLanguage];
                                    break;
                                default:
                                    // 3. [마지막] 일반 텍스트 (또는 서버가 보낸 '삭제된 메시지입니다')

                                    // [핵심 수정] 서버가 보낸 content가 '삭제된 메시지입니다'인지 확인
                                    if (room.lastMessage.content === "삭제된 메시지입니다.") {
                                        content = translations['deletedMessage'][currentLanguage];
                                    } else {
                                        // 그게 아니라면, 일반 텍스트 메시지
                                        const tempDiv = document.createElement('div');
                                        tempDiv.textContent = room.lastMessage.content;
                                        content = tempDiv.innerHTML;
                                    }
                                    break;
                            }
                        }

                        lastMessageHtml = `<p class="last-message">${content}</p>`;

                        // [버그 수정] formatMessageTime에 currentLanguage 인수 전달
                        formattedTime = formatMessageTime(room.lastMessage.createdAt, currentLanguage);
                    }

                    li.innerHTML = `
                        <img src="${profilePicSrc}" alt="Profile" class="list-profile-pic">
                        <div class="chat-room-details">
                            <div class="chat-room-name">${roomDisplayName}</div>
                            ${lastMessageHtml}
                        </div>
                        <div class="chat-room-meta">
                            <div class="last-message-time">${formattedTime}</div>
                            ${unreadBadge}
                        </div>
                    `;

                    li.addEventListener('click', () => showChatScreen(room.id, roomDisplayName, room.announcement));
                    DOM.roomList.appendChild(li);
                });
                if (currentRoomId) {
                    const activeRoom = rooms.find(r => r.id === currentRoomId);
                    if (activeRoom) {
                        // updateAnnouncementBar 함수를 호출해
                        // 현재 채팅방의 공지 바를 즉시 갱신합니다.
                        updateAnnouncementBar(activeRoom.announcement);
                    }
                }
                applyChatRoomFilter();

            }
        } catch (e) {
            console.warn("Received non-JSON message from room stream, ignoring.", e);
        }
    };
    roomEventSource.onerror = () => {
        console.error('Room SSE error. Reconnecting...');
    };
}

function listenToPresenceUpdates() {
    if (presenceEventSource) presenceEventSource.close();
    presenceEventSource = new EventSource(`/api/presence/${currentUser}/subscribe`);
    presenceEventSource.onmessage = (event) => {
        console.log("[Presence SSE] Raw data:", event.data);
        try {
            if (event.data.startsWith('{')) {
                const { username, status } = JSON.parse(event.data);
                console.log(`[Presence SSE] Parsed: User=${username}, Status=${status}`);
                if (status === 'DELETED') {
                    console.log(`[Presence SSE] 'DELETED' 감지. ${username}를 목록에서 제거 시도.`);
                    // 1. 상태 아이콘(동그라미)을 먼저 찾습니다.
                    const statusCircle = document.querySelector(`.status-circle[data-username="${username}"]`);
                    console.log("[Presence SSE] statusCircle 쿼리 결과:", statusCircle);
                    if (statusCircle) {
                        // 2. 그 아이콘을 감싸고 있는 부모 <li> (친구 항목)를 찾습니다.
                        const friendListItem = statusCircle.closest('li');
                        console.log("[Presence SSE] friendListItem 쿼리 결과:", friendListItem);
                        if (friendListItem) {
                            // 3. <li> 항목을 DOM에서 제거합니다.
                            friendListItem.remove();
                        }
                    }
                    // 4. (방어적 코드) 만약 캐시가 존재한다면 캐시에서도 제거합니다.
                    if (typeof allFriendsCache !== 'undefined') {
                        allFriendsCache = allFriendsCache.filter(friend => friend.username !== username);
                    }
                    if (typeof onlineFriendsCache !== 'undefined') {
                        onlineFriendsCache.delete(username);
                    }
                } else {
                    // [기존 로직] 'ONLINE' 또는 'OFFLINE' 상태는 동그라미 색만 변경합니다.
                    const statusCircle = document.querySelector(`.status-circle[data-username="${username}"]`);
                    if (statusCircle) {
                        statusCircle.classList.toggle('online', status === 'ONLINE');
                    }
                }
            }
        } catch (e) { console.warn("Received non-JSON message from presence stream, ignoring.", event.data); }
    };
    presenceEventSource.onerror = (e) => { console.error('Presence SSE error:', e); };
}

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
                    const currentMessageKSTDate = getKSTDateString(msg.createdAt);
                    // 2. 마지막으로 표시된 KST 날짜와 비교합니다.
                    if (currentMessageKSTDate !== currentLastDisplayedDate) {
                        // 3. 날짜가 다르면, 날짜 구분선을 먼저 추가합니다.
                        DOM.chatWindow.appendChild(createDateSeparatorElement(msgDto.createdAt, currentLanguage)); // <--- (2) 이렇게 수정
                        // 4. 마지막 표시 날짜를 지금 날짜로 업데이트합니다.
                        currentLastDisplayedDate = currentMessageKSTDate;
                    }
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

    // 4. 입력창을 비우고, 답장 상태를 초기화합니다.
    DOM.messageInput.value = '';
    messageInput.style.height = 'auto';``
    DOM.sendButton.classList.remove('visible');
    cancelReply(); // 답장 바를 숨기고 ID를 초기화하는 함수 호출

    // 5. 기존과 동일하게 타이핑 종료 이벤트를 처리합니다.
    clearTimeout(typingTimeout);
    sendTypingEnd();
}
    function sendTypingStart() { if (websocket?.readyState === WebSocket.OPEN) websocket.send(JSON.stringify({ type: 'TYPING_START', nickname: currentUserNickname })); }
    function sendTypingEnd() { if (websocket?.readyState === WebSocket.OPEN) websocket.send(JSON.stringify({ type: 'TYPING_STOP', nickname: currentUserNickname })); }
async function loadPreviousMessages() {
    try {
        const response = await fetch(`/api/rooms/${currentRoomId}/messages`, {
            headers: { 'X-Username': encodeURIComponent(currentUser) }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to load messages:', errorText);
            const errorTemplate = translations['toastLoadMessagesFail'][currentLanguage];
            showToast(`${errorTemplate}: ${errorText}`, 'error');
            showMainScreen();
            return;
        }
        const messages = await response.json();

        messages.forEach(msgDto => {
            // 1. 현재 메시지의 KST 날짜를 가져옵니다.
            const currentMessageKSTDate = getKSTDateString(msgDto.createdAt);

            // 2. 마지막으로 표시된 KST 날짜와 비교합니다.
            if (currentMessageKSTDate !== currentLastDisplayedDate) {
                // 3. 날짜가 다르면, 날짜 구분선을 먼저 추가합니다.
                DOM.chatWindow.appendChild(createDateSeparatorElement(msgDto.createdAt, currentLanguage));
                // 4. 마지막 표시 날짜를 지금 날짜로 업데이트합니다.
                currentLastDisplayedDate = currentMessageKSTDate;
            }
            const messageElement = displayMessage(msgDto);
            DOM.chatWindow.appendChild(messageElement);
        });

        setTimeout(() => {
            DOM.chatWindow.scrollTop = DOM.chatWindow.scrollHeight;
            markVisibleMessagesAsRead();
        }, 0);
    } catch (error) {
        console.error('Error in loadPreviousMessages:', error);
        showToast(translations['toastLoadMessagesFail'][currentLanguage], 'error');
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
    if (!currentUser || !roomId) {
        console.error("resetUnreadCount: currentUser 또는 roomId가 null입니다.");
        return;
    }
    try {
        const response = await fetch('/api/unread/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser, roomId: roomId }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("안 읽음 처리 API 실패:", response.status, errorText);
        }
    } catch (error) {
        console.error("Failed to reset unread count:", error);
    }
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
        profilePic.className = 'message-avatar';
        messageContainer.appendChild(profilePic);
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.className = 'bubble-wrapper';
    if (msg.messageType === 'IMAGE' || msg.messageType === 'FILE') {
        bubbleWrapper.classList.add('no-bubble');
    }
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';

    if (deleted) {
        messageBubble.classList.add('deleted-message');
        // [번역됨]
        messageBubble.textContent = translations['deletedMessage'][currentLanguage];
    } else {
        // 2. ✨ 답장 UI
        if (repliedMessageInfo) {
            const reply = repliedMessageInfo;
            const replyContainer = document.createElement('div');
            replyContainer.className = 'message-reply-container';

            let replyContent = reply.content;
            // [번역됨]
            if (reply.messageType === 'IMAGE') replyContent = translations['replyTypePhoto'][currentLanguage];
            else if (reply.messageType === 'FILE') replyContent = translations['replyTypeFile'][currentLanguage];

            replyContainer.innerHTML = `
                <strong>${reply.senderNickname}</strong>
                <p>${replyContent}</p>
            `;
            messageBubble.appendChild(replyContainer);
        }

        // 3. ✨ 기존 메시지 내용
        if (messageType === 'IMAGE') { const img = document.createElement('img'); img.src = fileUrl; img.className = 'chat-image'; messageBubble.appendChild(img); }
        else if (messageType === 'FILE') { const link = document.createElement('a'); link.href = fileUrl; link.target = '_blank'; link.download = content; link.className = 'chat-file-link'; link.innerHTML = `📄 <span>${content}</span>`; messageBubble.appendChild(link); }
        else {
            const textContent = document.createElement('div');
            textContent.className = 'message-text-content';

            // 1. 기본은 원본 메시지
            let finalContent = content;

            // 2. ★핵심★ 내 언어 설정(currentLanguage)에 맞는 번역본이 있으면 그걸로 교체!
            if (msg.translations && msg.translations[currentLanguage]) {
                finalContent = msg.translations[currentLanguage];

                // (선택사항) 원본이 궁금하면 마우스 올렸을 때 보이게 툴팁 추가
                textContent.title = `Original: ${content}`;
            }

            // 3. 화면에 표시
            textContent.innerHTML = finalContent;
            messageBubble.appendChild(textContent);
        }
    }

    // 4. ✨ 메타 컨테이너 (안읽음, 수정됨, 시간)
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
        // [번역됨]
        editedIndicator.textContent = translations['editedIndicator'][currentLanguage];
        metaContainer.appendChild(editedIndicator);
    }

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    // [번역됨] 'ko-KR', 'en-US' 등을 동적으로 설정
    let locale;
    switch (currentLanguage) {
        case 'en': locale = 'en-US'; break;
        case 'ja': locale = 'ja-JP'; break;
        case 'zh': locale = 'zh-CN'; break;
        case 'ar': locale = 'ar-EG'; break;
        case 'ko':
        default:   locale = 'ko-KR';
    }
    timeSpan.textContent = new Date(createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true });
    metaContainer.appendChild(timeSpan);

    // 5. ✨ 메뉴 컨테이너 (내 메시지)
    if (isMyMessage) {
        if (!deleted) {
            const menuContainer = document.createElement('div'); menuContainer.className = 'message-menu-container';
            const gearIcon = document.createElement('span'); gearIcon.className = 'menu-gear-icon'; gearIcon.innerHTML = '⚙️'; gearIcon.onclick = (event) => { event.stopPropagation(); toggleOptionsMenu(id); };
            const optionsPopup = document.createElement('div'); optionsPopup.className = 'menu-options-popup hidden'; optionsPopup.id = `options-${id}`;
            const editIcon = document.createElement('span'); editIcon.className = 'menu-option-icon'; editIcon.innerHTML = '✏️'; editIcon.onclick = () => showEditInput(id, messageBubble);
            const deleteIcon = document.createElement('span'); deleteIcon.className = 'menu-option-icon'; deleteIcon.innerHTML = '🗑️'; deleteIcon.onclick = () => sendDeleteMessage(id);
            optionsPopup.appendChild(editIcon); optionsPopup.appendChild(deleteIcon);
            if (msg.messageType === 'TEXT' || msg.messageType === 'FILE' || msg.messageType === 'IMAGE') {
                const announceIcon = document.createElement('span');
                announceIcon.className = 'menu-option-icon';
                announceIcon.innerHTML = '📢';
                // [변경] 번역 키 사용 (툴팁)
                announceIcon.title = translations['titleAnnounce'][currentLanguage];
                announceIcon.onclick = () => openAnnounceConfirmModal(msg);
                optionsPopup.appendChild(announceIcon);
            }
            menuContainer.appendChild(gearIcon); menuContainer.appendChild(optionsPopup);
            bubbleWrapper.appendChild(menuContainer);
        }
        bubbleWrapper.appendChild(metaContainer);
        bubbleWrapper.appendChild(messageBubble);
        messageContent.appendChild(bubbleWrapper);
    } else { // 6. ✨ 메뉴 컨테이너 (상대방 메시지)
        if (!isContinuous) {
            const senderSpan = document.createElement('div');
            senderSpan.className = 'message-sender';
            senderSpan.textContent = senderNickname || sender;
            messageContent.appendChild(senderSpan);
        }

        if (!deleted) {
            const menuContainer = document.createElement('div');
            menuContainer.className = 'message-menu-container';

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
            // [변경] 번역 키 사용 (툴팁)
            replyIcon.title = translations['titleReply'][currentLanguage];
            replyIcon.onclick = () => startReply(id, senderNickname, content);

            // 2. '번역 불러오기' 아이콘
            const translateIcon = document.createElement('span');
            translateIcon.className = 'menu-option-icon';
            translateIcon.innerHTML = '🌐';
            // [변경] 번역 키 사용 (툴팁)
            translateIcon.title = translations['titleLoadTranslation'][currentLanguage];
            translateIcon.onclick = () => toggleSavedTranslation(id, msg);

            optionsPopup.appendChild(replyIcon);

            if (msg.translations && Object.keys(msg.translations).length > 0) {
                optionsPopup.appendChild(translateIcon);
            }
            if (msg.messageType === 'TEXT' || msg.messageType === 'FILE' || msg.messageType === 'IMAGE') {
                const announceIcon = document.createElement('span');
                announceIcon.className = 'menu-option-icon';
                announceIcon.innerHTML = '📢';
                // [변경] 번역 키 사용 (툴팁)
                announceIcon.title = translations['titleAnnounce'][currentLanguage];
                announceIcon.onclick = () => openAnnounceConfirmModal(msg);
                optionsPopup.appendChild(announceIcon);
            }

            menuContainer.appendChild(gearIcon);
            menuContainer.appendChild(optionsPopup);
            bubbleWrapper.appendChild(menuContainer);
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

    // [수정] .textContent 대신 .message-text-content 내부의 텍스트를 가져옵니다.
    // (답장/번역 토글 시에도 원본 텍스트를 수정할 수 있도록)
    const textElement = messageBubbleElement.querySelector('.message-text-content');
    const currentText = (textElement) ? textElement.textContent : messageBubbleElement.textContent; // (이미지/파일이 아닐 경우 textElement가 있음)

    messageBubbleElement.style.display = 'none';
    const editContainer = document.createElement('div'); editContainer.className = 'edit-container';
    const editInput = document.createElement('input'); editInput.type = 'text'; editInput.value = currentText;

    const saveBtn = document.createElement('button');
    // [변경] 번역 키 사용
    saveBtn.textContent = translations['btnSave'][currentLanguage]; // '저장'
    saveBtn.onclick = () => sendEditMessage(messageId, editInput.value, messageBubbleElement);

    const cancelBtn = document.createElement('button');
    // [변경] 번역 키 사용 (재사용)
    cancelBtn.textContent = translations['btnCancel'][currentLanguage]; // '취소'
    cancelBtn.onclick = () => {
        // '수정' UI를 제거
        if (editContainer.parentElement) {
            editContainer.parentElement.removeChild(editContainer);
        }
        // 원래 메시지 버블을 다시 보여줌
        messageBubbleElement.style.display = 'block';
    };

    editContainer.appendChild(editInput); editContainer.appendChild(saveBtn); editContainer.appendChild(cancelBtn);
    // 메시지 버블의 *부모* (bubble-wrapper)에 editContainer를 추가
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
async function sendDeleteMessage(messageId) {
    const action = await showChoiceModal(
        translations['modalDeleteMessageTitle'][currentLanguage], // "메시지 삭제"
        translations['modalDeleteMessageDesc'][currentLanguage],  // "메시지를 삭제하시겠습니까?"
        translations['btnCancel'][currentLanguage],               // "취소" (재사용)
        translations['btnDelete'][currentLanguage]                // "삭제" (재사용)
    );
    if (action === '2') {
        if (websocket?.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: 'DELETE_MESSAGE', messageId: messageId }));
        }
    }
}

async function leaveCurrentRoom() {
    if (!currentRoomId || !currentUser) return;

    try {
        const response = await fetch(`/api/chatrooms/${currentRoomId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser })
        });

        // [변경] (로그인/프로필수정과 동일한 로직)
        if (response.ok) {
            // [성공] (성공 토스트 추가)
            showToast(translations['toastLeaveRoomSuccess'][currentLanguage], 'success');
            showMainScreen(); // 메인 화면으로 돌아가기
            currentRoomId = null;
        } else {
            // [실패]
            const errorKey = await response.text(); // Java가 "CHATROOM_NOT_FOUND_ERROR" 등을 보냄

            if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                // (Case 1) 번역 키가 있으면 (예: "당신은 이 채팅방의 멤버가 아닙니다.")
                showToast(translations[errorKey][currentLanguage], 'error');
            } else {
                // (Case 2) 번역 키가 없으면
                const errorTemplate = translations['toastLeaveRoomFail'][currentLanguage]; // '방 나가기 실패'
                showToast(`${errorTemplate}: ${errorKey}`, 'error');
            }
        }
    } catch (error) {
        // [네트워크 오류]
        console.error('채팅방 나가기 오류:', error);
        // [변경] 번역 키 사용
        const errorTemplate = translations['toastLeaveRoomFail'][currentLanguage]; // '방 나가기 실패'
        showToast(`${errorTemplate}: ${error.message}`, 'error');
    }
}

function closeProfileEditModal() {
    DOM.profileEditFileInput.value = ''; // 파일 선택 초기화
    DOM.profileEditOverlay.classList.add('hidden');
}

async function openParticipantsModal() {
    if (!currentRoomId) return;

    DOM.participantsList.innerHTML = `<span class="loading-text">${translations['loadingParticipants'][currentLanguage]}</span>`;
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
        DOM.participantsList.innerHTML = `<span class="error-text">${translations['errorLoadParticipants'][currentLanguage]}</span>`;
    }
}

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
async function handleDeleteAccount() {
    const action = await showChoiceModal(
        translations['modalDeleteAccountTitle'][currentLanguage], // "계정 탈퇴"
        translations['modalDeleteAccountDesc'][currentLanguage],  // "정말로 계정을..."
        translations['btnCancel'][currentLanguage],               // "취소" (재사용)
        translations['btnConfirmDelete'][currentLanguage]         // "탈퇴" (새 키)
    );

    if (action === '2' && currentUser) {
        try {
            const response = await fetch(`/api/users/${currentUser}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // [성공] 번역 키 사용
                showToast(translations['toastDeleteAccountSuccess'][currentLanguage], 'success');
                closeModal(DOM.profileEditModal);
                location.reload();
            } else {
                // [실패] (로그인/프로필수정과 동일한 로직)
                closeModal(DOM.profileEditModal);
                const errorKey = await response.text(); // Java가 "LOGIN_USER_NOT_FOUND" 등을 보냄

                if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                    // (Case 1) 번역 키가 있으면 (예: "사용자를 찾을 수 없습니다.")
                    showToast(translations[errorKey][currentLanguage], 'error');
                } else {
                    // (Case 2) 번역 키가 없으면
                    const errorTemplate = translations['toastDeleteAccountFail'][currentLanguage]; // '계정 탈퇴에 실패했습니다.'
                    showToast(`${errorTemplate}: ${errorKey}`, 'error');
                }
            }
        } catch (error) {
            // [네트워크 오류] 번역 키 사용
            closeModal(DOM.profileEditModal);
            console.error('Error deleting account:', error);
            showToast(translations['toastDeleteAccountError'][currentLanguage], 'error');
        }
    }
}
function closeModal(modalElement) {
    if (modalElement) {
        modalElement.classList.add('hidden');
        const overlay = modalElement.closest('.modal-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        } else {
            const overlayId = modalElement.id.replace('-modal', '-overlay');
            const siblingOverlay = document.getElementById(overlayId);
            if (siblingOverlay) {
                siblingOverlay.classList.add('hidden');
            }
        }
    }
}
//친구 초대 모달을 열고, API를 호출하여 내용을 채우는 메인 함수
async function openInviteFriendModal(roomId) {
    // 1. 함수가 호출되는 시점과 필요한 값들을 로그로 확인합니다. (디버깅용)
    console.log(`🚀 친구 초대 모달 열기 시도. Room ID: ${roomId}, User: ${currentUser}`);

    if (!currentUser) {
        // [변경] 번역 키 사용
        showToast(translations['toastInvalidLogin'][currentLanguage], 'error');
        return;
    }

    inviteFriendOverlay.classList.remove('hidden');
    // [변경] 번역 키 사용 (재사용)
    inviteFriendTitle.textContent = translations['modalInviteTitle'][currentLanguage];
    // [변경] 번역 키 사용
    inviteFriendList.innerHTML = `<li>${translations['loadingList'][currentLanguage]}</li>`;

    try {
        // 2. 친구 목록과 채팅방 멤버 목록 API를 동시에 호출합니다.
        const [friendsResponse, membersResponse] = await Promise.all([
            fetch(`/api/friends/${currentUser}`),
            fetch(`/api/chatrooms/${roomId}/members`)
        ]);

        // 3. [핵심] 친구 목록 API 응답 확인 (로그인/프로필수정과 동일한 로직)
        if (!friendsResponse.ok) {
            const errorKey = await friendsResponse.text(); // Java가 "LOGIN_USER_NOT_FOUND" 등을 보냄

            if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                // (Case 1) 번역 키가 있으면 (예: "사용자를 찾을 수 없습니다.")
                inviteFriendList.innerHTML = `<li class="no-results">${translations[errorKey][currentLanguage]}</li>`;
            } else {
                // (Case 2) 번역 키가 없으면
                const errorTemplate = translations['errorLoadFriendsFail'][currentLanguage]; // '친구 목록 로딩 실패'
                inviteFriendList.innerHTML = `<li class="no-results">${errorTemplate}: ${errorKey}</li>`;
            }
            return; // 함수 종료
        }

        // 4. [핵심] 채팅방 멤버 API 응답 확인 (이것이 우리가 찾던 'CHATROOM_NOT_FOUND_ERROR' 처리)
        if (!membersResponse.ok) {
            const errorKey = await membersResponse.text(); // Java가 "CHATROOM_NOT_FOUND_ERROR" 등을 보냄

            if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                // (Case 1) 번역 키가 있으면 (예: "존재하지 않는 채팅방입니다.")
                inviteFriendList.innerHTML = `<li class="no-results">${translations[errorKey][currentLanguage]}</li>`;
            } else {
                // (Case 2) 번역 키가 없으면
                const errorTemplate = translations['errorLoadMembersFail'][currentLanguage]; // '채팅방 멤버 로딩 실패'
                inviteFriendList.innerHTML = `<li class="no-results">${errorTemplate}: ${errorKey}</li>`;
            }
            return; // 함수 종료
        }

        // 5. 두 응답이 모두 성공했을 때만, 안전하게 JSON 데이터를 추출합니다.
        const myFriends = await friendsResponse.json();
        const roomMembers = await membersResponse.json();

        console.log("✅ API 호출 성공. 친구 목록:", myFriends, "채팅방 멤버:", roomMembers);

        // 6. 기존 로직을 수행하여 초대 가능한 친구 목록을 계산합니다.
        const memberUsernames = new Set(roomMembers.map(member => member.username));
        const availableFriends = myFriends.filter(friend => !memberUsernames.has(friend.username));

        // 7. 계산된 목록을 화면에 그려줍니다.
        renderInviteFriendList(availableFriends);

    } catch (error) {
        // 8. 위 try 블록 내에서 발생한 모든 네트워크 실패 에러는 여기서 잡힙니다.
        console.error("❌ 친구 초대 모달 처리 중 오류 발생:", error);
        // [변경] 번역 키 사용
        inviteFriendList.innerHTML = `<li class="no-results">${translations['errorLoadListFailed'][currentLanguage]}</li>`;
    }
}

//초대 가능한 친구 목록을 받아와 모달의 UI를 생성하는 함수
function renderInviteFriendList(friends) {
    inviteFriendList.innerHTML = ''; // 기존 목록을 깨끗이 비웁니다.

    if (friends.length === 0) {
        inviteFriendList.innerHTML = `<li class="no-results">${translations['noFriendsToInvite'][currentLanguage]}</li>`;
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
            <button class="invite-action-button" data-username="${friend.username}">${translations['inviteButton'][currentLanguage]}</button>
        `;
        inviteFriendList.appendChild(li);
    });
}

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
        const toastMessage = translations['toastNoSavedTranslation'][currentLanguage]
            .replace('{lang}', userLang.toUpperCase());
        showToast(toastMessage, 'error');
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
            showToast('검색 결과가 없습니다.', 'error');
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
// ✅ 채팅방 수정 모달을 여는 함수
function openRoomEditModal() {
    const currentRoom = findRoomById(currentRoomId);
    if (!currentRoom) return;

    DOM.roomEditName.value = currentRoom.name.includes(' & ') ? '' : currentRoom.name;
    DOM.roomEditPreview.src = currentRoom.profilePictureUrl || DEFAULT_PROFILE_PICTURE;
    DOM.roomEditOverlay.classList.remove('hidden');
}

// ✅ 채팅방 수정 모달을 닫는 함수
function closeRoomEditModal() {
    DOM.roomEditFileInput.value = ''; // 파일 선택 초기화
    DOM.roomEditOverlay.classList.add('hidden');
}

// ✅ 채팅방 프로필 사진 변경 시 미리보기
function previewRoomImage() {
    const file = DOM.roomEditFileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            DOM.roomEditPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// ✅ 변경된 채팅방 프로필을 서버에 저장하는 함수
async function saveRoomProfileChanges() {
    const newName = DOM.roomEditName.value.trim();
    const imageFile = DOM.roomEditFileInput.files[0];

    if (!newName) {
        // [변경] 번역 키 사용
        showToast(translations['toastRoomNameRequired'][currentLanguage], 'error');
        return;
    }

    const formData = new FormData();
    formData.append('newName', newName);
    if (imageFile) {
        formData.append('profileImage', imageFile);
    }

    try {
        formData.append('username', currentUser);
        const response = await fetch(`/api/chatrooms/${currentRoomId}/profile`, {
            method: 'POST',
            body: formData
        });

        // [변경] (로그인/프로필수정과 동일한 로직)
        if (response.ok) {
            // [성공]
            const updatedRoom = await response.json();

            // UI 즉시 업데이트 (SSE 업데이트를 기다리지 않아도 됨)
            DOM.chatRoomNameHeader.textContent = updatedRoom.name;
            DOM.chatRoomProfileHeader.src = updatedRoom.profilePictureUrl || 'default-profile.png';

            closeRoomEditModal();
            // [변경] 번역 키 사용
            showToast(translations['toastRoomUpdateSuccess'][currentLanguage], 'success');
        } else {
            // [실패]
            const errorKey = await response.text(); // Java가 "PROFILE_UPLOAD_DIR_ERROR" 등을 보냄

            if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                // (Case 1) 번역 키가 있으면 (예: "프로필 업로드 폴더...")
                showToast(translations[errorKey][currentLanguage], 'error');
            } else {
                // (Case 2) 번역 키가 없으면
                const errorTemplate = translations['toastRoomUpdateFail'][currentLanguage]; // '프로필 업데이트에 실패했습니다.'
                showToast(`${errorTemplate}: ${errorKey}`, 'error');
            }
        }
    } catch (error) {
        // [네트워크 오류]
        console.error('Error updating room profile:', error);
        // [변경] 번역 키 사용
        const errorTemplate = translations['toastRoomUpdateFail'][currentLanguage]; // '프로필 업데이트에 실패했습니다.'
        showToast(`${errorTemplate}: ${error.message}`, 'error');
    }
}
function applyChatRoomFilter() {
    const roomListElement = document.getElementById('room-list');
    if (!roomListElement) return;

    const rooms = roomListElement.querySelectorAll('.chat-room-item');
    rooms.forEach(room => {
        const unreadCount = parseInt(room.dataset.unreadCount, 10);
        if (currentChatRoomFilter === 'unread') {
            room.style.display = (unreadCount > 0) ? '' : 'none';
        } else {
            room.style.display = '';
        }
    });
}

//공지
function openAnnounceConfirmModal(message) {
    if (currentRoomAnnouncement) {
        showToast(translations['toastMaxOneAnnouncement'][currentLanguage], 'error');
        return;
    }

    // 공지할 내용을 전역 변수에 임시 저장
    let content = message.content;
    if (message.messageType === 'IMAGE') {
        // [변경] 번역 키 사용 (prefixImage)
        const prefix = translations['prefixImage'][currentLanguage];
        // [변경] 번역 키 사용 (galleryImageFallbackTitle 재사용)
        const fallbackName = translations['galleryImageFallbackTitle'][currentLanguage];
        content = `${prefix} ${message.fileUrl ? message.fileUrl.split('/').pop() : fallbackName}`;
    } else if (message.messageType === 'FILE') {
        // [변경] 번역 키 사용 (prefixFile)
        const prefix = translations['prefixFile'][currentLanguage];
        content = `${prefix} ${content}`; // 파일은 content에 파일명이 있음
    }
    messageToAnnounce = content; // '게시하기' 버튼이 누를 수 있도록 저장

    // 모달의 인용구(blockquote)에 내용 채우기
    DOM.announceConfirmContent.textContent = content;
    // 모달 보여주기
    DOM.announceConfirmOverlay.classList.remove('hidden');
}

//공지 확인 모달 닫기
function closeAnnounceConfirmModal() {
    DOM.announceConfirmOverlay.classList.add('hidden');
    messageToAnnounce = null; // 임시 변수 비우기
}

//'게시하기' 버튼 클릭 시 (WebSocket으로 전송)
function postAnnouncement() {
    if (websocket && websocket.readyState === WebSocket.OPEN && messageToAnnounce) {
        // 2단계(백엔드)에서 정의한 "UPDATE_ANNOUNCEMENT" 타입으로 메시지 전송
        websocket.send(JSON.stringify({
            type: "UPDATE_ANNOUNCEMENT",
            message: messageToAnnounce // 임시 저장했던 메시지 내용을 전송
        }));
    }
    // 전송 후 모달 닫기
    closeAnnounceConfirmModal();
}

//'공지 내리기 (x)' 버튼 클릭 시
async function removeAnnouncement() {
    const action = await showChoiceModal(
        translations['modalRemoveAnnounceTitle'][currentLanguage], // "공지 내리기"
        translations['modalRemoveAnnounceDesc'][currentLanguage],  // "공지를 내리시겠습니까?"
        translations['btnCancel'][currentLanguage],                // "취소" (재사용)
        translations['btnRemove'][currentLanguage]                 // "내리기"
    );
    if (action !== '2') {
        return;
    }
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        // 백엔드로 message: null 을 보내 공지 삭제를 요청
        websocket.send(JSON.stringify({
            type: "UPDATE_ANNOUNCEMENT",
            message: null
        }));
    }
}

//공지 바 UI
function updateAnnouncementBar(content) {
    // 1. 공지 내용이 이전에 기억한 내용과 다르면 (예: 새 공지 등록/삭제)
    //    '수동 숨김' 상태를 강제로 해제합니다.
    if (currentRoomAnnouncement !== content) {
        isAnnouncementManuallyHidden = false;
    }

    currentRoomAnnouncement = content; // 새 공지 내용 기억

    if (content) {
        // 2. 공지가 있는 경우
        DOM.announcementContent.textContent = content;

        if (isAnnouncementManuallyHidden) {
            // 2-1. (공지가 있지만) 수동으로 숨긴 상태: 바(Bar) 숨김, 이모지(📢) 표시
            DOM.announcementBar.classList.add('hidden');
            DOM.showAnnouncementBtn.classList.remove('hidden');
        } else {
            // 2-2. (공지가 있고) 일반 상태: 바(Bar) 표시, 이모지(📢) 숨김
            DOM.announcementBar.classList.remove('hidden');
            DOM.showAnnouncementBtn.classList.add('hidden');
        }

    } else {
        // 3. 공지가 없는 경우 (null)
        //    둘 다 숨기고, 상태도 초기화합니다.
        DOM.announcementBar.classList.add('hidden');
        DOM.showAnnouncementBtn.classList.add('hidden');
        isAnnouncementManuallyHidden = false;
    }
}

function hideAnnouncementBar() {
    DOM.announcementBar.classList.add('hidden');
    DOM.showAnnouncementBtn.classList.remove('hidden');
    isAnnouncementManuallyHidden = true; // '수동 숨김' 상태로 기억
}

function showAnnouncementBar() {
    DOM.announcementBar.classList.remove('hidden');
    DOM.showAnnouncementBtn.classList.add('hidden');
    isAnnouncementManuallyHidden = false; // '수동 숨김' 상태 해제
}


function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');

    //  새 토스트 div 생성
    const toast = document.createElement('div');
    toast.className = `toast ${type}`; // 예: 'toast success'
    toast.textContent = message;

    //  컨테이너에 추가
    container.appendChild(toast);

    //  'show' 클래스를 추가하여 나타나는 애니메이션 실행
    // (setTimeout을 10ms라도 줘야 CSS transition이 작동합니다)
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 3초 뒤에 사라지는 애니메이션 실행
    setTimeout(() => {
        toast.classList.remove('show'); // 'show'를 제거하면 사라지는 애니메이션 실행

        //  애니메이션이 끝난 후(0.4초) DOM에서 완전히 제거
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) { // (중복 제거 방지)
                toast.parentNode.removeChild(toast);
            }
        });

    }, 3000); // 3초 (3000ms)
}

//캘린더 패널에 FullCalendar를 그리는 함수
let calendarInstance = null; // 중복 렌더링 방지용

function renderCalendar() {

    // (기존 방어 코드)
    if (!currentUser) {
        console.warn("renderCalendar: currentUser가 null입니다.");
        return;
    }
    if (calendarInstance) {
        calendarInstance.destroy();
        calendarInstance = null;
    }

    const calendarEl = document.getElementById('calendar-view');

    calendarInstance = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        customButtons: {
            addEventButton: { // (버튼 이름)
                click: function() {
                    openPersonalEventModal();
                }
            }
        },
        headerToolbar: {
            left: 'title',
            center: '',
            right: 'addEventButton,prev,next'
        },
        height: '100%',
        locale: currentLanguage,
        eventDisplay: 'block',
        events: '/api/calendar/personal/' + currentUser, // 개인 일정 (R)

        // [U] 1. 일정을 마우스로 드래그할 수 있게 허용
        editable: true,

        /**
         * [U] 2. 드래그 앤 드롭("Drop")으로 날짜/시간 "수정" 시
         */
        eventDrop: async function(info) {
            const eventId = info.event.id;
            const newStartDate = info.event.startStr; // 변경된 시작 시간 (ISO 문자열)

            try {
                // 1-4에서 만든 "수정(PUT)" API 호출 (권한은 백엔드가 검사)
                const response = await fetch(`/api/calendar/${eventId}?userId=${currentUser}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    // "start" 필드만 수정하도록 요청
                    body: JSON.stringify({ start: newStartDate })
                });

                if (!response.ok) {
                    // [변경] 번역 키 사용 (토스트 메시지를 Error 객체 메시지로 사용)
                    throw new Error(translations['toastCalendarUpdateFail'][currentLanguage]);
                }
                // (성공 시 DB에 반영됨. UI는 이미 바뀌어 있음)

            } catch (error) {
                console.error('날짜 변경 실패:', error);
                // [변경] 번역 키 사용 (오류 메시지 또는 기본 메시지 표시)
                showToast(error.message || translations['toastCalendarUpdateFail'][currentLanguage], 'error');
                info.revert(); // ✨ 실패 시, 드래그를 원위치시킴
            }
        },

        /**
         * [D] 3. 일정을 "클릭"했을 때 "삭제"
         */
        eventClick: async function(info) {
            const eventId = info.event.id;
            const eventTitle = info.event.title;
            const action = await showChoiceModal(
                `'${eventTitle}'`,                 // 모달 제목 (이벤트 제목을 그대로 사용)
                translations['modalDeleteEventDesc'][currentLanguage],  // "이 일정을 '삭제'하시겠습니까?"
                translations['btnCancel'][currentLanguage],             // "취소" (재사용)
                translations['btnDelete'][currentLanguage]              // "삭제" (재사용)
            );
            if (action === '2') {
                try {
                    const response = await fetch(`/api/calendar/${eventId}?userId=${currentUser}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        // [변경] 번역 키 사용 (토스트 메시지를 Error 객체 메시지로 사용)
                        throw new Error(translations['toastCalendarDeleteFail'][currentLanguage]);
                    }

                    // [변경] 번역 키 사용
                    showToast(translations['toastCalendarDeleteSuccess'][currentLanguage], 'success');
                    calendarInstance.refetchEvents();

                } catch (error) {
                    console.error('삭제 실패:', error);
                    // [변경] 번역 키 사용 (오류 메시지 또는 기본 메시지 표시)
                    showToast(error.message || translations['toastCalendarDeleteFail'][currentLanguage], 'error');
                }
            }
        }
    });

    calendarInstance.render();
}
// "채팅방 캘린더" 모달에 캘린더를 그리는 함수 (메인 캘린더의 renderCalendar와는 "별개"의 함수)
function renderRoomCalendar(roomId) {

    // (기존 방어 코드)
    if (roomCalendarInstance || !roomId) {
        return;
    }

    const calendarEl = DOM.roomCalendarView;

    roomCalendarInstance = new FullCalendar.Calendar(calendarEl, {
        displayEventTime: true,
        initialView: 'dayGridMonth',
        // [수정] 'ko' 대신, 전역 변수인 currentLanguage를 사용합니다.
        locale: currentLanguage,
        height: '610px',
        eventDisplay: 'block',
        eventClassNames: 'custom-room-event',
        customButtons: {
            addEventButton: {
                click: function() {
                    // (3-3에서 추가할 함수를 호출)
                    openRoomEventModal();
                }
            }
        },

        // [✨ 3-2. 헤더 툴바 수정 (right 속성 변경)]
        headerToolbar: {
            left: 'title',
            center: '',
            // (기존 'prev,next'에 'addEventButton'을 맨 앞에 추가)
            right: 'addEventButton prev,next'
        },
        events: '/api/calendar/room/' + roomId,

        // [U] 1. 일정을 마우스로 드래그할 수 있게 허용 (공용)
        editable: true,

        /**
         * [U] 2. 드래그 앤 드롭("Drop")으로 날짜/시간 "수정" 시 (공용)
         */
        eventDrop: async function(info) {
            const eventId = info.event.id;
            const newStartDate = info.event.startStr;

            try {
                // 1-4에서 만든 "수정(PUT)" API 호출 (권한은 백엔드가 검사)
                const response = await fetch(`/api/calendar/${eventId}?userId=${currentUser}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ start: newStartDate })
                });

                if (!response.ok) {
                    // [변경] 번역 키 사용
                    throw new Error(translations['errorUpdatePermission'][currentLanguage]);
                }
                // (성공 시 DB에 반영됨)

            } catch (error) {
                console.error('날짜 변경 실패:', error);
                // [변경] 번역 키 사용
                showToast(error.message || translations['toastRoomCalendarUpdateFail'][currentLanguage], 'error');
                info.revert(); // ✨ 실패 시, 드래그를 원위치시킴
            }
        },

        /**
         * [D / C] 3. 일정을 "클릭"했을 때 "삭제" 또는 "복사"
         */
        eventClick: async function(info) {
            if (!currentUser) {
                // [변경] 번역 키 사용 (재사용)
                showToast(translations['toastLoginRequired'][currentLanguage], 'error');
                return;
            }

            const eventId = info.event.id;
            const eventTitle = info.event.title;

            const action = await showChoiceModal(
                `${eventTitle}`,                 // 제목
                translations['modalRoomEventActionDesc'][currentLanguage], // "이 일정으로 무엇을..."
                translations['btnCopyCalendar'][currentLanguage],          // "내 캘린더로 복사"
                translations['btnDelete'][currentLanguage]                 // "삭제" (재사용)
            );

            if (action === '1') {
                // --- (C) "복사" 로직 ---
                try {
                    const response = await fetch(`/api/calendar/copy-to-personal/${eventId}?userId=${currentUser}`, { method: 'POST' });
                    if (response.ok) {
                        // [변경] 번역 키 사용
                        showToast(translations['toastCopyCalendarSuccess'][currentLanguage], 'success');
                        if (calendarInstance) calendarInstance.refetchEvents();
                    } else {
                        // [변경] 번역 키 사용
                        showToast(translations['toastCopyCalendarFail'][currentLanguage], 'error');
                    }
                } catch (error) {
                    console.error('Error copying event:', error);
                    // [변경] 번역 키 사용
                    showToast(translations['toastCopyCalendarError'][currentLanguage], 'error');
                }

            } else if (action === '2') {
                // --- (D) "삭제" 로직 ---
                try {
                    // "삭제(DELETE)" API 호출
                    const response = await fetch(`/api/calendar/${eventId}?userId=${currentUser}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        // [변경] 번역 키 사용
                        throw new Error(translations['errorDeletePermission'][currentLanguage]);
                    }

                    // [변경] 번역 키 사용
                    showToast(translations['toastRoomCalendarDeleteSuccess'][currentLanguage], 'success');
                    roomCalendarInstance.refetchEvents();

                } catch (error) {
                    console.error('삭제 실패:', error);
                    // [변경] 번역 키 사용
                    showToast(error.message || translations['toastRoomCalendarDeleteFail'][currentLanguage], 'error');
                }
            }
        },
    });

    roomCalendarInstance.render();
}

// ===================================================================
// [✨ 3-3. '공용 일정 추가' 모달 제어 로직 (새로 추가)]
// ===================================================================

// (2단계에서 만든 HTML의 DOM 요소들을 미리 찾아둡니다)
const roomEventOverlay = document.getElementById('room-event-overlay');
const roomEventTitle = document.getElementById('room-event-title');
const roomEventDate = document.getElementById('room-event-date');
const roomEventTime = document.getElementById('room-event-time');

/**
 * '공용 일정 추가' 모달을 엽니다. (캘린더 '+' 버튼 클릭 시 호출됨)
 */
function openRoomEventModal() {
    // 입력 필드 초기화
    roomEventTitle.value = '';

    // 기본 날짜/시간을 현재로 설정 (편의 기능)
    const now = new Date();
    roomEventDate.value = now.toLocaleDateString('sv-SE'); // YYYY-MM-DD (스웨덴 로케일이 이 형식임)
    roomEventTime.value = now.toTimeString().substring(0, 5); // HH:mm

    roomEventOverlay.classList.remove('hidden');
}
/**
 * '공용 일정 추가' 모달을 닫습니다.
 */
function closeRoomEventModal() {
    roomEventOverlay.classList.add('hidden');
}

// [이벤트 리스너 연결]

// 1. 모달 '취소' 버튼
document.getElementById('cancel-room-event-button').addEventListener('click', closeRoomEventModal);

// 2. 모달 'X' 닫기 버튼 (index.html에 추가하셨던 버튼)
document.getElementById('close-room-event-modal').addEventListener('click', closeRoomEventModal);

// 3. 모달 '저장' 버튼 (핵심 로직)
document.getElementById('save-room-event-button').addEventListener('click', async () => {
    const title = roomEventTitle.value.trim();
    const date = roomEventDate.value;
    const time = roomEventTime.value || '00:00'; // 시간이 비면 자정(00:00)으로

    if (!title || !date) {
        showToast(translations['toastNeedTitleDate'][currentLanguage], 'error');
        return;
    }

    if (!currentRoomId) {
        showToast(translations['toastRoomNotSelected'][currentLanguage], 'error');
        return;
    }

    try {
        // 1. KST 날짜/시간을 UTC 표준시(ISO 문자열)로 변환
        const localDateTime = new Date(`${date}T${time}:00`);
        const utcIsoString = localDateTime.toISOString();

        // 2. [1단계]에서 만든 백엔드 API 호출
        const response = await fetch(`/api/calendar/room/${currentRoomId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                start: utcIsoString // UTC 시간으로 전송
            })
        });

        // [변경] (로그인/프로필수정과 동일한 로직)
        if (response.ok) {
            // [성공]
            closeRoomEventModal();
            if (roomCalendarInstance) {
                roomCalendarInstance.refetchEvents(); // 캘린더 UI 즉시 갱신
            }
            // [변경] 번역 키 사용
            showToast(translations['toastRoomCalendarSaveSuccess'][currentLanguage], 'success');
        } else {
            // [실패]
            const errorKey = await response.text(); // Java가 "CALENDAR_INVALID_DATE_FORMAT_ERROR" 등을 보냄

            if (translations[errorKey] && translations[errorKey][currentLanguage]) {
                // (Case 1) 번역 키가 있으면 (예: "잘못된 날짜 형식...")
                showToast(translations[errorKey][currentLanguage], 'error');
            } else {
                // (Case 2) 번역 키가 없으면
                const errorTemplate = translations['toastRoomCalendarSaveFail'][currentLanguage]; // '일정 생성 실패'
                showToast(`${errorTemplate}: ${errorKey}`, 'error');
            }
        }

    } catch (error) {
        // [네트워크 오류]
        console.error('공용 일정 저장 실패:', error);
        // [변경] 번역 키 사용
        const errorTemplate = translations['toastRoomCalendarSaveError'][currentLanguage];
        showToast(`${errorTemplate}: ${error.message}`, 'error');
    }
});
function applyTranslations() {
    const lang = currentLanguage; // script.js 상단에 'let currentLanguage = 'ko';' 변수가 있어야 합니다.

    if (!translations) {
        console.error("번역 객체(translations)를 찾을 수 없습니다.");
        return;
    }

    // 1. [data-translate-key] (일반 텍스트 번역)
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        if (translations[key] && translations[key][lang]) {
            element.textContent = translations[key][lang];
        }
    });

    // (C) 공용 일정 모달의 제목
    const roomEventTitleInput = document.getElementById('room-event-title');
    if (roomEventTitleInput && translations['eventTitleLabel'] && translations['eventTitleLabel'][lang]) {
        roomEventTitleInput.placeholder = translations['eventTitleLabel'][lang];
    }

    // (D) 개인 일정 모달의 제목
    const personalEventTitleInput = document.getElementById('personal-event-title');
    if (personalEventTitleInput && translations['eventTitleLabel'] && translations['eventTitleLabel'][lang]) {
        // (주의: 공용 일정과 같은 'eventTitleLabel' 키를 재사용합니다)
        personalEventTitleInput.placeholder = translations['eventTitleLabel'][lang];
    }

    // (E) 채팅방 설정 모달의 채팅방 이름
    const roomEditNameInput = document.getElementById('room-edit-name');
    if (roomEditNameInput && translations['placeholderRoomName'] && translations['placeholderRoomName'][lang]) {
        roomEditNameInput.placeholder = translations['placeholderRoomName'][lang];
    }

    // (F) 채팅 화면 입력창
    const messageInput = document.getElementById('message-input');
    if (messageInput && translations['messagePlaceholder'] && translations['messagePlaceholder'][lang]) {
        messageInput.placeholder = translations['messagePlaceholder'][lang];
    }

    // (G) 채팅 검색창
    const searchInput = document.getElementById('search-input');
    if (searchInput && translations['placeholderSearchMessages'] && translations['placeholderSearchMessages'][lang]) {
        searchInput.placeholder = translations['placeholderSearchMessages'][lang];
    }

    // 2. [data-translate-alt-key] (이미지 alt 속성 번역)
    document.querySelectorAll('[data-translate-alt-key]').forEach(element => {
        const key = element.getAttribute('data-translate-alt-key');
        if (translations[key] && translations[key][lang]) {
            element.alt = translations[key][lang];
        }
    });

    // 3. [ID로 직접] Placeholder 번역

    // (A) 프로필 설정 모달의 닉네임
    const profileNicknameInput = document.getElementById('profile-edit-nickname');
    if (profileNicknameInput && translations['nicknamePlaceholder'] && translations['nicknamePlaceholder'][lang]) {
        profileNicknameInput.placeholder = translations['nicknamePlaceholder'][lang];
    }

    // (B) [기존] 로그인/회원가입 닉네임 (DOM.nicknameInput 등)
    // (만약 DOM 객체로 관리하고 있다면 이 방식도 유효합니다)
    if (window.DOM && DOM.nicknameInput && translations['nicknamePlaceholder']) {
        DOM.nicknameInput.placeholder = translations['nicknamePlaceholder'][lang];
    }
    // --- (13) 공지 등록 확인 모달 ---
    // (이 요소들이 DOM 객체에 정의되어 있는지 확인 필요)
    const modalAnnounceTitle = document.querySelector('#announce-confirm-modal h2');
    if (modalAnnounceTitle) modalAnnounceTitle.textContent = translations['modalAnnounceTitle'][lang];

    const modalAnnounceDesc = document.querySelector('#announce-confirm-modal .modal-body p');
    if (modalAnnounceDesc) modalAnnounceDesc.textContent = translations['modalAnnounceDesc'][lang];

    const announceConfirmCancel = document.getElementById('announce-confirm-cancel');
    if (announceConfirmCancel) announceConfirmCancel.textContent = translations['btnCancel'][lang]; // (재사용)

    const announceConfirmPost = document.getElementById('announce-confirm-post');
    if (announceConfirmPost) announceConfirmPost.textContent = translations['btnPost'][lang];
}
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM 로드 완료, 초기 번역을 적용합니다.");

    // 1. 초기 번역 1회 실행 (기본값 'ko'로)
    // (3단계에서 만드신 함수를 여기서 처음 "호출"합니다)
    applyTranslations();

    // 2. 로그인 화면의 언어 선택기(<select>)를 찾아서 이벤트 장착
    // <select id="language-selector-auth">
    const languageSelectorAuth = document.getElementById('language-selector-auth');

    if (languageSelectorAuth) {
        // 이 선택기의 값이 'change' (변경)될 때마다
        languageSelectorAuth.addEventListener('change', (e) => {

            // script.js 맨 위에 있는 'currentLanguage' 전역 변수 값을
            // 선택된 값(en, ja 등)으로 변경
            currentLanguage = e.target.value;

            // 3단계에서 만든 번역 함수 "호출"
            applyTranslations();
        });
    }

    // 3. (나중에 추가) 메인 화면의 언어 선택기에도 동일하게 적용
    // (메인 화면의 <select> ID가 'language-selector-main'이 맞는지 확인 필요)
    const languageSelectorMain = document.getElementById('language-selector-main');
    if (languageSelectorMain) {
        languageSelectorMain.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            applyTranslations();
        });
    }
    // 4. [ID로 직접] Title (Tooltip) 번역
    const showAnnouncementBtn = document.getElementById('show-announcement-btn');
    if (showAnnouncementBtn && translations['titleViewAnnouncement'] && translations['titleViewAnnouncement'][lang]) {
        showAnnouncementBtn.title = translations['titleViewAnnouncement'][lang];
    }

    const roomCalendarButton = document.getElementById('room-calendar-button');
    if (roomCalendarButton && translations['titleSharedCalendar'] && translations['titleSharedCalendar'][lang]) {
        roomCalendarButton.title = translations['titleSharedCalendar'][lang];
    }

    const roomGalleryButton = document.getElementById('room-gallery-button');
    if (roomGalleryButton && translations['modalGalleryTitle'] && translations['modalGalleryTitle'][lang]) {
        // (주의: '파일 보관함' 모달 제목 키 재사용)
        roomGalleryButton.title = translations['modalGalleryTitle'][lang];
    }

    const hideAnnouncementBtn = document.getElementById('hide-announcement-btn');
    if (hideAnnouncementBtn && translations['titleHideAnnouncement'] && translations['titleHideAnnouncement'][lang]) {
        hideAnnouncementBtn.title = translations['titleHideAnnouncement'][lang];
    }

    const removeAnnouncementBtn = document.getElementById('remove-announcement-btn');
    if (removeAnnouncementBtn && translations['titleRemoveAnnouncement'] && translations['titleRemoveAnnouncement'][lang]) {
        removeAnnouncementBtn.title = translations['titleRemoveAnnouncement'][lang];
    }
    // --- 공지 등록 확인 모달 (이벤트 리스너 3개 추가) ---

// 1. '게시' 버튼 (가장 중요)
    const announceConfirmPostBtn = document.getElementById('announce-confirm-post');
    if (announceConfirmPostBtn) {
        announceConfirmPostBtn.addEventListener('click', () => {
            if (websocket && websocket.readyState === WebSocket.OPEN && messageToAnnounce) {
                // 백엔드로 공지 등록 요청
                websocket.send(JSON.stringify({
                    type: "UPDATE_ANNOUNCEMENT",
                    message: messageToAnnounce // (openAnnounceConfirmModal에서 저장해둔 내용)
                }));
            }
            // 모달 닫기
            DOM.announceConfirmOverlay.classList.add('hidden');
            messageToAnnounce = null; // 임시 내용 비우기
        });
    }

// 2. '취소' 버튼
    const announceConfirmCancelBtn = document.getElementById('announce-confirm-cancel');
    if (announceConfirmCancelBtn) {
        announceConfirmCancelBtn.addEventListener('click', () => {
            DOM.announceConfirmOverlay.classList.add('hidden');
            messageToAnnounce = null; // 임시 내용 비우기
        });
    }

// 3. 'X' 닫기 버튼
    const closeAnnounceConfirmBtn = document.getElementById('close-announce-confirm-modal');
    if (closeAnnounceConfirmBtn) {
        closeAnnounceConfirmBtn.addEventListener('click', () => {
            DOM.announceConfirmOverlay.classList.add('hidden');
            messageToAnnounce = null; // 임시 내용 비우기
        });
    }
});
const messageInput = document.getElementById('message-input');

// 1. 높이 자동 조절 함수
function autoResize() {
    messageInput.style.height = 'auto'; // 높이 초기화
    messageInput.style.height = messageInput.scrollHeight + 'px'; // 내용만큼 늘리기
}

if (messageInput) {
    // 2. 입력할 때마다 높이 조절 이벤트
    messageInput.addEventListener('input', function() {
        autoResize();

        // (기존 타이핑 알림 로직 연결)
        if (typeof sendTypingEvent === 'function' && websocket && websocket.readyState === WebSocket.OPEN) {
            sendTypingEvent();
        }
    });

    // 3. 엔터키(Enter) 처리
    messageInput.addEventListener('keydown', function(e) {
        // Shift + Enter는 줄바꿈, 그냥 Enter는 전송
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 줄바꿈 방지
            document.getElementById('send-button').click(); // 전송 버튼 클릭
        }
    });
}
// ========================================================
// [신규 추가] 5. 다국어 동시통역 설정 및 표시 로직
// (script.js 맨 마지막에 붙여넣으세요)
// ========================================================

const roomSettingsOverlay = document.getElementById('room-settings-overlay');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const roomSettingsBtn = document.getElementById('room-settings-btn');

// 1. [통역 설정] 버튼 클릭 시 모달 열기
if (roomSettingsBtn) {
    roomSettingsBtn.addEventListener('click', () => {
        // 메뉴 닫기
        document.getElementById('header-menu-popup').classList.add('hidden');
        // 모달 열기
        roomSettingsOverlay.classList.remove('hidden');

        // (선택) 현재 방의 설정을 불러와서 체크박스에 표시하면 좋겠지만,
        // 지금은 간단하게 열릴 때마다 체크박스를 초기화하거나 그대로 둡니다.
    });
}

// 2. [닫기] 버튼 클릭 시 모달 닫기
if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
        roomSettingsOverlay.classList.add('hidden');
    });
}

// 3. [저장] 버튼 클릭 시 서버로 설정 전송
if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
        // 체크된 언어 목록 가져오기
        const checkboxes = document.querySelectorAll('#room-settings-overlay input[type="checkbox"]:checked');
        const selectedLangs = Array.from(checkboxes).map(cb => cb.value);

        if (!currentRoomId) return;

        // 서버 API 호출 (언어 설정 저장)
        fetch(`/api/chatrooms/${currentRoomId}/languages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ languages: selectedLangs })
        })
            .then(response => {
                if (response.ok) {
                    alert("통역 설정이 저장되었습니다. 이제부터 대화가 자동 번역됩니다!");
                    roomSettingsOverlay.classList.add('hidden');
                } else {
                    alert("설정 저장 실패: " + response.status);
                }
            })
            .catch(err => console.error("Error saving languages:", err));
    });
}