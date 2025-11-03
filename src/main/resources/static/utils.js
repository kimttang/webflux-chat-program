export function getCharTypePriority(char) {
    if (!char) return 5; // 기타
    const code = char.charCodeAt(0);
    // 1. Numbers (0-9)
    if (code >= 48 && code <= 57) return 1;
    // 2. Hangul (가-힣 및 ㄱ-ㅎ)
    if ((code >= 44032 && code <= 55203) || (code >= 12593 && code <= 12643)) return 2;
    // 3. Lowercase English (a-z)
    if (code >= 97 && code <= 122) return 3;
    // 4. Uppercase English (A-Z)
    if (code >= 65 && code <= 90) return 4;
    // 5. Other
    return 5;
}

// [수정] lang 인수를 받도록 변경
export function sortFriends(a, b, lang) {
    const aName = a.nickname;
    const bName = b.nickname;
    if (!aName) return 1;
    if (!bName) return -1;
    const aType = getCharTypePriority(aName[0]);
    const bType = getCharTypePriority(bName[0]);
    if (aType !== bType) {
        return aType - bType;
    }
    // [수정] 'ko' 대신 lang 변수 사용
    return aName.localeCompare(bName, lang);
}

// [수정] lang 인수를 받도록 변경
export function formatMessageTime(isoString, lang) {
    if (!isoString) return '';
    const date = new Date(isoString);

    // 'ko' -> 'ko-KR', 'en' -> 'en-US' 등으로 변환
    let locale;
    switch (lang) {
        case 'en': locale = 'en-US'; break;
        case 'ja': locale = 'ja-JP'; break;
        case 'zh': locale = 'zh-CN'; break;
        case 'ar': locale = 'ar-EG'; break;
        case 'ko':
        default:   locale = 'ko-KR';
    }

    // [수정] 'ko-KR' 대신 locale 변수 사용
    return date.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

export function getKSTDateString(isoString) {
    const date = new Date(isoString);
    // KST (Asia/Seoul) 기준으로 YYYY-MM-DD 형식의 날짜 문자열 반환
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

// [수정] lang 인수를 받도록 변경
export function createDateSeparatorElement(isoString, lang) {
    const date = new Date(isoString);

    // 'ko' -> 'ko-KR', 'en' -> 'en-US' 등으로 변환
    let locale;
    switch (lang) {
        case 'en': locale = 'en-US'; break;
        case 'ja': locale = 'ja-JP'; break;
        case 'zh': locale = 'zh-CN'; break;
        case 'ar': locale = 'ar-EG'; break;
        case 'ko':
        default:   locale = 'ko-KR';
    }

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        timeZone: 'Asia/Seoul'
    };

    // [수정] 'ko-KR' 대신 locale 변수 사용
    const formattedDate = `🗓️ ${date.toLocaleDateString(locale, options)} >`;

    const separator = document.createElement('div');
    separator.className = 'date-separator';
    separator.innerHTML = `<span>${formattedDate}</span>`;
    return separator;
}