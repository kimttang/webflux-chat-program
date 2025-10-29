// --- 로그인/회원가입 화면 번역 추가 ---
const translations = {
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
    alertFileUploadFail: { ko: '파일 업로드에 실패했습니다.', en: 'File upload failed.', ja: 'ファイルのアップロードに失敗しました。', zh: '文件上传失败。', ar: 'فشل تحميل الملف.' }
};

export default translations;