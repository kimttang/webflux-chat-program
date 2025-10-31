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

export function sortFriends(a, b, lang) { // <--- (1) lang 인수 추가
    // User 객체의 nickname 필드를 기준으로 정렬합니다.
    const aName = a.nickname;
    const bName = b.nickname;
    if (!aName) return 1; // 이름 없는 경우 맨 뒤로
    if (!bName) return -1;
    const aType = getCharTypePriority(aName[0]);
    const bType = getCharTypePriority(bName[0]);
    // 1. 카테고리별 정렬 (숫자 > 한글 > 소문자 > 대문자 순)
    if (aType !== bType) {
        return aType - bType; // 오름차순 (1이 2보다 앞에)
    }
    // 2. 같은 카테고리 내에서는 '오름차순' 정렬
    // (3) 'ko' 대신, 넘겨받은 lang을 사용
    return aName.localeCompare(bName, lang);
}

export function formatMessageTime(isoString, lang) {
    if (!isoString) return '';
    const date = new Date(isoString);
    // (2) 'ko-KR' 대신, 'en-US', 'ja-JP' 등으로 자동 변환
    let locale;
    switch (lang) {
        case 'en': locale = 'en-US'; break;
        case 'ja': locale = 'ja-JP'; break;
        case 'zh': locale = 'zh-CN'; break;
        case 'ar': locale = 'ar-EG'; break;
        case 'ko':
        default:   locale = 'ko-KR';
    }

    // (3) 넘겨받은 locale로 시간 형식을 지정
    return date.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
export function getKSTDateString(isoString) {
    const date = new Date(isoString);
    // 'sv-SE' 로케일은 'YYYY-MM-DD' 형식을 보장합니다.
    return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
}

export function createDateSeparatorElement(isoString, lang) { // <--- (1) lang 인수 추가
    const date = new Date(isoString);

    // (2) 'ko-KR' 대신, 'en-US', 'ja-JP' 등으로 자동 변환
    let locale;
    switch (lang) {
        case 'en': locale = 'en-US'; break;
        case 'ja': locale = 'ja-JP'; break;
        case 'zh': locale = 'zh-CN'; break;
        case 'ar': locale = 'ar-EG'; break;
        case 'ko':
        default:   locale = 'ko-KR';
    }

    // (3) 사용자님이 사용 중인 options 객체 (KST 시간대 유지)
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        timeZone: 'Asia/Seoul'
    };

    // (4) 하드코딩된 'ko-KR' 대신, 동적 locale 변수를 사용
    const formattedDate = `🗓️ ${date.toLocaleDateString(locale, options)} >`;

    const separator = document.createElement('div');
    separator.className = 'date-separator';
    separator.innerHTML = `<span>${formattedDate}</span>`;
    return separator;
}