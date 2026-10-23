const ALL_CHANNELS = [
  {
    "name": "VTV1 HD",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_01.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/VTV1-HD-1080p/playlist.m3u8",
    "desc": "Kênh Thời sự - Chính luận - Tổng hợp Quốc gia.",
    "latency": 113,
    "num": 1
  },
  {
    "name": "VTV2 HD",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_02.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/VTV2-HD-1080p/playlist.m3u8",
    "desc": "Kênh Khoa học - Công nghệ - Giáo dục & Đời sống.",
    "latency": 103,
    "num": 2
  },
  {
    "name": "VTV3 HD",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_03.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/VTV3-HD-1080p/playlist.m3u8",
    "desc": "Kênh Thể thao - Giải trí - Gameshow đặc sắc.",
    "latency": 94,
    "num": 3
  },
  {
    "name": "VTV4 HD",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_04.png",
    "url": "https://vtvgolivepre-vtv02.vtvdigital.vn/hls/vtv/live/vtv4__vtv720p-h264/index.m3u8",
    "desc": "Kênh Truyền hình Đối ngoại Quốc gia.",
    "latency": 276,
    "num": 4
  },
  {
    "name": "VTV5 Tây Nam Bộ",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_05.png",
    "url": "https://vtvgolivepre-vtv02.vtvdigital.vn/hls/vtv/live/vtv5tnb__vtv720p-h264/index.m3u8",
    "desc": "Kênh Tiếng Dân tộc Đồng bằng Sông Cửu Long.",
    "latency": 181,
    "num": 5
  },
  {
    "name": "VTV5 Tây Nguyên",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_06.png",
    "url": "https://vtvgolivepre-vtv02.vtvdigital.vn/hls/vtv/live/vtv5tn__vtv720p-h264/index.m3u8",
    "desc": "Kênh Tiếng Dân tộc Khu vực Tây Nguyên.",
    "latency": 168,
    "num": 6
  },
  {
    "name": "VTV6 HD",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_07.png",
    "url": "https://vtvgolivepre-vtv02.vtvdigital.vn/hls/vtv/live/vtv6__vtv720p-h264/index.m3u8",
    "desc": "Kênh Giới trẻ & Văn hóa Thể thao.",
    "latency": 178,
    "num": 7
  },
  {
    "name": "VTV7 HD",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_08.png",
    "url": "https://vtvgolivepre-vtv02.vtvdigital.vn/hls/vtv/live/vtv7__vtv720p-h264/index.m3u8",
    "desc": "Kênh Truyền hình Giáo dục Quốc gia VTV7.",
    "latency": 175,
    "num": 8
  },
  {
    "name": "VTV8 HD",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_09.png",
    "url": "https://vtvgolivepre-vtv02.vtvdigital.vn/hls/vtv/live/vtv8__vtv720p-h264/index.m3u8",
    "desc": "Kênh Khu vực Miền Trung & Tây Nguyên.",
    "latency": 170,
    "num": 9
  },
  {
    "name": "VTV9 HD",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_10.png",
    "url": "https://vtvgolivepre-vtv02.vtvdigital.vn/hls/vtv/live/vtv9__vtv720p-h264/index.m3u8",
    "desc": "Kênh Truyền hình Quốc gia Khu vực Nam Bộ.",
    "latency": 177,
    "num": 10
  },
  {
    "name": "VTV10 HD",
    "cat": "vtv",
    "catLabel": "VTV Quốc Gia",
    "logo": "logos/ch_11.png",
    "url": "https://vtvgolivepre-vtv02.vtvdigital.vn/hls/vtv/live/vtv10__vtv720p-h264/index.m3u8",
    "desc": "Kênh VTV Cần Thơ & Miền Tây Nam Bộ.",
    "latency": 279,
    "num": 11
  },
  {
    "name": "HTV1",
    "cat": "htv",
    "catLabel": "HTV Miền Nam",
    "logo": "logos/ch_12.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/HTV1-HD-1080p/playlist.m3u8",
    "desc": "Kênh Thông tin công cộng Đài Truyền hình TP.HCM.",
    "latency": 92,
    "num": 12
  },
  {
    "name": "HTV2",
    "cat": "htv",
    "catLabel": "HTV Miền Nam",
    "logo": "logos/ch_13.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/HTV2-HD-1080p/playlist.m3u8",
    "desc": "Kênh Giải trí tổng hợp Vie Channel HTV2.",
    "latency": 100,
    "num": 13
  },
  {
    "name": "HTV3",
    "cat": "htv",
    "catLabel": "HTV Miền Nam",
    "logo": "logos/ch_14.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/HTV3-SD-720p/playlist.m3u8",
    "desc": "Kênh Giáo dục & Giải trí dành cho Thiếu nhi.",
    "latency": 99,
    "num": 14
  },
  {
    "name": "HTV7 HD",
    "cat": "htv",
    "catLabel": "HTV Miền Nam",
    "logo": "logos/ch_15.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/HTV7-HD-1080p/playlist.m3u8",
    "desc": "Kênh Giải trí & Phim truyện hàng đầu Miền Nam.",
    "latency": 100,
    "num": 15
  },
  {
    "name": "HTV9 HD",
    "cat": "htv",
    "catLabel": "HTV Miền Nam",
    "logo": "logos/ch_16.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/HTV9-HD-1080p/playlist.m3u8",
    "desc": "Kênh Thời sự - Chính luận Đài Truyền hình TP.HCM.",
    "latency": 81,
    "num": 16
  },
  {
    "name": "HTVC Thể Thao",
    "cat": "htv",
    "catLabel": "HTV Miền Nam",
    "logo": "logos/ch_17.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/HTV-THETHAO-HD-1080p/playlist.m3u8",
    "desc": "Kênh Thể thao chuyên biệt HTVC Sports HD.",
    "latency": 82,
    "num": 17
  },
  {
    "name": "HTVC Phim HD",
    "cat": "htv",
    "catLabel": "HTV Miền Nam",
    "logo": "logos/ch_18.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/HTVC-PHIM-HD-1080p/playlist.m3u8",
    "desc": "Kênh Phim truyện điện ảnh đặc sắc HTVC.",
    "latency": 80,
    "num": 18
  },
  {
    "name": "ANTV HD",
    "cat": "news",
    "catLabel": "An Ninh & Tin Tức",
    "logo": "logos/ch_19.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/ANTV-HD-1080p/playlist.m3u8",
    "desc": "Kênh Truyền hình Công an Nhân dân.",
    "latency": 109,
    "num": 19
  },
  {
    "name": "QPVN HD",
    "cat": "news",
    "catLabel": "An Ninh & Tin Tức",
    "logo": "logos/ch_20.png",
    "url": "https://liveh12.vtvprime.vn/hls/QPTV/index.m3u8",
    "desc": "Kênh Truyền hình Quốc phòng Việt Nam.",
    "latency": 877,
    "num": 20
  },
  {
    "name": "Hà Nội 1 HD",
    "cat": "news",
    "catLabel": "An Ninh & Tin Tức",
    "logo": "logos/ch_21.png",
    "url": "https://liveh34.vtvprime.vn/hls/HANOI1TV/index.m3u8",
    "desc": "Kênh Thời sự Chính luận Đài Phát thanh & Truyền hình Hà Nội.",
    "latency": 71,
    "num": 21
  },
  {
    "name": "SCTV2 AMC",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_22.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv2/master.m3u8",
    "desc": "Kênh Phim truyện & Giải trí Châu Á.",
    "latency": 271,
    "num": 22
  },
  {
    "name": "SCTV3 Thiếu Nhi",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_23.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv3/master.m3u8",
    "desc": "Kênh Thiếu nhi SeeTV SCTV3.",
    "latency": 273,
    "num": 23
  },
  {
    "name": "SCTV4 Giải Trí",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_24.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv4/master.m3u8",
    "desc": "Kênh Giải trí Tổng hợp SCTV4.",
    "latency": 267,
    "num": 24
  },
  {
    "name": "SCTV6 S-Drama",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_25.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv6/master.m3u8",
    "desc": "Kênh Phim truyền hình đặc sắc SCTV6.",
    "latency": 264,
    "num": 25
  },
  {
    "name": "SCTV7 S-Show",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_26.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv7/master.m3u8",
    "desc": "Kênh Giải trí & Sân khấu truyền hình.",
    "latency": 270,
    "num": 26
  },
  {
    "name": "SCTV9 Phim Châu Á",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_27.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv9/master.m3u8",
    "desc": "Kênh Phim truyện Châu Á & Độc quyền TVB.",
    "latency": 357,
    "num": 27
  },
  {
    "name": "SCTV11 Hát Trên Truyền Hình",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_28.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv11/master.m3u8",
    "desc": "Kênh Âm nhạc & Nghệ thuật truyền hình.",
    "latency": 164,
    "num": 28
  },
  {
    "name": "SCTV12 Du Lịch",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_29.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv12/master.m3u8",
    "desc": "Kênh Khám phá & Du lịch bốn phương.",
    "latency": 263,
    "num": 29
  },
  {
    "name": "SCTV13 Phụ Nữ",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_30.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv13/master.m3u8",
    "desc": "Kênh Đời sống & Gia đình Việt.",
    "latency": 266,
    "num": 30
  },
  {
    "name": "SCTV14 Phim Việt",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_31.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv14/master.m3u8",
    "desc": "Kênh Phim thuần Việt độc quyền SCTV14.",
    "latency": 202,
    "num": 31
  },
  {
    "name": "SCTV15 Thể Thao",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_32.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv15/master.m3u8",
    "desc": "Kênh Thể thao đỉnh cao SCTV15.",
    "latency": 234,
    "num": 32
  },
  {
    "name": "SCTV16 Phim Nước Ngoài",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_33.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv16/master.m3u8",
    "desc": "Kênh Phim truyện quốc tế bom tấn.",
    "latency": 223,
    "num": 33
  },
  {
    "name": "SCTV17 S-Sport",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_34.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv17/master.m3u8",
    "desc": "Kênh Thể thao quốc tế S-Sport.",
    "latency": 350,
    "num": 34
  },
  {
    "name": "SCTV18 Kênh 18",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_35.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv18/master.m3u8",
    "desc": "Kênh Thông tin & Giải trí tổng hợp.",
    "latency": 217,
    "num": 35
  },
  {
    "name": "SCTV19 Channel 19",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_36.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv19/master.m3u8",
    "desc": "Kênh Giải trí & Văn hóa nghệ thuật.",
    "latency": 219,
    "num": 36
  },
  {
    "name": "SCTV20 Ca Nhạc",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_37.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv20/master.m3u8",
    "desc": "Kênh Âm nhạc iMusic SCTV20.",
    "latency": 213,
    "num": 37
  },
  {
    "name": "SCTV22 S-Sport 2",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_38.jpg",
    "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv22/master.m3u8",
    "desc": "Kênh Thể thao đối kháng & eSports.",
    "latency": 204,
    "num": 38
  },
  {
    "name": "TVB Vietnam",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_39.png",
    "url": "https://amg01868-amg01868c3-tvbanywhere-us-4491.playouts.now.amagi.tv/playlist/amg01868-tvbusa-tvbvietnam-tvbanywhereus/playlist.m3u8",
    "desc": "Kênh Phim bộ TVB kinh điển lồng tiếng Việt.",
    "latency": 1338,
    "num": 39
  },
  {
    "name": "Vietnam Today",
    "cat": "cable",
    "catLabel": "Truyền Hình Cáp & Phim",
    "logo": "logos/ch_40.png",
    "url": "https://amagi-live.ondemandkorea.com/amgplt0456.m3u8",
    "desc": "Kênh Khám phá Đất nước & Con người Việt Nam.",
    "latency": 1311,
    "num": 40
  },
  {
    "name": "THVL1 HD",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_41.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/THVL1-HD-1080p/playlist.m3u8",
    "desc": "Kênh Thời sự - Phim truyện - Giải trí Đài PT-TH Vĩnh Long.",
    "latency": 55,
    "num": 41
  },
  {
    "name": "THVL2 HD",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_42.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/THVL2-HD-1080p/playlist.m3u8",
    "desc": "Kênh Giải trí & Văn nghệ Tổng hợp THVL2.",
    "latency": 55,
    "num": 42
  },
  {
    "name": "Cần Thơ TV 1",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_43.png",
    "url": "https://live.canthotv.vn/live/tv/chunklist.m3u8",
    "desc": "Kênh Thời sự - Chính luận TP. Cần Thơ.",
    "latency": 166,
    "num": 43
  },
  {
    "name": "Cần Thơ TV 2",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_44.png",
    "url": "https://live.canthotv.vn/cs2/live.stream/playlist.m3u8",
    "desc": "Kênh Khoa giáo & Giải trí Miền Tây.",
    "latency": 163,
    "num": 44
  },
  {
    "name": "Cần Thơ TV 3",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_45.png",
    "url": "https://live.canthotv.vn/cs3/tv/chunklist.m3u8",
    "desc": "Kênh Thông tin Kinh tế & Nông nghiệp.",
    "latency": 164,
    "num": 45
  },
  {
    "name": "Đồng Tháp 1",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_46.png",
    "url": "https://liveh34.vtvprime.vn/hls/DONGTHAPTV/index.m3u8",
    "desc": "Kênh Truyền hình Đồng Tháp THĐT1.",
    "latency": 172,
    "num": 46
  },
  {
    "name": "Đồng Tháp 2",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_47.png",
    "url": "https://618b88f69e53b.streamlock.net/THDT2/thdttv2/chunklist.m3u8",
    "desc": "Kênh Truyền hình Đồng Tháp Miền Tây THĐT2.",
    "latency": 153,
    "num": 47
  },
  {
    "name": "Đà Nẵng TV 1",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_48.png",
    "url": "https://live.mediatech.vn/live/285b59a111d76974225a8e3004bfc31a509/chunklist.m3u8",
    "desc": "Kênh Thời sự & Chính trị TP. Đà Nẵng.",
    "latency": 236,
    "num": 48
  },
  {
    "name": "Đà Nẵng TV 2",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_49.png",
    "url": "https://live.mediatech.vn/live/2859145290d0d7947ef88b6240123b62474/chunklist.m3u8",
    "desc": "Kênh Văn hóa & Xã hội Miền Trung.",
    "latency": 238,
    "num": 49
  },
  {
    "name": "Bình Thuận TV",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_50.png",
    "url": "https://1011154949.vnns.net/CDN-FPT02/BINHTHUAN-SD-720p/playlist.m3u8",
    "desc": "Đài Phát thanh - Truyền hình Bình Thuận BTV.",
    "latency": 128,
    "num": 50
  },
  {
    "name": "Nghệ An TV",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_51.png",
    "url": "https://67tz1gnwrvxic.cmccdn.net/hls/NGHEANTV/03.m3u8",
    "desc": "Đài Phát thanh - Truyền hình Nghệ An NTV.",
    "latency": 215,
    "num": 51
  },
  {
    "name": "Hà Tĩnh TV",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_52.png",
    "url": "https://cohauw9bgpvod.vcdn.cloud/httv1/index.m3u8",
    "desc": "Đài Phát thanh - Truyền hình Hà Tĩnh HTTV.",
    "latency": 255,
    "num": 52
  },
  {
    "name": "Tây Ninh TV",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_53.png",
    "url": "https://live-hq.evgcdn.net/live/2851dc2c9af68834814a89e61db0faee561/chunklist.m3u8",
    "desc": "Đài Phát thanh - Truyền hình Tây Ninh TTV11.",
    "latency": 138,
    "num": 53
  },
  {
    "name": "Thái Nguyên TV",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_54.png",
    "url": "https://streaming.thainguyentv.vn/hls/livestream.m3u8",
    "desc": "Đài Phát thanh - Truyền hình Thái Nguyên TNTV.",
    "latency": 120,
    "num": 54
  },
  {
    "name": "Cà Mau TV",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_55.png",
    "url": "https://tv.ctvcamau.vn/live/tv/tv.m3u8",
    "desc": "Đài Phát thanh - Truyền hình Cà Mau CTV.",
    "latency": 75,
    "num": 55
  },
  {
    "name": "An Giang 1",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_56.png",
    "url": "https://tv.angiangtv.vn/live/kgtv/kgtv.m3u8",
    "desc": "Đài Phát thanh - Truyền hình An Giang ATV1.",
    "latency": 55,
    "num": 56
  },
  {
    "name": "An Giang 2",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_57.png",
    "url": "https://tv.angiangtv.vn/live/kgtv2/kgtv2.m3u8",
    "desc": "Kênh Giải trí Truyền hình An Giang ATV2.",
    "latency": 59,
    "num": 57
  },
  {
    "name": "Lạng Sơn TV",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_58.png",
    "url": "https://stream.langsontv.vn/live/285c78da0c246524c90917842f8de03bd21/playlist.m3u8",
    "desc": "Đài Phát thanh - Truyền hình Lạng Sơn LSTV.",
    "latency": 159,
    "num": 58
  },
  {
    "name": "Điện Biên TV",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_59.png",
    "url": "https://stream.langsontv.vn/live/2855dfeccb7f49a41a2b0441b3bfeda413c/playlist.m3u8",
    "desc": "Đài Phát thanh - Truyền hình Điện Biên ĐTV.",
    "latency": 189,
    "num": 59
  },
  {
    "name": "Cao Bằng TV",
    "cat": "local",
    "catLabel": "Đài Địa Phương",
    "logo": "logos/ch_60.png",
    "url": "https://stream.thingnet.vn/live/smil:CRTV.smil/chunklist.m3u8",
    "desc": "Đài Phát thanh - Truyền hình Cao Bằng CRTV.",
    "latency": 163,
    "num": 60
  }
];

if (typeof window !== "undefined") {
    window.ALL_CHANNELS = ALL_CHANNELS;
}
