// 카카오 REST API 키
const KAKAO_API_KEY = "9d24e2454b7ecf5ed014931df91f0c20";

// 하단 도서 추천 섹션 카카오 API 검색 설정
// [1] 작가의 대표 작품 (우주 3부작 등)
const SERIES_QUERY = "앤디 위어";
const SERIES_SIZE = 10;
const SERIES_TARGET_TITLES = ['마션', '아르테미스'];

// [2] 함께 구매한 작품
const BOUGHT_TOGETHER_QUERY = "영화";
const BOUGHT_TOGETHER_SIZE = 18;

// [3] 함께 둘러본 작품
const VIEWED_TOGETHER_QUERY = '원작소설';
const VIEWED_TOGETHER_SIZE = 18;

// [4] SF 소설 베스트
const SF_BEST_QUERY = "SF소설";
const SF_BEST_SIZE = 18;

let tabData = {
    desc: '',
    toc: '',
    review: '',
    author_intro: ''
};

const authorProfileData = {
    'author': {
        name: '앤디 위어 <span class="eng-name">Andy Weir</span>',
        nation: '미국',
        birth: '1972년 6월 16일',
        edu: '캘리포니아 대학교 샌디에이고캠퍼스 컴퓨터공학 학사',
        career: '산디아 국립연구소 컴퓨터 프로그래머',
        debut: '소설 \'마션\'',
        link: '<a href="#" class="author-link">공식 사이트</a> <span class="link-divider">|</span> <a href="#" class="author-link">트위터</a>',
        date: '2018.12.03 업데이트'
    },
    'translator': {
        name: '강동혁',
        nation: '대한민국',
        birth: '-',
        edu: '서울대학교 사회학과, 동 대학원 영문학과 마침',
        career: '전문 번역가',
        debut: '-',
        link: '-',
        date: '2021.05.10 업데이트'
    }
};

function renderAuthorProfile(type) {
    const data = authorProfileData[type];
    if(!data) return '';
    return `
        <div class="author-header">
            <h2>${data.name}</h2>
            <button class="btn-author-alert">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> 
                작가 신간 알림·소식
            </button>
        </div>
        <table class="author-meta-table">
            <tbody>
                <tr><th>국적</th><td>${data.nation}</td></tr>
                <tr><th>출생</th><td>${data.birth}</td></tr>
                <tr><th>학력</th><td>${data.edu}</td></tr>
                <tr><th>경력</th><td>${data.career}</td></tr>
                <tr><th>데뷔</th><td>${data.debut}</td></tr>
                <tr><th>링크</th><td>${data.link}</td></tr>
            </tbody>
        </table>
        <div class="update-date">${data.date}</div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchBookDetail();
    fetchSidebarBest("SF소설", "sidebar-best-list");

    // 작품 정보 탭 클릭 로직
    const tabs = document.querySelectorAll('.book-desc-section, .detail_bottom > .book-tabs .tab');
    // 위 선택자가 조금 복잡할 수 있으니 명확하게 가져옵니다.
    const detailTabs = document.querySelectorAll('.detail_bottom .book-tabs .tab');
    detailTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            detailTabs.forEach(t => t.classList.remove('active'));
            const target = e.target.closest('.tab');
            target.classList.add('active');
            
            const tabId = target.getAttribute('data-tab');
            if (tabId && tabData[tabId]) {
                document.getElementById('detail-description').innerHTML = tabData[tabId];
            }
        });
    });

    // 작가 탭 클릭 로직
    const authorTabs = document.querySelectorAll('#author-tabs .tab');
    const authorBadgesArea = document.querySelector('.author-badges');
    
    authorTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            authorTabs.forEach(t => t.classList.remove('active'));
            const target = e.target.closest('.tab');
            target.classList.add('active');
            
            const tabId = target.getAttribute('data-authortab');
            const contentBox = document.querySelector('.author-profile-detail');
            
            if (tabId === 'profile') {
                contentBox.style.display = 'block';
                if(authorBadgesArea) authorBadgesArea.style.display = 'flex';
                
                // 현재 활성화된 뱃지에 맞춰 프로필 렌더링
                const activeBadge = document.querySelector('.author-badges .badge.active');
                const type = activeBadge && activeBadge.innerText.includes('번역') ? 'translator' : 'author';
                contentBox.innerHTML = renderAuthorProfile(type);
                
            } else if (tabId === 'intro') {
                if(authorBadgesArea) authorBadgesArea.style.display = 'none';
                contentBox.innerHTML = `
                    <div class="book-desc-section" id="author-intro-section">
                        <div class="desc-content-wrap">
                            <div class="desc-content" style="font-size:14px; line-height:1.8; color:#666;">
                                ${tabData.author_intro || '작가 소개 내용이 없습니다.'}
                            </div>
                            <div class="desc-fade"></div>
                        </div>
                        <button class="btn-more-desc" id="btn-more-author-intro">
                            <span class="btn-text">더보기</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-arrow" style="vertical-align: middle; margin-left: 2px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                    </div>
                `;

                // 더보기/접기 이벤트 등록
                const btnIntroMore = document.getElementById('btn-more-author-intro');
                const introSection = document.getElementById('author-intro-section');
                if (btnIntroMore && introSection) {
                    btnIntroMore.addEventListener('click', () => {
                        const isExpanded = introSection.classList.toggle('expanded');
                        btnIntroMore.querySelector('.btn-text').innerText = isExpanded ? '접기' : '더보기';
                    });
                }
            }
        });
    });

    // 뱃지 (저자/번역) 클릭 로직
    const badges = document.querySelectorAll('.author-badges .badge');
    badges.forEach((badge, index) => {
        badge.addEventListener('click', (e) => {
            badges.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const type = index === 1 ? 'translator' : 'author';
            const contentBox = document.querySelector('.author-profile-detail');
            contentBox.innerHTML = renderAuthorProfile(type);
        });
    });

    // 작품 정보 더보기/접기 로직
    const btnMore = document.getElementById('btn-more-desc');
    const descSection = document.getElementById('desc-section');
    if (btnMore && descSection) {
        btnMore.addEventListener('click', () => {
            const isExpanded = descSection.classList.toggle('expanded');
            btnMore.querySelector('.btn-text').innerText = isExpanded ? '접기' : '더보기';
        });
    }
});

// 카카오 API 응답에서 중복된 제목을 제거하고 이미지가 있는 도서만 추출하는 헬퍼 함수
function getUniqueBooks(documents, limit) {
    const uniqueDocs = [];
    const titles = new Set();
    for (const doc of documents) {
        // 제목 정규화: 시리즈, 분권(1권, 2권 등) 도배 방지
        let normalizedTitle = doc.title.toLowerCase();
        
        // 1. 괄호 안의 내용(양장본, 세트 등) 및 부제(콜론, 하이픈 이후) 제거
        normalizedTitle = normalizedTitle.replace(/\(.*?\)|\[.*?\]/g, '');
        normalizedTitle = normalizedTitle.split(':')[0].split('-')[0];
        
        // 2. n권, n부, vol.n, 상/중/하 등 연속된 시리즈 표시자 제거
        normalizedTitle = normalizedTitle.replace(/\d+\s*(권|부|화|집|장)/g, '');
        normalizedTitle = normalizedTitle.replace(/상|중|하/g, '');
        normalizedTitle = normalizedTitle.replace(/(vol|part)\.?\s*\d+/gi, '');
        
        // 3. 특수기호 및 공백 완전 제거
        normalizedTitle = normalizedTitle.replace(/[^a-z0-9가-힣]/g, '');

        // 4. 문자열 끝에 남은 숫자 제거 (예: 철종2 -> 철종)
        // 단, 1984처럼 제목 자체가 숫자인 경우를 대비해 예외 처리
        let coreTitle = normalizedTitle.replace(/\d+$/, '');
        if (coreTitle.length > 0) {
            normalizedTitle = coreTitle;
        }

        if (doc.thumbnail && !titles.has(normalizedTitle)) {
            titles.add(normalizedTitle);
            uniqueDocs.push(doc);
            if (uniqueDocs.length >= limit) break;
        }
    }
    return uniqueDocs;
}

function extractSection(text, title) {
    const startTag = `<b>&lt;${title}&gt;</b>`;
    const startIdx = text.indexOf(startTag);
    if(startIdx === -1) return '';
    
    let endIdx = text.length;
    const nextIdx = text.indexOf('<b>&lt;', startIdx + startTag.length);
    if(nextIdx !== -1) {
        endIdx = nextIdx;
    }
    return text.substring(startIdx + startTag.length, endIdx).trim().replace(/\n/g, '<br>');
}

async function fetchBookDetail() {
    try {
        const response = await fetch('./data/book_detail.json');
        if (!response.ok) throw new Error('Failed to load book_detail.json');
        const data = await response.json();

        // 1. 기본 정보 채우기
        const categoryStr = "소설 > SF 소설 > 소설 > 영미소설";
        document.getElementById('detail-category').innerText = categoryStr;
        
        // 제목 바인딩 2군데
        document.getElementById('detail-title').innerText = data.title;
        const subTitleEl = document.getElementById('book-title-sub');
        if(subTitleEl) subTitleEl.innerText = data.title;

        // 평점
        document.getElementById('detail-score').innerText = data.grade;
        document.getElementById('detail-count').innerText = `(${data.grade_count}명)`;

        // 저자 및 출판사
        document.getElementById('detail-author-publisher').innerHTML = 
            `<b>${data.author}</b> 저자 | <b>${data.translator}</b> 번역<br>${data.publisher} 출판`;

        // 작품 소개 파싱
        if (data.description) {
            const rawDesc = data.description;
            tabData.desc = extractSection(rawDesc, '책소개') || rawDesc.replace(/\n/g, '<br>');
            tabData.review = extractSection(rawDesc, '출판사 서평');
            tabData.toc = extractSection(rawDesc, '목차');
            tabData.author_intro = extractSection(rawDesc, '저자 소개');

            // 탭 초기값(작품 소개) 렌더링
            document.getElementById('detail-description').innerHTML = tabData.desc;
        }

        // 2. 부가 정보 (회색 박스) 채우기
        if(data.publish_date) document.getElementById('meta-publish').innerText = data.publish_date;
        if(data.file_info) document.getElementById('meta-file').innerText = data.file_info;
        if(data.isbn) document.getElementById('meta-isbn').innerText = data.isbn;
        
        if(data.support_tts) {
            const svgTTS = `<svg aria-label="TTS(듣기) 지원" fill="none" height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg" style="vertical-align: text-bottom;"><path clip-rule="evenodd" d="M2.4375 8.73453V9.67578H2.44212C2.43906 9.70808 2.4375 9.74081 2.4375 9.7739V14.287C2.4375 14.855 2.89801 15.3155 3.46607 15.3155H6.03763C6.60569 15.3155 7.0662 14.855 7.0662 14.287V9.7739C7.0662 9.20584 6.60569 8.74533 6.03763 8.74533H3.72V8.73453C3.72 5.82054 6.08226 3.45828 8.99625 3.45828C11.9102 3.45828 14.2725 5.82054 14.2725 8.73453V8.74533H11.9598C11.3918 8.74533 10.9313 9.20584 10.9313 9.7739V14.287C10.9313 14.855 11.3918 15.3155 11.9598 15.3155H14.5314C15.0994 15.3155 15.56 14.855 15.56 14.287V9.7739C15.56 9.73961 15.5583 9.70571 15.555 9.67228V8.73453C15.555 5.11223 12.6185 2.17578 8.99625 2.17578C5.37395 2.17578 2.4375 5.11223 2.4375 8.73453ZM3.72321 10.031V14.0298H5.78048V10.031H3.72321ZM12.217 14.0298V10.031H14.2742V14.0298H12.217Z" fill="#787878" fill-rule="evenodd"></path></svg>`;
            document.getElementById('meta-tts').innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;color:#787878;">${svgTTS} TTS(듣기) 지원</span>`;
        }
        
        // 지원 기기 (배열 형태)
        if(data.support_devices) {
            const supportEl = document.getElementById('meta-support');
            
            const svgApp = `<svg aria-label="앱 지원" fill="none" height="1em" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;"><path clip-rule="evenodd" d="M7.91564 2.57361C6.67024 2.57361 5.66064 3.5832 5.66064 4.82861V19.1715C5.66064 20.4169 6.67024 21.4265 7.91564 21.4265H16.0871C17.3325 21.4265 18.3421 20.4169 18.3421 19.1715V4.82861C18.3421 3.58321 17.3325 2.57361 16.0871 2.57361H7.91564ZM7.37064 4.82861C7.37064 4.52761 7.61465 4.28361 7.91564 4.28361H16.0871C16.3881 4.28361 16.6321 4.52761 16.6321 4.82861V19.1715C16.6321 19.4725 16.3881 19.7165 16.0871 19.7165H7.91564C7.61465 19.7165 7.37064 19.4725 7.37064 19.1715V4.82861ZM11.1429 16.6294C10.6707 16.6294 10.2879 17.0122 10.2879 17.4844C10.2879 17.9566 10.6707 18.3394 11.1429 18.3394H12.8572C13.3294 18.3394 13.7122 17.9566 13.7122 17.4844C13.7122 17.0122 13.3294 16.6294 12.8572 16.6294H11.1429Z" fill="currentColor" fill-rule="evenodd"></path></svg>`;
            const svgPC = `<svg aria-label="PC뷰어 지원" fill="none" height="1em" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;"><path clip-rule="evenodd" d="M2.56641 5.68073C2.56641 4.43414 3.57696 3.42358 4.82355 3.42358H19.1736C20.4201 3.42358 21.4307 4.43414 21.4307 5.68073V13.8607C21.4307 15.1073 20.4201 16.1179 19.1735 16.1179H12.8407C12.8515 16.1722 12.8571 16.2283 12.8571 16.2857V18.8572H15.0844C15.5577 18.8572 15.9415 19.2409 15.9415 19.7143C15.9415 20.1877 15.5577 20.5715 15.0844 20.5715H8.91293C8.43954 20.5715 8.05579 20.1877 8.05579 19.7143C8.05579 19.2409 8.43954 18.8572 8.91293 18.8572H11.1428V16.2857C11.1428 16.2283 11.1485 16.1722 11.1593 16.1179H4.82355C3.57696 16.1179 2.56641 15.1073 2.56641 13.8607V5.68073ZM4.82355 5.13787C4.52374 5.13787 4.28069 5.38091 4.28069 5.68073V13.8607C4.28069 14.1605 4.52374 14.4036 4.82355 14.4036H19.1735C19.4734 14.4036 19.7164 14.1605 19.7164 13.8607V5.68073C19.7164 5.38091 19.4734 5.13787 19.1736 5.13787H4.82355Z" fill="currentColor" fill-rule="evenodd"></path></svg>`;
            const svgPaper = `<svg aria-label="PAPER 지원" fill="none" height="1em" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;"><path clip-rule="evenodd" d="M14.0557 3.40002H15.77V3.40006H17.4571C18.7037 3.40006 19.7142 4.41062 19.7142 5.6572V18.2858C19.7142 19.5324 18.7037 20.5429 17.4571 20.5429H6.54279C5.2962 20.5429 4.28564 19.5324 4.28564 18.2858V5.6572C4.28564 4.41062 5.2962 3.40006 6.54279 3.40006H14.0557V3.40002ZM14.0557 5.11435H6.54279C6.24298 5.11435 5.99993 5.35739 5.99993 5.6572V18.2858C5.99993 18.5856 6.24298 18.8286 6.54279 18.8286H14.0557V17.9263V5.11435ZM15.77 18.8286H17.4571C17.7569 18.8286 17.9999 18.5856 17.9999 18.2858V5.6572C17.9999 5.35739 17.7569 5.11435 17.4571 5.11435H15.77V17.9263V18.8286Z" fill="currentColor" fill-rule="evenodd"></path></svg>`;
            const svgWebNo = `<svg aria-label="웹 미지원" fill="none" height="1em" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;"><path clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z" fill="#ccc" fill-rule="evenodd"></path></svg>`;
            
            supportEl.innerHTML = data.support_devices.map(dev => {
                let icon = '';
                let color = '#787878';
                
                if(dev.includes('앱')) icon = svgApp;
                else if(dev.includes('PC')) icon = svgPC;
                else if(dev.includes('PAPER')) icon = svgPaper;
                else if(dev.includes('웹')) {
                    icon = svgWebNo;
                    color = '#ccc';
                }
                else icon = svgApp; 
                
                return `<span style="display:inline-flex;align-items:center;gap:4px;color:${color};">${icon} <span style="${color === '#ccc' ? 'text-decoration: line-through;' : ''}">${dev}</span></span>`;
            }).join('<span style="color:#d1d5d9; margin: 0 6px;">|</span>');
        }

        // 3. 커버 이미지 카카오 검색
        searchCoverFromKakao(data.title);

    } catch (e) {
        console.error(e);
    }
}

async function searchCoverFromKakao(title) {
    try {
        const query = encodeURIComponent(title);
        const url = `https://dapi.kakao.com/v3/search/book?query=${query}`;
        const response = await fetch(url, {
            headers: {
                "Authorization": `KakaoAK ${KAKAO_API_KEY}`
            }
        });
        const result = await response.json();
        const doc = result.documents.find(d => d.thumbnail !== "");
        
        const coverImg = document.getElementById('detail-cover');
        if (doc && doc.thumbnail) {
            coverImg.src = doc.thumbnail;
        } else {
            coverImg.src = "https://img.ridicdn.net/cover/510001099/xxlarge#1"; 
        }
    } catch (e) {
        console.error(e);
        document.getElementById('detail-cover').src = "https://img.ridicdn.net/cover/510001099/xxlarge#1";
    }
}

// 우측 사이드바 베스트 10위 리스트 생성
async function fetchSidebarBest(query, elementId) {
    try {
        const url = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=15`;
        const response = await fetch(url, {
            headers: {
                "Authorization": `KakaoAK ${KAKAO_API_KEY}`
            }
        });
        const data = await response.json();
        
        // 10개만 추출
        const validBooks = data.documents.slice(0, 10);
        
        const list = document.getElementById(elementId);
        if (!list) return;

        list.innerHTML = validBooks.map((doc, index) => {
            const rank = index + 1;
            // 1~3위는 주황색(#fa722e), 4위부터는 회색(#999)
            const color = rank <= 3 ? "#fa722e" : "#999";
            
            return `
                <li class="sidebar-best-item">
                    <span class="sidebar-best-rank" style="color: ${color};">${rank}</span>
                    <a href="#" class="sidebar-best-title">${doc.title}</a>
                </li>
            `;
        }).join('');
    } catch (e) {
        console.error(e);
    }
}

// 작가의 대표 작품 검색 (하단 슬라이더)
async function fetchAuthorWorks() {
    try {
        const query = encodeURIComponent("앤디 위어");
        const url = `https://dapi.kakao.com/v3/search/book?query=${query}&size=5`;
        const response = await fetch(url, {
            headers: {
                "Authorization": `KakaoAK ${KAKAO_API_KEY}`
            }
        });
        const data = await response.json();
        
        const list = document.getElementById("author-works-list");
        if (!list) return;

        list.innerHTML = data.documents.map((doc, index) => {
            const authors = doc.authors.join(', ');
            let ronlyBadge = index === 0 ? '<div class="ronly-badge">R ONLY</div>' : ''; // 첫번째 항목에만 임의 배치
            
            return `
            <div class="discovery-item">
                <a href="#">
                    <div class="discovery-cover-wrapper">
                        ${ronlyBadge}
                        <img src="${doc.thumbnail || 'https://via.placeholder.com/120x174'}" alt="${doc.title}" class="discovery-cover">
                    </div>
                    <div class="discovery-text" style="margin-top: 8px;">
                        <span class="discovery-title">${doc.title}</span>
                        <span class="discovery-author">${authors}</span>
                        <span class="discovery-rating">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fa722e" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                            4.9 <span style="font-weight:400; color:#999;">(1,234)</span>
                        </span>
                    </div>
                </a>
            </div>
            `;
        }).join('');
    } catch (e) {
        console.error(e);
    }
}
document.addEventListener('DOMContentLoaded', fetchAuthorWorks);

let currentReviewData = null;

// 리뷰 데이터 로딩 및 렌더링
async function fetchReviews() {
    try {
        const response = await fetch('./data/reviews.json');
        if (!response.ok) throw new Error('Failed to load reviews.json');
        currentReviewData = await response.json();
        
        // 1. 리뷰 상단 요약 업데이트
        const sum = currentReviewData.summary;
        const totalScoreEl = document.getElementById('review-total-score');
        const totalCountEl = document.getElementById('review-total-count');
        const tabBuyerEl = document.getElementById('tab-buyer-count');
        const tabAllEl = document.getElementById('tab-all-count');
        
        if (totalScoreEl) totalScoreEl.innerText = sum.rating.toFixed(1);
        if (totalCountEl) totalCountEl.innerText = sum.totalCount.toLocaleString() + '명 평가';
        if (tabBuyerEl) tabBuyerEl.innerText = '구매자 ' + sum.buyerCount.toLocaleString();
        if (tabAllEl) tabAllEl.innerText = '전체 ' + sum.allCount.toLocaleString();
        
        // 2. 초기 렌더링 (구매자 리뷰)
        renderReviewList('buyer');
        
        // 3. 탭 전환 이벤트 리스너 등록
        if (tabBuyerEl && tabAllEl) {
            tabBuyerEl.addEventListener('click', () => {
                tabBuyerEl.classList.add('active');
                tabAllEl.classList.remove('active');
                renderReviewList('buyer');
            });
            tabAllEl.addEventListener('click', () => {
                tabAllEl.classList.add('active');
                tabBuyerEl.classList.remove('active');
                renderReviewList('all');
            });
        }
    } catch (e) {
        console.error(e);
    }
}

function renderReviewList(type) {
    if(!currentReviewData) return;
    const listContainer = document.getElementById('review-list-container');
    if (!listContainer) return;
    
    const reviews = type === 'buyer' ? currentReviewData.buyerReviews : currentReviewData.allReviews;
    
    listContainer.innerHTML = reviews.map(r => {
        // 별점 렌더링
        let starsHtml = '';
        for(let i=0; i<5; i++) {
            const color = i < r.rating ? '#fa722e' : '#e6e8eb';
            starsHtml += `<svg width="12" height="12" viewBox="0 0 24 24" fill="${color}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`;
        }
        
        // 구매자 뱃지
        const buyerBadge = r.isBuyer ? '<span class="badge-buyer">구매자</span>' : '';
        
        return `
        <li class="review-item">
            <div class="review-item-stars">${starsHtml}</div>
            <div class="review-item-text">${r.text}</div>
            <div class="review-item-meta">
                <div class="review-item-info">
                    ${buyerBadge}
                    <span>${r.userId}</span>
                    <span>${r.date}</span>
                    <button style="border:none; background:none; font-size:12px; color:#999; cursor:pointer; margin-left:4px;">신고/차단</button>
                </div>
                <div class="review-item-actions">
                    <button class="btn-action">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        댓글 0
                    </button>
                    <button class="btn-action">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                        좋아요 ${r.likes || 0}
                    </button>
                </div>
            </div>
        </li>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', fetchReviews);

// 앤디 위어 우주 3부작 시리즈 동적 검색
async function fetchSeriesWorks() {
    try {
        const query = encodeURIComponent(SERIES_QUERY);
        const url = `https://dapi.kakao.com/v3/search/book?query=${query}&size=${SERIES_SIZE}`;
        const response = await fetch(url, {
            headers: {
                "Authorization": `KakaoAK ${KAKAO_API_KEY}`
            }
        });
        const data = await response.json();
        
        const list = document.getElementById("series-works-list");
        if (!list) return;

        // 설정된 타겟 타이틀을 필터링 (원본 이미지와 동일한 구성)
        const targetTitles = SERIES_TARGET_TITLES;
        let seriesBooks = [];
        
        for (let target of targetTitles) {
            const found = data.documents.find(doc => doc.title.includes(target));
            if (found) seriesBooks.push(found);
        }

        list.innerHTML = seriesBooks.map(doc => {
            const authors = doc.authors.join(', ');
            // API에는 별점 정보가 없으므로 캡처본 기준 하드코딩된 평점 사용
            let rating = doc.title.includes('마션') ? '4.8' : '4.1';
            let count = doc.title.includes('마션') ? '(359)' : '(195)';
            
            return `
            <div class="discovery-item">
                <a href="#">
                    <div class="discovery-cover-wrapper">
                        <img src="${doc.thumbnail || 'https://via.placeholder.com/120x174'}" alt="${doc.title}" class="discovery-cover">
                    </div>
                    <div class="discovery-text">
                        <span class="discovery-title" style="font-size: 16px; margin-bottom: 4px; white-space: normal; line-height: 1.4;">${doc.title}</span>
                        <span class="discovery-author">${authors}</span>
                        <span class="discovery-rating" style="margin-top: 4px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fa722e" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                            <span style="color: #fa722e;">${rating}</span> <span style="font-weight:400; color:#999;">${count}</span>
                        </span>
                    </div>
                </a>
            </div>
            `;
        }).join('');

        bindSliderEvents(list);
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', fetchSeriesWorks);

// 하단 추천 섹션 데이터 동적 로드 (함께 구매한 작품 등)
async function fetchAndRenderBooks(query, targetId, count = 6) {
    try {
        const url = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=${count}`;
        const response = await fetch(url, {
            headers: { "Authorization": `KakaoAK ${KAKAO_API_KEY}` }
        });
        const data = await response.json();
        
        const list = document.getElementById(targetId);
        if (!list) return;

        // 중복 제거 및 이미지 있는 도서 추출
        const validDocs = getUniqueBooks(data.documents, count);

        list.innerHTML = validDocs.map(doc => {
            const authors = doc.authors.join(', ');
            // API에 평점 정보가 없으므로 화면 표시용 임의의 난수 평점 생성
            const randomRating = (Math.random() * 0.7 + 4.2).toFixed(1);
            const randomCount = Math.floor(Math.random() * 2000) + 10;
            
            return `
            <div class="discovery-item">
                <a href="#">
                    <div class="discovery-cover-wrapper">
                        <img src="${doc.thumbnail || 'https://via.placeholder.com/120x174'}" alt="${doc.title}" class="discovery-cover">
                    </div>
                    <div class="discovery-text">
                        <span class="discovery-title" style="font-size: 16px; margin-bottom: 4px; white-space: normal; line-height: 1.4;">${doc.title}</span>
                        <span class="discovery-author">${authors}</span>
                        <span class="discovery-rating" style="margin-top: 4px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fa722e" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                            <span style="color: #fa722e;">${randomRating}</span> <span style="font-weight:400; color:#999;">(${randomCount})</span>
                        </span>
                    </div>
                </a>
            </div>
            `;
        }).join('');

        bindSliderEvents(list);
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderBooks(BOUGHT_TOGETHER_QUERY, "bought-together-list", BOUGHT_TOGETHER_SIZE);
    fetchAndRenderBooks(VIEWED_TOGETHER_QUERY, "viewed-together-list", VIEWED_TOGETHER_SIZE);
    fetchAndRenderBooks(SF_BEST_QUERY, "sf-best-list", SF_BEST_SIZE);
});

// 슬라이더 이전/다음 버튼 동적 처리 및 스크롤 이벤트 바인딩
function bindSliderEvents(list) {
    const container = list.parentElement;
    const prevBtn = container.querySelector('.prev-btn');
    const nextBtn = container.querySelector('.next-btn');
    if (!prevBtn || !nextBtn) return;

    const updateButtons = () => {
        // scrollWidth: 요소의 전체 스크롤 가능한 너비
        // clientWidth: 현재 화면에 보여지는 요소의 너비
        const maxScrollLeft = list.scrollWidth - list.clientWidth;
        
        // 스크롤이 맨 앞이 아니면 이전 버튼 표시
        if (list.scrollLeft > 5) {
            prevBtn.style.display = 'flex';
        } else {
            prevBtn.style.display = 'none';
        }
        
        // 스크롤이 맨 끝이 아니면 다음 버튼 표시 (여유 오차 10px)
        if (list.scrollLeft < maxScrollLeft - 10) {
            nextBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'none';
        }
    };

    list.addEventListener('scroll', updateButtons);

    nextBtn.addEventListener('click', () => {
        const firstItem = list.querySelector('.discovery-item');
        if (!firstItem) return;
        // 실제 아이템 너비 + gap(16px)을 정확히 계산하여 5칸씩 이동
        const itemWidth = firstItem.offsetWidth + 16;
        list.scrollBy({ left: itemWidth * 5, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        const firstItem = list.querySelector('.discovery-item');
        if (!firstItem) return;
        const itemWidth = firstItem.offsetWidth + 16;
        list.scrollBy({ left: -itemWidth * 5, behavior: 'smooth' });
    });

    // 렌더링 직후 DOM 크기 계산을 위해 약간의 딜레이 후 버튼 상태 초기화
    setTimeout(updateButtons, 100);
}
