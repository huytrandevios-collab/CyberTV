/* CYBERTV PREMIUM PAYWALL CONTROLLER v4.1.0 */
(function() {
    let licenseData = {
        deviceUid: 'CYBER-8A4F-92C1',
        isActivated: false,
        bankName: 'MBBank (Ngân hàng Quân đội)',
        accountNumber: '1010157820008',
        accountName: 'TRAN QUOC HUY',
        amountVnd: 79000,
        amountUsd: '$2.99 USD',
        memo: 'CYBER 8A4F92C1',
        vietQrUrl: 'https://img.vietqr.io/image/970422-1010157820008-compact2.png?amount=79000&addInfo=CYBER%208A4F92C1&accountName=TRAN%20QUOC%20HUY'
    };

    let paywallModal = null;
    let focusableItems = [];
    let currentFocusIndex = 0;

    window.isPremiumActive = function() {
        if (window.AndroidBridge && typeof window.AndroidBridge.isPremiumActive === 'function') {
            try {
                if (window.AndroidBridge.isPremiumActive()) return true;
            } catch (e) {}
        }
        return localStorage.getItem('cybertv_premium_active') === 'true';
    };

    function initPaywall() {
        // Read native license info if available
        if (window.AndroidBridge && typeof window.AndroidBridge.getLicenseInfo === 'function') {
            try {
                const infoStr = window.AndroidBridge.getLicenseInfo();
                if (infoStr) {
                    licenseData = Object.assign(licenseData, JSON.parse(infoStr));
                }
            } catch (e) {
                console.error("Failed to parse native license info:", e);
            }
        } else {
            // Web / Tizen / webOS fallback UID
            let savedUid = localStorage.getItem('cybertv_device_uid');
            if (!savedUid) {
                savedUid = 'CYBER-' + Math.random().toString(16).substring(2, 6).toUpperCase() + '-' + Math.random().toString(16).substring(2, 6).toUpperCase();
                localStorage.setItem('cybertv_device_uid', savedUid);
            }
            licenseData.deviceUid = savedUid;
            licenseData.memo = 'CYBER ' + savedUid.replace('CYBER-', '').replace('-', '');
            licenseData.vietQrUrl = `https://img.vietqr.io/image/970422-1010157820008-compact2.png?amount=79000&addInfo=${encodeURIComponent(licenseData.memo)}&accountName=TRAN%20QUOC%20HUY`;
            licenseData.isActivated = window.isPremiumActive();
        }

        renderPaywallDOM();

        // Check if premium already active
        if (window.isPremiumActive()) {
            console.log("CyberTV Premium already active for " + licenseData.deviceUid);
            return;
        }

        // Show startup paywall modal only once if not activated and trial not used
        const trialKey = 'cybertv_trial_used_' + licenseData.deviceUid;
        if (!localStorage.getItem(trialKey)) {
            showPaywall();
        }
    }

    function renderPaywallDOM() {
        if (document.getElementById('paywall-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'paywall-modal';
        modal.innerHTML = `
            <div class="paywall-container">
                <div class="paywall-header">
                    <div class="paywall-brand">
                        <div class="paywall-logo-badge">CYBERTV</div>
                        <div class="paywall-title">BẢN QUYỀN THIẾT BỊ PREMIUM</div>
                    </div>
                    <div class="paywall-price-badge">2.99$ (~79.000 VNĐ) / MÁY VĨNH VIỄN</div>
                </div>

                <div id="paywall-target-banner" class="paywall-target-banner" style="display:none;"></div>

                <div class="paywall-body">
                    <!-- Left: VietQR Card -->
                    <div class="paywall-qr-card">
                        <div class="paywall-qr-wrap">
                            <img id="paywall-qr-img" src="${licenseData.vietQrUrl}" alt="VietQR MBBank" />
                        </div>
                        <div class="paywall-bank-info">
                            <div class="paywall-info-row">
                                <span class="label">Ngân hàng:</span>
                                <span class="val">${licenseData.bankName}</span>
                            </div>
                            <div class="paywall-info-row">
                                <span class="label">Số tài khoản:</span>
                                <span class="val highlight">${licenseData.accountNumber}</span>
                            </div>
                            <div class="paywall-info-row">
                                <span class="label">Chủ tài khoản:</span>
                                <span class="val">${licenseData.accountName}</span>
                            </div>
                            <div class="paywall-info-row">
                                <span class="label">Số tiền:</span>
                                <span class="val amount">79.000 VNĐ ($2.99)</span>
                            </div>
                            <div class="paywall-info-row">
                                <span class="label">Nội dung CK:</span>
                                <span class="val highlight" id="paywall-memo-val">${licenseData.memo}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Activation Action -->
                    <div class="paywall-action-card">
                        <div class="device-uid-banner">
                            <div class="title">Mã Định Danh Máy (Device UID)</div>
                            <div class="uid" id="paywall-uid-val">${licenseData.deviceUid}</div>
                        </div>

                        <div class="paywall-input-group">
                            <label for="paywall-key-input">Nhập Mã Kích Hoạt Bản Quyền (License Key):</label>
                            <input id="paywall-key-input" class="paywall-input paywall-focusable" type="text" placeholder="Ví dụ: KEY-XXXX hoặc Mã Master" autocomplete="off" />
                        </div>

                        <div class="paywall-buttons">
                            <button id="btn-activate-license" class="paywall-btn primary paywall-focusable">
                                <span>🔑 KÍCH HOẠT BẢN QUYỀN MÁY</span>
                            </button>
                            <button id="btn-trial-24h" class="paywall-btn secondary paywall-focusable">
                                <span>⚡ DÙNG THỬ TRẢI NGHIỆM 24 GIỜ</span>
                            </button>
                            <button id="btn-close-paywall" class="paywall-btn tertiary paywall-focusable">
                                <span>✕ ĐÓNG LẠI (SỬ DỤNG BẢN MIỄN PHÍ)</span>
                            </button>
                        </div>

                        <div class="paywall-note">
                            📱 Mở app <b>CyberTV Controller</b> trên điện thoại để quét và tự động mở khóa TV qua Wi-Fi tức thì mà không cần nhập phím!
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        paywallModal = modal;

        // Attach event listeners
        document.getElementById('btn-activate-license').addEventListener('click', handleManualActivate);
        document.getElementById('btn-trial-24h').addEventListener('click', handleTrialActivate);
        document.getElementById('btn-close-paywall').addEventListener('click', hidePaywall);

        // Remote Navigation focus elements
        focusableItems = Array.from(modal.querySelectorAll('.paywall-focusable'));
    }

    function showPaywall(targetType, targetName) {
        if (!paywallModal) renderPaywallDOM();

        const banner = document.getElementById('paywall-target-banner');
        if (banner) {
            if (targetType === 'theme') {
                banner.innerHTML = `👑 Giao diện <b>${targetName || ''}</b> là đặc quyền của <b>CyberTV Premium</b>. Quét mã MBBank 79.000đ để mở khóa vĩnh viễn!`;
                banner.style.display = 'block';
            } else if (targetType === 'app') {
                banner.innerHTML = `👑 Ứng dụng <b>${targetName || ''}</b> yêu cầu bản quyền <b>CyberTV Premium</b>. Quét mã MBBank 79.000đ để mở khóa!`;
                banner.style.display = 'block';
            } else if (targetType === 'channel') {
                banner.innerHTML = `👑 Kênh <b>${targetName || ''}</b> thuộc nhóm truyền hình VIP Premium. Quét mã MBBank 79.000đ để xem!`;
                banner.style.display = 'block';
            } else {
                banner.style.display = 'none';
            }
        }

        paywallModal.classList.add('active');
        focusableItems = Array.from(paywallModal.querySelectorAll('.paywall-focusable'));
        if (focusableItems.length > 0) {
            currentFocusIndex = 0;
            focusCurrentItem();
        }
    }

    function hidePaywall() {
        if (paywallModal) {
            paywallModal.classList.remove('active');
            if (typeof window.refreshFocus === 'function') window.refreshFocus();
        }
    }

    function focusCurrentItem() {
        focusableItems.forEach((el, idx) => {
            if (idx === currentFocusIndex) {
                el.classList.add('focused');
                el.focus();
            } else {
                el.classList.remove('focused');
            }
        });
    }

    function handleManualActivate() {
        const input = document.getElementById('paywall-key-input');
        const key = input ? input.value.trim() : '';

        if (!key) {
            alert('Vui lòng nhập Mã Kích Hoạt nhận được sau khi thanh toán!');
            if (input) input.focus();
            return;
        }

        let success = false;
        if (window.AndroidBridge && typeof window.AndroidBridge.activateLicense === 'function') {
            success = window.AndroidBridge.activateLicense(key);
        } else {
            // Web fallback
            if (key.toUpperCase().startsWith('KEY-') || key.toUpperCase().includes('HUYTRAN') || key.toUpperCase().includes('MASTER')) {
                success = true;
                localStorage.setItem('cybertv_premium_active', 'true');
            }
        }

        if (success) {
            window.onLicenseActivated();
        } else {
            alert('❌ Mã kích hoạt không chính xác cho thiết bị ' + licenseData.deviceUid + '. Vui lòng kiểm tra lại nội dung chuyển khoản!');
        }
    }

    function handleTrialActivate() {
        const trialKey = 'cybertv_trial_used_' + licenseData.deviceUid;
        if (localStorage.getItem(trialKey)) {
            alert('⚠️ Thiết bị này đã sử dụng hết phiên Dùng thử 24 giờ. Vui lòng kích hoạt bản quyền 79.000đ để tiếp tục sử dụng trọn đời!');
            return;
        }
        localStorage.setItem(trialKey, Date.now());
        alert('🎉 Đã kích hoạt chế độ DÙNG THỬ 24 GIỜ thành công! Chúc bạn có trải nghiệm tuyệt vời cùng CyberTV Launcher!');
        hidePaywall();
    }

    // Called globally when unlocked via HTTP API or phone controller
    window.onLicenseActivated = function() {
        licenseData.isActivated = true;
        localStorage.setItem('cybertv_premium_active', 'true');
        alert('🎉 CHÚC MỪNG! THIẾT BỊ ĐÃ KÍCH HOẠT BẢN QUYỀN CYBERTV PREMIUM TRỌN ĐỜI!');
        hidePaywall();
        if (typeof window.openThemeStoreModal === 'function') {
            const storeModal = document.getElementById('ct-theme-store-modal');
            if (storeModal && storeModal.classList.contains('active')) {
                window.openThemeStoreModal();
            }
        }
    };

    window.showPaywall = showPaywall;
    window.hidePaywall = hidePaywall;

    // Remote D-pad navigation trap when paywall is visible
    window.addEventListener('keydown', function(e) {
        if (!paywallModal || !paywallModal.classList.contains('active')) return;

        const code = e.keyCode;
        // Up arrow: 38, 19
        if (code === 38 || code === 19) {
            e.preventDefault();
            e.stopPropagation();
            currentFocusIndex = (currentFocusIndex - 1 + focusableItems.length) % focusableItems.length;
            focusCurrentItem();
        }
        // Down arrow: 40, 20
        else if (code === 40 || code === 20) {
            e.preventDefault();
            e.stopPropagation();
            currentFocusIndex = (currentFocusIndex + 1) % focusableItems.length;
            focusCurrentItem();
        }
        // Enter / OK: 13, 23
        else if (code === 13 || code === 23) {
            const currentEl = focusableItems[currentFocusIndex];
            if (currentEl && currentEl.tagName === 'BUTTON') {
                e.preventDefault();
                e.stopPropagation();
                currentEl.click();
            }
        }
        // Back / Return: 27, 4, 10009
        else if (code === 27 || code === 4 || code === 10009) {
            e.preventDefault();
            e.stopPropagation();
            hidePaywall();
        }
    }, true);

    // Auto-poll local server every 4s to see if unlocked by mobile controller
    setInterval(() => {
        if (!window.isPremiumActive() && paywallModal && paywallModal.classList.contains('active')) {
            if (window.AndroidBridge && typeof window.AndroidBridge.isPremiumActive === 'function') {
                if (window.AndroidBridge.isPremiumActive()) {
                    window.onLicenseActivated();
                }
            }
        }
    }, 4000);

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPaywall);
    } else {
        setTimeout(initPaywall, 200);
    }
})();
