const translations = {
    // --- 로그인/회원가입 화면 번역 추가 ---
    nicknamePlaceholder: { ko: '닉네임', en: 'Nickname', ja: 'ニックネーム', zh: '昵称', ar: 'اللقب' },
    usernamePlaceholder: { ko: '아이디', en: 'ID', ja: 'ID', zh: '用户名', ar: 'اسم المستخدم' },
    passwordPlaceholder: { ko: '비밀번호', en: 'Password', ja: 'パスワード', zh: '密码', ar: 'كلمة المرور' },
    loginButton: { ko: '로그인', en: 'Login', ja: 'ログイン', zh: '登录', ar: 'تسجيل الدخول' },
    signupPrompt: { ko: '계정이 없으신가요?', en: "Don't have an account?", ja: 'アカウントをお持ちではありませんか？', zh: '没有帐户？', ar: 'ليس لديك حساب؟' },
    showSignup: { ko: '회원가입', en: 'Sign up', ja: '会員登録', zh: '注册', ar: 'اشتراك' },
    signupButton: { ko: '가입하기', en: 'Sign Up', ja: '登録する', zh: '注册', ar: 'اشتراك' },
    loginPrompt: { ko: '이미 계정이 있으신가요?', en: 'Already have an account?', ja: 'すでにアカウントをお持ちですか？', zh: '已有帐户？', ar: 'هل لديك حساب بالفعل؟' },
    showLogin: { ko: '로그인', en: 'Login', ja: 'ログイン', zh: '登录', ar: 'تسجيل الدخول' },

    // ---  메인 화면 번역 ---
    logoutButton: { ko: '로그아웃', en: 'Logout', ja: 'ログアウト', zh: '登出', ar: 'تسجيل خروج' },
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
    inviteButton: { ko: '초대', en: 'Invite', ja: '招待', zh: '邀请', ar: 'دعوة' },
    leaveButton: { ko: '나가기', en: 'Leave', ja: '退出', zh: '离开', ar: 'مغادرة' },

    // ---  알림 메시지 번역 ---
    alertSignupSuccess: { ko: '회원가입 성공! 로그인해주세요.', en: 'Sign up successful! Please log in.', ja: '会員登録が成功しました！ログインしてください。', zh: '注册成功！请登录。', ar: 'تم التسجيل بنجاح! الرجاء تسجيل الدخول.' },
    alertAddFriendSuccess: { ko: '친구 추가 성공!', en: 'Friend added successfully!', ja: '友達追加が成功しました！', zh: '添加好友成功！', ar: 'تمت إضافة الصديق بنجاح!' },
    alertAddFriendFail: { ko: '친구 추가 실패: {error}', en: 'Failed to add friend: {error}', ja: '友達追加に失敗しました: {error}', zh: '添加好友失败: {error}', ar: 'فشل إضافة صديق: {error}' },
    alertFileUploadFail: { ko: '파일 업로드에 실패했습니다.', en: 'File upload failed.', ja: 'ファイルのアップロードに失敗しました。', zh: '文件上传失败。', ar: 'فشل تحميل الملف.' },

    // --- 프로필 설정 모달 ---
    modalProfileSettingsTitle: { ko: '프로필 설정', en: 'Profile Settings', ja: 'プロフィール設定', zh: '个人资料设置', ar: 'إعدادات الملف الشخصي' },
    altProfilePreview: { ko: '프로필 미리보기', en: 'Profile Preview', ja: 'プロフィールプレビュー', zh: '头像预览', ar: 'معاينة الملف الشخصي' },
    btnChangePicture: { ko: '사진 변경', en: 'Change Picture', ja: '写真変更', zh: '更换照片', ar: 'تغيير الصورة' },
    btnCancel: { ko: '취소', en: 'Cancel', ja: 'キャンセル', zh: '取消', ar: 'إلغاء' },
    btnSave: { ko: '저장', en: 'Save', ja: '保存', zh: '保存', ar: 'حفظ' },
    btnDeleteAccount: { ko: '계정 탈퇴', en: 'Delete Account', ja: '退会する', zh: '退出账户', ar: 'حذف الحساب' },

    // --- 친구 프로필 모달 ---
    modalFriendProfileTitle: { ko: '프로필', en: 'Profile', ja: 'プロフィール', zh: '个人资料', ar: 'الملف الشخصي' },
    altFriendProfilePicture: { ko: '프로필 사진', en: 'Profile Picture', ja: 'プロフィール写真', zh: '头像', ar: 'الصورة الشخصية' },
    friendProfileName: { ko: '친구 이름', en: 'Friend Name', ja: '友達の名前', zh: '朋友的名字', ar: 'اسم الصديق' },
    btnFriendProfileDM: { ko: '1:1 채팅', en: '1:1 Chat', ja: '1:1 チャット', zh: '1:1 聊天', ar: 'محادثة 1:1' },
    btnFriendProfileDelete: { ko: '친구 삭제', en: 'Delete Friend', ja: '友達削除', zh: '删除好友', ar: 'حذف الصديق' },
    // --- 채팅 읽음, 안읽음 ---
    btnFilterAll: { ko: '전체', en: 'All', ja: 'すべて', zh: '全部', ar: 'الكل' },
    btnFilterUnread: { ko: '안읽음', en: 'Unread', ja: '未読', zh: '未读', ar: 'غير مقروء' },
    // --- 파일 보관함 ---
    modalGalleryTitle: { ko: '파일 보관함', en: 'File Storage', ja: 'ファイル保管庫', zh: '文件保管箱', ar: 'مخزن الملفات' },
    galleryTabImages: { ko: '이미지', en: 'Images', ja: '画像', zh: '图片', ar: 'الصور' },
    galleryTabFiles: { ko: '파일', en: 'Files', ja: 'ファイル', zh: '文件', ar: 'الملفات' },

    // --- 공용 일정 추가 모달 ---
    modalRoomEventTitle: { ko: '공용 일정 추가', en: 'Add Shared Event', ja: '共用日程追加', zh: '添加共享日程', ar: 'إضافة حدث مشترك' },
    eventTitleLabel: { ko: '제목', en: 'Title', ja: 'タイトル', zh: '标题', ar: 'العنوان' },

    // --- script.js 알림 메시지 (공용 일정) ---
    toastNeedTitleDate: { ko: '제목과 날짜를 모두 입력해주세요.', en: 'Please enter both a title and a date.', ja: 'タイトルと日付を両方入力してください。', zh: '请输入标题和日期。', ar: 'يرجى إدخال العنوان والتاريخ كليهما.' },
    toastRoomNotSelected: { ko: '채팅방이 선택되지 않았습니다. (오류)', en: 'No chat room selected. (Error)', ja: 'チャットルームが選択されていません。(エラー)', zh: '未选择聊天室。(错误)', ar: 'لم يتم تحديد غرفة دردشة. (خطأ)' },

    // --- 개인 일정 추가 모달 ---
    modalPersonalEventTitle: { ko: '일정 추가', en: 'Add Event', ja: '予定追加', zh: '添加日程', ar: 'إضافة حدث' },

    // --- 공용 캘린더 모달 (보기) ---
    modalRoomCalendarTitle: { ko: '채팅방 공용 캘린더', en: 'Shared Room Calendar', ja: 'チャットルーム共用カレンダー', zh: '聊天室共享日历', ar: 'تقويم الغرفة المشترك' },

    // --- 채팅방 설정 모달 ---
    modalRoomSettingsTitle: { ko: '채팅방 설정', en: 'Chat Room Settings', ja: 'チャットルーム設定', zh: '聊天室设置', ar: 'إعدادات غرفة الدردشة' },
    altRoomEditPreview: { ko: '채팅방 사진 미리보기', en: 'Room Picture Preview', ja: 'チャットルーム写真プレビュー', zh: '聊天室图片预览', ar: 'معاينة صورة الغرفة' },
    placeholderRoomName: { ko: '새 채팅방 이름', en: 'New chat room name', ja: '新しいチャットルーム名', zh: '新聊天室名称', ar: 'اسم غرفة الدردشة الجديد' },

    // --- 참가자 / 친구 초대 모달 ---
    modalParticipantsTitle: { ko: '대화 상대', en: 'Participants', ja: '参加者', zh: '参与者', ar: 'المشاركون' },
    modalInviteTitle: { ko: '친구 초대', en: 'Invite Friends', ja: '友達招待', zh: '邀请好友', ar: 'دعوة أصدقاء' },
    // --- 채팅 화면 (헤더 팝업 메뉴) ---
    altRoomProfile: { ko: '채팅방 프로필', en: 'Room Profile', ja: 'ルームプロフィール', zh: '聊天室头像', ar: 'ملف تعريف الغرفة' },
    titleViewAnnouncement: { ko: '공지 보기', en: 'View Announcement', ja: 'お知らせを見る', zh: '查看公告', ar: 'عرض الإعلان' },
    titleSharedCalendar: { ko: '공용 캘린더', en: 'Shared Calendar', ja: '共用カレンダー', zh: '共享日历', ar: 'التقويم المشترك' },
    menuCalendar: { ko: '캘린더', en: 'Calendar', ja: 'カレンダー', zh: '日历', ar: 'التقويم' },
    // 'titleFileStorage'는 'modalGalleryTitle' (파일 보관함) 키를 재사용합니다.
    menuGallery: { ko: '사진/파일', en: 'Photos/Files', ja: '写真/ファイル', zh: '照片/文件', ar: 'الصور/الملفات' },
    menuViewParticipants: { ko: '대화상대 보기', en: 'View Participants', ja: '参加者表示', zh: '查看参与者', ar: 'عرض المشاركين' },
    menuInviteParticipants: { ko: '대화상대 초대', en: 'Invite Participants', ja: '参加者招待', zh: '邀请参与者', ar: 'دعوة مشاركين' },
    // 'leaveButton' (채팅방 나가기) 키는 재사용합니다.

    // --- 채팅 화면 (공지/검색창) ---
    titleHideAnnouncement: { ko: '공지 숨기기', en: 'Hide Announcement', ja: 'お知らせを非表示', zh: '隐藏公告', ar: 'إخفاء الإعلان' },
    titleRemoveAnnouncement: { ko: '공지 내리기', en: 'Remove Announcement', ja: 'お知らせを削除', zh: '移除公告', ar: 'إزالة الإعلان' },
    placeholderSearchMessages: { ko: '메시지 검색...', en: 'Search messages...', ja: 'メッセージ検索...', zh: '搜索消息...', ar: 'البحث في الرسائل...' },
    // 'messagePlaceholder' (메시지 입력...) 키는 재사용합니다.

    // --- 개인 캘린더 (새 일정 추가 버튼) ---
    btnAddPersonalEvent: { ko: '새 일정 추가', en: 'Add New Event', ja: '新規予定追加', zh: '添加新日程', ar: 'إضافة حدث جديد' },

    // --- script.js : 로그인 / 회원가입 (네트워크/폴백 오류) ---
    errorLoginFallback: { ko: '로그인 중 오류 발생', en: 'Error during login', ja: 'ログイン中にエラーが発生しました', zh: '登录时出错', ar: 'خطأ أثناء تسجيل الدخول' },
    errorSignupFallback: { ko: '회원가입 중 오류 발생', en: 'Error during sign up', ja: '会員登録中にエラーが発生しました', zh: '注册时出错', ar: 'خطأ أثناء الاشتراك' },
    SIGNUP_USERNAME_EXISTS: { ko: '이미 사용 중인 아이디입니다.', en: 'This ID is already in use.', ja: 'このIDは既に使用されています。', zh: '该ID已被使用。', ar: 'هذا المعرف قيد الاستخدام بالفعل.' },

    // --- 서버(Java) 오류 코드 번역 (로그인) ---
    LOGIN_USER_NOT_FOUND: { ko: '사용자를 찾을 수 없습니다.', en: 'User not found.', ja: 'ユーザーが見つかりません。', zh: '找不到用户。', ar: 'المستخدم غير موجود.' },
    LOGIN_INVALID_PASSWORD: { ko: '비밀번호가 일치하지 않습니다.', en: 'Password does not match.', ja: 'パスワードが一致しません。', zh: '密码不匹配。', ar: 'كلمة المرور غير متطابقة.' },

    // --- 서버(Java) 오류 코드 번역 (친구 추가) ---
    FRIEND_ADD_SELF_ERROR: { ko: '자기 자신을 친구로 추가할 수 없습니다.', en: 'You cannot add yourself as a friend.', ja: '自分自身を友達として追加することはできません。', zh: '不能添加自己为好友。', ar: 'لا يمكنك إضافة نفسك كصديق.' },
    FRIEND_ALREADY_EXISTS_ERROR: { ko: '이미 추가된 친구입니다.', en: 'This user is already your friend.', ja: '既に追加された友達です。', zh: '已经是好友。', ar: 'هذا المستخدم صديقك بالفعل.' },

    // --- 서버(Java) 오류 코드 번역 (친구 삭제) ---
    FRIEND_DELETE_TARGET_NOT_FOUND: { ko: '삭제할 친구를 찾을 수 없습니다.', en: 'Friend to delete not found.', ja: '削除する友達が見つかりません。', zh: '未找到要删除的好友。', ar: ' الصديق المراد حذفه غير موجود.' },

    // --- script.js : 친구 삭제 확인 모달 및 알림 ---
    modalDeleteFriendTitle: { ko: '친구 삭제', en: 'Delete Friend', ja: '友達削除', zh: '删除好友', ar: 'حذف الصديق' },
    modalDeleteFriendDesc: { ko: '정말로 \'{nickname}\'님을 친구 목록에서 삭제하시겠습니까?', en: 'Are you sure you want to remove \'{nickname}\' from your friends list?', ja: '本当に\'{nickname}\'さんを友達リストから削除しますか？', zh: '您确定要将 \'{nickname}\' 从好友列表中删除吗？', ar: 'هل أنت متأكد أنك تريد إزالة \'{nickname}\' من قائمة أصدقائك؟' },
    btnDelete: { ko: '삭제', en: 'Delete', ja: '削除', zh: '删除', ar: 'حذف' },
    toastDeleteFriendSuccess: { ko: '친구 삭제에 성공했습니다.', en: 'Friend deleted successfully.', ja: '友達の削除に成功しました。', zh: '删除好友成功。', ar: 'تم حذف الصديق بنجاح.' },
    toastDeleteFriendFail: { ko: '삭제 실패', en: 'Delete failed', ja: '削除失敗', zh: '删除失败', ar: 'فشل الحذف' },
    toastDeleteFriendError: { ko: '친구 삭제 중 오류가 발생했습니다.', en: 'An error occurred while deleting friend.', ja: '友達の削除中にエラーが発生しました。', zh: '删除好友时出错。', ar: 'حدث خطأ أثناء حذف الصديق.' },
    // --- 서버(Java) 오류 코드 번역 (프로필 수정) ---
    PROFILE_UPLOAD_DIR_ERROR: { ko: '프로필 업로드 폴더를 생성할 수 없습니다.', en: 'Cannot create profile upload folder.', ja: 'プロフィールアップロードフォルダを作成できません。', zh: '无法创建个人资料上传文件夹。', ar: 'لا يمكن إنشاء مجلد تحميل الملف الشخصي.' },
    toastProfileUpdateSuccess: { ko: '프로필이 업데이트되었습니다.', en: 'Profile has been updated.', ja: 'プロフィールが更新されました。', zh: '个人资料已更新。', ar: 'تم تحديث الملف الشخصي.' },
    toastProfileUpdateFail: { ko: '프로필 업데이트 실패', en: 'Profile update failed', ja: 'プロフィールの更新に失敗しました', zh: '个人资料更新失败', ar: 'فشل تحديث الملف الشخصي' },
    toastProfileUpdateError: { ko: '프로필 업데이트 중 오류가 발생했습니다.', en: 'Error while updating profile.', ja: 'プロフィールの更新中にエラーが発生しました。', zh: '更新个人资料时出错。', ar: 'خطأ أثناء تحديث الملف الشخصي.' },

    // --- script.js : 계정 탈퇴 확인 모달 및 알림 ---
    modalDeleteAccountTitle: { ko: '계정 탈퇴', en: 'Delete Account', ja: '退会する', zh: '退出账户', ar: 'حذف الحساب' },
    modalDeleteAccountDesc: { ko: '정말로 계정을 탈퇴하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.', en: 'Are you sure you want to delete your account?\n\nThis action cannot be undone.', ja: '本当に退会しますか？\n\nこの操作は元に戻せません。', zh: '您确定要退出账户吗？\n\n此操作无法撤销。', ar: 'هل أنت متأكد أنك تريد حذف حسابك؟\n\nلا يمكن التراجع عن هذا الإجراء.' },
    btnConfirmDelete: { ko: '탈퇴', en: 'Delete', ja: '脱退', zh: '删除', ar: 'حذف' },
    toastDeleteAccountSuccess: { ko: '계정이 성공적으로 탈퇴되었습니다.\n로그인 화면으로 돌아갑니다.', en: 'Your account has been successfully deleted.\nReturning to the login screen.', ja: 'アカウントが正常に削除されました。\nログイン画面に戻ります。', zh: '帐户已成功删除。\n正在返回登录屏幕。', ar: 'تم حذف حسابك بنجاح.\nجارٍ العودة إلى شاشة تسجيل الدخول.' },
    toastDeleteAccountFail: { ko: '계정 탈퇴에 실패했습니다.', en: 'Failed to delete account.', ja: 'アカウントの削除に失敗しました。', zh: '删除帐户失败。', ar: 'فشل حذف الحساب.' },
    toastDeleteAccountError: { ko: '계정 탈퇴 중 오류가 발생했습니다.', en: 'An error occurred while deleting the account.', ja: 'アカウントの削除中にエラーが発生しました。', zh: '删除帐户时出错。', ar: 'حدث خطأ أثناء حذف الحساب.' },

    // --- 서버(Java) 오류 코드 번역 (DM 생성) ---
    DM_CREATE_USER_NOT_FOUND_ERROR: { ko: '1:1 채팅 생성 실패: 사용자 정보를 찾을 수 없습니다.', en: 'Failed to create 1:1 chat: User information not found.', ja: '1:1チャット作成失敗：ユーザー情報が見つかりません。', zh: '创建 1:1 聊天失败：未找到用户信息。', ar: 'فشل إنشاء محادثة 1:1: لم يتم العثور على معلومات المستخدم.' },
    toastDMStartFail: { ko: 'DM 생성 실패', en: 'Failed to create DM', ja: 'DM作成失敗', zh: 'DM 创建失败', ar: 'فشل إنشاء رسالة خاصة' },
    toastDMStartError: { ko: 'DM 시작 중 오류가 발생했습니다.', en: 'An error occurred while starting DM.', ja: 'DM開始中にエラーが発生しました。', zh: '开始 DM 时出错。', ar: 'حدث خطأ أثناء بدء الرسالة الخاصة.' },

    // --- 서버(Java) 오류 코드 번역 (채팅방) ---
    CHATROOM_NOT_FOUND_ERROR: { ko: '존재하지 않는 채팅방입니다.', en: 'This chat room does not exist.', ja: '存在しないチャットルームです。', zh: '聊天室不存在。', ar: 'غرفة الدردشة هذه غير موجودة.' },

    // --- script.js : 참가자 모달 (불러오는 중...) ---
    loadingParticipants: { ko: '불러오는 중...', en: 'Loading...', ja: '読み込み中...', zh: '加载中...', ar: 'جار التحميل...' },
    errorLoadParticipants: { ko: '참가자 정보를 불러오는 데 실패했습니다.', en: 'Failed to load participant information.', ja: '参加者情報の読み込みに失敗しました。', zh: '加载参与者信息失败。', ar: 'فشل تحميل معلومات المشاركين.' },

    // --- script.js : 친구 초대 모달 (openInviteFriendModal) ---
    toastInvalidLogin: { ko: '로그인 정보가 유효하지 않습니다.', en: 'Login information is invalid.', ja: 'ログイン情報が無効です。', zh: '登录信息无效。', ar: 'معلومات تسجيل الدخول غير صالحة.' },
    loadingList: { ko: '목록을 불러오는 중...', en: 'Loading list...', ja: 'リストを読み込み中...', zh: '列表加载中...', ar: 'جار تحميل القائمة...' },
    errorLoadFriendsFail: { ko: '친구 목록 로딩 실패', en: 'Failed to load friends list', ja: '友達リストの読み込みに失敗しました', zh: '加载好友列表失败', ar: 'فشل تحميل قائمة الأصدقاء' },
    errorLoadMembersFail: { ko: '채팅방 멤버 로딩 실패', en: 'Failed to load chat room members', ja: 'チャットルームメンバーの読み込みに失敗しました', zh: '加载聊天室成员失败', ar: 'فشل تحميل أعضاء غرفة الدردشة' },
    errorLoadListFailed: { ko: '목록을 불러오는 데 실패했습니다.', en: 'Failed to load the list.', ja: 'リストの読み込みに失敗しました。', zh: '加载列表失败。', ar: 'فشل تحميل القائمة.' },

    // --- 서버(Java) 오류 코드 번역 (채팅방 초대) ---
    INVITE_USER_NOT_FOUND_ERROR: { ko: '초대할 사용자를 찾을 수 없습니다.', en: 'User to invite not found.', ja: '招待するユーザーが見つかりません。', zh: '未找到要邀请的用户。', ar: 'المستخدم المراد دعوته غير موجود.' },
    INVITE_PERMISSION_DENIED_ERROR: { ko: '초대 권한이 없습니다.', en: 'You do not have permission to invite.', ja: '招待する権限がありません。', zh: '您没有邀请权限。', ar: 'ليس لديك إذن بالدعوة.' },
    INVITE_USER_ALREADY_IN_ROOM_ERROR: { ko: '이미 채팅방에 참여하고 있는 사용자입니다.', en: 'This user is already in the chat room.', ja: 'このユーザーはすでにチャットルームに参加しています。', zh: '该用户已在聊天室中。', ar: 'هذا المستخدم موجود بالفعل في غرفة الدردشة.' },

    // --- script.js : 친구 초대 모달 (버튼 텍스트/알림) ---
    inviting: { ko: '초대 중...', en: 'Inviting...', ja: '招待中...', zh: '邀请中...', ar: 'جارٍ الدعوة...' },
    invited: { ko: '초대됨', en: 'Invited', ja: '招待済み', zh: '已邀请', ar: 'تمت الدعوة' },
    toastInviteError: { ko: '초대 중 오류가 발생했습니다.', en: 'An error occurred while inviting.', ja: '招待中にエラーが発生しました。', zh: '邀请时出错。', ar: 'حدث خطأ أثناء الدعوة.' },

    // --- 서버(Java) 오류 코드 번역 (채팅방 나가기) ---
    LEAVE_ROOM_NOT_MEMBER_ERROR: { ko: '당신은 이 채팅방의 멤버가 아닙니다.', en: 'You are not a member of this chat room.', ja: 'あなたはこのチャットルームのメンバーではありません。', zh: '您不是此聊天室的成员。', ar: 'أنت لست عضوا في غرفة الدردشة هذه.' },

    // --- script.js : 채팅방 나가기 확인 모달 및 알림 ---
    modalLeaveRoomTitle: { ko: '채팅방 나가기', en: 'Leave Chat Room', ja: 'チャットルーム退出', zh: '退出聊天室', ar: 'مغادرة غرفة الدردشة' },
    modalLeaveRoomDesc: { ko: '정말 이 채팅방을 나가시겠습니까?', en: 'Are you sure you want to leave this chat room?', ja: '本当にこのチャットルームから退出しますか？', zh: '您确定要离开这个聊天室吗？', ar: 'هل أنت متأكد أنك تريد مغادرة غرفة الدردشة هذه؟' },
    toastLeaveRoomSuccess: { ko: '채팅방을 나갔습니다.', en: 'You have left the chat room.', ja: 'チャットルームから退出しました。', zh: '您已离开聊天室。', ar: 'لقد غادرت غرفة الدردشة.' },
    toastLeaveRoomFail: { ko: '방 나가기 실패', en: 'Failed to leave room', ja: 'ルーム退出に失敗しました', zh: '离开房间失败', ar: 'فشل مغادرة الغرفة' },

    // --- script.js : 채팅방 설정 저장 알림 ---
    toastRoomNameRequired: { ko: '채팅방 이름은 비워둘 수 없습니다.', en: 'Chat room name cannot be empty.', ja: 'チャットルーム名は空にできません。', zh: '聊天室名称不能为空。', ar: 'لا يمكن أن يكون اسم غرفة الدردشة فارغًا.' },
    toastRoomUpdateSuccess: { ko: '채팅방 정보가 성공적으로 변경되었습니다.', en: 'Chat room information has been successfully changed.', ja: 'チャットルーム情報が正常に変更されました。', zh: '聊天室信息已成功更改。', ar: 'تم تغيير معلومات غرفة الدردشة بنجاح.' },
    toastRoomUpdateFail: { ko: '프로필 업데이트에 실패했습니다.', en: 'Failed to update profile.', ja: 'プロフィールの更新に失敗しました。', zh: '更新个人资料失败。', ar: 'فشل تحديث الملف الشخصي.' },

    // --- script.js : 갤러리(파일 보관함) 모달 ---
    galleryNoFilesFound: { ko: '업로드된 파일이 없습니다.', en: 'No files uploaded.', ja: 'アップロードされたファイルがありません。', zh: '未上传文件。', ar: 'لا توجد ملفات مرفوعة.' },
    galleryImageFallbackTitle: { ko: '이미지', en: 'Image', ja: '画像', zh: '图片', ar: 'صورة' },
    galleryDownloadFallbackText: { ko: '다운로드', en: 'Download', ja: 'ダウンロード', zh: '下载', ar: 'تحميل' },
    galleryNoImagesFound: { ko: '업로드된 이미지가 없습니다.', en: 'No images uploaded.', ja: 'アップロードされた画像がありません。', zh: '未上传图片。', ar: 'لا توجد صور مرفوعة.' },
    toastGalleryLoadFailed: { ko: '파일 보관함을 불러오는 데 실패했습니다.', en: 'Failed to load the file archive.', ja: 'ファイル保管庫の読み込みに失敗しました。', zh: '加载文件存档失败。', ar: 'فشل تحميل أرشيف الملفات.' },

    // --- script.js : 친구 초대 모달 (UI 렌더링) ---
    noFriendsToInvite: { ko: '초대할 친구가 없습니다.', en: 'No friends to invite.', ja: '招待する友達がいません。', zh: '没有可邀请的朋友。', ar: 'لا يوجد أصدقاء لدعوتهم.' },

    // --- script.js : 저장된 번역 토글 알림 ---
    toastNoSavedTranslation: { ko: "'{lang}' 언어로 저장된 번역이 없습니다.", en: "No saved translation found for '{lang}'.", ja: "'{lang}' の保存された翻訳が見つかりません。", zh: "未找到 '{lang}' 的已保存翻译。", ar: "لم يتم العثور على ترجمة محفوظة للغة '{lang}'." },

    // --- script.js : 공지 확인 모달 ---
    toastMaxOneAnnouncement: { ko: '공지는 하나씩만 게시 가능합니다.\n기존 공지를 먼저 내려주세요.', en: 'Only one announcement can be posted at a time.\nPlease remove the existing one first.', ja: 'お知らせは一度に1件のみ投稿できます。\n既存のお知らせを先に削除してください。', zh: '一次只能发布一条公告。\n请先移除现有公告。', ar: 'يمكن نشر إعلان واحد فقط في كل مرة.\nيرجى إزالة الإعلان الحالي أولاً.' },
    prefixImage: { ko: '[이미지]', en: '[Image]', ja: '[画像]', zh: '[图片]', ar: '[صورة]' },
    prefixFile: { ko: '[파일]', en: '[File]', ja: '[ファイル]', zh: '[文件]', ar: '[ملف]' },

    // --- 서버(Java) 오류 코드 번역 (캘린더) ---
    CALENDAR_INVALID_DATE_FORMAT_ERROR: { ko: '잘못된 날짜 형식입니다. UTC (YYYY-MM-DDTHH:mm:ssZ) 형식이 필요합니다.', en: 'Invalid date format. UTC (YYYY-MM-DDTHH:mm:ssZ) format is required.', ja: '不正な日付形式です。UTC (YYYY-MM-DDTHH:mm:ssZ) 形式が必要です。', zh: '日期格式无效。需要 UTC (YYYY-MM-DDTHH:mm:ssZ) 格式。', ar: 'تنسيق التاريخ غير صالح. مطلوب تنسيق UTC (YYYY-MM-DDTHH:mm:ssZ).' },

    // --- script.js : 공용 일정 저장 알림 ---
    toastRoomCalendarSaveSuccess: { ko: '공용 일정이 추가되었습니다.', en: 'Shared event has been added.', ja: '共有予定が追加されました。', zh: '已添加共享日程。', ar: 'تمت إضافة الحدث المشترك.' },
    toastRoomCalendarSaveFail: { ko: '일정 생성 실패', en: 'Failed to create event', ja: '予定の作成に失敗しました', zh: '创建日程失败', ar: 'فشل إنشاء الحدث' },
    toastRoomCalendarSaveError: { ko: '저장 중 오류가 발생했습니다.', en: 'An error occurred while saving.', ja: '保存中にエラーが発生しました。', zh: '保存时出错。', ar: 'حدث خطأ أثناء الحفظ.' },

    // --- script.js : 메시지 로딩 알림 ---
    toastLoadMessagesFail: { ko: '메시지를 불러오는 데 실패했습니다', en: 'Failed to load messages', ja: 'メッセージの読み込みに失敗しました', zh: '加载消息失败', ar: 'فشل تحميل الرسائل' },

    // --- script.js : 공지 내리기 확인 모달 ---
    modalRemoveAnnounceTitle: { ko: '공지 내리기', en: 'Remove Announcement', ja: 'お知らせを下げる', zh: '移除公告', ar: 'إزالة الإعلان' },
    modalRemoveAnnounceDesc: { ko: '공지를 내리시겠습니까?', en: 'Are you sure you want to remove this announcement?', ja: 'このお知らせを下げますか？', zh: '您确定要移除此公告吗？', ar: 'هل أنت متأكد أنك تريد إزالة هذا الإعلان؟' },
    btnRemove: { ko: '내리기', en: 'Remove', ja: '下げる', zh: '移除', ar: 'إزالة' },

    // --- script.js / index.html : 공지 등록 확인 모달 (정적 UI) ---
    modalAnnounceTitle: { ko: '공지 등록 확인', en: 'Confirm Announcement', ja: 'お知らせ登録確認', zh: '确认公告', ar: 'تأكيد الإعلان' },
    modalAnnounceDesc: { ko: '공지로 등록하겠습니까?', en: 'Would you like to register this as an announcement?', ja: 'お知らせとして登録しますか？', zh: '要将其注册为公告吗？', ar: 'هل ترغب في تسجيل هذا كإعلان؟' },
    btnPost: { ko: '게시', en: 'Post', ja: '掲示', zh: '发布', ar: 'نشر' },

    // --- script.js : 채팅방 목록 (SSE) ---
    roomListNoMessage: { ko: '대화 내용이 없습니다.', en: 'No conversation yet.', ja: '会話内容がありません。', zh: '暂无对话内容。', ar: 'لا يوجد محادثة بعد.' },
    roomListImageSent: { ko: '사진을 보냈습니다.', en: 'Sent a photo.', ja: '写真を送りました。', zh: '发送了图片。', ar: 'أرسل صورة.' },
    roomListFileSent: { ko: '파일을 보냈습니다.', en: 'Sent a file.', ja: 'ファイルを送りました。', zh: '发送了文件。', ar: 'أرسل ملفًا.' },

    // --- script.js : 메시지 삭제 확인 모달 ---
    modalDeleteMessageTitle: { ko: '메시지 삭제', en: 'Delete Message', ja: 'メッセージ削除', zh: '删除消息', ar: 'حذف الرسالة' },
    modalDeleteMessageDesc: { ko: '메시지를 삭제하시겠습니까?', en: 'Are you sure you want to delete this message?', ja: 'このメッセージを削除しますか？', zh: '您确定要删除此消息吗？', ar: 'هل أنت متأكد أنك تريد حذف هذه الرسالة؟' },

    // --- script.js : 메시지 UI (displayMessage) ---
    deletedMessage: { ko: '삭제된 메시지입니다.', en: 'This message has been deleted.', ja: '削除されたメッセージです。', zh: '此消息已被删除。', ar: 'تم حذف هذه الرسالة.' },
    replyTypePhoto: { ko: '사진', en: 'Photo', ja: '写真', zh: '照片', ar: 'صورة' },
    replyTypeFile: { ko: '파일', en: 'File', ja: 'ファイル', zh: '文件', ar: 'ملف' },
    editedIndicator: { ko: '(수정됨)', en: '(edited)', ja: '(編集済み)', zh: '(已编辑)', ar: '(تم التعديل)' },

    // --- script.js : 캘린더 (이벤트 수정/삭제) ---
    toastCalendarUpdateFail: { ko: '날짜 변경에 실패했습니다. (권한 확인)', en: 'Failed to change date. (Check permissions)', ja: '日付の変更に失敗しました。(権限確認)', zh: '更改日期失败。(检查权限)', ar: 'فشل تغيير التاريخ. (تحقق من الأذونات)' },
    modalDeleteEventDesc: { ko: "이 일정을 '삭제'하시겠습니까?", en: "Are you sure you want to 'delete' this event?", ja: "この予定を「削除」しますか？", zh: "您确定要“删除”此日程吗？", ar: "هل أنت متأكد أنك تريد 'حذف' هذا الحدث؟" },
    toastCalendarDeleteSuccess: { ko: '삭제되었습니다.', en: 'Deleted successfully.', ja: '削除されました。', zh: '已删除。', ar: 'تم الحذف بنجاح.' },
    toastCalendarDeleteFail: { ko: '삭제에 실패했습니다. (권한 확인)', en: 'Failed to delete. (Check permissions)', ja: '削除に失敗しました。(権限確認)', zh: '删除失败。(检查权限)', ar: 'فشل الحذف. (تحقق من الأذونات)' },

    // --- script.js : 공용 캘린더 (이벤트 수정/삭제/복사) ---
    toastRoomCalendarUpdateFail: { ko: '날짜 변경에 실패했습니다. (채팅방 멤버 권한 확인)', en: 'Failed to change date. (Check room member permissions)', ja: '日付の変更に失敗しました。(チャットルームのメンバー権限確認)', zh: '更改日期失败。(检查聊天室成员权限)', ar: 'فشل تغيير التاريخ. (تحقق من أذونات أعضاء الغرفة)' },
    modalRoomEventActionDesc: { ko: '이 일정으로 무엇을 하시겠습니까?', en: 'What would you like to do with this event?', ja: 'この予定で何をしますか？', zh: '您想对此日程执行什么操作？', ar: 'ماذا تريد أن تفعل بهذا الحدث؟' },
    btnCopyCalendar: { ko: '내 캘린더로 \n복사', en: 'Copy to \nMy Calendar', ja: 'マイカレンダーに\nコピー', zh: '复制到\n我的日历', ar: 'نسخ إلى \nتقويمي' },
    toastCopyCalendarSuccess: { ko: '개인 캘린더에 성공적으로 복사되었습니다.', en: 'Successfully copied to your personal calendar.', ja: '個人カレンダーに正常にコピーされました。', zh: '已成功复制到您的个人日历。', ar: 'تم النسخ إلى تقويمك الشخصي بنجاح.' },
    toastCopyCalendarFail: { ko: '일정 복사에 실패했습니다.', en: 'Failed to copy event.', ja: '予定のコピーに失敗しました。', zh: '复制日程失败。', ar: 'فشل نسخ الحدث.' },
    toastCopyCalendarError: { ko: '복사 중 오류가 발생했습니다.', en: 'An error occurred while copying.', ja: 'コピー中にエラーが発生しました。', zh: '复制时出错。', ar: 'حدث خطأ أثناء النسخ.' },
    toastRoomCalendarDeleteSuccess: { ko: '공용 일정이 삭제되었습니다.', en: 'Shared event has been deleted.', ja: '共有予定が削除されました。', zh: '共享日程已删除。', ar: 'تم حذف الحدث المشترك.' },
    toastRoomCalendarDeleteFail: { ko: '삭제에 실패했습니다. (채팅방 멤버 권한 확인)', en: 'Failed to delete. (Check room member permissions)', ja: '削除に失敗しました。(チャットルームのメンバー権限確認)', zh: '删除失败。(检查聊天室成员权限)', ar: 'فشل الحذف. (تحقق من أذونات أعضاء الغرفة)' },
    errorUpdatePermission: { ko: '수정 권한이 없거나 서버 오류 발생', en: 'No permission to modify or server error occurred', ja: '修正権限がないか、サーバーエラーが発生しました', zh: '没有修改权限或发生服务器错误', ar: 'لا يوجد إذن للتعديل أو حدث خطأ في الخادم' },
    errorDeletePermission: { ko: '삭제 권한이 없거나 서버 오류 발생', en: 'No permission to delete or server error occurred', ja: '削除権限がないか、サーバーエラーが発生しました', zh: '没有删除权限或发生服务器错误', ar: 'لا يوجد إذن للحذف أو حدث خطأ في الخادم' },

    // --- script.js : 메시지 메뉴 툴팁 (displayMessage) ---
    titleAnnounce: { ko: '이 글을 공지로', en: 'Set as announcement', ja: 'お知らせに設定', zh: '设为公告', ar: 'تعيين كإعلان' },
    titleReply: { ko: '답장하기', en: 'Reply', ja: '返信', zh: '回复', ar: 'رد' },
    titleLoadTranslation: { ko: '번역 불러오기', en: 'Load translation', ja: '翻訳を読み込む', zh: '加载翻译', ar: 'تحميل الترجمة' },

    // --- script.js : 개인 일정 저장 알림 ---
    toastPersonalCalendarSaveSuccess: { ko: '개인 일정이 저장되었습니다.', en: 'Personal event has been saved.', ja: '個人予定が保存されました。', zh: '个人日程已保存。', ar: 'تم حفظ الحدث الشخصي.' },
    toastPersonalCalendarSaveFail: { ko: '저장에 실패했습니다.', en: 'Failed to save.', ja: '保存に失敗しました。', zh: '保存失败。', ar: 'فشل الحفظ.' },
    toastPersonalCalendarSaveError: { ko: '저장 중 오류가 발생했습니다.', en: 'An error occurred while saving.', ja: '保存中にエラーが発生しました。', zh: '保存时出错。', ar: 'حدث خطأ أثناء الحفظ.' },


};

export default translations;