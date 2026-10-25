/**
 * ============================================================================
 * CYBERTV MULTI-LAYOUT THEME ENGINE v3.0.0
 * ============================================================================
 * Implements 6 genuinely distinct Android TV launcher layouts & navigation:
 *   0. cybertv-classic : Horizontal Shelf + 3 Color Styles (Neon, Minimal, Gold)
 *   1. cinema-horizon  : Cinema Billboard (60% top hero + left info + 2 shelves)
 *   2. orbit-os        : Spatial Circular Orbit Ring + Center Live TV + Left Panel
 *   3. zen-gallery     : Warm Ivory Architectural Gallery + Left Frame + Right Stack + Bottom Dock
 *   4. nexus-command   : Left Vertical Rail + Emerald/Graphite Bento Command Grid
 *   5. aura-stage      : 3D Coverflow Poster Carousel + Floating Bottom Pill Dock
 *
 * Shared Services & Lifecycle Guarantees:
 *   - Uses shared ALL_CHANNELS, playLiveChannel, AndroidBridge, Lunar Calendar,
 *     and localStorage watch history ('cybertv_watch_history').
 *   - Reads manifest.json (with embedded synchronous fallback for file://).
 *   - Cleans up timers and DOM event listeners on every theme switch.
 *   - Full D-pad (Up/Down/Left/Right), OK/Enter, Back, and Numeric (0-9) support.
 * ============================================================================
 */
(function () {
    'use strict';

    // ------------------------------------------------------------------------
    // 1. EMBEDDED MANIFEST REGISTRY (Synced with assets/themes/manifest.json)
    // ------------------------------------------------------------------------
    const DEFAULT_MANIFEST_REGISTRY = {
        engineVersion: '4.0.0',
        defaultThemeId: 'cybertv-classic',
        defaultStyleId: 'neon',
        defaultBgEffects: true,
        themes: [
            {
                id: 'cybertv-classic',
                name: 'CyberTV Classic',
                subtitle: 'CLASSIC • 3 PHONG CÁCH MÀU',
                isPremium: false,
                layout: 'horizontal-shelf',
                layoutLabel: 'Kệ Ngang Cổ Điển',
                description: 'Bố cục kệ ngang kinh điển với Spotlight phía trên, dải kênh truyền hình ở giữa và khay ứng dụng phía dưới. Hỗ trợ 3 phong cách màu: Neon, Minimal, Gold.',
                accentColor: '#00f2fe',
                bgPreview: 'linear-gradient(135deg, #040814 0%, #091936 55%, #00f2fe 100%)',
                supportsColorStyles: true,
                styles: [
                    { id: 'neon', name: 'Neon', fullName: 'Cyber Neon', accent: '#00f2fe' },
                    { id: 'minimal', name: 'Minimal', fullName: 'Minimal Dark Glass', accent: '#90CAF9' },
                    { id: 'gold', name: 'Gold', fullName: 'Luxury Gold Cinema', accent: '#ffd700' }
                ]
            },
            {
                id: 'cinema-horizon',
                name: 'Cinema Horizon',
                subtitle: 'CINEMA HORIZON',
                isPremium: true,
                layout: 'cinema-billboard',
                layoutLabel: 'Điện Ảnh Billboard',
                description: 'Hình ảnh nội dung nổi bật chiếm phần lớn phía trên, tiêu đề và nút xem đặt bên trái, điều hướng ngang phía trên, kênh truyền hình và xem tiếp bên dưới.',
                accentColor: '#e5b869',
                bgPreview: 'linear-gradient(135deg, #070605 0%, #261c10 60%, #e5b869 100%)',
                supportsColorStyles: false
            },
            {
                id: 'orbit-os',
                name: 'Orbit OS',
                subtitle: 'ORBIT OS • SPATIAL TV',
                isPremium: true,
                layout: 'spatial-orbit',
                layoutLabel: 'Quỹ Đạo Spatial',
                description: 'Các ứng dụng và tính năng sắp xếp theo vòng quỹ đạo quanh tâm xem trước truyền hình trực tiếp; cột trái hiển thị lời chào, đồng hồ lớn, thời tiết và gợi ý.',
                accentColor: '#7dd3fc',
                bgPreview: 'radial-gradient(circle at 65% 50%, #1e3a8a 0%, #040914 70%)',
                supportsColorStyles: false
            },
            {
                id: 'zen-gallery',
                name: 'Zen Gallery',
                subtitle: 'ZEN GALLERY',
                isPremium: true,
                layout: 'architectural-gallery',
                layoutLabel: 'Triển Lãm Kiến Trúc',
                description: 'Nền sáng ngà kiến trúc tối giản, khung truyền hình lớn bên trái, các thẻ thời tiết - gợi ý - thư giãn xếp dọc bên phải và thanh ứng dụng phía dưới.',
                accentColor: '#B08D57',
                bgPreview: 'linear-gradient(135deg, #F5F1E8 0%, #E5DEC9 60%, #B08D57 100%)',
                supportsColorStyles: false
            },
            {
                id: 'nexus-command',
                name: 'Nexus Command',
                subtitle: 'NEXUS COMMAND',
                isPremium: true,
                layout: 'bento-command',
                layoutLabel: 'Lưới Bento Điều Khiển',
                description: 'Thanh điều hướng dọc bên trái kết hợp lưới Bento thông minh: truyền hình trực tiếp, trạng thái hệ thống, thời tiết, kênh nổi bật, ứng dụng và xem tiếp.',
                accentColor: '#10B981',
                bgPreview: 'linear-gradient(135deg, #06100E 0%, #0D2922 60%, #10B981 100%)',
                supportsColorStyles: false
            },
            {
                id: 'prism-float',
                name: 'Prism Float',
                subtitle: 'PRISM FLOAT • CRYSTAL SPATIAL',
                isPremium: true,
                layout: 'prism-spatial-float',
                layoutLabel: 'Lăng Kính Đa Lớp',
                description: 'Thanh điều hướng kính mờ dọc bên trái, khung truyền hình lớn nổi trung tâm phía trước, khung giới thiệu phim phía trên bên phải và dải nội dung gần đây phía dưới.',
                accentColor: '#7DD3FC',
                bgPreview: 'linear-gradient(135deg, #0D1E3A 0%, #1E3A5F 55%, #BAE6FD 100%)',
                supportsColorStyles: false
            },
            {
                id: 'edition-noir',
                name: 'Edition Noir',
                subtitle: 'EDITION NOIR • CINEMA MAGAZINE',
                isPremium: true,
                layout: 'editorial-noir-magazine',
                layoutLabel: 'Tạp Chí Điện Ảnh',
                description: 'Bố cục bất đối xứng phong cách tạp chí điện ảnh: cột trái tiêu đề lớn & nút xem, giữa là poster dọc nổi bật, phải là hai khung ngang xếp chồng và thanh danh mục dưới.',
                accentColor: '#EF4444',
                bgPreview: 'linear-gradient(135deg, #080707 0%, #2A0A0E 62%, #B91C1C 100%)',
                supportsColorStyles: false
            },
            {
                id: 'sonata-lounge',
                name: 'Sonata Lounge',
                subtitle: 'SONATA LOUNGE • HI-FI CONSOLE',
                isPremium: true,
                layout: 'hifi-sonata-console',
                layoutLabel: 'Phòng Nghe Hi-Fi',
                description: 'Nửa trái là ảnh nội dung và điều khiển phát thật, nửa phải là 5 thẻ lớn (Nhạc thư giãn, Jazz, Hòa nhạc, Truyền hình, Ứng dụng) và hàng đợi gợi ý phía dưới.',
                accentColor: '#F59E0B',
                bgPreview: 'linear-gradient(135deg, #110A06 0%, #3E200F 60%, #F59E0B 100%)',
                supportsColorStyles: false
            }
        ]
    };

    const VALID_THEME_IDS = [
        'cybertv-classic',
        'cinema-horizon',
        'orbit-os',
        'zen-gallery',
        'nexus-command',
        'prism-float',
        'edition-noir',
        'sonata-lounge'
    ];

    const VALID_STYLE_IDS = ['neon', 'minimal', 'gold'];

    function checkIsPremiumUnlocked() {
        if (typeof window.isPremiumActive === 'function') {
            return window.isPremiumActive();
        }
        if (window.AndroidBridge && typeof window.AndroidBridge.isPremiumActive === 'function') {
            try { return window.AndroidBridge.isPremiumActive(); } catch (e) {}
        }
        return localStorage.getItem('cybertv_premium_active') === 'true';
    }

    const PREMIUM_APPS = {
        'io.gh.reisxd.tizentube.cobalt': 'TizenTube (YouTube Không QC)',
        'com.netflix.ninja': 'Netflix 4K',
        'com.chophim.tv': 'Cho Phim TV HD',
        'com.softmedia.receiver': 'AirReceiver (AirPlay/Cast)',
        'com.amazon.amazonvideo.livingroom': 'Prime Video'
    };

    // Curated 4K local studio backdrops matching exact TV channel genre & themes (100% offline, zero latency)
    const CURATED_BACKDROPS = {
        news: 'backdrops/news_studio.jpg',
        movie: 'backdrops/cinema_movie.jpg',
        sports: 'backdrops/football_stadium.jpg',
        music: 'backdrops/hifi_music.jpg',
        kyoto: 'backdrops/kyoto_garden.jpg',
        nature: 'backdrops/kyoto_garden.jpg',
        stage: 'backdrops/cinema_movie.jpg'
    };

    const CINEMA_BACKDROPS = [
        CURATED_BACKDROPS.news,
        CURATED_BACKDROPS.movie,
        CURATED_BACKDROPS.sports,
        CURATED_BACKDROPS.music,
        CURATED_BACKDROPS.kyoto,
        CURATED_BACKDROPS.stage,
        CURATED_BACKDROPS.nature
    ];

    // ------------------------------------------------------------------------
    // 2. ENGINE STATE & LIFECYCLE STORAGE
    // ------------------------------------------------------------------------
    let manifestRegistry = DEFAULT_MANIFEST_REGISTRY;
    let activeThemeId = 'cybertv-classic';
    let activeStyleId = 'neon';
    let activeBgEffects = true;

    // Lifecycle cleanup handlers for current active theme
    let themeCleanupCallbacks = [];
    let activeClockInterval = null;

    // Custom layout navigation state
    let customNavZones = []; // Array of arrays of DOM elements (or custom handlers)
    let customRow = 0;
    let customCol = 0;

    // Aura Stage Coverflow state
    let auraCenterIndex = 0;
    let auraCategoryFilter = 'all'; // 'all', 'movie', 'vtv'

    // Modal state ('none' | 'theme-store' | 'channel-browser')
    let currentModal = 'none';
    let modalRow = 0;
    let modalCol = 0;
    let channelBrowserFilter = 'all';

    // ------------------------------------------------------------------------
    // 3. SHARED DATA HELPERS (CHANNELS, APPS, WATCH HISTORY, SYSTEM STATS)
    // ------------------------------------------------------------------------
    function getChannels() {
        if (typeof ALL_CHANNELS !== 'undefined' && Array.isArray(ALL_CHANNELS) && ALL_CHANNELS.length > 0) {
            return ALL_CHANNELS;
        }
        return [];
    }

    function getChannelByNum(num) {
        const list = getChannels();
        return list.find(c => Number(c.num) === Number(num)) || list[0] || {
            num: 1,
            name: 'VTV1 HD',
            cat: 'vtv',
            catLabel: 'VTV Quốc Gia',
            logo: 'logos/ch_01.png',
            url: 'https://1011154949.vnns.net/CDN-FPT02/VTV1-HD-1080p/playlist.m3u8',
            desc: 'Kênh Thời sự - Chính luận - Tổng hợp Quốc gia.'
        };
    }

    function getChannelBackdrop(num) {
        const n = Number(num) || 1;
        // 1. Kênh Tin tức / Thời sự Quốc gia: VTV1, ANTV, VTV4, Truyền hình Quốc hội
        if (n === 1 || n === 19 || n === 4 || n === 21) {
            return CURATED_BACKDROPS.news;
        }
        // 2. Kênh Thể thao chuyên biệt: HTVC Thể Thao, SCTV22 S-Sport, Thể Thao TV, BTV2
        if (n === 17 || n === 38 || n === 39 || n === 40 || n === 45) {
            return CURATED_BACKDROPS.sports;
        }
        // 3. Kênh Phim truyện / Điện ảnh: HTVC Phim, SCTV14, Thuần Việt, Box Hits
        if (n === 18 || n === 22 || n === 27 || n === 28 || n === 29) {
            return CURATED_BACKDROPS.movie;
        }
        // 4. Kênh Âm nhạc / Phòng trà: HTVC Ca Nhạc, Nhạc Trẻ, Bolero
        if (n === 20 || n === 34 || n === 35) {
            return CURATED_BACKDROPS.music;
        }
        // 5. Kênh Khoa giáo / Du lịch / Khám phá: VTV2, VTV5, VTV Cần Thơ, Đà Nẵng
        if (n === 2 || n === 5 || n === 6 || n === 25) {
            return CURATED_BACKDROPS.nature;
        }
        // 6. Kênh Giải trí / Show nghệ thuật: VTV3, HTV7, HTV9, Hà Nội
        if (n === 3 || n === 15 || n === 16 || n === 24) {
            return CURATED_BACKDROPS.stage;
        }
        const fallbacks = [CURATED_BACKDROPS.news, CURATED_BACKDROPS.movie, CURATED_BACKDROPS.sports, CURATED_BACKDROPS.music, CURATED_BACKDROPS.stage, CURATED_BACKDROPS.nature];
        return fallbacks[(n - 1) % fallbacks.length];
    }

    function getAppsList() {
        const domCards = Array.from(document.querySelectorAll('#apps-row .app-card'));
        if (domCards.length > 0) {
            return domCards.map(card => {
                const iconEl = card.querySelector('.app-card-icon');
                const imgEl = iconEl ? iconEl.querySelector('img') : null;
                return {
                    pkg: card.getAttribute('data-pkg') || '',
                    title: card.getAttribute('data-title') || card.innerText.trim(),
                    desc: card.getAttribute('data-desc') || 'Ứng dụng Android TV',
                    iconHtml: imgEl ? `<img src="${imgEl.src}" alt="">` : (iconEl ? iconEl.innerHTML : '📺'),
                    iconBg: iconEl ? iconEl.style.background : 'rgba(255,255,255,0.1)'
                };
            });
        }
        return [
            { pkg: 'com.google.android.youtube.tv', title: 'YouTube', desc: 'Video 4K', iconHtml: '▶', iconBg: '#ff0000' },
            { pkg: 'com.netflix.ninja', title: 'Netflix', desc: 'Phim 4K', iconHtml: 'N', iconBg: '#000000' },
            { pkg: 'com.chophim.tv', title: 'Cho Phim TV', desc: 'Kho Phim HD', iconHtml: '🍿', iconBg: '#f6d365' },
            { pkg: 'io.gh.reisxd.tizentube.cobalt', title: 'TizenTube', desc: 'YouTube Không QC', iconHtml: '▶️', iconBg: '#00f2fe' },
            { pkg: 'com.tcl.browser', title: 'BrowseHere', desc: 'Trình duyệt TV', iconHtml: '🌐', iconBg: '#2193b0' },
            { pkg: 'com.softmedia.receiver', title: 'AirReceiver', desc: 'AirPlay & Cast', iconHtml: '📲', iconBg: '#0984e3' },
            { pkg: 'com.mitv.gallery', title: 'Thư viện', desc: 'Ảnh & Video', iconHtml: '🖼️', iconBg: '#f0932b' },
            { pkg: 'com.xiaomi.mitv.tvmanager', title: 'Quản lý TV', desc: 'Tối ưu RAM', iconHtml: '🚀', iconBg: '#00b09b' },
            { pkg: 'settings', title: 'Cài đặt', desc: 'Cài đặt hệ thống', iconHtml: '⚙️', iconBg: '#636e72' }
        ];
    }

    function getCleanAppInfo(pkg, rawTitle, rawDesc) {
        const MAP = {
            'com.xiaomi.mitv.tvmanager': { title: 'Quản lý TV', desc: 'Tối ưu RAM & Tăng tốc', tag: 'Hệ thống' },
            'io.gh.reisxd.tizentube.cobalt': { title: 'TizenTube', desc: 'YouTube không quảng cáo', tag: 'Video' },
            'com.netflix.ninja': { title: 'Netflix', desc: 'Phim điện ảnh 4K Dolby', tag: 'Phim' },
            'com.chophim.tv': { title: 'Cho Phim TV', desc: 'Kho phim bom tấn HD', tag: 'Phim' },
            'com.tcl.browser': { title: 'BrowseHere', desc: 'Trình duyệt web Smart TV', tag: 'Web' },
            'com.softmedia.receiver': { title: 'AirReceiver', desc: 'AirPlay & Cast không dây', tag: 'Truyền phát' },
            'com.mitv.gallery': { title: 'Thư Viện Ảnh', desc: 'Xem ảnh & video TV/USB', tag: 'Tiện ích' },
            'com.xiaomi.mitv.smartshare': { title: 'Miracast', desc: 'Chiếu không dây màn hình', tag: 'Truyền phát' },
            'com.mitv.livetv': { title: 'Live TV', desc: 'Kênh trực tiếp mặc định', tag: 'TV' },
            'com.xiaomi.mitv.mediaexplorer': { title: 'Media Player', desc: 'Trình phát video 4K & file', tag: 'Media' },
            'com.google.android.youtube.tv': { title: 'YouTube TV', desc: 'Video trực tuyến số 1 thế giới', tag: 'Video' },
            'com.amazon.amazonvideo.livingroom': { title: 'Prime Video', desc: 'Amazon Originals 4K HDR', tag: 'Phim' },
            'settings': { title: 'Cài Đặt TV', desc: 'Wi-Fi, Bluetooth & Âm thanh', tag: 'Cài đặt' }
        };

        if (MAP[pkg]) return MAP[pkg];

        let cleanTitle = rawTitle || 'Ứng dụng';
        cleanTitle = cleanTitle.replace(/\s*Trình duyệt web\s*/i, '').replace(/\s*\(.*?\)\s*/g, '').trim();
        return {
            title: cleanTitle || 'Ứng dụng TV',
            desc: rawDesc || 'Mở ứng dụng Android TV',
            tag: 'Ứng dụng'
        };
    }

    function launchAppByPkg(pkg) {
        if (!pkg) return;
        if (pkg === 'action:channels') {
            openChannelBrowserModal('all');
            return;
        }
        if (pkg === 'action:themes') {
            openThemeStoreModal();
            return;
        }
        if (pkg === 'action:cleanram') {
            triggerCleanRam();
            return;
        }
        if (pkg === 'settings') {
            if (window.AndroidBridge && typeof window.AndroidBridge.openSettings === 'function') {
                window.AndroidBridge.openSettings();
            } else {
                showEngineToast('CÀI ĐẶT HỆ THỐNG', 'Đang mở bảng Cài đặt Android TV...');
            }
            return;
        }

        // Check Premium VIP Apps lock
        if (PREMIUM_APPS[pkg] && !checkIsPremiumUnlocked()) {
            const appName = PREMIUM_APPS[pkg];
            if (typeof window.showPaywall === 'function') {
                window.showPaywall('app', appName);
            } else {
                alert('Ứng dụng ' + appName + ' yêu cầu kích hoạt bản quyền CyberTV Premium (79.000đ).');
            }
            return;
        }

        if (window.AndroidBridge && typeof window.AndroidBridge.launchApp === 'function') {
            window.AndroidBridge.launchApp(pkg);
        } else {
            showEngineToast('MỞ ỨNG DỤNG', 'Khởi chạy gói: ' + pkg);
        }
    }

    function triggerCleanRam() {
        if (window.AndroidBridge && typeof window.AndroidBridge.cleanRAM === 'function') {
            window.AndroidBridge.cleanRAM();
        }
        if (typeof refreshRAM === 'function') {
            setTimeout(refreshRAM, 350);
        }
        showEngineToast('TỐI ƯU HỆ THỐNG', 'Đã giải phóng bộ nhớ đệm và tăng tốc Android TV.');
    }

    // Watch History Management (Real persistent history in localStorage)
    const WATCH_HISTORY_KEY = 'cybertv_watch_history';

    function getWatchHistory() {
        if (typeof ENTERTAINMENT_WATCH_HISTORY !== 'undefined' && Array.isArray(ENTERTAINMENT_WATCH_HISTORY) && ENTERTAINMENT_WATCH_HISTORY.length > 0) {
            return ENTERTAINMENT_WATCH_HISTORY;
        }
        if (typeof window !== 'undefined' && Array.isArray(window.ENTERTAINMENT_WATCH_HISTORY) && window.ENTERTAINMENT_WATCH_HISTORY.length > 0) {
            return window.ENTERTAINMENT_WATCH_HISTORY;
        }
        return [
            { id: 'hist-netflix-1', title: 'Stranger Things: Thế Giới Ngược', name: 'Stranger Things', sub: 'Mùa 4 Tập 7 • Còn 18:40', app: 'Netflix', pkg: 'com.netflix.ninja', badge: 'NETFLIX', badgeBg: '#E50914', res: '4K HDR', progress: 75, backdrop: 'backdrops/netflix_scifi.jpg' },
            { id: 'hist-youtube-1', title: 'Nhạc Lofi Chill 4K • Cố Đô Chiều Mưa', name: 'Lofi Chill 4K', sub: 'Thư Giãn Làm Việc • Còn 25:10', app: 'YouTube', pkg: 'com.google.android.youtube.tv', badge: 'YOUTUBE', badgeBg: '#FF0000', res: '4K 60FPS', progress: 82, backdrop: 'backdrops/kyoto_garden.jpg' },
            { id: 'hist-chophim-1', title: 'Lật Mặt 7: Một Điều Ước', name: 'Lật Mặt 7', sub: 'Phim Chiếu Rạp 1080p • Đã xem 65:20', app: 'Cho Phim TV', pkg: 'com.chophim.tv', badge: 'CHỢ PHIM', badgeBg: '#FF9F43', res: '1080p FHD', progress: 52, backdrop: 'backdrops/cinema_movie.jpg' },
            { id: 'hist-tizentube-1', title: 'Khám Phá Vũ Trụ 4K HDR • Hố Đen', name: 'Khám Phá Vũ Trụ', sub: 'Khoa Học & Thiên Văn • Không QC', app: 'TizenTube', pkg: 'io.gh.reisxd.tizentube.cobalt', badge: 'TIZENTUBE', badgeBg: '#00A8FF', res: '4K HDR', progress: 70, backdrop: 'backdrops/news_studio.jpg' },
            { id: 'hist-netflix-2', title: 'Squid Game: Trò Chơi Sinh Tử', name: 'Squid Game 2', sub: 'Phần 2 Tập 4 • Còn 22:15', app: 'Netflix', pkg: 'com.netflix.ninja', badge: 'NETFLIX', badgeBg: '#E50914', res: '4K HDR', progress: 55, backdrop: 'backdrops/netflix_scifi.jpg' }
        ];
    }

    function getCleanAppInfo(pkg, rawTitle, rawDesc) {
        const MAP = {
            'com.xiaomi.mitv.tvmanager': { title: 'Quản lý TV', desc: 'Tối ưu RAM & Tăng tốc', tag: 'Hệ thống' },
            'io.gh.reisxd.tizentube.cobalt': { title: 'TizenTube', desc: 'YouTube không quảng cáo', tag: 'Video' },
            'com.netflix.ninja': { title: 'Netflix', desc: 'Phim điện ảnh 4K Dolby', tag: 'Phim' },
            'com.chophim.tv': { title: 'Cho Phim TV', desc: 'Kho phim bom tấn HD', tag: 'Phim' },
            'com.tcl.browser': { title: 'BrowseHere', desc: 'Trình duyệt web Smart TV', tag: 'Web' },
            'com.softmedia.receiver': { title: 'AirReceiver', desc: 'AirPlay & Cast không dây', tag: 'Truyền phát' },
            'com.mitv.gallery': { title: 'Thư Viện Ảnh', desc: 'Xem ảnh & video TV/USB', tag: 'Tiện ích' },
            'com.xiaomi.mitv.smartshare': { title: 'Miracast', desc: 'Chiếu không dây màn hình', tag: 'Truyền phát' },
            'com.mitv.livetv': { title: 'Live TV', desc: 'Kênh trực tiếp mặc định', tag: 'TV' },
            'com.xiaomi.mitv.mediaexplorer': { title: 'Media Player', desc: 'Trình phát video 4K & file', tag: 'Media' },
            'com.google.android.youtube.tv': { title: 'YouTube TV', desc: 'Video trực tuyến số 1 thế giới', tag: 'Video' },
            'com.amazon.amazonvideo.livingroom': { title: 'Prime Video', desc: 'Amazon Originals 4K HDR', tag: 'Phim' },
            'settings': { title: 'Cài Đặt TV', desc: 'Wi-Fi, Bluetooth & Âm thanh', tag: 'Cài đặt' }
        };

        if (MAP[pkg]) return MAP[pkg];

        let cleanTitle = rawTitle || 'Ứng dụng';
        cleanTitle = cleanTitle.replace(/\s*Trình duyệt web\s*/i, '').replace(/\s*\(.*?\)\s*/g, '').trim();
        return {
            title: cleanTitle || 'Ứng dụng TV',
            desc: rawDesc || 'Mở ứng dụng Android TV',
            tag: 'Ứng dụng'
        };
    }

    function recordChannelWatch(channelObj) {
        if (!channelObj || !channelObj.num) return;
        try {
            const list = getWatchHistory().filter(item => Number(item.num) !== Number(channelObj.num));
            list.unshift({
                num: channelObj.num,
                name: channelObj.name,
                sub: `${channelObj.catLabel || 'Truyền hình'} • Vừa xem trực tiếp`,
                progress: 85,
                ts: Date.now()
            });
            localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(list.slice(0, 8)));
        } catch (e) {}
    }

    function playChannelByNumber(num) {
        const ch = getChannelByNum(num);
        if (!ch) return;
        recordChannelWatch(ch);
        if (typeof window.playLiveChannel === 'function') {
            window.playLiveChannel(ch.url, `#${String(ch.num).padStart(2, '0')} ${ch.name}`);
        }
    }

    function getClockData() {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayName = days[now.getDay()];
        const sDay = now.getDate();
        const sMonth = now.getMonth() + 1;
        const sYear = now.getFullYear();

        let greeting = 'Chào buổi tối!';
        if (h >= 5 && h < 12) greeting = 'Chào buổi sáng!';
        else if (h >= 12 && h < 18) greeting = 'Chào buổi chiều!';

        let lunarShort = '15/09 Âm lịch';
        if (typeof window.getLunarDate === 'function') {
            try {
                const l = window.getLunarDate(sDay, sMonth, sYear);
                lunarShort = `${String(l.day).padStart(2, '0')}/${String(l.month).padStart(2, '0')} Âm lịch (${l.yearCanChi})`;
            } catch (e) {}
        }

        let ramMb = '1180 MB';
        const ramEl = document.getElementById('ram-indicator');
        if (ramEl && ramEl.innerText) {
            ramMb = ramEl.innerText.replace(' RAM', '');
        } else if (window.AndroidBridge && typeof window.AndroidBridge.getRamInfo === 'function') {
            try {
                const info = JSON.parse(window.AndroidBridge.getRamInfo());
                if (info && info.availMb) ramMb = `${info.availMb} MB`;
            } catch (e) {}
        }

        return {
            timeStr,
            greeting,
            dateFull: `${dayName}, ngày ${sDay} tháng ${sMonth}, ${sYear}`,
            dateShort: `${dayName}, ${sDay}/${sMonth}`,
            lunarShort,
            ramMb
        };
    }

    // ------------------------------------------------------------------------
    // 4. NORMALIZATION & MIGRATION ENGINE
    // ------------------------------------------------------------------------
    function normalizeThemeId(rawId) {
        if (!rawId) return 'cybertv-classic';
        const clean = String(rawId).trim().toLowerCase();
        if (VALID_THEME_IDS.indexOf(clean) !== -1) {
            return clean;
        }
        // Legacy IDs migrate cleanly to cybertv-classic
        if (clean === 'cybertv' || clean === 'cyber' || clean === 'minimal' || clean === 'cinema' || clean === 'neon' || clean === 'gold') {
            return 'cybertv-classic';
        }
        return 'cybertv-classic';
    }

    function normalizeStyleId(rawStyle) {
        if (!rawStyle) return 'neon';
        const clean = String(rawStyle).trim().toLowerCase();
        if (clean === 'minimal') return 'minimal';
        if (clean === 'gold' || clean === 'cinema') return 'gold';
        return 'neon';
    }

    function getThemeMeta(themeId) {
        const norm = normalizeThemeId(themeId);
        return manifestRegistry.themes.find(t => t.id === norm) || manifestRegistry.themes[0];
    }

    // ------------------------------------------------------------------------
    // 5. LIFECYCLE CLEANUP & STAGE CONTAINER
    // ------------------------------------------------------------------------
    function cleanupActiveThemeResources() {
        if (activeClockInterval) {
            clearInterval(activeClockInterval);
            activeClockInterval = null;
        }
        while (themeCleanupCallbacks.length > 0) {
            const fn = themeCleanupCallbacks.pop();
            try { fn(); } catch (e) {}
        }
        customNavZones = [];
    }

    function ensureStageContainers() {
        const uiLayer = document.querySelector('.ui-layer');
        if (uiLayer && !uiLayer.id) {
            uiLayer.id = 'classic-ui-layer';
        }

        let stage = document.getElementById('custom-theme-stage');
        if (!stage) {
            stage = document.createElement('div');
            stage.id = 'custom-theme-stage';
            const tvScreen = document.querySelector('.tv-screen');
            if (tvScreen) {
                tvScreen.appendChild(stage);
            } else {
                document.body.appendChild(stage);
            }
        }

        let storeModal = document.getElementById('ct-theme-store-modal');
        if (!storeModal) {
            storeModal = document.createElement('div');
            storeModal.id = 'ct-theme-store-modal';
            storeModal.className = 'ct-modal-backdrop';
            document.body.appendChild(storeModal);
        }

        let browserModal = document.getElementById('ct-channel-browser-modal');
        if (!browserModal) {
            browserModal = document.createElement('div');
            browserModal.id = 'ct-channel-browser-modal';
            browserModal.className = 'ct-modal-backdrop';
            document.body.appendChild(browserModal);
        }

        return stage;
    }

    // ------------------------------------------------------------------------
    // 6. RENDERERS FOR THE 5 NEW DISTINCT LAYOUTS
    // ------------------------------------------------------------------------

    /**
     * THEME 1: CINEMA HORIZON (cinema-horizon)
     * - Top horizontal nav bar (Trang chủ, Truyền hình, Ứng dụng, Kho Theme, Tìm kiếm)
     * - Large upper hero billboard (60% height) with left-aligned title, description & CTAs
     * - 2 horizontal shelves at bottom: "Kênh truyền hình" & "Tiếp tục xem"
     */
    function renderCinemaHorizon(stage) {
        const clock = getClockData();
        const heroCh = getChannelByNum(18); // HTVC Phim HD
        const liveChannels = [
            getChannelByNum(1),  // VTV1 HD
            getChannelByNum(3),  // VTV3 HD
            getChannelByNum(15), // HTV7 HD
            getChannelByNum(2),  // VTV2 HD
            getChannelByNum(17), // HTVC Thể Thao
            getChannelByNum(19)  // ANTV HD
        ];
        const watchHistory = getWatchHistory().slice(0, 5);

        stage.innerHTML = `
            <div class="ch-layout">
                <div class="ch-backdrop" id="ch-hero-backdrop" style="background-image: url('${getChannelBackdrop(heroCh.num)}');"></div>
                <div class="ch-vignette"></div>

                <!-- TOP HORIZONTAL NAVIGATION -->
                <div class="ch-topbar">
                    <div class="ch-brand">
                        <span class="ch-logo">CyberTV</span>
                    </div>

                    <div class="ch-nav-pills">
                        <div class="ch-nav-item active ct-focusable" data-zone="0" data-action="home">Trang chủ</div>
                        <div class="ch-nav-item ct-focusable" data-zone="0" data-action="channels">Truyền hình</div>
                        <div class="ch-nav-item ct-focusable" data-zone="0" data-action="apps">Ứng dụng</div>
                        <div class="ch-nav-item ct-focusable" data-zone="0" data-action="themes">Theme</div>
                    </div>

                    <div class="ch-top-right">
                        <div class="ch-icon-btn ct-focusable" data-zone="0" data-action="search" title="Tìm kiếm kênh">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                        <div class="ch-icon-btn ct-focusable" data-zone="0" data-action="settings" title="Cài đặt TV">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        </div>
                        <span class="ch-clock" id="ch-live-clock">${clock.timeStr}</span>
                    </div>
                </div>

                <!-- LEFT HERO FEATURED CONTENT -->
                <div class="ch-hero">
                    <div class="ch-hero-meta" id="ch-hero-meta">ĐIỆN ẢNH ĐẶC SẮC • TRỰC TIẾP 1080P FHD</div>
                    <div class="ch-hero-title" id="ch-hero-title">CHÂN TRỜI ĐỎ</div>
                    <div class="ch-hero-subtitle" id="ch-hero-subtitle">HÀNH TRÌNH VƯỢT KHÔNG GIAN • #${String(heroCh.num).padStart(2, '0')} ${heroCh.name}</div>
                    <div class="ch-hero-desc" id="ch-hero-desc">${heroCh.desc} Trải nghiệm không gian điện ảnh màn ảnh rộng với luồng phát HLS tốc độ cao trên CyberTV.</div>
                    <div class="ch-hero-actions">
                        <div class="ch-btn-primary ct-focusable" id="ch-hero-watch-btn" data-zone="1" data-num="${heroCh.num}">
                            <span>▶</span>
                            <span>Xem ngay</span>
                        </div>
                        <div class="ch-btn-secondary ct-focusable" id="ch-hero-detail-btn" data-zone="1" data-action="channels">
                            <span>ⓘ</span>
                            <span>Danh sách 60 kênh</span>
                        </div>
                    </div>
                </div>

                <!-- BOTTOM HORIZONTAL SHELVES -->
                <div class="ch-shelves">
                    <!-- ROW 1: LIVE TV CHANNELS -->
                    <div class="ch-shelf-block">
                        <div class="ch-shelf-title">Kênh truyền hình</div>
                        <div class="ch-row">
                            ${liveChannels.map((ch) => `
                                <div class="ch-live-card ct-focusable" data-zone="2" data-num="${ch.num}" data-name="${ch.name}" data-cat="${ch.catLabel}" data-desc="${ch.desc}">
                                    <img class="ch-live-card-bg" src="${getChannelBackdrop(ch.num)}" alt="">
                                    <div class="ch-live-card-shade"></div>
                                    <div class="ch-live-card-top">
                                        <span style="font-size:15px;font-weight:900;color:#f3c878;letter-spacing:0.5px;">${ch.name}</span>
                                        <span class="ch-live-badge"><span class="ch-live-dot"></span>TRỰC TIẾP</span>
                                    </div>
                                    <div class="ch-live-card-bottom">
                                        <span class="ch-live-name">#${String(ch.num).padStart(2, '0')} • ${ch.catLabel}</span>
                                    </div>
                                </div>
                            `).join('')}
                            <div class="ch-live-card ch-more-card ct-focusable" data-zone="2" data-action="channels">
                                <div style="font-size:20px;color:#e5b869;">•••</div>
                                <div style="font-size:12px;font-weight:700;color:#f7f3eb;">Tất cả 60 kênh</div>
                            </div>
                        </div>
                    </div>

                    <!-- ROW 2: CONTINUE WATCHING -->
                    <div class="ch-shelf-block">
                        <div class="ch-shelf-title">Tiếp tục xem • Ứng dụng giải trí</div>
                        <div class="ch-row">
                            ${watchHistory.map((item) => `
                                <div class="ch-continue-card ct-focusable" data-zone="3" ${item.pkg ? `data-pkg="${item.pkg}"` : (item.num ? `data-num="${item.num}"` : '')} data-name="${item.title || item.name}">
                                    <img class="ch-live-card-bg" src="${item.backdrop || getChannelBackdrop(item.num || 1)}" alt="">
                                    <div class="ch-live-card-shade"></div>
                                    <div style="position:absolute;top:8px;left:8px;z-index:3;display:flex;align-items:center;gap:6px;">
                                        <span style="font-size:9.5px;font-weight:900;padding:2px 7px;border-radius:4px;background:${item.badgeBg || '#E50914'};color:#fff;letter-spacing:0.5px;">${item.badge || item.app || 'GIẢI TRÍ'}</span>
                                        <span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;background:rgba(0,0,0,0.6);color:#f7f3eb;border:1px solid rgba(255,255,255,0.2);">${item.res || 'FHD'}</span>
                                    </div>
                                    <div class="ch-continue-title" style="margin-top:20px;">${item.title || item.name}</div>
                                    <div class="ch-continue-sub">${item.sub}</div>
                                    <div class="ch-progress-track">
                                        <div class="ch-progress-fill" style="width: ${item.progress || 65}%;"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const zone0 = Array.from(stage.querySelectorAll('[data-zone="0"]'));
        const zone1 = Array.from(stage.querySelectorAll('[data-zone="1"]'));
        const zone2 = Array.from(stage.querySelectorAll('[data-zone="2"]'));
        const zone3 = Array.from(stage.querySelectorAll('[data-zone="3"]'));
        customNavZones = [zone0, zone1, zone2, zone3];
        customRow = 1; // Default focus on "Xem ngay" CTA button
        customCol = 0;

        // Bind clicks & focus spotlight updates
        stage.querySelectorAll('.ct-focusable').forEach(el => {
            const onClick = () => {
                activateCustomElement(el);
            };
            el.addEventListener('click', onClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onClick));
        });

        activeClockInterval = setInterval(() => {
            const c = getClockData();
            const el = document.getElementById('ch-live-clock');
            if (el) el.innerText = c.timeStr;
        }, 5000);
    }

    /**
     * THEME 2: ORBIT OS (orbit-os)
     * - Left panel: Greeting, big clock, date, weather, "GỢI Ý CHO BẠN" card with 2 buttons
     * - Center/Right: Circular Orbit with Central Live TV Preview Portal + 8 Orbital Nodes
     * - Responsive 960x540 logical TV viewport & explicit 4-direction D-pad navigation
     */
    function renderOrbitOS(stage) {
        const clock = getClockData();
        const centerCh = getChannelByNum(1); // VTV1 HD
        const suggestCh = getChannelByNum(3); // VTV3 HD
        const suggestHist = getWatchHistory()[0];

        // 8 Orbital Nodes positioned around the 360x360 ring (stage 520x440, center = 260, 220; radius = 180)
        const orbitNodes = [
            { title: 'Truyền hình', sub: 'Xem trực tiếp', icon: '📺', bg: 'linear-gradient(135deg,#0284c7,#38bdf8)', action: 'channels', x: 195, y: 21, pill: true },
            { title: 'YouTube', sub: '4K HDR', icon: '▶', bg: '#dc2626', pkg: 'com.google.android.youtube.tv', x: 355, y: 61 },
            { title: 'Cho Phim TV', sub: 'Phim • Show', icon: '🍿', bg: 'linear-gradient(135deg,#f59e0b,#ea580c)', pkg: 'com.chophim.tv', x: 408, y: 188 },
            { title: 'VTV3 HD', sub: 'Giải trí', icon: 'VTV3', bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)', num: 3, x: 355, y: 315 },
            { title: 'Ứng dụng khác', sub: 'Khám phá', icon: '⊞', bg: 'linear-gradient(135deg,#059669,#10b981)', action: 'apps', x: 195, y: 381, pill: true },
            { title: 'Theme', sub: 'Giao diện TV', icon: '🎨', bg: 'linear-gradient(135deg,#7c3aed,#a855f7)', action: 'themes', x: 101, y: 315 },
            { title: 'Netflix', sub: 'Phim bom tấn', icon: 'N', bg: '#111827', pkg: 'com.netflix.ninja', x: 48, y: 188 },
            { title: 'TizenTube', sub: 'Không QC', icon: '▶️', bg: 'linear-gradient(135deg,#0284c7,#0369a1)', pkg: 'io.gh.reisxd.tizentube.cobalt', x: 101, y: 61 }
        ];

        stage.innerHTML = `
            <div class="orb-layout">
                <!-- TOP BAR -->
                <div class="orb-topbar">
                    <div class="orb-brand">
                        <span class="orb-logo">CyberTV</span>
                    </div>

                    <div class="orb-top-actions">
                        <div class="orb-top-pill ct-focusable" data-zone="0" data-action="search">🔍 Tìm kiếm kênh</div>
                        <div class="orb-top-pill ct-focusable" data-zone="0" data-action="themes">🎨 Theme</div>
                        <div class="orb-top-pill ct-focusable" data-zone="0" data-action="cleanram">⚡ RAM: ${clock.ramMb}</div>
                        <div class="orb-top-pill ct-focusable" data-zone="0" data-action="settings">⚙️ Cài đặt</div>
                    </div>
                </div>

                <!-- MAIN SPATIAL BODY -->
                <div class="orb-body">
                    <!-- LEFT PANEL: GREETING, CLOCK, WEATHER, SUGGESTION -->
                    <div class="orb-left-panel">
                        <div>
                            <div class="orb-greeting-title" id="orb-greeting">${clock.greeting}</div>
                            <div class="orb-greeting-sub">Chào mừng bạn trở lại không gian giải trí CyberTV.</div>
                        </div>

                        <div>
                            <div class="orb-big-clock" id="orb-clock">${clock.timeStr}</div>
                            <div class="orb-date-line" id="orb-date">${clock.dateFull} • ${clock.lunarShort}</div>
                        </div>

                        <div class="orb-weather-row">
                            <span style="font-size:24px;">⛅</span>
                            <span class="orb-weather-temp">28°C</span>
                            <div class="orb-weather-meta">
                                <div>TP. Hồ Chí Minh • Trời quang mây tạnh</div>
                                <div>Độ ẩm: 65% • AQI: <b style="color:#34d399;">32 Tốt</b></div>
                            </div>
                        </div>

                        <div class="orb-suggest-card">
                            <div class="orb-suggest-header">
                                <span>TIẾP TỤC XEM GẦN ĐÂY</span>
                                <span style="background:${suggestHist.badgeBg || '#E50914'};color:#fff;padding:2px 7px;border-radius:4px;font-weight:900;font-size:10px;">${suggestHist.badge || suggestHist.app}</span>
                            </div>
                            <div class="orb-suggest-banner" style="background-image: url('${suggestHist.backdrop}');">
                                <div class="orb-suggest-title">${suggestHist.title}</div>
                                <div class="orb-suggest-desc">${suggestHist.app} • ${suggestHist.sub}</div>
                            </div>
                            <div class="orb-suggest-actions">
                                <div class="orb-btn primary ct-focusable" data-zone="1" data-pkg="${suggestHist.pkg}">▶ Tiếp tục xem</div>
                                <div class="orb-btn ct-focusable" data-zone="1" data-action="channels">Danh sách kênh</div>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT/CENTER ORBITAL STAGE -->
                    <div class="orb-wheel-stage">
                        <div class="orb-ring-outer"></div>
                        <div class="orb-ring-inner"></div>

                        <!-- CENTER LIVE TV PREVIEW PORTAL -->
                        <div class="orb-center-portal ct-focusable" id="orb-center-portal" data-zone="2" data-num="${centerCh.num}">
                            <img class="orb-center-bg" id="orb-center-bg" src="${getChannelBackdrop(centerCh.num)}" alt="">
                            <div class="orb-center-shade"></div>
                            <div class="orb-center-top">
                                <span style="font-weight:900;font-size:13px;color:#7dd3fc;" id="orb-center-chname">${centerCh.name}</span>
                                <span class="orb-live-pill">● TRỰC TIẾP</span>
                            </div>
                            <div style="position:relative;z-index:2;width:32px;height:32px;border-radius:50%;background:rgba(125,211,252,0.22);border:1.5px solid #7dd3fc;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;">▶</div>
                            <div class="orb-center-bottom">
                                <div class="orb-center-title" id="orb-center-title">THỜI SỰ & TOÀN CẢNH</div>
                                <div class="orb-center-desc" id="orb-center-desc">Bấm OK để mở toàn màn hình</div>
                            </div>
                        </div>

                        <!-- 8 ORBITAL NODES -->
                        ${orbitNodes.map((n, idx) => `
                            <div class="orb-node ${n.pill ? 'orb-node-pill' : ''} ct-focusable"
                                 style="left:${n.x}px; top:${n.y}px;"
                                 data-zone="3"
                                 data-orbit-idx="${idx}"
                                 ${n.num ? `data-num="${n.num}"` : ''}
                                 ${n.pkg ? `data-pkg="${n.pkg}"` : ''}
                                 ${n.action ? `data-action="${n.action}"` : ''}>
                                <div class="orb-node-icon" style="background:${n.bg};color:#fff;">${n.icon}</div>
                                <div class="orb-node-title">${n.title}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const zone0 = Array.from(stage.querySelectorAll('[data-zone="0"]')); // Top bar
        const zone1 = Array.from(stage.querySelectorAll('[data-zone="1"]')); // Left panel buttons
        const zone2 = Array.from(stage.querySelectorAll('[data-zone="2"]')); // Center portal
        const zone3 = Array.from(stage.querySelectorAll('[data-zone="3"]')); // 8 Orbit nodes
        customNavZones = [zone0, zone1, zone2, zone3];
        customRow = 2; // Start directly on Center Live TV Portal
        customCol = 0;

        stage.querySelectorAll('.ct-focusable').forEach(el => {
            const onClick = () => activateCustomElement(el);
            el.addEventListener('click', onClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onClick));
        });

        activeClockInterval = setInterval(() => {
            const c = getClockData();
            const clockEl = document.getElementById('orb-clock');
            const greetEl = document.getElementById('orb-greeting');
            if (clockEl) clockEl.innerText = c.timeStr;
            if (greetEl) greetEl.innerText = c.greeting;
        }, 5000);
    }

    /**
     * THEME 3: ZEN GALLERY (zen-gallery)
     * - Warm ivory background (#F3EFE6), minimalist architectural gallery
     * - Large framed TV / Netflix / Art Exhibition slideshow on the left (64%)
     * - 3 vertically stacked cards on the right:
     *   Card 1: Weather & Lunar calendar
     *   Card 2: TV Channel Suggestion (VTV3 HD)
     *   Card 3: YouTube Relaxation Watch History
     * - Horizontal app & channel dock at the bottom
     */
    function renderZenGallery(stage) {
        const clock = getClockData();
        const suggestCh = getChannelByNum(3); // VTV3 HD
        const apps = getAppsList().slice(0, 9);

        const zenSlides = [
            {
                type: 'netflix',
                tag: '🎬 LỊCH SỬ XEM NETFLIX',
                dotColor: '#E50914',
                eyebrow: 'Mùa 4 Tập 7 • Đã xem 48:15 / 65:00',
                title: 'Stranger Things: Thế Giới Ngược',
                sub: 'Tiếp tục xem tập tiếp theo • Bấm OK mở Netflix',
                img: 'backdrops/netflix_scifi.jpg',
                pkg: 'com.netflix.ninja'
            },
            {
                type: 'art',
                tag: '🎨 TRANH NGHỆ THUẬT GẦN ĐÂY',
                dotColor: '#B08D57',
                eyebrow: 'Trường phái Ấn tượng Cổ điển • Triển lãm The Frame 4K',
                title: 'Hoa Súng & Cầu Gỗ Hoàng Hôn',
                sub: 'Kiệt tác nghệ thuật sơn dầu Châu Âu • Bấm OK chiêm ngưỡng',
                img: 'backdrops/art_oil_masterpiece.jpg',
                action: 'artwork'
            },
            {
                type: 'netflix',
                tag: '🎬 LỊCH SỬ XEM NETFLIX',
                dotColor: '#E50914',
                eyebrow: 'Mới xem hôm qua • Tập 4 (32:40 / 58:00)',
                title: 'Squid Game: Trò Chơi Sinh Tử (Phần 2)',
                sub: 'Bộ phim truyền hình số 1 toàn cầu • Bấm OK mở Netflix',
                img: 'backdrops/cinema_movie.jpg',
                pkg: 'com.netflix.ninja'
            },
            {
                type: 'art',
                tag: '🎨 TRANH NGHỆ THUẬT GẦN ĐÂY',
                dotColor: '#B08D57',
                eyebrow: 'Tuyệt tác phong cảnh Thiền viện Á Đông 4K HDR',
                title: 'Vườn Thu Cố Đô Kyoto',
                sub: 'Bộ sưu tập kiến trúc & không gian sống tối giản',
                img: 'backdrops/kyoto_garden.jpg',
                action: 'artwork'
            }
        ];

        let currentSlideIdx = 0;
        const firstSlide = zenSlides[0];

        stage.innerHTML = `
            <div class="zen-layout">
                <!-- TOP HEADER -->
                <div class="zen-topbar">
                    <div class="zen-brand">
                        <span class="zen-logo">CyberTV</span>
                    </div>

                    <div class="zen-nav-links">
                        <div class="zen-nav-item active ct-focusable" data-zone="0" data-action="home">Trang chủ</div>
                        <div class="zen-nav-item ct-focusable" data-zone="0" data-action="channels">Truyền hình</div>
                        <div class="zen-nav-item ct-focusable" data-zone="0" data-action="themes">Theme</div>
                        <div class="zen-nav-item ct-focusable" data-zone="0" data-action="settings">Thiết lập</div>
                    </div>

                    <div class="zen-top-right">
                        <div class="zen-icon-btn ct-focusable" data-zone="0" data-action="search" title="Tìm kiếm kênh">🔍</div>
                        <div class="zen-clock-box">
                            <div class="zen-clock-time" id="zen-clock">${clock.timeStr}</div>
                            <div class="zen-clock-date">${clock.dateShort}</div>
                        </div>
                    </div>
                </div>

                <!-- MAIN ARCHITECTURAL GRID: LEFT LARGE SLIDESHOW FRAME + RIGHT 3 STACKED CARDS -->
                <div class="zen-main-grid">
                    <!-- LEFT: LARGE SLIDESHOW FRAME (NETFLIX HISTORY & ART EXHIBITION) -->
                    <div class="zen-tv-frame ct-focusable" data-zone="1" data-pkg="${firstSlide.pkg || ''}">
                        <img class="zen-tv-bg" src="${firstSlide.img}" alt="">
                        <div class="zen-tv-shade"></div>
                        <div class="zen-tv-top">
                            <div class="zen-live-pill" id="zen-slide-badge">
                                <span id="zen-slide-dot" style="width:8px;height:8px;border-radius:50%;background:${firstSlide.dotColor};display:inline-block;"></span>
                                <span id="zen-slide-tag">${firstSlide.tag}</span>
                            </div>
                            <div class="zen-slide-dots">
                                ${zenSlides.map((_, i) => `<span class="zen-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
                            </div>
                        </div>
                        <div class="zen-tv-bottom">
                            <div class="zen-tv-eyebrow" id="zen-slide-eyebrow">${firstSlide.eyebrow}</div>
                            <div class="zen-tv-title" id="zen-slide-title">${firstSlide.title}</div>
                            <div class="zen-tv-sub" id="zen-slide-sub">${firstSlide.sub}</div>
                        </div>
                    </div>

                    <!-- RIGHT: 3 STACKED UTILITY & CONTENT CARDS -->
                    <div class="zen-right-stack">
                        <!-- Card 1: Weather & Lunar -->
                        <div class="zen-side-card ct-focusable" data-zone="2" data-action="cleanram">
                            <div class="zen-weather-top">
                                <span>TP. HCM • ${clock.lunarShort}</span>
                                <span>☀️ Nắng ấm</span>
                            </div>
                            <div class="zen-weather-main">
                                <span class="zen-weather-deg">24°C</span>
                                <span class="zen-weather-desc">Không khí trong lành</span>
                            </div>
                            <div style="font-size:10px;color:#787166;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">RAM: ${clock.ramMb} trống • Bấm OK tối ưu</div>
                        </div>

                        <!-- Card 2: TV Channel Suggestion (VTV3 HD) -->
                        <div class="zen-side-card dark-media ct-focusable" data-zone="2" data-num="${suggestCh.num}">
                            <div class="zen-card-header">
                                <span class="zen-tag-gold">📺 GỢI Ý KÊNH TRUYỀN HÌNH</span>
                                <span class="zen-live-tag">● TRỰC TIẾP</span>
                            </div>
                            <div>
                                <div style="font-size:14px;font-weight:800;color:#FAF7F0;letter-spacing:-0.2px;line-height:1.2;">#${String(suggestCh.num).padStart(2, '0')} ${suggestCh.name}</div>
                                <div style="font-size:11px;color:#D5BA8C;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">Ký Ức Vui Vẻ • Giải trí âm nhạc & văn hóa</div>
                            </div>
                            <div class="zen-card-cta">▶ Xem ngay (#${String(suggestCh.num).padStart(2, '0')})</div>
                        </div>

                        <!-- Card 3: YouTube Relaxation Watch History -->
                        <div class="zen-side-card ct-focusable" data-zone="2" data-pkg="io.gh.reisxd.tizentube.cobalt">
                            <div class="zen-card-header">
                                <span class="zen-youtube-tag">
                                    <svg style="width:13px;height:13px;fill:#DC2626;" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    LỊCH SỬ XEM YOUTUBE
                                </span>
                                <span style="font-size:9.5px;font-weight:700;color:#6E675F;">Mới xem</span>
                            </div>
                            <div>
                                <div style="font-size:12.5px;font-weight:800;color:#23211E;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Nhạc Lofi Thư Giãn 4K • Cố Đô Chiều Mưa</div>
                                <div style="font-size:10px;color:#6E675F;margin-top:2px;">Đã xem 28:40 / 60:00 • Chất lượng 4K HDR</div>
                            </div>
                            <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;">
                                <span style="color:#5C5549;font-weight:600;">Tiếp tục phát</span>
                                <span style="color:#B08D57;font-weight:800;">▶ Mở YouTube</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BOTTOM HORIZONTAL APP DOCK -->
                <div class="zen-dock-row">
                    <div class="zen-app-tile ct-focusable" data-zone="3" data-action="channels">
                        <div class="zen-app-icon" style="background:#23211E;color:#F5F1E8;">TV</div>
                        <div class="zen-app-name">60 Kênh TV</div>
                    </div>
                    ${apps.map(app => `
                        <div class="zen-app-tile ct-focusable" data-zone="3" data-pkg="${app.pkg}">
                            <div class="zen-app-icon" style="background:${app.iconBg || '#E8E1D3'};color:#23211E;">${app.iconHtml}</div>
                            <div class="zen-app-name">${app.title}</div>
                        </div>
                    `).join('')}
                    <div class="zen-app-tile ct-focusable" data-zone="3" data-action="themes">
                        <div class="zen-app-icon" style="background:#B08D57;color:#FFFFFF;">🎨</div>
                        <div class="zen-app-name">Theme</div>
                    </div>
                </div>
            </div>
        `;

        function renderZenCurrentSlide() {
            const slide = zenSlides[currentSlideIdx];
            const frame = stage.querySelector('.zen-tv-frame');
            const bg = stage.querySelector('.zen-tv-bg');
            const dot = stage.querySelector('#zen-slide-dot');
            const tag = stage.querySelector('#zen-slide-tag');
            const eyebrow = stage.querySelector('#zen-slide-eyebrow');
            const title = stage.querySelector('#zen-slide-title');
            const sub = stage.querySelector('#zen-slide-sub');
            const dots = stage.querySelectorAll('.zen-dot');

            if (bg) {
                bg.style.opacity = '0.35';
                setTimeout(() => {
                    bg.src = slide.img;
                    bg.style.opacity = '0.92';
                }, 180);
            }
            if (dot) dot.style.background = slide.dotColor;
            if (tag) tag.innerText = slide.tag;
            if (eyebrow) eyebrow.innerText = slide.eyebrow;
            if (title) title.innerText = slide.title;
            if (sub) sub.innerText = slide.sub;

            if (frame) {
                if (slide.pkg) {
                    frame.setAttribute('data-pkg', slide.pkg);
                    frame.removeAttribute('data-action');
                    frame.removeAttribute('data-num');
                } else {
                    frame.removeAttribute('data-pkg');
                    frame.setAttribute('data-action', slide.action || 'artwork');
                    frame.removeAttribute('data-num');
                }
            }

            dots.forEach((d, i) => {
                if (i === currentSlideIdx) d.classList.add('active');
                else d.classList.remove('active');
            });
        }

        window.zenNextSlide = () => {
            currentSlideIdx = (currentSlideIdx + 1) % zenSlides.length;
            renderZenCurrentSlide();
        };

        window.zenPrevSlide = () => {
            currentSlideIdx = (currentSlideIdx - 1 + zenSlides.length) % zenSlides.length;
            renderZenCurrentSlide();
        };

        const slideInterval = setInterval(() => {
            if (!currentModal && activeThemeId === 'zen-gallery') {
                window.zenNextSlide();
            }
        }, 7000);
        themeCleanupCallbacks.push(() => {
            clearInterval(slideInterval);
            delete window.zenNextSlide;
            delete window.zenPrevSlide;
        });

        const zone0 = Array.from(stage.querySelectorAll('[data-zone="0"]'));
        const zone1 = Array.from(stage.querySelectorAll('[data-zone="1"]')); // Left large TV frame
        const zone2 = Array.from(stage.querySelectorAll('[data-zone="2"]')); // Right 3 stacked cards
        const zone3 = Array.from(stage.querySelectorAll('[data-zone="3"]')); // Bottom app dock
        customNavZones = [zone0, zone1, zone2, zone3];
        customRow = 1; // Default focus on Left Large TV Frame
        customCol = 0;

        stage.querySelectorAll('.ct-focusable').forEach(el => {
            const onClick = () => activateCustomElement(el);
            el.addEventListener('click', onClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onClick));
        });

        activeClockInterval = setInterval(() => {
            const c = getClockData();
            const el = document.getElementById('zen-clock');
            if (el) el.innerText = c.timeStr;
        }, 5000);
    }

    /**
     * THEME 4: NEXUS COMMAND (nexus-command)
     * - Left vertical navigation rail
     * - Bento Grid in main area:
     *   Row 1: Live TV Preview (VTV1 HD) + Real System & Broadcast Digest
     *   Row 2: Weather/Lunar Card + Real Device Quick Controls + 4 Featured Channels (VTV1, VTV3, HTV7, ANTV)
     *   Row 3: Favorite Apps Strip + Continue Watching Strip
     */
    function renderNexusCommand(stage) {
        const clock = getClockData();
        const liveCh = getChannelByNum(1);
        const featuredChs = [
            getChannelByNum(1),  // VTV1 HD
            getChannelByNum(3),  // VTV3 HD
            getChannelByNum(15), // HTV7 HD
            getChannelByNum(19)  // ANTV HD
        ];
        const apps = getAppsList().slice(0, 6);
        const history = getWatchHistory().slice(0, 3);

        stage.innerHTML = `
            <div class="nx-layout">
                <!-- TOP HEADER -->
                <div class="nx-topbar">
                    <div class="nx-brand">
                        <span class="nx-logo">CyberTV</span>
                    </div>
                    <div class="nx-top-right">
                        <span style="font-size:12px;color:#A7F3D0;">${clock.dateFull} • ${clock.lunarShort}</span>
                        <span style="font-size:20px;font-weight:800;color:#ffffff;" id="nx-clock">${clock.timeStr}</span>
                    </div>
                </div>

                <!-- BODY: LEFT VERTICAL SIDEBAR + BENTO GRID -->
                <div class="nx-body">
                    <!-- LEFT VERTICAL SIDEBAR -->
                    <div class="nx-sidebar">
                        <div class="nx-side-item active ct-focusable" data-zone="0" data-action="home">
                            <span style="font-size:16px;">🏠</span>
                            <span>Trang chủ</span>
                        </div>
                        <div class="nx-side-item ct-focusable" data-zone="0" data-action="channels">
                            <span style="font-size:16px;">📺</span>
                            <span>Truyền hình</span>
                        </div>
                        <div class="nx-side-item ct-focusable" data-zone="0" data-num="18">
                            <span style="font-size:16px;">🎬</span>
                            <span>Phim HD</span>
                        </div>
                        <div class="nx-side-item ct-focusable" data-zone="0" data-action="apps">
                            <span style="font-size:16px;">📦</span>
                            <span>Ứng dụng</span>
                        </div>
                        <div class="nx-side-item ct-focusable" data-zone="0" data-action="cleanram">
                            <span style="font-size:16px;">⚡</span>
                            <span>Dọn RAM</span>
                        </div>
                        <div class="nx-side-item ct-focusable" data-zone="0" data-action="themes">
                            <span style="font-size:16px;">🎨</span>
                            <span>Theme</span>
                        </div>
                        <div class="nx-side-item ct-focusable" data-zone="0" data-action="settings">
                            <span style="font-size:16px;">⚙️</span>
                            <span>Cài đặt</span>
                        </div>
                    </div>

                    <!-- BENTO COMMAND GRID -->
                    <div class="nx-bento">
                        <!-- BENTO ROW 1: LIVE TV + BROADCAST/SYSTEM INTELLIGENCE -->
                        <div class="nx-row-top">
                            <div class="nx-card ct-focusable" data-zone="1" data-num="${liveCh.num}" style="padding:0;">
                                <img src="${getChannelBackdrop(liveCh.num)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.65;" alt="">
                                <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,16,14,0.18) 0%,rgba(6,16,14,0.92) 100%);"></div>
                                <div style="position:relative;z-index:2;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
                                    <span style="padding:4px 10px;border-radius:999px;background:#dc2626;color:#fff;font-size:11px;font-weight:800;">● TRỰC TIẾP • ${liveCh.name}</span>
                                    <span style="font-size:12px;font-weight:800;color:#34D399;">1080p FHD</span>
                                </div>
                                <div style="position:relative;z-index:2;padding:8px 14px 10px 14px;">
                                    <div style="display:inline-block;padding:2px 8px;border-radius:5px;background:#dc2626;color:#fff;font-size:10px;font-weight:800;margin-bottom:4px;">THỜI SỰ & CHÍNH LUẬN</div>
                                    <div style="font-size:17px;font-weight:800;color:#ffffff;line-height:1.2;">#${String(liveCh.num).padStart(2, '0')} ${liveCh.name} — Bản tin Thời sự Quốc gia</div>
                                    <div style="font-size:11.5px;color:#A7F3D0;margin-top:2px;">Bấm phím OK để mở toàn màn hình</div>
                                </div>
                            </div>

                            <div class="nx-card ct-focusable" data-zone="1" data-action="cleanram">
                                <div class="nx-card-header">
                                    <span style="font-size:13px;font-weight:800;color:#ffffff;white-space:nowrap;">✨ TỔNG QUAN HỆ THỐNG</span>
                                    <span style="padding:2px 8px;border-radius:999px;background:rgba(16,185,129,0.2);border:1px solid rgba(52,211,153,0.4);color:#34D399;font-size:9.5px;font-weight:700;white-space:nowrap;flex-shrink:0;">IPTV 4K SẴN SÀNG</span>
                                </div>
                                <div style="display:flex;flex-direction:column;gap:6px;margin:4px 0;">
                                    <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(52,211,153,0.16);">
                                        <span style="font-size:16px;">📺</span>
                                        <div>
                                            <div style="font-size:12.5px;font-weight:800;color:#fff;">Hệ thống IPTV 60 Kênh Truyền Hình</div>
                                            <div style="font-size:10.5px;color:rgba(236,253,245,0.72);">VTV Quốc gia, HTV, SCTV & Đài địa phương FHD.</div>
                                        </div>
                                    </div>
                                    <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(52,211,153,0.16);">
                                        <span style="font-size:16px;">⚡</span>
                                        <div>
                                            <div style="font-size:12.5px;font-weight:800;color:#fff;">Hiệu năng: ${clock.ramMb} RAM khả dụng</div>
                                            <div style="font-size:10.5px;color:rgba(236,253,245,0.72);">Hiệu ứng nền: ${activeBgEffects ? 'BẬT' : 'TẮT'} • Lịch âm: ${clock.lunarShort}.</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                                    <span style="font-size:10.5px;color:#6EE7B7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Bấm OK để dọn RAM tức thì</span>
                                    <span style="padding:3px 10px;border-radius:999px;background:rgba(16,185,129,0.28);border:1px solid #34D399;font-size:10.5px;font-weight:800;color:#fff;white-space:nowrap;flex-shrink:0;">Tối ưu RAM →</span>
                                </div>
                            </div>
                        </div>

                        <!-- BENTO ROW 2: WEATHER + DEVICE QUICK CONTROLS + FEATURED CHANNELS -->
                        <div class="nx-row-mid">
                            <div class="nx-card ct-focusable" data-zone="2" data-action="toggle-bg">
                                <div class="nx-card-header">
                                    <span>📍 TP. Hồ Chí Minh</span>
                                    <span>⛅</span>
                                </div>
                                <div style="display:flex;align-items:center;gap:10px;margin:4px 0;">
                                    <span style="font-size:28px;font-weight:800;color:#fff;line-height:1;">28°C</span>
                                    <div>
                                        <div style="font-size:13px;font-weight:700;color:#fff;">Trời ít mây</div>
                                        <div style="font-size:10.5px;color:#A7F3D0;">AQI: 32 Tốt</div>
                                    </div>
                                </div>
                                <div style="font-size:11px;color:rgba(236,253,245,0.75);">Cao 31° | Thấp 24° | Độ ẩm 65%</div>
                            </div>

                            <div class="nx-card">
                                <div class="nx-card-header">
                                    <span>🎛️ Điều khiển nhanh</span>
                                    <span style="font-size:10.5px;color:#34D399;">TRỰC TIẾP</span>
                                </div>
                                <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;flex:1;margin-top:6px;">
                                    <div class="nx-mini-tile ct-focusable" data-zone="2" data-action="toggle-bg">
                                        <span style="font-size:15px;">✨</span>
                                        <div>
                                            <div style="font-size:11px;font-weight:800;color:#fff;white-space:nowrap;">Hiệu ứng</div>
                                            <div style="font-size:9.5px;color:#34D399;white-space:nowrap;">${activeBgEffects ? 'Bật' : 'Tắt'}</div>
                                        </div>
                                    </div>
                                    <div class="nx-mini-tile ct-focusable" data-zone="2" data-action="cleanram">
                                        <span style="font-size:15px;">🚀</span>
                                        <div>
                                            <div style="font-size:11px;font-weight:800;color:#fff;white-space:nowrap;">Dọn RAM</div>
                                            <div style="font-size:9.5px;color:#A7F3D0;white-space:nowrap;">${clock.ramMb}</div>
                                        </div>
                                    </div>
                                    <div class="nx-mini-tile ct-focusable" data-zone="2" data-action="themes">
                                        <span style="font-size:15px;">🎨</span>
                                        <div>
                                            <div style="font-size:11px;font-weight:800;color:#fff;white-space:nowrap;">Theme</div>
                                            <div style="font-size:9.5px;color:#A7F3D0;white-space:nowrap;">Giao diện</div>
                                        </div>
                                    </div>
                                    <div class="nx-mini-tile ct-focusable" data-zone="2" data-action="googletv">
                                        <span style="font-size:15px;">📺</span>
                                        <div>
                                            <div style="font-size:11px;font-weight:800;color:#fff;">Google TV</div>
                                            <div style="font-size:9.5px;color:#A7F3D0;">Mặc định</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="nx-card">
                                <div class="nx-card-header">
                                    <span>📺 Kênh nổi bật</span>
                                    <span style="font-size:10.5px;color:#34D399;">Xem tất cả →</span>
                                </div>
                                <div class="nx-mini-grid">
                                    ${featuredChs.map(ch => `
                                        <div class="nx-mini-tile ct-focusable" data-zone="2" data-num="${ch.num}">
                                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                                <span style="font-size:13px;font-weight:900;color:#fff;">${ch.name.replace(' HD', '')}</span>
                                                <span style="width:6px;height:6px;border-radius:50%;background:#ef4444;"></span>
                                            </div>
                                            <div>
                                                <div style="font-size:10px;font-weight:700;color:#34D399;">● Phát trực tiếp</div>
                                                <div style="font-size:9.5px;color:rgba(236,253,245,0.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ch.catLabel}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- BENTO ROW 3: FAVORITE APPS + CONTINUE WATCHING -->
                        <div class="nx-row-bot">
                            <div class="nx-card">
                                <div class="nx-card-header">
                                    <span>Ứng dụng yêu thích</span>
                                    <span style="font-size:12px;color:#34D399;">Tất cả ứng dụng →</span>
                                </div>
                                <div class="nx-app-strip">
                                    ${apps.map(app => `
                                        <div class="nx-app-icon-btn ct-focusable" data-zone="3" data-pkg="${app.pkg}" title="${app.title}">
                                            <div style="width:30px;height:30px;border-radius:8px;background:${app.iconBg || '#10b981'};display:flex;align-items:center;justify-content:center;font-size:14px;">${app.iconHtml}</div>
                                            <span>${app.title.slice(0, 10)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="nx-card">
                                <div class="nx-card-header">
                                    <span>Tiếp tục xem gần đây</span>
                                    <span style="font-size:12px;color:#34D399;">Ứng dụng giải trí →</span>
                                </div>
                                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;flex:1;margin-top:10px;">
                                    ${history.map(item => `
                                        <div class="nx-mini-tile ct-focusable" data-zone="3" ${item.pkg ? `data-pkg="${item.pkg}"` : (item.num ? `data-num="${item.num}"` : '')} style="position:relative;overflow:hidden;">
                                            <img src="${item.backdrop || getChannelBackdrop(item.num || 1)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.38;" alt="">
                                            <div style="position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;">
                                                <span style="font-size:9.5px;font-weight:900;padding:1px 6px;border-radius:4px;background:${item.badgeBg || '#10B981'};color:#fff;">${item.badge || item.app || 'APP'}</span>
                                                <span style="font-size:9px;color:#A7F3D0;font-weight:700;">${item.res || 'FHD'}</span>
                                            </div>
                                            <div style="position:relative;z-index:2;font-size:12.5px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:4px;">${item.title || item.name}</div>
                                            <div style="position:relative;z-index:2;">
                                                <div style="font-size:10px;color:#A7F3D0;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.sub}</div>
                                                <div style="width:100%;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;overflow:hidden;">
                                                    <div style="width:${item.progress || 70}%;height:100%;background:#10B981;"></div>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const zone0 = Array.from(stage.querySelectorAll('[data-zone="0"]')); // Left vertical sidebar
        const zone1 = Array.from(stage.querySelectorAll('[data-zone="1"]')); // Bento Top row
        const zone2 = Array.from(stage.querySelectorAll('[data-zone="2"]')); // Bento Mid row
        const zone3 = Array.from(stage.querySelectorAll('[data-zone="3"]')); // Bento Bottom row
        customNavZones = [zone0, zone1, zone2, zone3];
        customRow = 1; // Focus on Live TV card first
        customCol = 0;

        stage.querySelectorAll('.ct-focusable').forEach(el => {
            const onClick = () => activateCustomElement(el);
            el.addEventListener('click', onClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onClick));
        });

        activeClockInterval = setInterval(() => {
            const c = getClockData();
            const el = document.getElementById('nx-clock');
            if (el) el.innerText = c.timeStr;
        }, 5000);
    }

    /**
     * THEME 5: AURA STAGE (aura-stage)
     * - Center large poster on glowing pedestal + 2 flanking posters on left & right (Coverflow)
     * - Left/Right D-pad rotates posters smoothly; OK plays the center poster
     * - Floating bottom glass control dock: Truyền hình, Phim & Giải trí, Ứng dụng, Tìm kiếm, Kho Theme
     */
    function getAuraStageItems() {
        const all = getChannels();
        if (auraCategoryFilter === 'movie') {
            const filtered = all.filter(c => c.cat === 'cable' || c.cat === 'htv');
            if (filtered.length >= 5) return filtered;
        }
        // Curated showcase list combining flagship channels
        const showcaseNums = [1, 3, 15, 18, 27, 31, 33, 41, 19, 2];
        return showcaseNums.map(n => getChannelByNum(n));
    }

    function renderAuraStage(stage) {
        const clock = getClockData();
        const items = getAuraStageItems();
        if (auraCenterIndex < 0) auraCenterIndex = items.length - 1;
        if (auraCenterIndex >= items.length) auraCenterIndex = 0;

        const getRelItem = (offset) => {
            const idx = (auraCenterIndex + offset + items.length * 10) % items.length;
            return items[idx];
        };

        const slots = [
            { posClass: 'pos-far-left', offset: -2, item: getRelItem(-2) },
            { posClass: 'pos-left', offset: -1, item: getRelItem(-1) },
            { posClass: 'pos-center', offset: 0, item: getRelItem(0) },
            { posClass: 'pos-right', offset: 1, item: getRelItem(1) },
            { posClass: 'pos-far-right', offset: 2, item: getRelItem(2) }
        ];

        stage.innerHTML = `
            <div class="aura-layout">
                <div class="aura-ribbons"></div>

                <!-- TOP BAR -->
                <div class="aura-topbar">
                    <div class="aura-brand">
                        <span class="aura-logo">CyberTV</span>
                        <span class="aura-sub">AURA STAGE</span>
                    </div>

                    <div style="display:flex;align-items:center;gap:14px;">
                        <span style="font-size:13px;color:#E9D5FF;">${clock.dateShort} • ${clock.lunarShort}</span>
                        <span style="font-size:18px;font-weight:800;color:#ffffff;" id="aura-clock">${clock.timeStr}</span>
                    </div>
                </div>

                <!-- 5-POSTER 3D COVERFLOW STAGE -->
                <div class="aura-stage-carousel" id="aura-carousel">
                    ${slots.map(slot => {
                        const isCenter = slot.offset === 0;
                        const ch = slot.item;
                        return `
                            <div class="aura-poster ${slot.posClass} ${isCenter ? 'ct-focusable' : ''}"
                                 ${isCenter ? `data-zone="0" data-num="${ch.num}"` : `data-offset="${slot.offset}"`}>
                                <img class="aura-poster-bg" src="${getChannelBackdrop(ch.num)}" alt="">
                                <div class="aura-poster-shade"></div>
                                <div class="aura-poster-content">
                                    <div class="aura-poster-tag">#${String(ch.num).padStart(2, '0')} • ${ch.catLabel}</div>
                                    <div class="aura-poster-title">${ch.name}</div>
                                    ${isCenter ? `
                                        <div class="aura-poster-sub">${ch.desc}</div>
                                        <div class="aura-watch-btn">▶ Xem ngay</div>
                                    ` : `
                                        <div class="aura-poster-sub">TRỰC TIẾP 1080P</div>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- GLOWING PEDESTAL -->
                <div class="aura-pedestal"></div>

                <!-- FLOATING BOTTOM PILL CONTROL BAR -->
                <div class="aura-dock-wrap">
                    <div class="aura-caption">Dùng phím ◀ ▶ để xoay sân khấu Poster • Bấm OK để phát kênh đang chọn</div>
                    <div class="aura-dock">
                        <div class="aura-dock-item ${auraCategoryFilter === 'all' ? 'active' : ''} ct-focusable" data-zone="1" data-aura-filter="all">📺 Truyền hình</div>
                        <div class="aura-dock-item ${auraCategoryFilter === 'movie' ? 'active' : ''} ct-focusable" data-zone="1" data-aura-filter="movie">🎬 Phim & Giải trí</div>
                        <div class="aura-dock-item ct-focusable" data-zone="1" data-action="channels">📋 Tất cả 60 kênh</div>
                        <div class="aura-dock-item ct-focusable" data-zone="1" data-action="search">🔍 Tìm kiếm</div>
                        <div class="aura-dock-item ct-focusable" data-zone="1" data-action="themes">🎨 Kho Theme</div>
                    </div>
                </div>
            </div>
        `;

        const zone0 = Array.from(stage.querySelectorAll('[data-zone="0"]')); // Center Poster
        const zone1 = Array.from(stage.querySelectorAll('[data-zone="1"]')); // Bottom Floating Pill Dock
        customNavZones = [zone0, zone1];
        if (customRow >= customNavZones.length) customRow = 0;

        // Allow clicking side posters in browser/mouse testing to rotate
        stage.querySelectorAll('.aura-poster[data-offset]').forEach(el => {
            const onSideClick = () => {
                const offset = parseInt(el.getAttribute('data-offset'), 10) || 0;
                auraCenterIndex += offset;
                renderAuraStage(stage);
                refreshCustomFocus();
            };
            el.addEventListener('click', onSideClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onSideClick));
        });

        stage.querySelectorAll('.ct-focusable').forEach(el => {
            const onClick = () => activateCustomElement(el);
            el.addEventListener('click', onClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onClick));
        });

        activeClockInterval = setInterval(() => {
            const c = getClockData();
            const el = document.getElementById('aura-clock');
            if (el) el.innerText = c.timeStr;
        }, 5000);
    }

    /**
     * THEME 6: PRISM FLOAT (prism-float)
     * - Frosted crystal vertical navigation rail on the left
     * - Large floating Live TV frame in the center foreground (VTV1 | Truyền hình trực tiếp)
     * - Layered movie spotlight card at top-right (Phim điện ảnh / Xem ngay)
     * - Clock & Weather card at top-left of content area (Hà Nội • 24°C)
     * - Recent content strip at bottom-right (Đã xem gần đây • 4 cards)
     * - Crystal, pearl silver & ice blue palette; non-overlapping layers; supports reduced-motion mode
     */
    function renderPrismFloat(stage) {
        const clock = getClockData();
        const liveCh = getChannelByNum(1);   // VTV1 HD
        const movieCh = getChannelByNum(18); // HTVC Phim HD
        const history = getWatchHistory().slice(0, 4);

        stage.innerHTML = `
            <div class="pf-layout">
                <!-- TOP HEADER -->
                <div class="pf-topbar">
                    <div class="pf-brand">
                        <span class="pf-logo">CyberTV</span>
                    </div>
                    <div class="pf-top-right">
                        <span style="font-size:13px;color:#BAE6FD;">Lớp Kính Pha Lê Đa Tầng • ${clock.lunarShort}</span>
                        <span style="font-size:19px;font-weight:800;color:#ffffff;" id="pf-top-clock">${clock.timeStr}</span>
                    </div>
                </div>

                <!-- MAIN BODY: LEFT GLASS RAIL + MULTI-LAYER SPATIAL CANVAS -->
                <div class="pf-body">
                    <!-- LEFT FROSTED GLASS VERTICAL NAV RAIL (ZONE 0) -->
                    <div class="pf-left-rail">
                        <div class="pf-rail-btn active ct-focusable" data-zone="0" data-action="home">
                            <span class="pf-rail-icon">🏠</span>
                            <span>Trang chủ</span>
                        </div>
                        <div class="pf-rail-btn ct-focusable" data-zone="0" data-action="channels">
                            <span class="pf-rail-icon">📺</span>
                            <span>Truyền hình</span>
                        </div>
                        <div class="pf-rail-btn ct-focusable" data-zone="0" data-num="${movieCh.num}">
                            <span class="pf-rail-icon">🎬</span>
                            <span>Phim ảnh</span>
                        </div>
                        <div class="pf-rail-btn ct-focusable" data-zone="0" data-action="apps">
                            <span class="pf-rail-icon">📦</span>
                            <span>Ứng dụng</span>
                        </div>
                        <div class="pf-rail-btn ct-focusable" data-zone="0" data-pkg="com.google.android.youtube.tv">
                            <span class="pf-rail-icon">🎮</span>
                            <span>Giải trí 4K</span>
                        </div>
                        <div class="pf-rail-btn ct-focusable" data-zone="0" data-num="20">
                            <span class="pf-rail-icon">🎵</span>
                            <span>Âm nhạc</span>
                        </div>
                        <div class="pf-rail-btn ct-focusable" data-zone="0" data-action="themes" style="margin-top:auto;">
                            <span class="pf-rail-icon">🎨</span>
                            <span>Theme</span>
                        </div>
                    </div>

                    <!-- RIGHT SPATIAL CANVAS: 4 NON-OVERLAPPING FLOATING PRISM LAYERS -->
                    <div class="pf-spatial-canvas">
                        <!-- TOP-LEFT: WEATHER & CLOCK PRISM CARD (ZONE 1, COL 0) -->
                        <div class="pf-weather-card ct-focusable" data-zone="1" data-action="toggle-bg">
                            <div class="pf-weather-loc">
                                <span>📍 Hà Nội / TP.HCM</span>
                                <span>⛅ Ít mây</span>
                            </div>
                            <div class="pf-weather-row">
                                <span style="font-size:38px;">🌤️</span>
                                <span class="pf-weather-temp">24°C</span>
                            </div>
                            <div>
                                <div class="pf-weather-clock" id="pf-card-clock">${clock.timeStr}</div>
                                <div class="pf-weather-date">${clock.dateFull} • Hiệu ứng: ${activeBgEffects ? 'Bật' : 'Giảm nhẹ'}</div>
                            </div>
                        </div>

                        <!-- TOP-RIGHT: LAYERED MOVIE SPOTLIGHT CARD (ZONE 1, COL 1) -->
                        <div class="pf-movie-card ct-focusable" data-zone="1" data-num="${movieCh.num}">
                            <img class="pf-movie-bg" src="${getChannelBackdrop(movieCh.num)}" alt="">
                            <div class="pf-movie-shade"></div>
                            <div class="pf-movie-content">
                                <div class="pf-movie-tag">PHIM ĐIỆN ẢNH • #${String(movieCh.num).padStart(2, '0')} ${movieCh.name}</div>
                                <div class="pf-movie-title">CHÂN TRỜI PHA LÊ</div>
                                <div style="font-size:12px;color:#E2E8F0;max-width:75%;">Tác phẩm điện ảnh khoa học viễn tưởng đặc sắc trên kênh ${movieCh.name}.</div>
                                <div class="pf-movie-cta">▶ Xem ngay</div>
                            </div>
                        </div>

                        <!-- CENTER FOREGROUND: LARGE FLOATING LIVE TV STAGE (ZONE 2, COL 0..1) -->
                        <div class="pf-tv-stage">
                            <img class="pf-tv-bg" src="${getChannelBackdrop(liveCh.num)}" alt="">
                            <div class="pf-tv-shade"></div>
                            <div class="pf-tv-top">
                                <div class="pf-tv-badge">
                                    <span>${liveCh.name} | Truyền hình trực tiếp</span>
                                </div>
                                <div class="pf-live-dot">● LIVE 1080P</div>
                            </div>
                            <div class="pf-tv-bottom">
                                <div style="min-width:0;flex:1;">
                                    <div class="pf-tv-sub">ĐANG PHÁT TRỰC TIẾP • KÊNH #${String(liveCh.num).padStart(2, '0')}</div>
                                    <div class="pf-tv-title">Khám Phá Vũ Trụ & Tương Lai</div>
                                </div>
                                <div class="pf-tv-actions">
                                    <div class="pf-btn primary ct-focusable" data-zone="2" data-num="${liveCh.num}">▶ Toàn màn hình</div>
                                    <div class="pf-btn ct-focusable" data-zone="2" data-action="channels">📋 60 Kênh</div>
                                </div>
                            </div>
                        </div>

                        <!-- BOTTOM-RIGHT: RECENT CONTENT STRIP (ZONE 3, COL 0..3) -->
                        <div class="pf-recent-strip">
                            <div class="pf-recent-header">
                                <span>ĐÃ XEM GẦN ĐÂY • ỨNG DỤNG GIẢI TRÍ</span>
                                <span style="color:#7DD3FC;font-size:11px;">Bấm OK để tiếp tục xem</span>
                            </div>
                            <div class="pf-recent-grid">
                                ${history.map(item => `
                                    <div class="pf-recent-item ct-focusable" data-zone="3" ${item.pkg ? `data-pkg="${item.pkg}"` : (item.num ? `data-num="${item.num}"` : '')}>
                                        <img src="${item.backdrop || getChannelBackdrop(item.num || 1)}" alt="">
                                        <div class="pf-recent-shade"></div>
                                        <div style="position:absolute;top:6px;left:6px;z-index:3;display:flex;align-items:center;gap:4px;">
                                            <span style="font-size:9px;font-weight:900;padding:1px 5px;border-radius:3px;background:${item.badgeBg || '#0284c7'};color:#fff;">${item.badge || item.app || 'APP'}</span>
                                        </div>
                                        <div class="pf-recent-name" style="bottom:10px;font-size:11.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title || item.name}</div>
                                        <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.2);z-index:3;">
                                            <div style="width:${item.progress || 60}%;height:100%;background:#00f2fe;"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const zone0 = Array.from(stage.querySelectorAll('[data-zone="0"]')); // Left vertical glass rail
        const zone1 = Array.from(stage.querySelectorAll('[data-zone="1"]')); // Weather card + Top-right movie card
        const zone2 = Array.from(stage.querySelectorAll('[data-zone="2"]')); // Center Live TV frame + action buttons
        const zone3 = Array.from(stage.querySelectorAll('[data-zone="3"]')); // Bottom-right 4 recent cards
        customNavZones = [zone0, zone1, zone2, zone3];
        customRow = 2; // Start focus on the prominent Center Floating Live TV Stage
        customCol = 0;

        stage.querySelectorAll('.ct-focusable').forEach(el => {
            const onClick = () => activateCustomElement(el);
            el.addEventListener('click', onClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onClick));
        });

        activeClockInterval = setInterval(() => {
            const c = getClockData();
            const topEl = document.getElementById('pf-top-clock');
            const cardEl = document.getElementById('pf-card-clock');
            if (topEl) topEl.innerText = c.timeStr;
            if (cardEl) cardEl.innerText = c.timeStr;
        }, 5000);
    }

    /**
     * THEME 7: EDITION NOIR (edition-noir)
     * - Asymmetric cinema magazine editorial layout
     * - Left column: sub-nav, giant Vietnamese-safe serif headline ("ĐÊM" + "ĐIỆN ẢNH"), synopsis, "XEM NGAY" CTA
     * - Center column: prominent vertical poster frame with crisp ivory border
     * - Right column: two stacked horizontal content frames (LIVE VTV1 HD + Feature Film/Series)
     * - Bottom compact category bar
     * - Matte black (#080707), warm ivory (#F5F0E6), wine red (#B91C1C)
     */
    function renderEditionNoir(stage) {
        const clock = getClockData();
        const posterCh = getChannelByNum(18); // HTVC Phim HD
        const liveCh = getChannelByNum(1);    // VTV1 HD
        const secondCh = getChannelByNum(3);  // VTV3 HD
        const noirHist = getWatchHistory()[2] || getWatchHistory()[0];

        const categories = [
            { label: 'NỔI BẬT', num: 18, active: true },
            { label: 'PHIM ĐIỆN ẢNH', num: 27 },
            { label: 'TRUYỀN HÌNH', action: 'channels' },
            { label: 'PHIM BỘ', num: 33 },
            { label: 'VĂN HÓA', num: 2 },
            { label: 'THỂ THAO', num: 17 },
            { label: 'ỨNG DỤNG', action: 'apps' },
            { label: 'THEME', action: 'themes' }
        ];

        stage.innerHTML = `
            <div class="en-layout">
                <!-- TOP EDITORIAL HEADER (ZONE 0) -->
                <div class="en-topbar">
                    <div class="en-subnav">
                        <span class="en-subnav-item active ct-focusable" data-zone="0" data-action="home">TRANG CHỦ</span>
                        <span class="en-subnav-item ct-focusable" data-zone="0" data-action="channels">TRUYỀN HÌNH</span>
                        <span class="en-subnav-item ct-focusable" data-zone="0" data-num="18">PHIM ẢNH</span>
                        <span class="en-subnav-item ct-focusable" data-zone="0" data-action="themes">THEME</span>
                    </div>

                    <div class="en-top-right">
                        <div class="en-icon-btn ct-focusable" data-zone="0" data-action="search" title="Tìm kiếm kênh">🔍</div>
                        <div class="en-icon-btn ct-focusable" data-zone="0" data-action="settings" title="Cài đặt">⚙️</div>
                        <span style="font-size:13px;color:rgba(245,240,230,0.68);">${clock.dateShort}</span>
                        <span class="en-clock" id="en-clock">${clock.timeStr}</span>
                    </div>
                </div>

                <!-- 3-COLUMN ASYMMETRIC MAGAZINE GRID (ZONE 1) -->
                <div class="en-editorial-grid">
                    <!-- COLUMN 1 (LEFT): GIANT SERIF HEADLINE + SYNOPSIS + CTA -->
                    <div class="en-col-left">
                        <div class="en-issue-tag">ẤN PHẨM ĐẶC BIỆT • SỐ 10/2026 • CYBERTV EDITION NOIR</div>
                        <h1 class="en-headline-word1">ĐÊM</h1>
                        <h2 class="en-headline-word2">ĐIỆN ẢNH</h2>
                        <p class="en-synopsis">
                            Tuyển tập những tác phẩm điện ảnh kinh điển, phim truyện đặc sắc và chương trình nghệ thuật chọn lọc tối nay trên hệ thống truyền hình độ nét cao CyberTV.
                        </p>
                        <div class="en-cta-btn ct-focusable" data-zone="1" data-num="${posterCh.num}">
                            <span>▶ XEM NGAY</span>
                        </div>
                    </div>

                    <!-- COLUMN 2 (CENTER): VERTICAL FEATURE POSTER -->
                    <div class="en-poster-frame ct-focusable" data-zone="1" data-num="${posterCh.num}">
                        <img class="en-poster-img" src="${getChannelBackdrop(posterCh.num)}" alt="">
                        <div class="en-poster-shade"></div>
                        <div class="en-poster-caption">
                            <div class="en-poster-meta">PHIM TRUYỆN ĐẶC SẮC • #${String(posterCh.num).padStart(2, '0')} ${posterCh.name}</div>
                            <div class="en-poster-title">HÀ NỘI MÙA ĐÔNG</div>
                            <div class="en-poster-sub">Chính kịch • Lãng mạn • Full HD 1080p</div>
                        </div>
                    </div>

                    <!-- COLUMN 3 (RIGHT): TWO STACKED HORIZONTAL FRAMES -->
                    <div class="en-col-right">
                        <!-- Top Stacked Card: Live VTV1 HD -->
                        <div class="en-hcard ct-focusable" data-zone="1" data-num="${liveCh.num}">
                            <img class="en-hcard-bg" src="${getChannelBackdrop(liveCh.num)}" alt="">
                            <div class="en-hcard-shade"></div>
                            <div class="en-hcard-top">
                                <span class="en-live-badge">● TRỰC TIẾP • ${liveCh.name}</span>
                            </div>
                            <div class="en-hcard-bottom">
                                <div class="en-hcard-title">Bản Tin Thời Sự & Toàn Cảnh Thế Giới</div>
                                <div class="en-hcard-sub">Kênh #${String(liveCh.num).padStart(2, '0')} • Đang phát sóng trực tiếp</div>
                            </div>
                        </div>

                        <!-- Bottom Stacked Card: Entertainment History Feature -->
                        <div class="en-hcard ct-focusable" data-zone="1" data-pkg="${noirHist.pkg}">
                            <img class="en-hcard-bg" src="${noirHist.backdrop}" alt="">
                            <div class="en-hcard-shade"></div>
                            <div class="en-hcard-top">
                                <span class="en-cat-badge" style="background:${noirHist.badgeBg};color:#fff;">TIẾP TỤC XEM • ${noirHist.badge}</span>
                            </div>
                            <div class="en-hcard-bottom">
                                <div class="en-hcard-title">${noirHist.title}</div>
                                <div class="en-hcard-sub">${noirHist.app} • ${noirHist.sub} • Bấm OK để tiếp tục xem</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BOTTOM COMPACT CATEGORY BAR (ZONE 2) -->
                <div class="en-catbar">
                    ${categories.map(cat => `
                        <div class="en-cat-item ${cat.active ? 'active' : ''} ct-focusable"
                             data-zone="2"
                             ${cat.num ? `data-num="${cat.num}"` : ''}
                             ${cat.action ? `data-action="${cat.action}"` : ''}>
                            ${cat.label}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const zone0 = Array.from(stage.querySelectorAll('[data-zone="0"]')); // Top subnav + icons
        const zone1 = Array.from(stage.querySelectorAll('[data-zone="1"]')); // Left CTA (0), Center Poster (1), Right Top (2), Right Bottom (3)
        const zone2 = Array.from(stage.querySelectorAll('[data-zone="2"]')); // Bottom category bar
        customNavZones = [zone0, zone1, zone2];
        customRow = 1; // Default focus on "XEM NGAY" CTA button in Left Column
        customCol = 0;

        stage.querySelectorAll('.ct-focusable').forEach(el => {
            const onClick = () => activateCustomElement(el);
            el.addEventListener('click', onClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onClick));
        });

        activeClockInterval = setInterval(() => {
            const c = getClockData();
            const el = document.getElementById('en-clock');
            if (el) el.innerText = c.timeStr;
        }, 5000);
    }

    /**
     * THEME 8: KYOTO LIVING (kyoto-living)
     * - Serene Japanese garden background with warm sunlight, wood & stone aesthetic
     * - Slim status bar at the top + separate vertical hanging-scroll Weather & Clock widget on the right
     * - Four main cards in a horizontal row across the lower half: Truyền hình, Phim, Âm nhạc, Ứng dụng
     * - Selected/focused card expands upward smoothly to reveal preview content while siblings stay compact
     * - Warm ivory paper (#F5F0E3), sumi ink (#1E201D), moss green accent (#5F7A4B)
     */
    function renderKyotoLiving(stage) {
        const clock = getClockData();
        const tvCh = getChannelByNum(1);    // VTV1 HD
        const movieCh = getChannelByNum(18); // HTVC Phim HD
        const musicCh = getChannelByNum(20); // HTVC Ca Nhạc

        const pillars = [
            {
                id: 'tv',
                title: 'Truyền hình',
                sub: 'VTV1 • 60 Kênh Trực tiếp',
                previewImg: 'backdrops/news_studio.jpg',
                previewTag: 'ĐANG PHÁT • VTV1 HD',
                previewTitle: 'Việt Nam Diệu Kỳ',
                ctaText: '▶ Tiếp tục xem',
                num: tvCh.num
            },
            {
                id: 'movie',
                title: 'Phim',
                sub: 'Điện ảnh & Phim Châu Á',
                previewImg: 'backdrops/kyoto_garden.jpg',
                previewTag: 'PHIM CHỌN LỌC • #18 HTVC PHIM',
                previewTitle: 'Mùa Thu Kyoto & Cố Đô',
                ctaText: '▶ Xem phim ngay',
                num: movieCh.num
            },
            {
                id: 'music',
                title: 'Âm nhạc',
                sub: 'Hòa tấu & Ca nhạc 24/7',
                previewImg: 'backdrops/hifi_music.jpg',
                previewTag: 'KHÔNG GIAN THIỀN • #20 CA NHẠC',
                previewTitle: 'Giai Điệu Trầm Lắng Phòng Trà',
                ctaText: '▶ Thưởng thức nhạc',
                num: musicCh.num
            },
            {
                id: 'apps',
                title: 'Ứng dụng',
                sub: 'YouTube, Netflix & Apps',
                previewImg: 'backdrops/cinema_movie.jpg',
                previewTag: 'TIỆN ÍCH SMART TV',
                previewTitle: 'Khám Phá Kho Ứng Dụng & Theme',
                ctaText: '⊞ Mở kho ứng dụng',
                action: 'apps'
            }
        ];

        stage.innerHTML = `
            <div class="kl-layout">
                <div class="kl-garden-backdrop"></div>
                <div class="kl-garden-vignette"></div>

                <!-- TOP AREA: SLIM STATUS BAR + SEPARATE RIGHT WEATHER/CLOCK HANGING SCROLL -->
                <div class="kl-top-area">
                    <div class="kl-brand-bar">
                        <span class="kl-logo">CyberTV</span>
                        <span class="kl-divider"></span>
                        <span class="kl-sub">KYOTO LIVING</span>
                    </div>

                    <div class="kl-right-widgets">
                        <div class="kl-status-strip">
                            <span>📶 Wi-Fi</span>
                            <span>${clock.dateFull}</span>
                            <span class="kl-status-btn ct-focusable" data-zone="0" data-action="channels">60 Kênh</span>
                            <span class="kl-status-btn ct-focusable" data-zone="0" data-action="themes">Kho Theme</span>
                            <span class="kl-status-btn ct-focusable" data-zone="0" data-action="toggle-bg">${activeBgEffects ? 'Hiệu ứng: Bật' : 'Tĩnh lặng'}</span>
                        </div>

                        <!-- Elegant Weather, Clock & Harmony Pill Widget -->
                        <div class="kl-scroll-widget ct-focusable" data-zone="0" data-action="cleanram" title="Tối ưu RAM">
                            <span>☀️ 26°C</span>
                            <span class="kl-scroll-divider-v"></span>
                            <span id="kl-clock">${clock.timeStr}</span>
                            <span class="kl-scroll-divider-v"></span>
                            <span class="kl-scroll-kanji">静けさ</span>
                        </div>
                    </div>
                </div>

                <!-- LOWER HALF: 4 HORIZONTAL WASHI PAPER CARDS (EXPANDS UPWARD WHEN FOCUSED) -->
                <div class="kl-cards-row">
                    ${pillars.map((p, idx) => `
                        <div class="kl-pillar-card ${idx === 0 ? 'expanded' : ''} ct-focusable"
                             data-zone="1"
                             data-pillar-idx="${idx}"
                             ${p.num ? `data-num="${p.num}"` : ''}
                             ${p.action ? `data-action="${p.action}"` : ''}>
                            <!-- Preview Drawer (Revealed when expanded) -->
                            <div class="kl-preview-drawer">
                                <img class="kl-preview-img" src="${p.previewImg}" alt="">
                                <div class="kl-preview-tag">${p.previewTag}</div>
                                <div class="kl-preview-title">${p.previewTitle}</div>
                                <div class="kl-preview-cta">${p.ctaText}</div>
                            </div>

                            <!-- Base Card Footer (Always visible) -->
                            <div class="kl-card-base">
                                <div>
                                    <div class="kl-card-title">${p.title}</div>
                                    <div class="kl-card-sub">${p.sub}</div>
                                </div>
                                <div class="kl-card-indicator">
                                    <span>Khám phá • Bấm OK để mở</span>
                                    <span>→</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const zone0 = Array.from(stage.querySelectorAll('[data-zone="0"]')); // Top status buttons + scroll widget
        const zone1 = Array.from(stage.querySelectorAll('[data-zone="1"]')); // 4 Washi Paper Pillar Cards
        customNavZones = [zone0, zone1];
        customRow = 1; // Start on first pillar card ("Truyền hình" expanded)
        customCol = 0;

        stage.querySelectorAll('.ct-focusable').forEach(el => {
            const onClick = () => activateCustomElement(el);
            el.addEventListener('click', onClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onClick));
        });

        activeClockInterval = setInterval(() => {
            const c = getClockData();
            const el = document.getElementById('kl-clock');
            if (el) el.innerText = c.timeStr;
        }, 5000);
    }

    /**
     * THEME 9: VELOCITY ARENA (velocity-arena)
     * - Sports-prioritized interface: carbon black, titanium, electric lime (#A3E635)
     * - Compact top navigation bar
     * - Large Live Broadcast frame on the left (#17 HTVC Thể Thao HD)
     * - Match / Broadcast Info panel on the right (Truthful status: no fake live scores hardcoded)
     * - Sports channels & broadcast schedule strip along the bottom
     */
    function renderVelocityArena(stage) {
        const clock = getClockData();
        const mainSportCh = getChannelByNum(17); // HTVC Thể Thao HD (#17)
        const vtv3Ch = getChannelByNum(3);       // VTV3 HD (#03)
        const vtvCanTho = getChannelByNum(6);    // VTV Cần Thơ / VTV6 (#06)

        const sportsStrip = [
            { ch: getChannelByNum(17), slot: 'ĐANG PHÁT TRỰC TIẾP', prog: 'Nhịp Đập Thể Thao & Bóng Đá Quốc Tế', live: true },
            { ch: getChannelByNum(38), slot: 'ĐANG PHÁT TRỰC TIẾP', prog: 'Tạp Chí Thể Thao Tổng Hợp HD', live: true },
            { ch: getChannelByNum(3),  slot: '20:00 HÔM NAY', prog: 'Thể Thao 24/7 & Giải Trí VTV3', live: false },
            { ch: getChannelByNum(6),  slot: '20:30 HÔM NAY', prog: 'Bình Luận Thể Thao & Sự Kiện', live: false },
            { ch: getChannelByNum(15), slot: '21:00 HÔM NAY', prog: 'Tổng Hợp Đường Đua Tốc Độ HTV7', live: false },
            { action: 'channels', title: 'Tất Cả 60 Kênh & App', slot: 'DANH SÁCH ĐẦY ĐỦ', prog: 'Mở toàn bộ kênh truyền hình & ứng dụng', live: false }
        ];

        stage.innerHTML = `
            <div class="va-layout">
                <!-- COMPACT TOP NAVIGATION BAR (ZONE 0) -->
                <div class="va-topbar">
                    <div class="va-brand">
                        <span class="va-logo">CyberTV</span>
                        <span class="va-sub">VELOCITY ARENA</span>
                    </div>

                    <div class="va-nav-pills">
                        <div class="va-nav-pill active ct-focusable" data-zone="0" data-num="${mainSportCh.num}">⚡ Trực tiếp Thể thao</div>
                        <div class="va-nav-pill ct-focusable" data-zone="0" data-num="${vtv3Ch.num}">⚽ Bóng đá & Sự kiện</div>
                        <div class="va-nav-pill ct-focusable" data-zone="0" data-pkg="com.google.android.youtube.tv">▶️ YouTube Thể thao</div>
                        <div class="va-nav-pill ct-focusable" data-zone="0" data-action="channels">📺 Tất cả 60 Kênh</div>
                        <div class="va-nav-pill ct-focusable" data-zone="0" data-action="apps">📦 Ứng dụng</div>
                        <div class="va-nav-pill ct-focusable" data-zone="0" data-action="themes">🎨 Kho Theme</div>
                    </div>

                    <div class="va-top-right">
                        <span style="font-size:12px;color:#A3E635;font-weight:700;">${clock.dateShort}</span>
                        <span class="va-clock" id="va-clock">${clock.timeStr}</span>
                    </div>
                </div>

                <!-- MAIN ARENA GRID: LEFT LARGE LIVE BROADCAST + RIGHT BROADCAST DATA PANEL (ZONE 1) -->
                <div class="va-main-grid">
                    <!-- LEFT: LARGE LIVE SPORTS BROADCAST FRAME -->
                    <div class="va-live-stage ct-focusable" data-zone="1" data-num="${mainSportCh.num}">
                        <img class="va-live-bg" src="${getChannelBackdrop(mainSportCh.num)}" alt="">
                        <div class="va-live-shade"></div>

                        <div class="va-live-top">
                            <div class="va-live-hud">
                                <span class="va-live-badge">● TRỰC TIẾP</span>
                                <span class="va-ch-tag">#${String(mainSportCh.num).padStart(2, '0')} ${mainSportCh.name}</span>
                                <span class="va-ch-tag" style="color:#A3E635;">1080P 60FPS</span>
                            </div>
                        </div>

                        <div class="va-live-bottom">
                            <div>
                                <div class="va-live-eyebrow">TÂM ĐIỂM THỂ THAO TRỰC TIẾP • ${mainSportCh.catLabel}</div>
                                <div class="va-live-title">Cầu Trường Rực Lửa — ${mainSportCh.name}</div>
                                <div class="va-live-sub">Bấm phím OK để mở luồng phát trực tiếp toàn màn hình với âm thanh sân vận động</div>
                            </div>
                            <div class="va-cta-btn">▶ XEM TRỰC TIẾP</div>
                        </div>
                    </div>

                    <!-- RIGHT: HONEST SPORTS CENTER & BROADCAST SCHEDULE PANEL -->
                    <div class="va-info-panel">
                        <div class="va-panel-header">
                            <span class="va-panel-title">TRUNG TÂM THỂ THAO & LỊCH PHÁT SÓNG</span>
                            <span class="va-status-pill">TRỰC TIẾP HD/4K</span>
                        </div>

                        <div class="va-honest-box">
                            <div class="va-honest-title">🔴 TÂM ĐIỂM THỂ THAO TRỰC TIẾP HÔM NAY</div>
                            <div class="va-honest-desc">
                                Phát sóng trực tiếp Ngoại Hạng Anh, Cúp C1, Quần vợt & Thể thao đỉnh cao với âm thanh vòm sống động trên hệ thống kênh Thể Thao CyberTV.
                            </div>
                        </div>

                        <div class="va-stat-rows">
                            <div class="va-stat-card ct-focusable" data-zone="1" data-num="17">
                                <div class="va-stat-left">
                                    <span class="va-stat-ch">#17 • KÊNH CHUYÊN BIỆT THỂ THAO</span>
                                    <span class="va-stat-name">${mainSportCh.name}</span>
                                    <span class="va-stat-meta">Bóng đá, Quần vợt, Đua xe & Thể thao tổng hợp</span>
                                </div>
                                <span class="va-stat-action">Phát ngay ▶</span>
                            </div>

                            <div class="va-stat-card ct-focusable" data-zone="1" data-num="3">
                                <div class="va-stat-left">
                                    <span class="va-stat-ch">#03 • ĐÀI TRUYỀN HÌNH VIỆT NAM</span>
                                    <span class="va-stat-name">${vtv3Ch.name} — Thể Thao & Giải Trí</span>
                                    <span class="va-stat-meta">Nhịp đập Thể thao • Tường thuật các giải đấu quốc gia</span>
                                </div>
                                <span class="va-stat-action">Phát ngay ▶</span>
                            </div>

                            <div class="va-stat-card ct-focusable" data-zone="1" data-num="6">
                                <div class="va-stat-left">
                                    <span class="va-stat-ch">#06 • KÊNH QUỐC GIA & SỰ KIỆN</span>
                                    <span class="va-stat-name">${vtvCanTho.name}</span>
                                    <span class="va-stat-meta">Trực tiếp bóng đá Việt Nam & Thể thao khu vực</span>
                                </div>
                                <span class="va-stat-action">Phát ngay ▶</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BOTTOM: SPORTS CHANNELS & BROADCAST SCHEDULE STRIP (ZONE 2) -->
                <div class="va-bottom-strip">
                    <div class="va-strip-header">
                        <span>LỊCH PHÁT SÓNG & DẢI KÊNH THỂ THAO (60 KÊNH KHẢ DỤNG)</span>
                        <span style="color:#A3E635;">Dùng phím ◀ ▶ để chọn kênh • OK để phát</span>
                    </div>
                    <div class="va-strip-grid">
                        ${sportsStrip.map(item => {
                            if (item.action) {
                                return `
                                    <div class="va-sched-card ct-focusable" data-zone="2" data-action="${item.action}">
                                        <div class="va-sched-top">
                                            <span class="va-sched-ch">KHO KÊNH & APP</span>
                                            <span class="va-sched-time">${item.slot}</span>
                                        </div>
                                        <div>
                                            <div class="va-sched-prog">${item.title}</div>
                                            <div class="va-sched-sub">${item.prog}</div>
                                        </div>
                                    </div>
                                `;
                            }
                            return `
                                <div class="va-sched-card ct-focusable" data-zone="2" data-num="${item.ch.num}">
                                    <div class="va-sched-top">
                                        <span class="va-sched-ch">#${String(item.ch.num).padStart(2, '0')} ${item.ch.name}</span>
                                        <span class="va-sched-time">${item.slot}</span>
                                    </div>
                                    <div>
                                        <div class="va-sched-prog">${item.prog}</div>
                                        <div class="va-sched-sub">${item.live ? '● Đang phát sóng FHD' : 'Bấm OK để chuyển kênh'}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        const zone0 = Array.from(stage.querySelectorAll('[data-zone="0"]')); // Top nav bar
        const zone1 = Array.from(stage.querySelectorAll('[data-zone="1"]')); // Left Live Stage + 3 Right Sports Cards
        const zone2 = Array.from(stage.querySelectorAll('[data-zone="2"]')); // Bottom 6 Schedule & Channel cards
        customNavZones = [zone0, zone1, zone2];
        customRow = 1; // Default focus on Left Large Live Sports Stage
        customCol = 0;

        stage.querySelectorAll('.ct-focusable').forEach(el => {
            const onClick = () => activateCustomElement(el);
            el.addEventListener('click', onClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onClick));
        });

        activeClockInterval = setInterval(() => {
            const c = getClockData();
            const el = document.getElementById('va-clock');
            if (el) el.innerText = c.timeStr;
        }, 5000);
    }

    /**
     * THEME 10: SONATA LOUNGE (sonata-lounge)
     * - High-end Hi-Fi equipment aesthetic: espresso (#110A06), cognac, brushed copper, warm amber glow (#F59E0B)
     * - Left half: Square album/broadcast artwork, title, honest Hi-Fi source status, and real supported playback/app buttons
     *   (No fake song durations, fake pause/shuffle buttons, or fake song queues)
     * - Right half: 5 large horizontal category cards (Nhạc thư giãn, Jazz, Hòa nhạc, Truyền hình, Ứng dụng)
     * - Bottom-right: Quick-access suggested music/video apps & channels
     */
    function renderSonataLounge(stage) {
        const clock = getClockData();
        const musicCh = getChannelByNum(20); // HTVC Ca Nhạc (#20)
        const vtv3Ch = getChannelByNum(3);   // VTV3 HD (#03)
        const vtv1Ch = getChannelByNum(1);   // VTV1 HD (#01)

        const deckCards = [
            {
                title: 'Nhạc Thư Giãn',
                sub: 'Kênh #20 HTVC Ca Nhạc HD',
                thumb: 'backdrops/hifi_music.jpg',
                num: musicCh.num
            },
            {
                title: 'Acoustic & Jazz',
                sub: 'Ứng dụng YouTube TV Âm nhạc',
                thumb: 'backdrops/hifi_music.jpg',
                pkg: 'com.google.android.youtube.tv'
            },
            {
                title: 'Hòa Nhạc & Cổ Điển',
                sub: 'Ứng dụng TizenTube Âm nhạc',
                thumb: 'backdrops/hifi_music.jpg',
                pkg: 'io.gh.reisxd.tizentube.cobalt'
            },
            {
                title: 'Kênh Truyền Hình',
                sub: 'Xem 60 kênh trực tiếp CyberTV',
                thumb: 'backdrops/news_studio.jpg',
                action: 'channels'
            },
            {
                title: 'Kho Ứng Dụng',
                sub: 'Mở ứng dụng & Theme',
                thumb: 'backdrops/cinema_movie.jpg',
                action: 'apps'
            }
        ];

        const queueItems = [
            {
                tag: 'NETFLIX',
                name: 'Stranger Things 4',
                sub: 'Mùa 4 Tập 7 • 4K HDR',
                thumb: 'backdrops/netflix_scifi.jpg',
                pkg: 'com.netflix.ninja'
            },
            {
                tag: 'YOUTUBE',
                name: 'Lofi Chill 4K',
                sub: 'Cố Đô Chiều Mưa • Thư giãn',
                thumb: 'backdrops/kyoto_garden.jpg',
                pkg: 'com.google.android.youtube.tv'
            },
            {
                tag: 'CHỢ PHIM',
                name: 'Lật Mặt 7',
                sub: 'Phim Chiếu Rạp 1080p',
                thumb: 'backdrops/cinema_movie.jpg',
                pkg: 'com.chophim.tv'
            }
        ];

        stage.innerHTML = `
            <div class="sl-layout">
                <div class="sl-ambient-glow"></div>

                <!-- TOP HEADER (ZONE 0) -->
                <div class="sl-topbar">
                    <div class="sl-brand">
                        <span class="sl-logo">CyberTV</span>
                    </div>

                    <div class="sl-top-right">
                        <div class="sl-icon-btn ct-focusable" data-zone="0" data-action="search" title="Tìm kiếm kênh">🔍</div>
                        <div class="sl-icon-btn ct-focusable" data-zone="0" data-action="themes" title="Theme">🎨</div>
                        <div class="sl-icon-btn ct-focusable" data-zone="0" data-action="settings" title="Cài đặt">⚙️</div>
                        <span class="sl-clock" id="sl-clock">${clock.timeStr}</span>
                    </div>
                </div>

                <!-- MAIN HI-FI GRID: LEFT TURNTABLE STAGE + RIGHT CATEGORY STACK & SUGGESTED STRIP -->
                <div class="sl-main-grid">
                    <!-- LEFT HALF: ALBUM / BROADCAST ARTWORK + REAL SUPPORTED CONTROLS -->
                    <div class="sl-left-stage">
                        <div class="sl-album-frame ct-focusable" data-zone="1" data-num="${musicCh.num}">
                            <img class="sl-album-img" id="sl-album-img" src="backdrops/hifi_music.jpg" alt="">
                            <div class="sl-album-shade"></div>
                            <div class="sl-album-badge">● PHÒNG TRÀ CA NHẠC TRỰC TUYẾN • CHUẨN HI-FI</div>
                        </div>

                        <div class="sl-track-info">
                            <div class="sl-track-title" id="sl-track-title">ĐÊM ÊM • Giai Điệu Thư Giãn</div>
                            <div class="sl-track-artist" id="sl-track-artist">Kênh #${String(musicCh.num).padStart(2, '0')} ${musicCh.name} • Trực tiếp chất lượng cao</div>
                            <div class="sl-source-status">
                                <span>🎧 Không gian âm thanh thư giãn cao cấp cùng CyberTV</span>
                            </div>
                        </div>

                        <div class="sl-transport-row">
                            <div class="sl-transport-btn primary ct-focusable" data-zone="2" data-num="${musicCh.num}">
                                <span>▶ Phát Kênh Ca Nhạc #20</span>
                            </div>
                            <div class="sl-transport-btn ct-focusable" data-zone="2" data-pkg="com.google.android.youtube.tv">
                                <span>🎵 YouTube Music</span>
                            </div>
                            <div class="sl-transport-btn ct-focusable" data-zone="2" data-pkg="io.gh.reisxd.tizentube.cobalt">
                                <span>📻 TizenTube</span>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT HALF: 5 LARGE STACKED CATEGORY CARDS + BOTTOM SUGGESTED CONTENT -->
                    <div class="sl-right-stage">
                        <div class="sl-deck-list">
                            ${deckCards.map((c, idx) => `
                                <div class="sl-deck-card ct-focusable"
                                     data-zone="1"
                                     data-deck-idx="${idx}"
                                     data-preview-img="${c.thumb}"
                                     data-preview-title="${c.title}"
                                     data-preview-sub="${c.sub}"
                                     ${c.num ? `data-num="${c.num}"` : ''}
                                     ${c.pkg ? `data-pkg="${c.pkg}"` : ''}
                                     ${c.action ? `data-action="${c.action}"` : ''}>
                                    <div class="sl-deck-text">
                                        <div class="sl-deck-title">${c.title}</div>
                                        <div class="sl-deck-sub">${c.sub}</div>
                                    </div>
                                    <div class="sl-deck-art">
                                        <img src="${c.thumb}" alt="">
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- BOTTOM-RIGHT: SUGGESTED CHANNELS & MUSIC APPS (ZONE 2) -->
                        <div class="sl-queue-section">
                            <div class="sl-queue-header">
                                <span>LỐI TẮT NHANH & GỢI Ý</span>
                                <span style="color:#F59E0B;font-size:11px;font-weight:600;">Ca nhạc • Ứng dụng • Giải trí</span>
                            </div>
                            <div class="sl-queue-grid">
                                ${queueItems.map(q => `
                                    <div class="sl-queue-card ct-focusable"
                                         data-zone="2"
                                         ${q.num ? `data-num="${q.num}"` : ''}
                                         ${q.pkg ? `data-pkg="${q.pkg}"` : ''}>
                                        <img class="sl-queue-thumb" src="${q.thumb}" alt="">
                                        <div class="sl-queue-meta">
                                            <div class="sl-queue-tag">${q.tag}</div>
                                            <div class="sl-queue-name">${q.name}</div>
                                            <div class="sl-queue-sub">${q.sub}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const zone0 = Array.from(stage.querySelectorAll('[data-zone="0"]')); // Top bar icons
        const zone1 = Array.from(stage.querySelectorAll('[data-zone="1"]')); // index 0 = Left Album Frame; index 1..5 = Right 5 Stacked Category Cards
        const zone2 = Array.from(stage.querySelectorAll('[data-zone="2"]')); // index 0..2 = Left 3 Transport Buttons; index 3..5 = Bottom-right 3 Suggested Cards
        customNavZones = [zone0, zone1, zone2];
        customRow = 1;
        customCol = 1; // Default focus on the first right category card ("Nhạc thư giãn") matching the concept image!

        stage.querySelectorAll('.ct-focusable').forEach(el => {
            const onClick = () => activateCustomElement(el);
            el.addEventListener('click', onClick);
            themeCleanupCallbacks.push(() => el.removeEventListener('click', onClick));
        });

        activeClockInterval = setInterval(() => {
            const c = getClockData();
            const el = document.getElementById('sl-clock');
            if (el) el.innerText = c.timeStr;
        }, 5000);
    }

    // ------------------------------------------------------------------------
    // 7. FOCUS & D-PAD NAVIGATION ENGINE FOR ALL 5 CUSTOM THEMES
    // ------------------------------------------------------------------------
    function refreshCustomFocus() {
        document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
        if (!customNavZones || customNavZones.length === 0) return;

        customRow = Math.max(0, Math.min(customRow, customNavZones.length - 1));
        const rowItems = customNavZones[customRow] || [];
        if (rowItems.length === 0) return;

        customCol = Math.max(0, Math.min(customCol, rowItems.length - 1));
        const target = rowItems[customCol];
        if (!target) return;

        target.classList.add('focused');
        try {
            // Only scroll specific horizontal containers, NEVER scroll the main TV window/body vertically!
            const scrollContainer = target.closest('.ch-shelf-row, .va-schedule-strip, .aura-stage-carousel');
            if (scrollContainer) {
                target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        } catch (e) {}
        if (window.scrollY !== 0 || window.scrollX !== 0) {
            window.scrollTo(0, 0);
        }

        // Dynamic Hero Preview when navigating shelves in Cinema Horizon
        if (activeThemeId === 'cinema-horizon') {
            if (target.hasAttribute('data-pkg')) {
                const title = target.getAttribute('data-name');
                const titleEl = document.getElementById('ch-hero-title');
                const subEl = document.getElementById('ch-hero-subtitle');
                const descEl = document.getElementById('ch-hero-desc');
                const bgEl = document.getElementById('ch-hero-backdrop');
                const watchBtn = document.getElementById('ch-hero-watch-btn');
                const pkg = target.getAttribute('data-pkg');
                const img = target.querySelector('.ch-live-card-bg');
                if (titleEl) titleEl.innerText = title;
                if (subEl) subEl.innerText = 'LỊCH SỬ XEM GẦN ĐÂY • ỨNG DỤNG GIẢI TRÍ';
                if (descEl) descEl.innerText = 'Bấm phím OK để mở ứng dụng tiếp tục xem.';
                if (bgEl && img) bgEl.style.backgroundImage = `url('${img.src}')`;
                if (watchBtn) {
                    watchBtn.removeAttribute('data-num');
                    watchBtn.setAttribute('data-pkg', pkg);
                }
            } else if (target.hasAttribute('data-num') && customRow >= 2) {
                const num = target.getAttribute('data-num');
                const ch = getChannelByNum(num);
                if (ch) {
                    const titleEl = document.getElementById('ch-hero-title');
                    const subEl = document.getElementById('ch-hero-subtitle');
                    const descEl = document.getElementById('ch-hero-desc');
                    const bgEl = document.getElementById('ch-hero-backdrop');
                    const watchBtn = document.getElementById('ch-hero-watch-btn');
                    if (titleEl) titleEl.innerText = ch.name;
                    if (subEl) subEl.innerText = `KÊNH #${String(ch.num).padStart(2, '0')} • ${ch.catLabel}`;
                    if (descEl) descEl.innerText = ch.desc;
                    if (bgEl) bgEl.style.backgroundImage = `url('${getChannelBackdrop(ch.num)}')`;
                    if (watchBtn) {
                        watchBtn.removeAttribute('data-pkg');
                        watchBtn.setAttribute('data-num', String(ch.num));
                    }
                }
            }
        }

        // Dynamic upward card expansion in Kyoto Living when focusing any of the 4 main Washi Pillar cards
        if (activeThemeId === 'kyoto-living' && customRow === 1 && target.classList.contains('kl-pillar-card')) {
            document.querySelectorAll('#custom-theme-stage .kl-pillar-card').forEach(card => {
                card.classList.toggle('expanded', card === target);
            });
        }

        // Dynamic turntable album preview update when focusing right deck cards in Sonata Lounge
        if (activeThemeId === 'sonata-lounge' && customRow === 1 && target.classList.contains('sl-deck-card')) {
            const imgUrl = target.getAttribute('data-preview-img');
            const pTitle = target.getAttribute('data-preview-title');
            const pSub = target.getAttribute('data-preview-sub');
            const albumImg = document.getElementById('sl-album-img');
            const trackTitle = document.getElementById('sl-track-title');
            const trackArtist = document.getElementById('sl-track-artist');
            if (albumImg && imgUrl) albumImg.src = imgUrl;
            if (trackTitle && pTitle) trackTitle.innerText = `ĐÊM ÊM • ${pTitle}`;
            if (trackArtist && pSub) trackArtist.innerText = pSub;
        }
    }

    function activateCustomElement(el) {
        if (!el) return;

        if (el.hasAttribute('data-aura-filter')) {
            auraCategoryFilter = el.getAttribute('data-aura-filter') || 'all';
            auraCenterIndex = 0;
            const stage = ensureStageContainers();
            renderAuraStage(stage);
            customRow = 1;
            refreshCustomFocus();
            return;
        }

        if (el.hasAttribute('data-num')) {
            const num = parseInt(el.getAttribute('data-num'), 10);
            playChannelByNumber(num);
            return;
        }

        if (el.hasAttribute('data-pkg')) {
            launchAppByPkg(el.getAttribute('data-pkg'));
            return;
        }

        const action = el.getAttribute('data-action');
        if (action === 'themes') {
            openThemeStoreModal();
        } else if (action === 'channels' || action === 'search') {
            openChannelBrowserModal('all');
        } else if (action === 'apps') {
            openChannelBrowserModal('apps');
        } else if (action === 'cleanram') {
            triggerCleanRam();
        } else if (action === 'settings') {
            launchAppByPkg('settings');
        } else if (action === 'googletv') {
            if (window.AndroidBridge && typeof window.AndroidBridge.openGoogleTV === 'function') {
                window.AndroidBridge.openGoogleTV();
            } else {
                showEngineToast('GOOGLE TV GỐC', 'Đang chuyển về màn hình chính Google TV...');
            }
        } else if (action === 'toggle-bg') {
            window.toggleBackgroundEffects();
            renderCurrentThemeStage();
        } else if (action === 'artwork') {
            if (typeof window.zenNextSlide === 'function') {
                window.zenNextSlide();
                showEngineToast('TRIỂN LÃM THE FRAME', 'Chuyển kiệt tác nghệ thuật kế tiếp');
            } else {
                showEngineToast('TRIỂN LÃM THE FRAME', 'Đang trình diễn slide tranh nghệ thuật 4K...');
            }
        } else if (action === 'home') {
            customRow = 1;
            customCol = 0;
            refreshCustomFocus();
        }
    }

    function handleCustomThemeKey(keyCode) {
        // Special spatial navigation rules per layout
        if (activeThemeId === 'aura-stage') {
            // In Aura Stage, when on Row 0 (Coverflow Stage), Left/Right rotates the 3D poster carousel!
            if (customRow === 0) {
                if (keyCode === 22) { // RIGHT
                    auraCenterIndex++;
                    renderAuraStage(ensureStageContainers());
                    customRow = 0;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 21) { // LEFT
                    auraCenterIndex--;
                    renderAuraStage(ensureStageContainers());
                    customRow = 0;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 20) { // DOWN -> go to bottom dock
                    customRow = 1;
                    customCol = 0;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 23 || keyCode === 66) {
                    const centerEl = customNavZones[0] && customNavZones[0][0];
                    activateCustomElement(centerEl);
                    return true;
                }
            } else if (customRow === 1) {
                if (keyCode === 19) { // UP -> back to Center Poster
                    customRow = 0;
                    customCol = 0;
                    refreshCustomFocus();
                    return true;
                }
            }
        }

        if (activeThemeId === 'orbit-os') {
            // Zone 0: Top Bar (4 pills: Search 0, Themes 1, RAM 2, Settings 3)
            // Zone 1: Left Panel (2 buttons: Xem ngay 0, Danh sách kênh 1)
            // Zone 2: Center Live TV Portal (col 0)
            // Zone 3: 8 Orbital Nodes (0:Top Truyền hình, 1:TR YouTube, 2:R Cho Phim, 3:BR VTV3, 4:B Khám phá, 5:BL Kho Theme, 6:L Netflix, 7:TL TizenTube)

            if (customRow === 0) { // Top bar
                if (keyCode === 20) { // DOWN from Top Bar
                    if (customCol === 0) {
                        customRow = 1; // Left panel Xem ngay
                        customCol = 0;
                    } else if (customCol === 1) {
                        customRow = 3; // Top node (Truyền hình)
                        customCol = 0;
                    } else if (customCol === 2) {
                        customRow = 3; // Top-right node (YouTube)
                        customCol = 1;
                    } else {
                        customRow = 3; // Right node (Cho Phim TV)
                        customCol = 2;
                    }
                    refreshCustomFocus();
                    return true;
                }
            } else if (customRow === 1) { // Left Panel buttons (0: Xem ngay, 1: Danh sách kênh)
                if (keyCode === 22) { // RIGHT
                    if (customCol === 0) {
                        customCol = 1; // Move to Danh sách kênh
                    } else {
                        customRow = 2; // Jump to Center Live TV Portal
                        customCol = 0;
                    }
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 21) { // LEFT
                    if (customCol > 0) {
                        customCol = 0;
                        refreshCustomFocus();
                        return true;
                    }
                } else if (keyCode === 19) { // UP -> Top Bar Search
                    customRow = 0;
                    customCol = 0;
                    refreshCustomFocus();
                    return true;
                }
            } else if (customRow === 2) { // Center Live TV Portal
                if (keyCode === 21) { // LEFT -> Left Panel "Danh sách kênh"
                    customRow = 1;
                    customCol = 1;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 19) { // UP -> Top orbit node (0: Truyền hình)
                    customRow = 3;
                    customCol = 0;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 22) { // RIGHT -> Right orbit node (2: Cho Phim TV)
                    customRow = 3;
                    customCol = 2;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 20) { // DOWN -> Bottom orbit node (4: Ứng dụng khác)
                    customRow = 3;
                    customCol = 4;
                    refreshCustomFocus();
                    return true;
                }
            } else if (customRow === 3) { // 8 Orbit Nodes (0..7)
                if (customCol === 0) { // Top (Truyền hình)
                    if (keyCode === 19) { customRow = 0; customCol = 1; } // UP -> Top Bar Themes
                    else if (keyCode === 20) { customRow = 2; customCol = 0; } // DOWN -> Center Portal
                    else if (keyCode === 21) { customCol = 7; } // LEFT -> Node 7 (TizenTube)
                    else if (keyCode === 22) { customCol = 1; } // RIGHT -> Node 1 (YouTube)
                    refreshCustomFocus();
                    return true;
                } else if (customCol === 1) { // Top-Right (YouTube)
                    if (keyCode === 19) { customRow = 0; customCol = 2; } // UP -> Top Bar RAM
                    else if (keyCode === 21) { customRow = 2; customCol = 0; } // LEFT -> Center Portal
                    else if (keyCode === 20 || keyCode === 22) { customCol = 2; } // DOWN/RIGHT -> Node 2
                    refreshCustomFocus();
                    return true;
                } else if (customCol === 2) { // Right (Cho Phim TV)
                    if (keyCode === 21) { customRow = 2; customCol = 0; } // LEFT -> Center Portal
                    else if (keyCode === 19) { customCol = 1; } // UP -> Node 1 (YouTube)
                    else if (keyCode === 20) { customCol = 3; } // DOWN -> Node 3 (VTV3 HD)
                    refreshCustomFocus();
                    return true;
                } else if (customCol === 3) { // Bottom-Right (VTV3 HD)
                    if (keyCode === 21) { customRow = 2; customCol = 0; } // LEFT -> Center Portal
                    else if (keyCode === 19) { customCol = 2; } // UP -> Node 2 (Cho Phim TV)
                    else if (keyCode === 20) { customCol = 4; } // DOWN -> Node 4 (Ứng dụng khác)
                    refreshCustomFocus();
                    return true;
                } else if (customCol === 4) { // Bottom (Ứng dụng khác)
                    if (keyCode === 19) { customRow = 2; customCol = 0; } // UP -> Center Portal
                    else if (keyCode === 21) { customCol = 5; } // LEFT -> Node 5 (Kho Theme)
                    else if (keyCode === 22) { customCol = 3; } // RIGHT -> Node 3 (VTV3 HD)
                    refreshCustomFocus();
                    return true;
                } else if (customCol === 5) { // Bottom-Left (Kho Theme)
                    if (keyCode === 22) { customRow = 2; customCol = 0; } // RIGHT -> Center Portal
                    else if (keyCode === 21) { customRow = 1; customCol = 1; } // LEFT -> Left Panel
                    else if (keyCode === 19) { customCol = 6; } // UP -> Node 6 (Netflix)
                    else if (keyCode === 20) { customCol = 4; } // DOWN -> Node 4 (Ứng dụng khác)
                    refreshCustomFocus();
                    return true;
                } else if (customCol === 6) { // Left (Netflix)
                    if (keyCode === 22) { customRow = 2; customCol = 0; } // RIGHT -> Center Portal
                    else if (keyCode === 21) { customRow = 1; customCol = 0; } // LEFT -> Left Panel
                    else if (keyCode === 19) { customCol = 7; } // UP -> Node 7 (TizenTube)
                    else if (keyCode === 20) { customCol = 5; } // DOWN -> Node 5 (Kho Theme)
                    refreshCustomFocus();
                    return true;
                } else if (customCol === 7) { // Top-Left (TizenTube)
                    if (keyCode === 19) { customRow = 0; customCol = 0; } // UP -> Top Bar Search
                    else if (keyCode === 22) { customCol = 0; } // RIGHT -> Node 0 (Truyền hình)
                    else if (keyCode === 21) { customRow = 1; customCol = 0; } // LEFT -> Left Panel
                    else if (keyCode === 20) { customRow = 2; customCol = 0; } // DOWN -> Center Portal
                    refreshCustomFocus();
                    return true;
                }
            }
        }

        if (activeThemeId === 'zen-gallery') {
            // Zone 0: Top bar, Zone 1: Left large TV frame, Zone 2: Right 3 stacked cards, Zone 3: Bottom dock
            if (customRow === 0) { // Top bar
                if (keyCode === 20) { // DOWN from Top Bar
                    if (customCol <= 2) {
                        // From Trang chủ, Truyền hình, Theme -> Left TV frame
                        customRow = 1;
                        customCol = 0;
                    } else {
                        // From Thiết lập, Search -> Right stack top card
                        customRow = 2;
                        customCol = 0;
                    }
                    refreshCustomFocus();
                    return true;
                }
            } else if (customRow === 1) { // Left TV frame
                if (keyCode === 22) { // RIGHT -> Right stack top card
                    customRow = 2;
                    customCol = 0;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 20) { // DOWN -> Bottom dock
                    customRow = 3;
                    customCol = 0;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 19) { // UP -> Top bar
                    customRow = 0;
                    customCol = 0;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 21) { // LEFT -> Previous slide
                    if (typeof window.zenPrevSlide === 'function') {
                        window.zenPrevSlide();
                        return true;
                    }
                }
            } else if (customRow === 2) { // Right vertical stack (col 0, 1, 2 stacked vertically!)
                if (keyCode === 20) { // DOWN through stack, then to bottom dock
                    if (customCol < customNavZones[2].length - 1) {
                        customCol++;
                    } else {
                        customRow = 3;
                        customCol = Math.min(3, customNavZones[3].length - 1);
                    }
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 19) { // UP through stack, then to top bar
                    if (customCol > 0) {
                        customCol--;
                    } else {
                        customRow = 0;
                        customCol = 3;
                    }
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 21) { // LEFT -> back to Left TV frame
                    customRow = 1;
                    customCol = 0;
                    refreshCustomFocus();
                    return true;
                }
            } else if (customRow === 3 && keyCode === 19) { // UP from bottom dock -> Left TV frame
                customRow = 1;
                customCol = 0;
                refreshCustomFocus();
                return true;
            }
        }

        if (activeThemeId === 'nexus-command') {
            // Zone 0 is vertical sidebar (items 0..6), Zones 1, 2, 3 are Bento rows
            if (customRow === 0) {
                if (keyCode === 20) { // DOWN in vertical sidebar
                    if (customCol < customNavZones[0].length - 1) customCol++;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 19) { // UP in vertical sidebar
                    if (customCol > 0) customCol--;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 22) { // RIGHT -> enter Bento Grid
                    customRow = 1;
                    customCol = 0;
                    refreshCustomFocus();
                    return true;
                }
            } else if (customRow >= 1 && keyCode === 21 && customCol === 0) {
                // LEFT from leftmost Bento card -> enter Left Vertical Sidebar
                const targetSidebarIdx = customRow === 1 ? 0 : (customRow === 2 ? 1 : 3);
                customRow = 0;
                customCol = Math.min(targetSidebarIdx, customNavZones[0].length - 1);
                refreshCustomFocus();
                return true;
            }
        }

        if (activeThemeId === 'prism-float') {
            // Zone 0: Left vertical glass rail (0..6)
            // Zone 1: Top-left Weather card (0) + Top-right Movie card (1)
            // Zone 2: Center Foreground Live TV stage (0) + 2 inner CTA buttons (1, 2)
            // Zone 3: Bottom-right 4 Recent cards (0..3)
            if (customRow === 0) {
                if (keyCode === 20) { // DOWN along left glass rail
                    if (customCol < customNavZones[0].length - 1) customCol++;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 19) { // UP along left glass rail
                    if (customCol > 0) customCol--;
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 22) { // RIGHT -> enter spatial canvas (Center Live TV stage or Top-left Weather)
                    customRow = customCol <= 1 ? 1 : 2;
                    customCol = 0;
                    refreshCustomFocus();
                    return true;
                }
            } else if (customRow >= 1 && keyCode === 21 && customCol === 0) {
                // LEFT from leftmost spatial card -> enter Left Glass Rail
                const railIdx = customRow === 1 ? 0 : (customRow === 2 ? 1 : 4);
                customRow = 0;
                customCol = Math.min(railIdx, customNavZones[0].length - 1);
                refreshCustomFocus();
                return true;
            }
        }

        if (activeThemeId === 'edition-noir') {
            // Zone 0: Top sub-nav + icons
            // Zone 1: Left CTA (0), Center Vertical Poster (1), Right Top Horizontal Card (2), Right Bottom Horizontal Card (3)
            // Zone 2: Bottom 8 category items
            if (customRow === 1) {
                if (keyCode === 20) { // DOWN
                    if (customCol === 2) {
                        // From Right Top Card -> Right Bottom Card
                        customCol = 3;
                    } else {
                        // Go to Bottom Category Bar
                        customRow = 2;
                        customCol = Math.min(customCol * 2, customNavZones[2].length - 1);
                    }
                    refreshCustomFocus();
                    return true;
                } else if (keyCode === 19) { // UP
                    if (customCol === 3) {
                        // From Right Bottom Card -> Right Top Card
                        customCol = 2;
                    } else {
                        customRow = 0;
                        customCol = Math.min(customCol, customNavZones[0].length - 1);
                    }
                    refreshCustomFocus();
                    return true;
                }
            }
        }

        if (activeThemeId === 'velocity-arena') {
            // Zone 0: Top nav bar
            // Zone 1: Left Large Live Broadcast Stage (0), Right Sports Cards (1, 2, 3 stacked vertically)
            // Zone 2: Bottom 6 Schedule & Channel cards
            if (customRow === 1) {
                if (customCol === 0) { // On Left Large Live Stage
                    if (keyCode === 22) { // RIGHT -> Right panel top card
                        customCol = 1;
                        refreshCustomFocus();
                        return true;
                    } else if (keyCode === 20) { // DOWN -> Bottom schedule strip
                        customRow = 2;
                        customCol = 0;
                        refreshCustomFocus();
                        return true;
                    } else if (keyCode === 19) { // UP -> Top nav bar
                        customRow = 0;
                        customCol = 0;
                        refreshCustomFocus();
                        return true;
                    }
                } else { // On Right Sports Center stacked cards (1, 2, 3)
                    if (keyCode === 20) { // DOWN through stacked cards, then to bottom strip
                        if (customCol < customNavZones[1].length - 1) {
                            customCol++;
                        } else {
                            customRow = 2;
                            customCol = Math.min(3, customNavZones[2].length - 1);
                        }
                        refreshCustomFocus();
                        return true;
                    } else if (keyCode === 19) { // UP through stacked cards, then to top bar
                        if (customCol > 1) {
                            customCol--;
                        } else {
                            customRow = 0;
                            customCol = Math.min(3, customNavZones[0].length - 1);
                        }
                        refreshCustomFocus();
                        return true;
                    } else if (keyCode === 21) { // LEFT -> back to Left Large Live Stage
                        customCol = 0;
                        refreshCustomFocus();
                        return true;
                    }
                }
            } else if (customRow === 2 && keyCode === 19) {
                customRow = 1;
                customCol = customCol >= 3 ? 3 : 0;
                refreshCustomFocus();
                return true;
            }
        }

        if (activeThemeId === 'sonata-lounge') {
            // Zone 0: Top bar icons (0..2)
            // Zone 1: Left Album Frame (0), Right 5 Stacked Category Cards (1..5)
            // Zone 2: Left 3 Transport Buttons (0..2), Bottom-Right 3 Suggested Queue Cards (3..5)
            if (customRow === 1) {
                if (customCol === 0) { // On Left Album Frame
                    if (keyCode === 22) { // RIGHT -> First Right Category Card
                        customCol = 1;
                        refreshCustomFocus();
                        return true;
                    } else if (keyCode === 20) { // DOWN -> First Transport Button
                        customRow = 2;
                        customCol = 0;
                        refreshCustomFocus();
                        return true;
                    } else if (keyCode === 19) { // UP -> Top bar
                        customRow = 0;
                        customCol = 0;
                        refreshCustomFocus();
                        return true;
                    }
                } else { // On Right 5 Stacked Category Cards (col 1..5)
                    if (keyCode === 20) { // DOWN through the 5 stacked cards, then to Bottom-Right Queue
                        if (customCol < customNavZones[1].length - 1) {
                            customCol++;
                        } else {
                            customRow = 2;
                            customCol = 3; // First bottom-right queue card
                        }
                        refreshCustomFocus();
                        return true;
                    } else if (keyCode === 19) { // UP through the 5 stacked cards, then to Top bar
                        if (customCol > 1) {
                            customCol--;
                        } else {
                            customRow = 0;
                            customCol = 0;
                        }
                        refreshCustomFocus();
                        return true;
                    } else if (keyCode === 21) { // LEFT -> Left Album Frame or Transport
                        customCol = 0;
                        refreshCustomFocus();
                        return true;
                    }
                }
            } else if (customRow === 2) {
                if (keyCode === 19) { // UP from bottom row
                    customRow = 1;
                    customCol = customCol >= 3 ? customNavZones[1].length - 1 : 0;
                    refreshCustomFocus();
                    return true;
                }
            }
        }

        // Default 2D Grid Navigation
        const rowItems = customNavZones[customRow] || [];
        if (keyCode === 22) { // RIGHT
            if (customCol < rowItems.length - 1) customCol++;
            refreshCustomFocus();
            return true;
        } else if (keyCode === 21) { // LEFT
            if (customCol > 0) customCol--;
            refreshCustomFocus();
            return true;
        } else if (keyCode === 20) { // DOWN
            if (customRow < customNavZones.length - 1) {
                customRow++;
                customCol = Math.min(customCol, (customNavZones[customRow] || []).length - 1);
                refreshCustomFocus();
            }
            return true;
        } else if (keyCode === 19) { // UP
            if (customRow > 0) {
                customRow--;
                customCol = Math.min(customCol, (customNavZones[customRow] || []).length - 1);
                refreshCustomFocus();
            }
            return true;
        } else if (keyCode === 23 || keyCode === 66) { // ENTER / OK
            const target = rowItems[customCol];
            activateCustomElement(target);
            return true;
        }

        return false;
    }

    // ------------------------------------------------------------------------
    // 8. IN-APP THEME STORE MODAL & ALL-CHANNELS / APPS MODAL
    // ------------------------------------------------------------------------
    function openThemeStoreModal() {
        ensureStageContainers();
        const modal = document.getElementById('ct-theme-store-modal');
        if (!modal) return;

        currentModal = 'theme-store';
        renderThemeStoreModalContent();
        modal.classList.add('active');

        // Focus current active theme card in the store
        const idx = manifestRegistry.themes.findIndex(t => t.id === activeThemeId);
        modalRow = 1;
        modalCol = idx >= 0 ? idx : 0;
        refreshModalFocus();
    }

    function closeModals() {
        const storeModal = document.getElementById('ct-theme-store-modal');
        const browserModal = document.getElementById('ct-channel-browser-modal');
        if (storeModal) storeModal.classList.remove('active');
        if (browserModal) browserModal.classList.remove('active');
        const wasOpen = currentModal !== 'none';
        currentModal = 'none';

        if (activeThemeId === 'cybertv-classic') {
            if (typeof window.refreshFocus === 'function') window.refreshFocus();
        } else {
            refreshCustomFocus();
        }
        return wasOpen;
    }

    function getThemeMiniWireframe(themeId, accent) {
        switch (themeId) {
            case 'cybertv-classic':
                return `
                    <div style="position:absolute;inset:12px 14px 36px 14px;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none;opacity:0.85;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div style="width:42px;height:8px;border-radius:4px;background:rgba(255,255,255,0.28);"></div>
                            <div style="width:64px;height:8px;border-radius:4px;background:${accent};opacity:0.5;"></div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
                            <div style="height:34px;border-radius:6px;background:rgba(255,255,255,0.12);border:1.5px solid ${accent};"></div>
                            <div style="height:34px;border-radius:6px;background:rgba(255,255,255,0.08);"></div>
                            <div style="height:34px;border-radius:6px;background:rgba(255,255,255,0.08);"></div>
                            <div style="height:34px;border-radius:6px;background:rgba(255,255,255,0.08);"></div>
                        </div>
                        <div style="display:flex;gap:5px;">
                            <div style="width:24px;height:10px;border-radius:3px;background:rgba(255,255,255,0.18);"></div>
                            <div style="width:24px;height:10px;border-radius:3px;background:rgba(255,255,255,0.18);"></div>
                            <div style="width:24px;height:10px;border-radius:3px;background:rgba(255,255,255,0.18);"></div>
                        </div>
                    </div>
                `;
            case 'cinema-horizon':
                return `
                    <div style="position:absolute;inset:12px 14px 36px 14px;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none;opacity:0.9;">
                        <div style="height:46px;border-radius:8px;background:linear-gradient(90deg, rgba(229,184,105,0.28), rgba(255,255,255,0.05));border:1px solid rgba(229,184,105,0.45);padding:6px 8px;display:flex;flex-direction:column;justify-content:flex-end;gap:4px;">
                            <div style="width:55%;height:7px;border-radius:3px;background:#f7f3eb;"></div>
                            <div style="width:28%;height:6px;border-radius:3px;background:${accent};"></div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">
                            <div style="height:18px;border-radius:4px;background:rgba(255,255,255,0.14);border:1px solid ${accent};"></div>
                            <div style="height:18px;border-radius:4px;background:rgba(255,255,255,0.08);"></div>
                            <div style="height:18px;border-radius:4px;background:rgba(255,255,255,0.08);"></div>
                            <div style="height:18px;border-radius:4px;background:rgba(255,255,255,0.08);"></div>
                        </div>
                    </div>
                `;
            case 'orbit-os':
                return `
                    <div style="position:absolute;inset:10px 14px 34px 14px;display:flex;align-items:center;justify-content:space-between;pointer-events:none;opacity:0.9;">
                        <div style="width:34%;height:100%;display:flex;flex-direction:column;justify-content:space-between;">
                            <div style="height:26px;border-radius:6px;background:rgba(125,211,252,0.14);border:1px solid rgba(125,211,252,0.3);"></div>
                            <div style="height:36px;border-radius:6px;background:rgba(255,255,255,0.08);"></div>
                        </div>
                        <div style="width:68px;height:68px;border-radius:50%;border:1.5px dashed rgba(125,211,252,0.55);display:flex;align-items:center;justify-content:center;position:relative;margin-right:10px;">
                            <div style="width:34px;height:34px;border-radius:50%;background:rgba(125,211,252,0.28);border:1.5px solid ${accent};"></div>
                        </div>
                    </div>
                `;
            case 'zen-gallery':
                return `
                    <div style="position:absolute;inset:10px 14px 34px 14px;display:flex;flex-direction:column;gap:5px;pointer-events:none;">
                        <div style="flex:1;display:grid;grid-template-columns:1.7fr 1fr;gap:6px;">
                            <div style="border-radius:6px;background:#2c2824;border:1.5px solid #B08D57;"></div>
                            <div style="display:flex;flex-direction:column;gap:4px;">
                                <div style="flex:1;border-radius:4px;background:rgba(35,33,30,0.14);"></div>
                                <div style="flex:1;border-radius:4px;background:rgba(35,33,30,0.26);"></div>
                            </div>
                        </div>
                        <div style="height:10px;border-radius:4px;background:rgba(35,33,30,0.16);"></div>
                    </div>
                `;
            case 'nexus-command':
                return `
                    <div style="position:absolute;inset:10px 14px 34px 14px;display:grid;grid-template-columns:16px 1fr;gap:6px;pointer-events:none;opacity:0.9;">
                        <div style="border-radius:5px;background:rgba(16,185,129,0.25);border:1px solid rgba(16,185,129,0.45);"></div>
                        <div style="display:grid;grid-template-columns:1.5fr 1fr;grid-template-rows:1.3fr 1fr;gap:5px;">
                            <div style="border-radius:5px;background:rgba(16,185,129,0.2);border:1.5px solid ${accent};"></div>
                            <div style="border-radius:5px;background:rgba(255,255,255,0.08);"></div>
                            <div style="border-radius:5px;background:rgba(255,255,255,0.08);"></div>
                            <div style="border-radius:5px;background:rgba(255,255,255,0.08);"></div>
                        </div>
                    </div>
                `;
            case 'prism-float':
                return `
                    <div style="position:absolute;inset:10px 14px 34px 14px;display:grid;grid-template-columns:16px 1fr;gap:6px;pointer-events:none;opacity:0.94;">
                        <div style="border-radius:6px;background:rgba(226,232,240,0.22);border:1px solid rgba(255,255,255,0.38);"></div>
                        <div style="position:relative;">
                            <div style="position:absolute;top:0;left:0;width:36%;height:20px;border-radius:5px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.25);"></div>
                            <div style="position:absolute;top:0;right:0;width:54%;height:26px;border-radius:6px;background:rgba(125,211,252,0.2);border:1px solid rgba(125,211,252,0.4);"></div>
                            <div style="position:absolute;top:22px;left:4%;width:66%;height:36px;border-radius:7px;background:rgba(15,23,42,0.85);border:1.5px solid ${accent};box-shadow:0 4px 12px rgba(0,0,0,0.4);"></div>
                            <div style="position:absolute;bottom:0;right:0;width:56%;height:14px;border-radius:4px;background:rgba(255,255,255,0.14);"></div>
                        </div>
                    </div>
                `;
            case 'edition-noir':
                return `
                    <div style="position:absolute;inset:10px 14px 34px 14px;display:flex;flex-direction:column;gap:5px;pointer-events:none;opacity:0.94;">
                        <div style="flex:1;display:grid;grid-template-columns:1fr 0.9fr 1.1fr;gap:6px;">
                            <div style="display:flex;flex-direction:column;justify-content:center;gap:4px;">
                                <div style="width:75%;height:10px;border-radius:2px;background:#F3E5AB;"></div>
                                <div style="width:92%;height:10px;border-radius:2px;background:#EF4444;"></div>
                                <div style="width:55%;height:8px;border-radius:999px;background:rgba(245,240,230,0.25);margin-top:2px;"></div>
                            </div>
                            <div style="border-radius:3px;background:rgba(239,68,68,0.18);border:1.5px solid #F5F0E6;"></div>
                            <div style="display:flex;flex-direction:column;gap:4px;">
                                <div style="flex:1;border-radius:4px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);"></div>
                                <div style="flex:1;border-radius:4px;background:rgba(255,255,255,0.08);"></div>
                            </div>
                        </div>
                        <div style="height:7px;border-radius:3px;background:rgba(245,240,230,0.15);"></div>
                    </div>
                `;
            case 'sonata-lounge':
                return `
                    <div style="position:absolute;inset:10px 14px 34px 14px;display:grid;grid-template-columns:0.88fr 1.12fr;gap:6px;pointer-events:none;opacity:0.94;">
                        <div style="display:flex;flex-direction:column;gap:4px;">
                            <div style="flex:1;border-radius:6px;background:rgba(245,158,11,0.22);border:1.5px solid ${accent};"></div>
                            <div style="height:9px;border-radius:4px;background:rgba(245,158,11,0.35);"></div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <div style="flex:1;border-radius:4px;background:rgba(245,158,11,0.25);border:1px solid ${accent};"></div>
                            <div style="flex:1;border-radius:4px;background:rgba(255,255,255,0.08);"></div>
                            <div style="flex:1;border-radius:4px;background:rgba(255,255,255,0.08);"></div>
                            <div style="height:10px;border-radius:3px;background:rgba(255,255,255,0.12);"></div>
                        </div>
                    </div>
                `;
            default:
                return '';
        }
    }

    function renderThemeStoreModalContent() {
        const modal = document.getElementById('ct-theme-store-modal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="ct-modal-header">
                <div class="ct-modal-title-group">
                    <div class="ct-modal-eyebrow">CYBERTV THEME STORE • 8 GIAO DIỆN ĐỘC BẢN</div>
                    <div class="ct-modal-title">Kho Giao Diện Truyền Hình</div>
                </div>
                <div class="ct-modal-controls">
                    <div class="ct-modal-btn ct-store-focus" data-store-zone="0" data-store-action="toggle-bg">
                        <span>⚡ Hiệu ứng nền: <b>${activeBgEffects ? 'BẬT' : 'TẮT'}</b></span>
                    </div>
                    <div class="ct-modal-btn ct-store-focus" data-store-zone="0" data-store-action="close">
                        <span>✕ Đóng</span>
                    </div>
                </div>
            </div>

            <div class="theme-store-grid">
                ${manifestRegistry.themes.map((t) => {
                    const isCurrent = t.id === activeThemeId;
                    const isLocked = t.isPremium && !checkIsPremiumUnlocked();
                    return `
                        <div class="ts-card ct-store-focus ${isLocked ? 'ts-card-locked' : ''}" data-store-zone="1" data-theme-id="${t.id}">
                            <div>
                                <div class="ts-card-preview" style="background:${t.bgPreview};">
                                    ${getThemeMiniWireframe(t.id, t.accentColor)}
                                    ${t.isPremium ? `<div class="ts-premium-badge">👑 PREMIUM</div>` : `<div class="ts-free-badge">MIỄN PHÍ</div>`}
                                    ${isCurrent ? `<div class="ts-active-badge">✓ ĐANG SỬ DỤNG</div>` : ''}
                                    ${isLocked ? `
                                        <div class="ts-lock-overlay">
                                            <div class="ts-lock-icon">🔒</div>
                                            <div class="ts-lock-text">MBBank 79.000đ</div>
                                        </div>
                                    ` : ''}
                                    <div class="ts-layout-tag">${t.layoutLabel}</div>
                                </div>
                                <div class="ts-card-title-row" style="margin-top:10px;">
                                    <div class="ts-card-name">${t.name}</div>
                                    <span style="width:10px;height:10px;border-radius:50%;background:${t.accentColor};display:inline-block;"></span>
                                </div>
                                <div class="ts-card-desc" style="margin-top:4px;">${t.description}</div>
                            </div>

                            <div class="ts-card-footer">
                                ${t.supportsColorStyles ? `
                                    <div class="ts-style-pills">
                                        ${t.styles.map(s => `
                                            <span class="ts-style-dot ${activeStyleId === s.id ? 'active' : ''}" data-style-id="${s.id}">${s.name}</span>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <span class="ts-card-spec">Tối ưu D-Pad</span>
                                `}
                                <span class="ts-action-hint ${isLocked ? 'ts-hint-locked' : ''}">
                                    ${isLocked ? '🔒 Mở khóa 79k' : (isCurrent && t.supportsColorStyles ? 'Đổi màu' : (isCurrent ? 'Đang dùng' : 'Áp dụng'))}
                                </span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        modal.querySelectorAll('.ct-store-focus').forEach((el) => {
            el.addEventListener('click', () => {
                triggerStoreElement(el);
            });
        });
    }

    function openChannelBrowserModal(mode) {
        ensureStageContainers();
        const modal = document.getElementById('ct-channel-browser-modal');
        if (!modal) return;

        channelBrowserFilter = mode || 'all';
        currentModal = 'channel-browser';
        renderChannelBrowserContent();
        modal.classList.add('active');
        modalRow = 1;
        modalCol = 0;
        refreshModalFocus();
    }

    function renderChannelBrowserContent() {
        const modal = document.getElementById('ct-channel-browser-modal');
        if (!modal) return;

        const isApps = channelBrowserFilter === 'apps';
        const channels = getChannels();
        const apps = getAppsList();

        modal.innerHTML = `
            <div class="ct-modal-header">
                <div class="ct-modal-title-group">
                    <div class="ct-modal-eyebrow">${isApps ? 'KHO ỨNG DỤNG SMART TV • ANDROID TV' : 'DANH SÁCH KÊNH TRUYỀN HÌNH TRỰC TIẾP'}</div>
                    <div class="ct-modal-title">${isApps ? 'Ứng Dụng Đã Cài Đặt' : `Tất Cả ${channels.length} Kênh Truyền Hình FHD`}</div>
                </div>
                <div class="ct-modal-controls">
                    <div class="ct-modal-btn ${!isApps ? 'active' : ''} ct-browser-focus" data-bzone="0" data-bmode="all">📺 60 Kênh TV</div>
                    <div class="ct-modal-btn ${isApps ? 'active' : ''} ct-browser-focus" data-bzone="0" data-bmode="apps">📦 Ứng dụng (${apps.length})</div>
                    <div class="ct-modal-btn ct-browser-focus" data-bzone="0" data-bmode="close">✕ Đóng</div>
                </div>
            </div>

            ${isApps ? `
                <div class="ct-app-grid">
                    ${apps.map(app => {
                        const info = getCleanAppInfo(app.pkg, app.title, app.desc);
                        return `
                            <div class="ct-app-card ct-browser-focus" data-bzone="1" data-pkg="${app.pkg}">
                                <div class="ct-app-icon-wrap" style="background:${app.iconBg || 'rgba(255,255,255,0.08)'};">
                                    ${app.iconHtml}
                                </div>
                                <div class="ct-app-info">
                                    <div class="ct-app-title">${info.title}</div>
                                    <div class="ct-app-sub"><span class="ct-app-tag">${info.tag}</span> • ${info.desc}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <div class="ct-channel-grid">
                    ${channels.map(ch => `
                        <div class="ct-channel-card ct-browser-focus" data-bzone="1" data-num="${ch.num}">
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <span style="font-size:11.5px;font-weight:900;color:#00f2fe;">#${String(ch.num).padStart(2, '0')}</span>
                                <span style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.65);">${ch.catLabel}</span>
                            </div>
                            <div style="font-size:14.5px;font-weight:800;color:#ffffff;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ch.name}</div>
                        </div>
                    `).join('')}
                </div>
            `}
        `;

        modal.querySelectorAll('.ct-browser-focus').forEach(el => {
            el.addEventListener('click', () => triggerBrowserElement(el));
        });
    }

    function refreshModalFocus() {
        if (currentModal === 'theme-store') {
            const modal = document.getElementById('ct-theme-store-modal');
            if (!modal) return;
            modal.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
            const z0 = Array.from(modal.querySelectorAll('[data-store-zone="0"]'));
            const z1 = Array.from(modal.querySelectorAll('[data-store-zone="1"]'));
            const zones = [z0, z1];
            modalRow = Math.max(0, Math.min(modalRow, zones.length - 1));
            const row = zones[modalRow];
            if (!row || row.length === 0) return;
            modalCol = Math.max(0, Math.min(modalCol, row.length - 1));
            const target = row[modalCol];
            target.classList.add('focused');
            try { target.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
        } else if (currentModal === 'channel-browser') {
            const modal = document.getElementById('ct-channel-browser-modal');
            if (!modal) return;
            modal.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
            const z0 = Array.from(modal.querySelectorAll('[data-bzone="0"]'));
            const z1 = Array.from(modal.querySelectorAll('[data-bzone="1"]'));
            const zones = [z0, z1];
            modalRow = Math.max(0, Math.min(modalRow, zones.length - 1));
            const row = zones[modalRow];
            if (!row || row.length === 0) return;
            modalCol = Math.max(0, Math.min(modalCol, row.length - 1));
            const target = row[modalCol];
            target.classList.add('focused');
            try { target.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
        }
    }

    function triggerStoreElement(el) {
        if (!el) return;
        const action = el.getAttribute('data-store-action');
        if (action === 'close') {
            closeModals();
            return;
        }
        if (action === 'toggle-bg') {
            applyFullThemeState(activeThemeId, activeStyleId, !activeBgEffects, true, true);
            renderThemeStoreModalContent();
            refreshModalFocus();
            return;
        }
        const themeId = el.getAttribute('data-theme-id');
        if (themeId) {
            const targetTheme = manifestRegistry.themes.find(t => t.id === themeId);
            if (targetTheme && targetTheme.isPremium && !checkIsPremiumUnlocked()) {
                if (typeof window.showPaywall === 'function') {
                    window.showPaywall('theme', targetTheme.name);
                } else {
                    alert('Giao diện ' + targetTheme.name + ' yêu cầu kích hoạt bản quyền CyberTV Premium (79.000đ).');
                }
                return;
            }
            let nextStyle = activeStyleId;
            if (themeId === 'cybertv-classic' && activeThemeId === 'cybertv-classic') {
                // Cycling color style when clicking CyberTV Classic again
                const idx = VALID_STYLE_IDS.indexOf(activeStyleId);
                nextStyle = VALID_STYLE_IDS[(idx + 1) % VALID_STYLE_IDS.length];
            }
            applyFullThemeState(themeId, nextStyle, activeBgEffects, true, true);
            closeModals();
        }
    }

    function triggerBrowserElement(el) {
        if (!el) return;
        const bmode = el.getAttribute('data-bmode');
        if (bmode === 'close') {
            closeModals();
            return;
        }
        if (bmode === 'all' || bmode === 'apps') {
            channelBrowserFilter = bmode;
            renderChannelBrowserContent();
            modalRow = 1;
            modalCol = 0;
            refreshModalFocus();
            return;
        }
        if (el.hasAttribute('data-num')) {
            const num = parseInt(el.getAttribute('data-num'), 10);
            closeModals();
            playChannelByNumber(num);
            return;
        }
        if (el.hasAttribute('data-pkg')) {
            const pkg = el.getAttribute('data-pkg');
            closeModals();
            launchAppByPkg(pkg);
        }
    }

    function handleModalKey(keyCode) {
        if (keyCode === 4) { // BACK
            closeModals();
            return true;
        }

        if (currentModal === 'theme-store') {
            const modal = document.getElementById('ct-theme-store-modal');
            const z0 = Array.from(modal.querySelectorAll('[data-store-zone="0"]'));
            const z1 = Array.from(modal.querySelectorAll('[data-store-zone="1"]'));
            if (modalRow === 0) {
                if (keyCode === 22 && modalCol < z0.length - 1) modalCol++;
                else if (keyCode === 21 && modalCol > 0) modalCol--;
                else if (keyCode === 20) {
                    modalRow = 1;
                    modalCol = Math.min(modalCol * 2, z1.length - 1);
                }
                else if (keyCode === 23 || keyCode === 66) { triggerStoreElement(z0[modalCol]); return true; }
            } else {
                // 4-column grid (8 cards: 0..3 on row 1, 4..7 on row 2)
                if (keyCode === 22 && modalCol < z1.length - 1) modalCol++;
                else if (keyCode === 21 && modalCol > 0) modalCol--;
                else if (keyCode === 20) {
                    if (modalCol + 4 < z1.length) {
                        modalCol += 4;
                    }
                } else if (keyCode === 19) {
                    if (modalCol >= 4) {
                        modalCol -= 4;
                    } else {
                        modalRow = 0;
                        modalCol = modalCol >= 2 ? 1 : 0;
                    }
                } else if (keyCode === 23 || keyCode === 66) {
                    triggerStoreElement(z1[modalCol]);
                    return true;
                }
            }
            refreshModalFocus();
            return true;
        }

        if (currentModal === 'channel-browser') {
            const modal = document.getElementById('ct-channel-browser-modal');
            const z0 = Array.from(modal.querySelectorAll('[data-bzone="0"]'));
            const z1 = Array.from(modal.querySelectorAll('[data-bzone="1"]'));
            if (modalRow === 0) {
                if (keyCode === 22 && modalCol < z0.length - 1) modalCol++;
                else if (keyCode === 21 && modalCol > 0) modalCol--;
                else if (keyCode === 20) { modalRow = 1; modalCol = 0; }
                else if (keyCode === 23 || keyCode === 66) { triggerBrowserElement(z0[modalCol]); return true; }
            } else {
                const cols = 4; // Harmonized 4 columns for both Channel Grid and App Grid
                if (keyCode === 22 && modalCol < z1.length - 1) modalCol++;
                else if (keyCode === 21 && modalCol > 0) modalCol--;
                else if (keyCode === 20 && modalCol + cols < z1.length) modalCol += cols;
                else if (keyCode === 19) {
                    if (modalCol >= cols) modalCol -= cols;
                    else { modalRow = 0; modalCol = 0; }
                } else if (keyCode === 23 || keyCode === 66) {
                    triggerBrowserElement(z1[modalCol]);
                    return true;
                }
            }
            refreshModalFocus();
            return true;
        }

        return false;
    }

    // ------------------------------------------------------------------------
    // 9. UNIFIED APPLY & PERSISTENCE API (6 THEMES + 3 STYLES + BG EFFECTS)
    // ------------------------------------------------------------------------
    function showEngineToast(title, subtitle) {
        let toast = document.getElementById('theme-switch-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'theme-switch-toast';
            toast.className = 'theme-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `
            <div class="theme-toast-icon"><img src="icons/icon_theme.png" style="width:34px;height:34px;border-radius:8px;object-fit:cover;display:block;"></div>
            <div class="theme-toast-content">
                <div class="theme-toast-title">${title}</div>
                <div class="theme-toast-name">${subtitle}</div>
            </div>
        `;
        toast.classList.add('show');
        clearTimeout(window.__themeToastTimeout);
        window.__themeToastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    function renderCurrentThemeStage() {
        const stage = ensureStageContainers();
        cleanupActiveThemeResources();

        // Update body classes for active layout & background effects
        document.body.classList.remove(
            'custom-layout-active',
            'layout-cinema-horizon',
            'layout-orbit-os',
            'layout-zen-gallery',
            'layout-nexus-command',
            'layout-prism-float',
            'layout-edition-noir',
            'layout-sonata-lounge'
        );

        if (activeThemeId === 'cybertv-classic') {
            stage.innerHTML = '';
            // Ensure CyberTV Classic top bar has a dedicated "Kho Theme (8)" pill if not already added
            injectClassicThemeStoreButton();
            if (typeof window.refreshFocus === 'function') {
                window.refreshFocus();
            }
            return;
        }

        document.body.classList.add('custom-layout-active', 'layout-' + activeThemeId);

        if (activeThemeId === 'cinema-horizon') {
            renderCinemaHorizon(stage);
        } else if (activeThemeId === 'orbit-os') {
            renderOrbitOS(stage);
        } else if (activeThemeId === 'zen-gallery') {
            renderZenGallery(stage);
        } else if (activeThemeId === 'nexus-command') {
            renderNexusCommand(stage);
        } else if (activeThemeId === 'prism-float') {
            renderPrismFloat(stage);
        } else if (activeThemeId === 'edition-noir') {
            renderEditionNoir(stage);
        } else if (activeThemeId === 'sonata-lounge') {
            renderSonataLounge(stage);
        }

        refreshCustomFocus();
    }

    function injectClassicThemeStoreButton() {
        const quickActions = document.querySelector('#classic-ui-layer .quick-actions');
        if (!quickActions) return;
        let storePill = document.getElementById('action-themestore-pill');
        if (!storePill) {
            storePill = document.createElement('div');
            storePill.className = 'action-pill';
            storePill.id = 'action-themestore-pill';
            storePill.setAttribute('data-action', 'themestore');
            storePill.title = 'Theme CyberTV';
            storePill.innerHTML = `
                <svg class="lucide-svg" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/></svg>
                <span>Theme</span>
            `;
            quickActions.insertBefore(storePill, quickActions.firstChild);

            if (typeof actionPills !== 'undefined' && Array.isArray(actionPills)) {
                actionPills.unshift(storePill);
                storePill.addEventListener('click', () => {
                    openThemeStoreModal();
                });
            }
        }
    }

    function applyFullThemeState(themeIdOrLegacy, styleIdOpt, bgEffectsOpt, saveToStorage = true, showToast = false) {
        let rawTheme = themeIdOrLegacy ? String(themeIdOrLegacy).trim().toLowerCase() : activeThemeId;
        let nextStyle = styleIdOpt ? normalizeStyleId(styleIdOpt) : activeStyleId;
        let nextBg = (typeof bgEffectsOpt === 'boolean') ? bgEffectsOpt : activeBgEffects;

        // Legacy migration support if caller passes 'cyber', 'minimal', 'cinema', 'neon', 'gold'
        if (rawTheme === 'minimal') {
            nextStyle = 'minimal';
            if (typeof bgEffectsOpt !== 'boolean') nextBg = false;
            rawTheme = 'cybertv-classic';
        } else if (rawTheme === 'cinema' || rawTheme === 'gold') {
            nextStyle = 'gold';
            rawTheme = 'cybertv-classic';
        } else if (rawTheme === 'cyber' || rawTheme === 'neon' || rawTheme === 'cybertv') {
            if (!styleIdOpt && rawTheme === 'neon') nextStyle = 'neon';
            rawTheme = 'cybertv-classic';
        }

        const validThemeId = normalizeThemeId(rawTheme);

        // Security Lock: Check Premium License before switching theme
        const targetThemeObj = manifestRegistry.themes.find(t => t.id === validThemeId);
        if (targetThemeObj && targetThemeObj.isPremium && !checkIsPremiumUnlocked()) {
            console.warn("Blocked premium theme switch without license:", validThemeId);
            if (typeof window.showPaywall === 'function') {
                window.showPaywall('theme', targetThemeObj.name);
            }
            if (activeThemeId !== 'cybertv-classic') {
                return applyFullThemeState('cybertv-classic', activeStyleId, activeBgEffects, true, false);
            }
            return;
        }

        activeThemeId = validThemeId;
        activeStyleId = nextStyle;
        activeBgEffects = nextBg;

        // Sync globals in index.html
        if (typeof currentThemeId !== 'undefined') currentThemeId = validThemeId;
        if (typeof currentStyleId !== 'undefined') currentStyleId = nextStyle;
        if (typeof currentBgEffects !== 'undefined') currentBgEffects = nextBg;

        // Apply base CyberTV Classic style & background particle state
        document.body.classList.remove(
            'theme-cyber', 'theme-minimal', 'theme-cinema',
            'style-neon', 'style-minimal', 'style-gold',
            'bg-effects-on', 'bg-effects-off'
        );
        document.body.classList.add('theme-cybertv', 'style-' + nextStyle);
        document.body.classList.add(nextBg ? 'bg-effects-on' : 'bg-effects-off');

        // Start/stop particle canvas (only animate on cybertv-classic or orbit-os when bgEffects is ON)
        if (nextBg && (validThemeId === 'cybertv-classic' || validThemeId === 'orbit-os')) {
            if (typeof startCanvas === 'function') startCanvas();
        } else {
            if (typeof stopCanvas === 'function') stopCanvas();
        }

        // Update Classic Quick Action labels
        const themeLabelEl = document.getElementById('theme-btn-label');
        if (themeLabelEl) {
            const styleCap = nextStyle === 'gold' ? 'Gold' : (nextStyle === 'minimal' ? 'Minimal' : 'Neon');
            themeLabelEl.innerText = styleCap;
        }
        const bgLabelEl = document.getElementById('bgeffects-btn-label');
        if (bgLabelEl) {
            bgLabelEl.innerHTML = nextBg
                ? '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#00ff88;box-shadow:0 0 8px #00ff88;margin-right:4px;"></span>ON'
                : '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#64748b;margin-right:4px;"></span>OFF';
        }

        // Render active layout stage
        renderCurrentThemeStage();

        // Persist to localStorage & AndroidBridge
        if (saveToStorage) {
            const configObj = {
                themeId: validThemeId,
                style: nextStyle,
                bgEffects: nextBg
            };
            try {
                localStorage.setItem('cybertv_theme_config', JSON.stringify(configObj));
                localStorage.removeItem('cybertv_theme');
                if (window.AndroidBridge) {
                    if (typeof window.AndroidBridge.saveThemeConfig === 'function') {
                        window.AndroidBridge.saveThemeConfig(validThemeId, nextStyle, nextBg);
                    } else if (typeof window.AndroidBridge.saveTheme === 'function') {
                        window.AndroidBridge.saveTheme(validThemeId);
                    }
                }
            } catch (e) {
                console.error('Failed to save theme config:', e);
            }
        }

        if (showToast) {
            const meta = getThemeMeta(validThemeId);
            const effectTxt = nextBg ? 'Hiệu ứng: BẬT' : 'Hiệu ứng: TẮT';
            const styleSuffix = validThemeId === 'cybertv-classic' ? ` • Phong cách ${nextStyle.toUpperCase()}` : '';
            showEngineToast(`GIAO DIỆN: ${meta.name.toUpperCase()}`, `${meta.layoutLabel}${styleSuffix} • ${effectTxt}`);
        }

        console.log('CyberTV Multi-Layout Engine applied:', {
            themeId: validThemeId,
            style: nextStyle,
            bgEffects: nextBg
        });
        return true;
    }

    // ------------------------------------------------------------------------
    // 10. HOOK INTO EXISTING GLOBAL FUNCTIONS IN INDEX.HTML
    // ------------------------------------------------------------------------
    function installEngineHooks() {
        // 1. Hook playLiveChannel to record Watch History automatically
        const origPlayLiveChannel = window.playLiveChannel;
        if (typeof origPlayLiveChannel === 'function' && !origPlayLiveChannel.__hooked) {
            window.playLiveChannel = function (url, title) {
                try {
                    const match = String(title || '').match(/#(\d+)/);
                    if (match) {
                        const ch = getChannelByNum(parseInt(match[1], 10));
                        if (ch) recordChannelWatch(ch);
                    }
                } catch (e) {}
                return origPlayLiveChannel.apply(this, arguments);
            };
            window.playLiveChannel.__hooked = true;
        }

        // 2. Hook onBackPress so Back closes modals first, then video player, or returns to Classic/top
        const origOnBackPress = window.onBackPress;
        window.onBackPress = function () {
            if (currentModal !== 'none') {
                closeModals();
                return true;
            }
            if (typeof origOnBackPress === 'function') {
                return origOnBackPress();
            }
            return false;
        };

        // 3. Hook handleKey to route D-Pad & OK to Modal or Active Custom Layout
        const origHandleKey = window.handleKey;
        window.handleKey = function (keyCode) {
            // Volume & Power HUD always work
            if (keyCode === 24 || keyCode === 25 || keyCode === 164 || keyCode === 26) {
                return origHandleKey(keyCode);
            }

            // If Video Player is active, let original video player controls handle Left/Right/OK/Back
            const vModal = document.getElementById('video-modal');
            if (vModal && vModal.classList.contains('active')) {
                return origHandleKey(keyCode);
            }

            // If Theme Store or Channel Browser modal is open, route keys there
            if (currentModal !== 'none') {
                handleModalKey(keyCode);
                return;
            }

            // Numeric keys (0-9) for instant channel jump work in EVERY theme!
            const isNumeric = (keyCode >= 7 && keyCode <= 16) ||
                              (keyCode >= 144 && keyCode <= 153) ||
                              (keyCode >= 48 && keyCode <= 57) ||
                              (keyCode >= 96 && keyCode <= 105);
            if (isNumeric || (typeof numBuffer !== 'undefined' && numBuffer.length > 0)) {
                return origHandleKey(keyCode);
            }

            // If a custom theme layout is active, route D-Pad & OK to custom layout engine
            if (activeThemeId !== 'cybertv-classic') {
                if (keyCode === 4) { // BACK key on home screen
                    return;
                }
                handleCustomThemeKey(keyCode);
                return;
            }

            // In CyberTV Classic, check if user pressed OK on the injected 'themestore' pill
            if ((keyCode === 23 || keyCode === 66) && typeof activeRow !== 'undefined' && activeRow === 0) {
                const targetPill = (typeof actionPills !== 'undefined') ? actionPills[colIndex] : null;
                if (targetPill && targetPill.getAttribute('data-action') === 'themestore') {
                    openThemeStoreModal();
                    return;
                }
            }

            return origHandleKey(keyCode);
        };

        // 4. Expose public Theme Engine functions for AndroidBridge, TVHttpServer & iOS Remote
        window.applyFullThemeState = applyFullThemeState;
        window.openThemeStoreModal = openThemeStoreModal;
        window.closeThemeStoreModal = closeModals;
        window.openChannelBrowserModal = openChannelBrowserModal;

        window.applyThemeConfig = function (styleOrThemeId, bgEffects, saveToStorage = true, shouldShowToast = false) {
            const clean = String(styleOrThemeId || '').trim().toLowerCase();
            if (VALID_THEME_IDS.indexOf(clean) !== -1) {
                return applyFullThemeState(clean, activeStyleId, bgEffects, saveToStorage, shouldShowToast);
            }
            return applyFullThemeState(activeThemeId, clean, bgEffects, saveToStorage, shouldShowToast);
        };

        window.applyTheme = function (themeOrStyleId, saveToStorage = true) {
            const clean = String(themeOrStyleId || '').trim().toLowerCase();
            if (VALID_THEME_IDS.indexOf(clean) !== -1) {
                return applyFullThemeState(clean, activeStyleId, activeBgEffects, saveToStorage, true);
            }
            return applyFullThemeState('cybertv-classic', clean, activeBgEffects, saveToStorage, true);
        };

        window.cycleNextTheme = function () {
            // In Classic top bar, "Màu: Neon/Minimal/Gold" cycles the 3 classic styles
            const nextIdx = (VALID_STYLE_IDS.indexOf(activeStyleId) + 1) % VALID_STYLE_IDS.length;
            applyFullThemeState('cybertv-classic', VALID_STYLE_IDS[nextIdx], activeBgEffects, true, true);
        };

        window.toggleBackgroundEffects = function () {
            applyFullThemeState(activeThemeId, activeStyleId, !activeBgEffects, true, true);
        };

        window.getThemeEngineState = function () {
            return {
                themeId: activeThemeId,
                style: activeStyleId,
                bgEffects: activeBgEffects,
                availableThemes: manifestRegistry.themes.map(t => ({
                    id: t.id,
                    name: t.name,
                    layout: t.layout,
                    layoutLabel: t.layoutLabel
                }))
            };
        };
    }

    // ------------------------------------------------------------------------
    // 11. INITIALIZE FROM MANIFEST.JSON + SAVED STORAGE
    // ------------------------------------------------------------------------
    function restoreSavedThemeOnBoot() {
        let loadedTheme = 'cybertv-classic';
        let loadedStyle = 'neon';
        let loadedBg = true;
        let found = false;

        try {
            // 1. Check URL query parameter (?theme=cinema-horizon) for quick preview/testing
            const params = new URLSearchParams(window.location.search);
            const urlTheme = params.get('theme');

            // 2. Check AndroidBridge.getThemeConfig()
            if (window.AndroidBridge && typeof window.AndroidBridge.getThemeConfig === 'function') {
                const rawJson = window.AndroidBridge.getThemeConfig();
                if (rawJson) {
                    const parsed = JSON.parse(rawJson);
                    loadedTheme = normalizeThemeId(parsed.themeId);
                    loadedStyle = normalizeStyleId(parsed.style);
                    loadedBg = (typeof parsed.bgEffects === 'boolean') ? parsed.bgEffects : true;
                    found = true;
                }
            }

            // 3. Check localStorage ('cybertv_theme_config' or legacy 'cybertv_theme')
            if (!found) {
                const savedConfigStr = localStorage.getItem('cybertv_theme_config');
                if (savedConfigStr) {
                    const parsed = JSON.parse(savedConfigStr);
                    loadedTheme = normalizeThemeId(parsed.themeId);
                    loadedStyle = normalizeStyleId(parsed.style);
                    loadedBg = (typeof parsed.bgEffects === 'boolean') ? parsed.bgEffects : true;
                    found = true;
                } else {
                    const legacy = localStorage.getItem('cybertv_theme');
                    if (legacy) {
                        const clean = String(legacy).trim().toLowerCase();
                        if (clean === 'minimal') {
                            loadedTheme = 'cybertv-classic';
                            loadedStyle = 'minimal';
                            loadedBg = false;
                        } else if (clean === 'cinema' || clean === 'gold') {
                            loadedTheme = 'cybertv-classic';
                            loadedStyle = 'gold';
                            loadedBg = true;
                        } else {
                            loadedTheme = normalizeThemeId(clean);
                            loadedStyle = 'neon';
                            loadedBg = true;
                        }
                    }
                }
            }

            if (urlTheme && VALID_THEME_IDS.indexOf(urlTheme) !== -1) {
                loadedTheme = urlTheme;
            }
        } catch (e) {
            console.warn('Theme restore warning:', e);
        }

        applyFullThemeState(loadedTheme, loadedStyle, loadedBg, true, false);

        try {
            const params = new URLSearchParams(window.location.search);
            const modalParam = params.get('modal');
            if (modalParam === 'store') {
                setTimeout(openThemeStoreModal, 120);
            } else if (modalParam === 'channels') {
                setTimeout(() => openChannelBrowserModal('all'), 120);
            }
        } catch (e) {}
    }

    function bootThemeEngine() {
        ensureStageContainers();
        installEngineHooks();
        restoreSavedThemeOnBoot();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(bootThemeEngine, 180));
    } else {
        setTimeout(bootThemeEngine, 180);
    }
})();
