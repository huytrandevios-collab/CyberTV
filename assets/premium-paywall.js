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
    let isHardLocked = false;

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

        // Kiểm tra trạng thái bản quyền: Nếu hết hạn dùng thử -> KHÓA TOÀN MÀN HÌNH FULL TIVI
        const trialKey = 'cybertv_trial_used_' + licenseData.deviceUid;
        const trialVal = localStorage.getItem(trialKey);
        
        if (trialVal) {
            const timestamp = parseInt(trialVal, 10);
            const trialDuration = 24 * 60 * 60 * 1000; // 24 giờ
            if (Date.now() - timestamp >= trialDuration) {
                // Đã hết hạn dùng thử -> Khóa cứng toàn màn hình
                showPaywall('hard_lock_expired');
                return;
            }
        } else {
            // Thiết bị mới chưa mua bản quyền -> Hiển thị khóa thanh toán mở khóa vĩnh viễn
            showPaywall('hard_lock_new');
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

                <div class="paywall-tabs" style="display:flex;gap:12px;margin-bottom:8px;">
                    <button id="tab-btn-vietqr" class="paywall-tab-btn active paywall-focusable" style="padding:10px 18px;border-radius:12px;background:linear-gradient(135deg,rgba(0,242,254,0.2),rgba(79,172,254,0.2));border:1px solid #00f2fe;color:#fff;font-size:13px;font-weight:700;cursor:pointer;">
                        🇻🇳 MBBank VietQR (79.000 VNĐ)
                    </button>
                    <button id="tab-btn-paypal" class="paywall-tab-btn paywall-focusable" style="padding:10px 18px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#94a3b8;font-size:13px;font-weight:700;cursor:pointer;">
                        🌍 Google Pay & PayPal ($2.99 USD)
                    </button>
                </div>

                <div class="paywall-body">
                    <!-- Left: VietQR Card -->
                    <div id="method-card-vietqr" class="paywall-qr-card">
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

                    <!-- Left Alternative: PayPal & Google Pay Card -->
                    <div id="method-card-paypal" class="paywall-qr-card" style="display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:14px;">
                        <div style="font-size:14px;font-weight:800;color:#f59e0b;letter-spacing:0.5px;">
                            💳 GOOGLE PAY & PAYPAL CHECKOUT
                        </div>
                        <div style="font-size:11px;color:#94a3b8;text-align:center;">
                            Hỗ trợ Google Pay, Thẻ Visa/Mastercard và tài khoản PayPal
                        </div>
                        <div id="paypal-button-container" style="width:100%;min-height:80px;display:flex;flex-direction:column;gap:8px;"></div>
                        <div style="background:rgba(255,255,255,0.04);border:1px dashed rgba(255,255,255,0.2);border-radius:14px;padding:12px;text-align:center;width:100%;">
                            <div style="font-size:11px;color:#cbd5e1;margin-bottom:6px;">📱 Hoặc quét mã mở Google Pay trên điện thoại:</div>
                            <img style="width:130px;height:130px;border-radius:8px;background:#fff;padding:4px;" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://www.paypal.com/checkoutnow?token=cybertv_' + licenseData.deviceUid)}" alt="PayPal Google Pay QR" />
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

        document.getElementById('tab-btn-vietqr').addEventListener('click', () => switchMethodTab('vietqr'));
        document.getElementById('tab-btn-paypal').addEventListener('click', () => switchMethodTab('paypal'));

        // Remote Navigation focus elements
        focusableItems = Array.from(modal.querySelectorAll('.paywall-focusable'));
    }

    let paypalLoaded = false;
    function switchMethodTab(tab) {
        const btnVn = document.getElementById('tab-btn-vietqr');
        const btnPp = document.getElementById('tab-btn-paypal');
        const cardVn = document.getElementById('method-card-vietqr');
        const cardPp = document.getElementById('method-card-paypal');

        if (tab === 'paypal') {
            btnVn.style.background = 'rgba(255,255,255,0.06)';
            btnVn.style.borderColor = 'rgba(255,255,255,0.15)';
            btnVn.style.color = '#94a3b8';
            btnPp.style.background = 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(217,119,6,0.25))';
            btnPp.style.borderColor = '#f59e0b';
            btnPp.style.color = '#fff';
            cardVn.style.display = 'none';
            cardPp.style.display = 'flex';
            loadPayPalSDK();
        } else {
            btnPp.style.background = 'rgba(255,255,255,0.06)';
            btnPp.style.borderColor = 'rgba(255,255,255,0.15)';
            btnPp.style.color = '#94a3b8';
            btnVn.style.background = 'linear-gradient(135deg,rgba(0,242,254,0.2),rgba(79,172,254,0.2))';
            btnVn.style.borderColor = '#00f2fe';
            btnVn.style.color = '#fff';
            cardPp.style.display = 'none';
            cardVn.style.display = 'flex';
        }
        focusableItems = Array.from(paywallModal.querySelectorAll('.paywall-focusable')).filter(el => el.offsetParent !== null);
    }

    function loadPayPalSDK() {
        if (paypalLoaded) return;
        const script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?client-id=BAAyo6ZCcBWj4stab8r0jzblAsBwSlkBCiYttlefhdKBuk6CpJuI7hm-4VLHHwpDmyKT1xDND0SnqAQTcA&currency=USD&enable-funding=venmo,paylater';
        script.onload = function() {
            paypalLoaded = true;
            renderPayPalButtons();
        };
        script.onerror = function() {
            console.warn("Could not load PayPal SDK online");
        };
        document.head.appendChild(script);
    }

    function renderPayPalButtons() {
        const container = document.getElementById('paypal-button-container');
        if (!container || !window.paypal) return;
        container.innerHTML = '';
        try {
            window.paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal',
                    height: 38
                },
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            description: 'CyberTV Premium Device License - ' + licenseData.deviceUid,
                            amount: {
                                currency_code: 'USD',
                                value: '2.99'
                            }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        const orderId = data.orderID || ('PAYPAL_' + Date.now());
                        if (window.AndroidBridge && typeof window.AndroidBridge.activateLicense === 'function') {
                            window.AndroidBridge.activateLicense('PAYPAL_' + orderId);
                        } else {
                            localStorage.setItem('cybertv_premium_active', 'true');
                        }
                        try {
                            fetch('/api/payment_notify?amount=2.99&currency=USD&order=' + orderId + '&uid=' + licenseData.deviceUid);
                        } catch(e) {}
                        window.onLicenseActivated();
                    });
                }
            }).render('#paypal-button-container');
        } catch(e) {
            console.error("PayPal render error:", e);
        }
    }

    function showPaywall(targetType, targetName) {
        if (!paywallModal) renderPaywallDOM();

        const banner = document.getElementById('paywall-target-banner');
        const btnClose = document.getElementById('btn-close-paywall');
        const btnTrial = document.getElementById('btn-trial-24h');

        if (targetType === 'hard_lock_expired') {
            isHardLocked = true;
            paywallModal.classList.add('hard-locked');
            if (banner) {
                banner.innerHTML = `🔒 <b>HẾT HẠN DÙNG THỬ BẢN QUYỀN</b> — Màn hình TV đã bị khóa toàn bộ. Quét mã VietQR MBBank 79.000đ để mở khóa vĩnh viễn trọn đời!`;
                banner.style.display = 'block';
            }
            if (btnClose) btnClose.style.display = 'none';
            if (btnTrial) btnTrial.style.display = 'none';
        } else if (targetType === 'hard_lock_new') {
            isHardLocked = true;
            paywallModal.classList.add('hard-locked');
            if (banner) {
                banner.innerHTML = `🔒 <b>BẢN QUYỀN CYBERTV CHƯA KÍCH HOẠT</b> — Quét mã MBBank 79.000đ mở khóa trọn đời hoặc chọn Dùng Thử 24 Giờ để trải nghiệm!`;
                banner.style.display = 'block';
            }
            if (btnClose) btnClose.style.display = 'none';
        } else {
            isHardLocked = false;
            paywallModal.classList.remove('hard-locked');
            if (btnClose) btnClose.style.display = 'inline-flex';
            if (btnTrial) btnTrial.style.display = 'inline-flex';

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
        }

        paywallModal.classList.add('active');
        focusableItems = Array.from(paywallModal.querySelectorAll('.paywall-focusable')).filter(el => el.offsetParent !== null);
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
        isHardLocked = false;
        paywallModal.classList.remove('hard-locked');
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
            if (isHardLocked) {
                // Rung cảnh báo không cho đóng khi đã bị khóa toàn màn hình
                const container = document.querySelector('.paywall-container');
                if (container) {
                    container.classList.add('shake-anim');
                    setTimeout(() => container.classList.remove('shake-anim'), 600);
                }
                return;
            }
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
