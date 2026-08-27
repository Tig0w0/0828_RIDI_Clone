// 카카오 REST API 키를 여기에 입력하세요
const KAKAO_API_KEY = "9d24e2454b7ecf5ed014931df91f0c20"; 

document.addEventListener('DOMContentLoaded', () => {
    fetchKakaoBanners("추천"); // 슬라이더 배너용 카카오 API 호출
    fetchKakaoBooks("소설"); // 추천 도서 리스트용 
    
    // 리디의 발견 포맷 (3개 섹션)
    fetchKakaoDiscoveryList("에세이", "discovery-list"); // 오늘 리디의 발견
    fetchKakaoDiscoveryList("신간", "new-works-list"); // 새로 나온 작품
    fetchKakaoDiscoveryList("신화", "odyssey-list"); // 오디세이랑 함께 보면 좋아요!

    fetchKakaoEvents("기획전"); // 이벤트
    fetchKakaoBest("베스트"); // 하단 베스트 섹션
    fetchKakaoNewRelease("신작"); // 하단 선 출간 신작

    // Scroll-to-top button logic
    const btnScrollTop = document.querySelector('.btn-scroll-top');
    if (btnScrollTop) {
        btnScrollTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

async function fetchKakaoBanners(query) {
    if (!KAKAO_API_KEY) {
        return;
    }

    try {
        const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=6`, {
            method: 'GET',
            headers: {
                'Authorization': `KakaoAK ${KAKAO_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Kakao API HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // 배너 카드에 어울리는 배경색과 뱃지 지정
        const badges = ["이벤트", "신간", "단독", "추천"];
        const colors = ["#1e3a2f", "#3a2f5b", "#1a464c", "#5a2f2f", "#2f405a", "#5a482f"];

        const formattedBanners = data.documents.map((doc, index) => {
            return {
                id: index + 1,
                coverUrl: doc.thumbnail ? doc.thumbnail : 'https://via.placeholder.com/140x200?text=No+Image',
                title: doc.title,
                subTitle: doc.authors.length > 0 ? doc.authors[0] : "작자미상",
                badge: badges[index % badges.length],
                bgColor: colors[index % colors.length]
            };
        });

        renderHeroBanners(formattedBanners);

    } catch (error) {
        console.error("카카오 배너 데이터를 불러오는데 실패했습니다:", error);
    }
}

async function fetchKakaoBooks(query) {
    if (!KAKAO_API_KEY) {
        console.warn("카카오 API 키가 입력되지 않았습니다. API 키를 입력해 주세요.");
        return;
    }

    try {
        const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=10`, {
            method: 'GET',
            headers: {
                'Authorization': `KakaoAK ${KAKAO_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Kakao API HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // 카카오 API 응답 데이터를 우리 렌더링 규격에 맞게 변환
        const formattedBooks = data.documents.map((doc, index) => {
            // 카카오 API는 별점/리뷰 수를 제공하지 않으므로 디자인 유지를 위해 랜덤(가상) 데이터 생성
            const mockRating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
            const mockReviewCount = Math.floor(Math.random() * 2000) + 10;
            
            return {
                id: index + 1,
                coverUrl: doc.thumbnail ? doc.thumbnail : 'https://via.placeholder.com/140x200?text=No+Image',
                title: doc.title,
                author: doc.authors.length > 0 ? doc.authors[0] : "작자미상",
                rating: mockRating,
                reviewCount: mockReviewCount,
                rank: index + 1
            };
        });

        renderReadingBooks(formattedBooks);

    } catch (error) {
        console.error("카카오 도서 데이터를 불러오는데 실패했습니다:", error);
    }
}

function renderHeroBanners(banners) {
    const container = document.getElementById('hero-slider-container');
    if (!container) return;
    
    // 카카오 API로 받아온 도서 정보를 배너 카드로 디자인하여 렌더링
    container.innerHTML = banners.map(banner => `
        <div class="slider-slide" style="background-color: ${banner.bgColor}; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 30px; text-align: center; color: white; border-radius: 12px;">
            <!-- 책 표지 영역 -->
            <div style="margin-bottom: 24px; box-shadow: 0 8px 16px rgba(0,0,0,0.4); border-radius: 4px; overflow: hidden; width: 140px; height: 200px;">
                <img src="${banner.coverUrl}" alt="cover" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <!-- 텍스트 정보 영역 -->
            <div class="slider-content" style="width: 100%; padding: 0 24px;">
                <span class="badge" style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-bottom: 12px; display: inline-block;">${banner.badge}</span>
                <h2 style="font-size: 18px; margin-bottom: 6px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${banner.title}</h2>
                <p style="font-size: 14px; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${banner.subTitle}</p>
            </div>
        </div>
    `).join('');

    // 배너 렌더링 후 슬라이더 초기화
    initHeroSlider();
}



function renderReadingBooks(books) {
    const list = document.getElementById('now-reading-list');
    if (!list) return;

    // 최대 9권만 표시 (3x3 그리드)
    const pageBooks = books.slice(0, 9);

    list.innerHTML = pageBooks.map(book => `
        <li class="book-grid-item">
            <a href="#">
                <div class="book-cover-wrapper">
                    <img src="${book.coverUrl}" alt="${book.title}" class="book-cover">
                </div>
                <div class="book-rank">${book.rank}</div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <div class="book-rating">
                        <svg width="1em" height="1em" viewBox="0 0 11 11" fill="none" class="star-icon"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 0L7.31151 3.30313L11 4.025L8.44643 6.75938L8.90476 10.5L5.5 8.90312L2.09524 10.5L2.55357 6.75938L0 4.00313L3.68849 3.30313L5.5 0Z" fill="currentColor"></path></svg>
                        <span class="rating-score">${book.rating}</span>
                        <span class="rating-count">(${book.reviewCount})</span>
                    </div>
                </div>
            </a>
        </li>
    `).join('');
}

async function fetchKakaoDiscoveryList(query, listId) {
    if (!KAKAO_API_KEY) return;
    try {
        const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=6`, {
            method: 'GET',
            headers: { 'Authorization': `KakaoAK ${KAKAO_API_KEY}` }
        });
        const data = await response.json();
        
        const list = document.getElementById(listId);
        if (!list) return;
        
        list.innerHTML = data.documents.map(doc => {
            // 별점 랜덤 부여 (0 또는 4점대)
            const rating = Math.random() > 0.5 ? 0 : (Math.random() * 1 + 4).toFixed(1);
            return `
            <li class="discovery-item">
                <a href="#">
                    <div class="discovery-cover-wrapper">
                        <img src="${doc.thumbnail ? doc.thumbnail : 'https://via.placeholder.com/150x200'}" alt="${doc.title}" class="discovery-cover">
                        <span class="discovery-badge">10%</span>
                    </div>
                    <div class="discovery-text">
                        <h3 class="discovery-title">${doc.title}</h3>
                        <p class="discovery-author">${doc.authors.length > 0 ? doc.authors[0] : '작자미상'}</p>
                        <div class="discovery-rating">
                            <svg width="1em" height="1em" viewBox="0 0 11 11" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 0L7.31151 3.30313L11 4.025L8.44643 6.75938L8.90476 10.5L5.5 8.90312L2.09524 10.5L2.55357 6.75938L0 4.00313L3.68849 3.30313L5.5 0Z" fill="currentColor"></path></svg>
                            <span>${rating}</span>
                        </div>
                    </div>
                </a>
            </li>
        `}).join('');
    } catch (e) {
        console.error(e);
    }
}

async function fetchKakaoEvents(query) {
    if (!KAKAO_API_KEY) return;
    try {
        const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=3`, {
            method: 'GET',
            headers: { 'Authorization': `KakaoAK ${KAKAO_API_KEY}` }
        });
        const data = await response.json();
        const colors = ["#129188", "#db5e16", "#2d3d5e"];
        
        const list = document.getElementById('event-list');
        if (!list) return;

        list.innerHTML = data.documents.map((doc, idx) => `
            <a href="#" class="event-item" style="background-color: ${colors[idx % colors.length]};">
                <div class="event-info">
                    <span>${doc.title}</span>
                </div>
                <img src="${doc.thumbnail ? doc.thumbnail : 'https://via.placeholder.com/50x75'}" alt="${doc.title}" class="event-cover">
            </a>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function fetchKakaoBest(query) {
    if (!KAKAO_API_KEY) return;
    try {
        const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=9`, {
            method: 'GET',
            headers: { 'Authorization': `KakaoAK ${KAKAO_API_KEY}` }
        });
        const data = await response.json();
        
        const list = document.getElementById('best-list');
        if (!list) return;

        list.innerHTML = data.documents.map((doc, idx) => {
            const rating = (Math.random() * 1 + 4).toFixed(1); 
            const reviewCount = Math.floor(Math.random() * 500) + 10;
            return `
            <li class="book-grid-item">
                <a href="#">
                    <div class="book-cover-wrapper">
                        <img src="${doc.thumbnail || 'https://via.placeholder.com/120x174'}" alt="${doc.title}" class="book-cover">
                    </div>
                    <div class="book-rank">${idx + 1}</div>
                    <div class="book-info">
                        <h3 class="book-title">${doc.title}</h3>
                        <p class="book-author">${doc.authors.length > 0 ? doc.authors[0] : '작자미상'}</p>
                        <div class="book-rating">
                            <svg width="1em" height="1em" viewBox="0 0 11 11" fill="none" class="star-icon"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 0L7.31151 3.30313L11 4.025L8.44643 6.75938L8.90476 10.5L5.5 8.90312L2.09524 10.5L2.55357 6.75938L0 4.00313L3.68849 3.30313L5.5 0Z" fill="currentColor"></path></svg>
                            <span class="rating-score">${rating}</span>
                            <span class="rating-count">(${reviewCount})</span>
                        </div>
                    </div>
                </a>
            </li>
        `}).join('');
    } catch (e) {
        console.error(e);
    }
}

async function fetchKakaoNewRelease(query) {
    if (!KAKAO_API_KEY) return;
    try {
        // We will fetch 6 items so the slider can move once (shows 3, slides to next 3)
        const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=6`, {
            method: 'GET',
            headers: { 'Authorization': `KakaoAK ${KAKAO_API_KEY}` }
        });
        const data = await response.json();
        
        const list = document.getElementById('new-release-list');
        if (!list) return;

        const colors = ["#8a1a38", "#2a3b5c", "#1a7c3a"]; // Red, Blue, Green

        list.innerHTML = data.documents.map((doc, idx) => `
            <li class="new-release-item">
                <a href="#">
                    <div class="new-release-bg" style="background-color: ${colors[idx % colors.length]};">
                        <img src="${doc.thumbnail || 'https://via.placeholder.com/90x130'}" alt="${doc.title}" class="new-release-cover">
                    </div>
                    <div class="new-release-info">
                        <p class="new-release-desc">${doc.contents.slice(0, 25)}...</p>
                        <h3 class="new-release-title">${doc.title}</h3>
                    </div>
                </a>
            </li>
        `).join('');

        initNewReleaseSlider();
    } catch (e) {
        console.error(e);
    }
}

function initNewReleaseSlider() {
    const container = document.getElementById('new-release-list');
    const btnPrev = document.getElementById('new-release-prev');
    const btnNext = document.getElementById('new-release-next');
    
    if (!container || !btnPrev || !btnNext) return;

    let currentIndex = 0;
    // We show 3 items at a time out of 6. So we can slide exactly once.
    const maxIndex = 1; 

    function updateSlider() {
        const itemWidth = container.children[0].offsetWidth;
        const gap = 16;
        // Move by 3 items
        const translateX = -(itemWidth * 3 + gap * 3) * currentIndex;
        container.style.transform = `translateX(${translateX}px)`;

        // Non-infinite slider logic
        btnPrev.style.display = currentIndex === 0 ? 'none' : 'flex';
        btnNext.style.display = currentIndex === maxIndex ? 'none' : 'flex';
    }

    btnPrev.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    btnNext.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlider();
        }
    });

    // Handle window resize
    window.addEventListener('resize', updateSlider);
}

function initHeroSlider() {
    const container = document.getElementById('hero-slider-container');
    const slides = document.querySelectorAll('.slider-slide');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    if (!container || slides.length === 0) return;
    
    let currentIndex = 0;
    // 3개가 한 화면에 보이므로, 최대로 갈 수 있는 인덱스는 전체 개수 - 3
    const maxIndex = Math.max(0, slides.length - 3);
    let autoPlayInterval;

    function goToSlide(index) {
        if (index < 0) {
            currentIndex = maxIndex;
        } else if (index > maxIndex) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }
        
        // 이동할 너비 계산 (슬라이드 너비 + gap(12px))
        // 3개가 딱 맞게 들어가 있으므로 1개 이동 시 -33.333% 부근을 이동
        const slideWidth = slides[0].offsetWidth;
        const gap = 12;
        const translateX = -(slideWidth + gap) * currentIndex;
        
        container.style.transform = `translateX(${translateX}px)`;
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    btnNext.addEventListener('click', () => {
        nextSlide();
        stopAutoPlay();
        startAutoPlay();
    });

    btnPrev.addEventListener('click', () => {
        prevSlide();
        stopAutoPlay();
        startAutoPlay();
    });
    
    // 마우스 호버 시 멈춤
    container.parentElement.addEventListener('mouseenter', stopAutoPlay);
    container.parentElement.addEventListener('mouseleave', startAutoPlay);

    // Initial positioning
    container.style.transition = 'transform 0.4s ease-in-out';
    startAutoPlay();
}