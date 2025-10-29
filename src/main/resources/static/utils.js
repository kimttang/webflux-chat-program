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

export function sortFriends(a, b) {
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
    // localeCompare는 기본적으로 오름차순입니다. (aName이 bName보다 앞이면 -1)
    return aName.localeCompare(bName, 'ko');
}

export function formatMessageTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    // 한국 시간 기준으로, 오전/오후와 시:분(2자리) 형식으로 변환
    return date.toLocaleTimeString('ko-KR', {
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

export function createDateSeparatorElement(isoString) {
    const date = new Date(isoString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        timeZone: 'Asia/Seoul'
    };
    const formattedDate = `🗓️ ${date.toLocaleDateString('ko-KR', options)} >`;

    const separator = document.createElement('div');
    separator.className = 'date-separator';
    separator.innerHTML = `<span>${formattedDate}</span>`;
    return separator;
}