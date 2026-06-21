# Tiến Trình Hệ Thống — Thú Giới

> File này tự động cập nhật khi mỗi chức năng được build xong.
> Trạng thái: ✅ = Hoàn thành | 🔄 = Đang build | ⬜ = Chưa làm

---

## BACKEND & DATABASE

### Cơ Sở Hạ Tầng
- ✅ Khởi tạo pnpm monorepo workspace
- ✅ PostgreSQL database provisioned
- ✅ Drizzle ORM + schema push
- ✅ OpenAPI spec (openapi.yaml) — contract-first
- ✅ Orval codegen — React Query hooks + Zod schemas

### Schema Database
- ✅ Bảng `beasts` — thú với đầy đủ cấp bậc, chủng tộc, sức mạnh
- ✅ Bảng `species` — chủng loài theo 6 nguồn gốc
- ✅ Bảng `universe_maps` — bản đồ vũ trụ theo từng cấp
- ✅ Bảng `breeding_records` — lịch sử lai tạo

### API Routes
- ✅ `GET/POST /api/beasts` — danh sách + tạo thú mới
- ✅ `GET/PATCH/DELETE /api/beasts/:id` — chi tiết, sửa, xóa
- ✅ `POST /api/beasts/:id/evolve` — tiến hóa thú lên cấp tiếp theo
- ✅ `GET /api/beasts/legendary` — danh sách thú huyền thoại
- ✅ `GET /api/beasts/recent` — thú mới nhất
- ✅ `GET/POST /api/species` — chủng loài
- ✅ `PATCH/DELETE /api/species/:id` — quản lý chủng loài
- ✅ `GET /api/breeding` — lịch sử lai tạo
- ✅ `POST /api/breeding` — thực hiện lai tạo
- ✅ `GET /api/maps` — tất cả bản đồ
- ✅ `GET /api/maps/:tier` — bản đồ theo cấp
- ✅ `GET /api/stats/overview` — thống kê tổng quan
- ✅ `GET /api/stats/tiers` — thống kê theo cấp
- ✅ `GET /api/stats/species` — thống kê theo chủng

### Dữ Liệu Khởi Tạo
- ✅ 18 chủng loài từ 6 nguồn gốc (Sử Thi, Truyền Thuyết, Huyền Thoại, Thần Thoại, Dân Gian, Huyền Ảo)
- ✅ 16 thú mẫu từ Cấp 1 → Cấp 11 (Hung thú)
- ✅ 11 bản đồ vũ trụ từ Đồng Bằng Xanh → Vực Thẳm Hắc Ám

---

## FRONTEND — GIAO DIỆN CỔ ĐIỂN (v1.0)

### Hệ Thống Chung
- ✅ Layout sidebar navigation
- ✅ Dark fantasy theme (indigo, gold, ember red)
- ✅ Custom fonts (Cinzel + Inter)
- ✅ React Query integration
- ✅ Wouter routing

### Các Trang
- ✅ **Cổng Môn (/)** — Landing page huyền bí, hero với rồng
- ✅ **Vạn Thú Giới (/universe)** — Gallery thú, lọc theo cấp/chủng tộc
- ✅ **Phối Giống (/breed)** — Phòng lai tạo nghi lễ
- ✅ **Thú Ký (/bestiary)** — Danh sách đầy đủ, tìm kiếm, phân trang
- ✅ **Bản Đồ (/map)** — 11 vùng bản đồ vũ trụ
- ✅ **Quản Trị (/admin)** — Thống kê, CRUD thú + chủng loài

---

## FRONTEND — GIAO DIỆN SPATIAL (v2.0) ← VR/AR/MR/XR

### Cơ Sở Hạ Tầng 3D
- ✅ Cài đặt React Three Fiber + Drei + Three.js
- ✅ Cài đặt @react-three/xr — WebXR API support
- ✅ Scene 3D chính — không gian vũ trụ Thú Giới (SpatialScene)
- ✅ Camera controls — OrbitControls (xoay/zoom/pan)
- ✅ WebGL detection hook — `useWebGLSupported()` phát hiện môi trường không có GPU
- ✅ Lazy XR store — `useXRStore(enabled)` chỉ khởi tạo khi WebGL khả dụng
- ✅ CanvasErrorBoundary — bắt lỗi React nếu Canvas crash
- ✅ Graceful fallback — tự chuyển sang UI 2D khi WebGL không hỗ trợ

### Spatial UI Components
- ✅ **BeastOrb** — Quả cầu thú nổi 3D với glow theo cấp, Fibonacci distribution
- ✅ **TierRing** — 11 vòng cấp bậc xoay trong không gian
- ✅ **MapZone3D** — Bản đồ vũ trụ 3D phân tầng hình trụ
- ✅ **SpatialScene** — Background scene nền toàn trang
- ✅ **XRButton** — Nút vào chế độ VR/AR (chỉ hiện khi thiết bị hỗ trợ)
- ✅ **BreedingPortal** — Cổng lai tạo 3D: hai quả cầu xoay hội tụ, vòng xoáy vortex, particles phát nổ

### VR / AR / MR / XR
- ✅ WebXR Session Manager (createXRStore lazy)
- ✅ VR Mode button — sẵn sàng khi có thiết bị VR
- ✅ AR Mode button — sẵn sàng khi có thiết bị AR
- ⬜ Hand tracking — tương tác bằng tay trong VR
- ⬜ Spatial audio — âm thanh 3D theo vị trí thú
- ⬜ Eye tracking — nhìn vào thú để xem thông tin

---

## HỆ THỐNG NGƯỜI DÙNG

- ⬜ Đăng ký / Đăng nhập (Replit Auth hoặc Clerk)
- ⬜ Mỗi user có đàn thú riêng
- ⬜ Profile người chơi

## HỆ THỐNG CHIẾN ĐẤU / PVP

- ⬜ So sánh sức mạnh giữa 2 thú
- ⬜ Trận đấu PvP giữa người chơi
- ⬜ Bảng xếp hạng (leaderboard)

## HỆ THỐNG TIẾN HÓA & NÂNG CẤP

- ⬜ Tính năng tiến hóa từ cấp 1 → 11
- ⬜ Thu thập nguyên liệu để tiến hóa
- ⬜ Kỹ năng đặc biệt theo chủng loài

## THÚ KÝ MỞ RỘNG

- ⬜ AI sinh tên thú tự động
- ⬜ AI tạo mô tả thú dựa trên cha mẹ
- ⬜ AI tạo ảnh thú bằng image generation

---

## TRIỂN KHAI

- ⬜ Deploy lên Replit production
- ⬜ Domain tùy chỉnh
- ⬜ CDN cho assets 3D

---

_Cập nhật lần cuối: 2026-06-21_
_Phiên bản: v2.0-spatial-complete_
