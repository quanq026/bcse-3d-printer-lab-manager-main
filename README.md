<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-428-80c8-01ce9429161f" />

# BCSE 3D Printer Lab Manager
**Hệ thống quản lý đặt lịch và vận hành phòng in 3D — VJU BCSE Lab**

![Node.js](https://img.shields.io/badge/Node.js-20-green) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![SQLite](https://img.shields.io/badge/SQLite-WAL-orange) ![License](https://img.shields.io/badge/License-MIT-lightgrey)
</div>

---

## Mục lục

1. [Giới thiệu & Yêu cầu](#1-giới-thiệu--yêu-cầu)
2. [Kiến trúc tổng quan](#2-kiến-trúc-tổng-quan)
3. [Technical Stack](#3-technical-stack)
4. [Cấu trúc thư mục](#4-cấu-trúc-thư-mục)
5. [Thiết kế chức năng & Luồng sử dụng](#5-thiết-kế-chức-năng--luồng-sử-dụng)
6. [Database Schema](#6-database-schema)
7. [API Reference](#7-api-reference)
8. [Bảo mật & Middleware](#8-bảo-mật--middleware)
9. [Cài đặt & Chạy local](#9-cài-đặt--chạy-local)
10. [Triển khai lên máy chủ (Production)](#10-triển-khai-lên-máy-chủ-production)
11. [Tài khoản demo](#11-tài-khoản-demo)

---

## 1. Giới thiệu & Yêu cầu

### Bối cảnh

BCSE Lab tại VJU vận hành nhiều máy in 3D (Bambu Lab A1, X1 Carbon, Creality Ender 3…) phục vụ sinh viên nghiên cứu và làm đồ án. Trước đây việc đặt lịch được thực hiện thủ công qua email/Zalo, dẫn đến:

- Trùng lịch giữa các sinh viên
- Không theo dõi được trạng thái lệnh in
- Thiếu minh bạch trong tính phí vật liệu
- Khó quản lý tồn kho filament

### Yêu cầu đặt ra

| Yêu cầu | Mô tả |
|---------|-------|
| **Đặt lịch trực tuyến** | Sinh viên đặt lịch qua web, không cần liên hệ trực tiếp |
| **Phê duyệt có kiểm soát** | Moderator/Admin duyệt từng yêu cầu trước khi in |
| **Hai chế độ in** | Tự in (sinh viên tự vận hành) và In hộ (nhân viên lab thực hiện) |
| **Tính phí tự động** | Chi phí tính theo vật liệu sử dụng và phí dịch vụ |
| **Quản lý tồn kho** | Theo dõi filament theo chủng loại, màu sắc, vị trí |
| **Xác thực sinh viên** | Chỉ email VJU (`@st.vju.ac.vn`, `@vju.ac.vn`) được đăng ký |
| **Đa ngôn ngữ** | Giao diện song ngữ Tiếng Việt / Tiếng Nhật |
| **Dark mode** | Hỗ trợ giao diện tối, tự nhận diện theme hệ thống |

---

## 2. Kiến trúc tổng quan

```
┌──────────────────────────────────────────────────────┐
│                   Người dùng (Browser)                │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼───────────────────────────────────┐
│               Nginx (Reverse Proxy)                   │
│  /           → static dist/                           │
│  /api        → Express :3000                          │
│  /uploads    → Express :3000                          │
│  /printer-images → Express :3000                      │
└──────────────────┬───────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────┐
│            Express Server (Node.js :3000)             │
│                                                       │
│  Middleware stack:                                    │
│   Helmet → CORS → Body Parser → HTTP Logger →         │
│   Rate Limit → Auth (JWT) → Zod Validate →            │
│   Route Handler → SQLite (WAL)                        │
│                                                       │
│  Static:  dist/              (Vite SPA build)         │
│  Uploads: data/uploads/      (STL, 3MF, GCode)        │
│  Images:  data/printer-images/                        │
│  DB:      data/lab.db        (SQLite WAL)             │
│  Logs:    data/logs/         (Winston rotation)       │
└──────────────────────────────────────────────────────┘
```

**Luồng dữ liệu:**
```
React SPA  ──fetch──►  Express REST API  ──query──►  SQLite DB
                              │
                        Nodemailer SMTP
                        (OTP / thông báo)
```

---

## 3. Technical Stack

### Frontend

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| **React** | 19 | UI framework |
| **TypeScript** | 5.8 | Type safety |
| **Vite** | 6 | Build tool, dev server |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Three.js** | 0.183 | Render file STL 3D trực tiếp trên browser |
| **JSZip** | 3.10 | Giải nén file `.3mf` để lấy thumbnail |
| **Recharts** | 3.7 | Biểu đồ thống kê (bar chart 7 ngày) |
| **Lucide React** | 0.546 | Icon library |
| **date-fns** | 4 | Xử lý ngày tháng |
| **Motion** | 12 | Animations (Framer Motion) |

### Backend

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| **Express** | 4.21 | Web framework |
| **TypeScript** | 5.8 | Type safety |
| **tsx** | 4.21 | Chạy TypeScript trực tiếp (không cần compile) |
| **better-sqlite3** | 12.4 | SQLite driver (synchronous, hiệu suất cao) |
| **bcryptjs** | 2.4 | Hash mật khẩu (cost=10) |
| **jsonwebtoken** | 9.0 | JWT authentication (7 ngày) |
| **multer** | 2.0 | Upload file (STL/3MF/GCode, max 50MB) |
| **nodemailer** | 8.0 | Gửi email OTP |
| **helmet** | 8.1 | HTTP security headers |
| **express-rate-limit** | 8.3 | Rate limiting chống spam/brute-force |
| **zod** | 4.3 | Schema validation & sanitize đầu vào |
| **winston** | 3.19 | File logging với rotation tự động |
| **PM2** | — | Process manager production |

### Database

**SQLite** với **WAL mode** (Write-Ahead Logging):
- Không cần server database riêng → đơn giản khi deploy
- WAL cho phép đọc concurrent không block ghi
- Backup đơn giản: copy 1 file `.db`
- Phù hợp cho lab nhỏ (< 500 user, vài trăm job/tháng)

---

## 4. Cấu trúc thư mục

```
bcse-3d-printer-lab-manager/
│
├── server/
│   ├── index.ts          # Express app + tất cả API routes
│   ├── logger.ts         # Winston logger (file + console)
│   └── validation.ts     # Zod schemas + validate() middleware
│
├── src/
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Client-side routing
│   ├── types.ts          # TypeScript interfaces & enums
│   │
│   ├── lib/
│   │   ├── api.ts        # API client (fetch wrapper, tất cả endpoint)
│   │   ├── i18n.ts       # Bản dịch VN/JP (key-value)
│   │   └── utils.ts      # Helper functions
│   │
│   ├── contexts/
│   │   └── LanguageContext.tsx   # Language state (localStorage persist)
│   │
│   ├── components/
│   │   ├── FilePreview.tsx       # 3D viewer (STL → Three.js, 3MF → JSZip)
│   │   ├── TopBar.tsx            # Header navigation
│   │   └── Sidebar.tsx           # Left navigation menu
│   │
│   └── pages/
│       ├── LandingPage.tsx       # Login / Register + OTP flow
│       ├── StudentDashboard.tsx  # Trang chủ sinh viên (KPI + job table)
│       ├── BookingWizard.tsx     # Đặt lịch in (4 bước, 1.200 LOC)
│       ├── QueuePage.tsx         # Xem hàng đợi công khai
│       ├── JobDetail.tsx         # Chi tiết lệnh in + chat theo job
│       ├── ChatPage.tsx          # Chat nội bộ chung
│       ├── ModeratorQueue.tsx    # Duyệt lệnh (split-view)
│       ├── AdminUsers.tsx        # Quản lý người dùng + ban
│       ├── AdminPrinters.tsx     # Quản lý máy in + upload ảnh
│       ├── AdminInventory.tsx    # Tồn kho filament
│       ├── AdminPricing.tsx      # Cấu hình giá vật liệu + phí dịch vụ
│       ├── AdminSettings.tsx     # SMTP, thông tin lab, điều khoản
│       ├── BackupPage.tsx        # Sao lưu / tải về database
│       └── PricingPage.tsx       # Bảng giá công khai
│
├── data/                 # Runtime data — KHÔNG commit vào git
│   ├── lab.db            # SQLite database
│   ├── uploads/          # File STL/3MF/GCode của sinh viên
│   ├── printer-images/   # Ảnh máy in do Admin upload
│   ├── backups/          # Snapshot DB (auto 2AM + manual)
│   └── logs/             # app.log, error.log (winston)
│
├── public/               # Static assets (favicon, v.v.)
├── images/               # Ảnh máy in mặc định
├── pm2.config.cjs        # PM2 ecosystem config
├── vite.config.ts        # Vite + dev proxy config
├── .env.example          # Mẫu biến môi trường
└── package.json
```

---

## 5. Thiết kế chức năng & Luồng sử dụng

### 5.1 Phân quyền (Role-Based Access Control)

Hệ thống có 3 vai trò:

| Tính năng | Student | Moderator | Admin |
|-----------|:-------:|:---------:|:-----:|
| Đặt lịch in | ✓ | ✓ | ✓ |
| Xem lịch sử lệnh in của mình | ✓ | ✓ | ✓ |
| Xem hàng đợi | ✓ | ✓ | ✓ |
| Nhắn tin nội bộ | ✓ | ✓ | ✓ |
| Duyệt / Từ chối / Yêu cầu sửa | — | ✓ | ✓ |
| Cập nhật trạng thái đang in | — | ✓ | ✓ |
| Xem thống kê & audit log | — | ✓ | ✓ |
| Quản lý tồn kho filament | — | ✓ | ✓ |
| Quản lý người dùng & phân quyền | — | — | ✓ |
| Quản lý máy in | — | — | ✓ |
| Cấu hình giá & phí dịch vụ | — | — | ✓ |
| Cài đặt SMTP / thông tin lab | — | — | ✓ |
| Sao lưu database | — | — | ✓ |

### 5.2 Luồng đăng ký tài khoản

```
[Sinh viên nhập email @st.vju.ac.vn / @vju.ac.vn]
         │
         ▼
[Hệ thống gửi OTP 6 số qua email]
   ├── Hiệu lực: 10 phút
   ├── Cooldown: 60 giây giữa 2 lần gửi (per email)
   └── Rate limit: tối đa 5 lần/giờ/IP
         │
         ▼
[Sinh viên nhập OTP xác thực]
         │
         ▼
[Điền thông tin đăng ký]
   ├── Họ tên (bắt buộc)
   ├── Mật khẩu: ≥8 ký tự, có chữ hoa, có số
   ├── MSSV, Điện thoại, Giảng viên (tùy chọn)
   └── [Tạo tài khoản — status: active]
```

### 5.3 Luồng đặt lịch in (Booking Wizard)

Wizard thông minh: bỏ qua các bước không cần thiết dựa trên lựa chọn.

```
BƯỚC 1 — Thông tin & Chế độ in
  ├── Chọn: Tự in (self) / In hộ (lab_assisted)
  ├── Tên job (bắt buộc, ≤200 ký tự)
  └── Mô tả (tùy chọn)

BƯỚC 2 — Vật liệu   [bỏ qua nếu: Tự in + Vật liệu tự mang]
  ├── Loại: PLA / PETG / TPU / ABS
  ├── Nguồn: Lab mua / Tự mang
  ├── Màu (11 màu preset + custom hex)
  ├── Thương hiệu
  └── Khối lượng ước tính (grams)

BƯỚC 3 — File in
  ├── Upload .STL / .3MF / .GCode (max 50MB)
  ├── Kéo thả hoặc click
  └── Preview trực tiếp:
        STL  → Three.js 3D render
        3MF  → JSZip giải nén lấy thumbnail PNG

BƯỚC 4 — Lịch in   [bỏ qua nếu: In hộ]
  ├── Chọn máy in (lọc theo vật liệu hỗ trợ)
  ├── Ngày ưu tiên
  └── Khung giờ → Slot cụ thể (8h–9h, 9h–10h…)

BƯỚC 5 — Xác nhận
  ├── Hiển thị tóm tắt + chi phí ước tính
  ├── Checkbox xác nhận điều khoản
  └── Nộp → Trạng thái khởi tạo:
        Tự in  → "Submitted"
        In hộ  → "Pending review"
```

**Luồng điều kiện:**

| Chế độ | Vật liệu | Các bước |
|--------|----------|---------|
| Tự in | Lab mua | 1 → 2 → 3 → 4 → 5 |
| Tự in | Tự mang | 1 → 3 → 4 → 5 |
| In hộ | Lab mua | 1 → 2 → 3 → 5 |
| In hộ | Tự mang | 1 → 3 → 5 |

> **Giới hạn hàng ngày:** Tối đa 2 lệnh/ngày/sinh viên (không tính lệnh đã Cancelled).

### 5.4 Tính phí tự động

| Chế độ | Nguồn vật liệu | Công thức chi phí |
|--------|----------------|-------------------|
| Tự in | Lab mua | `grams × giá_vật_liệu/gram` |
| Tự in | Tự mang | **Miễn phí** |
| In hộ | Lab mua | `grams × (giá_vật_liệu + phí_dịch_vụ) / gram` |
| In hộ | Tự mang | `grams × phí_dịch_vụ/gram` |

Giá mặc định (Admin có thể chỉnh qua giao diện):

| Vật liệu | Giá/gram |
|----------|---------|
| PLA | 1.000 đ |
| PETG | 1.200 đ |
| TPU | 1.500 đ |
| ABS | 1.300 đ |
| Phí dịch vụ in hộ | 100 đ |

### 5.5 Vòng đời trạng thái lệnh in

```
[Tự in]          [In hộ]
    │                │
    ▼                ▼
Submitted    Pending review
    │                │
    └────────┬────────┘
             ▼
          Approved
             │
         (gán máy)
             ▼
          Scheduled
             │
             ▼
          Printing
             │
             ▼
           Done

Từ bất kỳ trạng thái nào:
  ──► Rejected       (Mod/Admin từ chối, kèm lý do)
  ──► Cancelled      (Sinh viên tự hủy)
  ──► Needs Revision (Mod yêu cầu chỉnh file/thông tin)
```

### 5.6 Luồng Moderator duyệt job

```
Moderator đăng nhập → ModeratorQueue (split-view)
│
├── Bảng bên trái: danh sách job đang chờ
│     └── Lọc: Chờ duyệt / Đang in
│
└── Panel bên phải: chi tiết + hành động

    Nếu PENDING_REVIEW / SUBMITTED:
    ├── ✅ Phê duyệt & Xếp lịch
    ├── 🔄 Yêu cầu sửa đổi (kèm ghi chú)
    └── ❌ Từ chối (kèm lý do)

    Nếu APPROVED / SCHEDULED:
    ├── Gán máy in
    └── ▶ Bắt đầu in → Printing (máy: Busy)

    Nếu PRINTING:
    ├── Nhập khối lượng thực tế
    └── ✓ Đánh dấu hoàn thành → Done (máy: Available)
```

### 5.7 Tính năng Admin

| Module | Chức năng chính |
|--------|----------------|
| **Quản lý người dùng** | Xem danh sách, phê duyệt pending, phân quyền, tạm khóa có thời hạn / vĩnh viễn kèm lý do |
| **Quản lý máy in** | Thêm/sửa/xóa máy, upload ảnh, cấu hình AMS, build volume, vật liệu hỗ trợ |
| **Tồn kho filament** | Cập nhật số gram, ngưỡng cảnh báo, vị trí kệ, thương hiệu |
| **Cấu hình giá** | Giá/gram theo vật liệu + phí dịch vụ in hộ |
| **Cài đặt hệ thống** | Thông tin lab, SMTP email (test ngay trong giao diện), điều khoản sử dụng |
| **Backup DB** | Tạo snapshot thủ công, tải về; tự động 1 lần/ngày lúc 2AM |
| **Audit Log** | Toàn bộ hành động của admin/mod (xem 500 gần nhất) |

---

## 6. Database Schema

### Bảng `users`
```sql
id           TEXT PRIMARY KEY    -- UUID v4
email        TEXT UNIQUE NOT NULL -- @st.vju.ac.vn / @vju.ac.vn
password_hash TEXT NOT NULL       -- bcrypt, cost=10
full_name    TEXT NOT NULL
student_id   TEXT                 -- MSSV (tùy chọn)
role         TEXT DEFAULT 'Student'   -- Student | Moderator | Admin
phone        TEXT
supervisor   TEXT
status       TEXT DEFAULT 'pending'   -- pending | active | suspended
ban_reason   TEXT
ban_until    TEXT                 -- ISO 8601 hoặc NULL (vĩnh viễn)
created_at   TEXT NOT NULL        -- ISO 8601
```

### Bảng `print_jobs`
```sql
id               TEXT PRIMARY KEY  -- JOB-001, JOB-002...
user_id          TEXT NOT NULL     -- FK → users.id
user_name        TEXT NOT NULL     -- denormalized để tránh JOIN
job_name         TEXT NOT NULL
description      TEXT
file_name        TEXT DEFAULT ''   -- tên file trong data/uploads/
estimated_time   TEXT              -- ước tính thời gian in
estimated_grams  INTEGER DEFAULT 0
actual_grams     INTEGER           -- điền sau khi in xong
material_type    TEXT NOT NULL     -- PLA | PETG | TPU | ABS
color            TEXT NOT NULL
brand            TEXT
material_source  TEXT NOT NULL     -- Lab | Personal
print_mode       TEXT DEFAULT 'self'   -- self | lab_assisted
printer_id       TEXT              -- FK → printers.id
printer_name     TEXT              -- denormalized
slot_time        TEXT              -- "2025-06-15 Sáng 8h-9h"
status           TEXT DEFAULT 'Draft'
cost             REAL DEFAULT 0    -- tính khi tạo job
rejection_reason TEXT
revision_note    TEXT
notes            TEXT
created_at       TEXT NOT NULL
updated_at       TEXT NOT NULL
```

### Bảng `printers`
```sql
id                  TEXT PRIMARY KEY
name                TEXT NOT NULL
build_volume        TEXT NOT NULL      -- "256 x 256 x 256 mm"
supported_materials TEXT NOT NULL      -- JSON array: ["PLA","PETG","TPU"]
status              TEXT DEFAULT 'Available'  -- Available | Busy | Maintenance
queue_length        INTEGER DEFAULT 0
next_available      TEXT
location            TEXT DEFAULT ''    -- Mỹ Đình | Hòa Lạc
image_url           TEXT DEFAULT ''
has_ams             INTEGER DEFAULT 0  -- 0 = không có AMS, 1 = có AMS
```

### Bảng `filament_inventory`
```sql
id              TEXT PRIMARY KEY   -- S-001, S-002...
material        TEXT NOT NULL      -- PLA | PETG | TPU | ABS
color           TEXT NOT NULL
remaining_grams REAL DEFAULT 1000
threshold       REAL DEFAULT 200   -- cảnh báo "Low" khi dưới ngưỡng
location        TEXT DEFAULT ''    -- "Tủ A1", "Kệ B2"...
brand           TEXT DEFAULT ''
area            TEXT DEFAULT 'Mỹ Đình'
-- status được tính động: Out of Stock | Low | In Stock
```

### Bảng `pricing_rules`
```sql
id             TEXT PRIMARY KEY
material       TEXT NOT NULL UNIQUE  -- PLA | PETG | TPU | ABS
price_per_gram REAL NOT NULL
```

### Bảng `service_fees`
```sql
id          TEXT PRIMARY KEY
name        TEXT NOT NULL UNIQUE   -- setup_fee | rush_fee | service_fee
label       TEXT NOT NULL          -- tên hiển thị
amount      REAL DEFAULT 0
description TEXT DEFAULT ''
enabled     INTEGER DEFAULT 1      -- 0 = tắt phí này
```

### Bảng `email_verifications`
```sql
id         TEXT PRIMARY KEY
email      TEXT NOT NULL
otp        TEXT NOT NULL    -- 6 chữ số ngẫu nhiên
expires_at TEXT NOT NULL    -- 10 phút sau khi tạo
verified   INTEGER DEFAULT 0
created_at TEXT NOT NULL
```

### Bảng `messages`
```sql
id         TEXT PRIMARY KEY
user_id    TEXT NOT NULL
user_name  TEXT NOT NULL
user_role  TEXT NOT NULL
job_id     TEXT              -- NULL = tin nhắn chung
content    TEXT NOT NULL
created_at TEXT NOT NULL
```

### Bảng `lab_settings` (Key-Value)
```sql
key   TEXT PRIMARY KEY
value TEXT NOT NULL
-- Các key được phép:
-- lab_name, contact_email, contact_facebook, contact_zalo, guide_url
-- smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from
-- terms_content, require_approval
```

### Bảng `activity_logs`
```sql
id         TEXT PRIMARY KEY
user_id    TEXT
user_name  TEXT
action     TEXT NOT NULL   -- LOGIN, REGISTER, CREATE_JOB, UPDATE_JOB_STATUS...
details    TEXT
created_at TEXT NOT NULL
```

---

## 7. API Reference

### Base URL
```
Development:  http://localhost:3000/api
Production:   https://your-domain.com/api
```

### Xác thực
Các route yêu cầu auth phải gửi header:
```
Authorization: Bearer <jwt_token>
```
JWT token hết hạn sau **7 ngày**.

---

### 7.1 Health Check

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/health` | Không |

```json
// Response 200
{ "status": "ok", "db": "ok", "uptime": 3600, "ts": "2025-01-01T00:00:00.000Z" }
```

---

### 7.2 Auth

| Method | Endpoint | Auth | Giới hạn | Mô tả |
|--------|----------|------|----------|-------|
| POST | `/auth/send-otp` | Không | 5/giờ/IP | Gửi OTP xác thực |
| POST | `/auth/verify-otp` | Không | — | Xác thực OTP |
| POST | `/auth/register` | Không | — | Đăng ký tài khoản |
| POST | `/auth/login` | Không | 20/15ph/IP | Đăng nhập |
| GET | `/auth/me` | ✓ | — | Thông tin user hiện tại |

**POST `/auth/send-otp`**
```json
// Request body
{ "email": "student@st.vju.ac.vn" }

// Response 200
{ "message": "OTP đã được gửi đến email của bạn." }

// Response 429 — cooldown 60s
{ "error": "Vui lòng chờ 45 giây trước khi gửi lại OTP." }

// Response 400 — email không hợp lệ
{ "error": "Chỉ chấp nhận email VJU (@st.vju.ac.vn hoặc @vju.ac.vn)" }
```

**POST `/auth/register`**
```json
// Request body
{
  "email": "student@st.vju.ac.vn",
  "password": "MyPass123",       // min 8 ký tự, có chữ hoa + số
  "fullName": "Nguyễn Văn A",
  "studentId": "VJU2024001",     // tùy chọn
  "phone": "0901234567",         // tùy chọn
  "supervisor": "PGS. Trần B"    // tùy chọn
}
// Response 200
{ "message": "Đăng ký thành công. Bạn có thể đăng nhập ngay bây giờ." }
```

**POST `/auth/login`**
```json
// Request body
{ "email": "admin@vju.ac.vn", "password": "Admin@2024" }

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@vju.ac.vn",
    "role": "Admin",
    "fullName": "Admin BCSE Lab",
    "studentId": null
  }
}
```

---

### 7.3 Print Jobs

| Method | Endpoint | Auth | Role | Mô tả |
|--------|----------|------|------|-------|
| GET | `/jobs` | ✓ | All | Danh sách (Student: chỉ của mình; Mod/Admin: tất cả) |
| GET | `/jobs/queue` | ✓ | All | Hàng đợi đang hoạt động (Submitted → Printing) |
| GET | `/jobs/:id` | ✓ | All | Chi tiết 1 job |
| POST | `/jobs` | ✓ | All | Tạo lệnh in mới |
| PATCH | `/jobs/:id` | ✓ | All | Cập nhật trạng thái / ghi chú |
| POST | `/jobs/upload` | ✓ | All | Upload file in (STL/3MF/GCode, max 50MB) |

**POST `/jobs`** — Tạo lệnh in
```json
// Request body
{
  "jobName": "Giá đỡ điện thoại",
  "description": "In cho đề tài nghiên cứu IoT",
  "fileName": "1234567890-holder.stl",   // từ /jobs/upload
  "estimatedGrams": 45,
  "materialType": "PLA",
  "materialSource": "Lab",      // "Lab" | "Personal"
  "printMode": "self",          // "self" | "lab_assisted"
  "color": "Trắng",
  "brand": "Bambu",
  "printerId": "p1",
  "slotTime": "2025-06-15 Sáng 8h-9h"
}

// Response 201
{
  "id": "JOB-042",
  "status": "Submitted",   // hoặc "Pending review" nếu lab_assisted
  "cost": 45000,
  "createdAt": "2025-06-14T08:00:00.000Z",
  ...
}
```

**PATCH `/jobs/:id`** — Cập nhật trạng thái
```json
// Moderator duyệt
{ "status": "Approved", "printerId": "p1", "slotTime": "2025-06-15 Sáng 8h-9h" }

// Moderator từ chối
{ "status": "Rejected", "rejectionReason": "File lỗi layer" }

// Moderator yêu cầu sửa
{ "status": "Needs Revision", "revisionNote": "Cần tăng wall thickness lên 3mm" }

// Moderator bắt đầu in
{ "status": "Printing" }

// Moderator hoàn thành
{ "status": "Done", "actualGrams": 43 }

// Sinh viên hủy
{ "status": "Cancelled" }
```

---

### 7.4 Printers

| Method | Endpoint | Auth | Role | Mô tả |
|--------|----------|------|------|-------|
| GET | `/printers` | ✓ | All | Danh sách máy in |
| POST | `/printers` | ✓ | Admin | Thêm máy in |
| PATCH | `/printers/:id` | ✓ | Admin | Sửa thông tin |
| DELETE | `/printers/:id` | ✓ | Admin | Xóa máy in |
| POST | `/printers/upload-image` | ✓ | Admin | Upload ảnh (max 5MB) |

```json
// GET /printers — Response
[{
  "id": "p1",
  "name": "Bambu Lab A1",
  "buildVolume": "256 x 256 x 256 mm",
  "supportedMaterials": ["PLA", "PETG", "TPU"],
  "status": "Available",      // Available | Busy | Maintenance
  "queueLength": 0,
  "location": "Mỹ Đình",
  "imageUrl": "/images/bambuA1.jpg",
  "hasAMS": true
}]
```

---

### 7.5 Inventory

| Method | Endpoint | Auth | Role | Mô tả |
|--------|----------|------|------|-------|
| GET | `/inventory` | ✓ | All | Danh sách filament |
| POST | `/inventory` | ✓ | Admin | Thêm filament mới |
| PATCH | `/inventory/:id` | ✓ | Admin/Mod | Cập nhật tồn kho |
| DELETE | `/inventory/:id` | ✓ | Admin | Xóa filament |

```json
// GET /inventory — Response
[{
  "id": "S-001",
  "material": "PLA",
  "color": "Trắng",
  "remainingGrams": 850,
  "threshold": 200,
  "brand": "Bambu",
  "area": "Mỹ Đình",
  "location": "Tủ A1",
  "status": "In Stock"   // "In Stock" | "Low" | "Out of Stock"
}]
```

---

### 7.6 Pricing

| Method | Endpoint | Auth | Role | Mô tả |
|--------|----------|------|------|-------|
| GET | `/pricing` | Không | — | Bảng giá vật liệu (public) |
| PUT | `/pricing` | ✓ | Admin | Cập nhật giá |
| GET | `/service-fees` | ✓ | All | Phí dịch vụ |
| PUT | `/service-fees` | ✓ | Admin | Cập nhật phí |

```json
// PUT /pricing — Request body
{
  "rules": [
    { "material": "PLA",  "pricePerGram": 1000 },
    { "material": "PETG", "pricePerGram": 1200 },
    { "material": "TPU",  "pricePerGram": 1500 },
    { "material": "ABS",  "pricePerGram": 1300 }
  ]
}
```

---

### 7.7 Users (Admin)

| Method | Endpoint | Auth | Role | Mô tả |
|--------|----------|------|------|-------|
| GET | `/users` | ✓ | Admin | Tất cả người dùng |
| PATCH | `/users/:id` | ✓ | Admin | Cập nhật role / status / ban |
| DELETE | `/users/:id` | ✓ | Admin | Xóa tài khoản |

```json
// PATCH /users/:id — Khóa tài khoản có thời hạn
{
  "status": "suspended",
  "banReason": "Vi phạm quy định sử dụng thiết bị",
  "banUntil": "2025-07-15T00:00:00.000Z"
}

// PATCH /users/:id — Phân quyền
{ "role": "Moderator" }
```

---

### 7.8 Messages

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/messages?jobId=JOB-001` | ✓ | Chat theo job cụ thể |
| GET | `/messages` | ✓ | Chat chung (100 tin gần nhất) |
| POST | `/messages` | ✓ | Gửi tin nhắn |

---

### 7.9 Settings

| Method | Endpoint | Auth | Role | Mô tả |
|--------|----------|------|------|-------|
| GET | `/settings` | Không | — | Thông tin công khai (lab, contact) |
| GET | `/settings/admin` | ✓ | Admin | Tất cả settings kể cả SMTP |
| PUT | `/settings` | ✓ | Admin | Cập nhật settings |
| POST | `/settings/test-smtp` | ✓ | Admin | Test gửi email thử |

---

### 7.10 Stats & Logs

| Method | Endpoint | Auth | Role | Mô tả |
|--------|----------|------|------|-------|
| GET | `/stats` | ✓ | Admin/Mod | Thống kê tổng hợp |
| GET | `/stats/daily` | ✓ | Admin/Mod | Biểu đồ 7 ngày gần nhất |
| GET | `/logs?limit=100` | ✓ | Admin/Mod | Audit log (tối đa 500) |

```json
// GET /stats — Response
{
  "totalJobs": 156,
  "pendingReview": 3,
  "printing": 2,
  "totalUsers": 45,
  "pendingUsers": 1,
  "totalRevenue": 4500000
}

// GET /stats/daily — Response
[
  { "date": "2025-06-08", "approved": 2, "done": 3, "rejected": 0, "needsRevision": 1 },
  ...
]
```

---

### 7.11 Backup

| Method | Endpoint | Auth | Role | Mô tả |
|--------|----------|------|------|-------|
| POST | `/backup` | ✓ | Admin | Tạo snapshot DB ngay |
| GET | `/backups` | ✓ | Admin | Danh sách file backup |
| GET | `/backups/:file` | ✓ | Admin | Tải về file backup |

---

## 8. Bảo mật & Middleware

### 8.1 Middleware Stack (thứ tự thực thi)

```
Mọi request đến /api
  │
  1. Helmet          — HTTP security headers (X-Frame-Options, X-Content-Type, HSTS...)
  2. CORS            — Chỉ chấp nhận origin trong ALLOWED_ORIGINS
  3. Body Parser     — JSON (giới hạn 1MB)
  4. HTTP Logger     — Ghi log method, URL, status, thời gian, IP
  5. Global Limiter  — 300 req/15min/IP
  6. [Auth Limiter   — 20 req/15min/IP cho /api/auth/*]
  7. [OTP Limiter    — 5 req/giờ/IP cho /api/auth/send-otp]
  8. requireAuth()   — Verify JWT token
  9. requireRole()   — Kiểm tra vai trò
  10. validate(Zod)  — Validate & sanitize request body
  11. Route Handler  — Xử lý business logic
```

### 8.2 Rate Limiting (3 tầng)

| Tầng | Scope | Giới hạn | Mục đích |
|------|-------|---------|----------|
| Global | `/api/*` | 300 req / 15 phút / IP | Chống DoS |
| Auth | `/api/auth/*` | 20 req / 15 phút / IP | Chống brute-force |
| OTP | `/api/auth/send-otp` | 5 req / 1 giờ / IP | Chống spam email |
| Email cooldown | Per-email (DB) | 60s giữa 2 lần gửi | Double protection |

### 8.3 Input Validation (Zod)

Tất cả POST/PATCH/PUT đều validate input trước khi xử lý:

| Schema | Áp dụng cho | Kiểm tra |
|--------|-------------|---------|
| `SendOtpSchema` | POST /auth/send-otp | email hợp lệ, max 254 ký tự |
| `RegisterSchema` | POST /auth/register | email, password (≥8, chữ hoa, số), fullName (2-100) |
| `LoginSchema` | POST /auth/login | email, password không rỗng |
| `CreateJobSchema` | POST /jobs | jobName (1-200), materialSource enum, grams 0-10000 |
| `PatchJobSchema` | PATCH /jobs/:id | `.strict()` — reject unknown keys |
| `PatchUserSchema` | PATCH /users/:id | status/role enum, banReason max 500 |
| `UpdatePricingSchema` | PUT /pricing | pricePerGram 0-10,000,000, max 20 rules |
| `PostMessageSchema` | POST /messages | content 1-5000 ký tự |

### 8.4 File Upload Security

| Loại file | Extension cho phép | Giới hạn kích thước |
|-----------|-------------------|---------------------|
| File in | `.stl`, `.3mf`, `.gcode` | 50 MB |
| Ảnh máy in | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` | 5 MB |

### 8.5 Các biện pháp khác

- **Path traversal**: Backup download dùng `path.resolve()` + kiểm tra prefix
- **Settings allowlist**: Chỉ 12 key định nghĩa sẵn có thể ghi vào `lab_settings`
- **Proxy trust**: `app.set('trust proxy', 1)` để đọc IP thật qua Nginx
- **Production assertion**: Server exit ngay nếu `JWT_SECRET` vẫn là giá trị mặc định
- **Passwords**: bcrypt hash (cost=10) — không lưu plaintext
- **OTP verify trước register**: Không thể đăng ký nếu chưa xác thực email

---

## 9. Cài đặt & Chạy local

### Yêu cầu

- **Node.js** ≥ 20.6
- **npm** ≥ 10

### Cài đặt

```bash
# Clone repo
git clone https://github.com/<your-username>/bcse-3d-printer-lab-manager.git
cd bcse-3d-printer-lab-manager

# Cài dependencies
npm install

# Tạo file .env
cp .env.example .env
# Chỉnh sửa .env nếu muốn cấu hình SMTP
```

### Chạy development (2 terminal)

```bash
# Terminal 1 — Backend Express + SQLite (port 3000)
npm run dev:server

# Terminal 2 — Frontend Vite (port 5173)
npm run dev
``` 
 
Mở trình duyệt: **http://localhost:5173**

> Lần đầu khởi động, hệ thống tự tạo `data/lab.db` và seed dữ liệu mẫu (tài khoản, máy in, filament, bảng giá).

### Build & Chạy production local

```bash
# Build frontend
npm run build

# Chạy (Express serve cả API lẫn static frontend)
npm start
# Truy cập http://localhost:3000
```

### Biến môi trường (`.env`)

```ini
# ── Bắt buộc trong production ──────────────────────────────────
NODE_ENV=development
PORT=3000
JWT_SECRET=<chuỗi_random_ít_nhất_32_ký_tự>

# ── CORS ────────────────────────────────────────────────────────
# Danh sách origin được phép gọi API, cách nhau bởi dấu phẩy
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
# Production: ALLOWED_ORIGINS=https://your-domain.com

# ── Data directory ───────────────────────────────────────────────
# DATA_DIR=/path/to/persistent/data   (mặc định: ./data)

# ── Email OTP ───────────────────────────────────────────────────
# Dùng Gmail App Password (không phải mật khẩu thật)
# Bật 2FA → Google Account → Security → App Passwords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-lab-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=BCSE 3D Lab <your-lab-email@gmail.com>

# ── Logging ─────────────────────────────────────────────────────
LOG_LEVEL=info   # error | warn | info | debug
```

> **Tạo JWT_SECRET an toàn:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## 10. Triển khai lên máy chủ (Production)

### Yêu cầu máy chủ

| Thành phần | Phiên bản / Specs |
|------------|------------------|
| OS | Ubuntu 20.04+ / Debian 11+ |
| Node.js | 20 LTS |
| Nginx | ≥ 1.18 |
| PM2 | `npm install -g pm2` |
| RAM | ≥ 1 GB |
| Disk | ≥ 20 GB (cho uploads + logs) |

### Bước 1 — Chuẩn bị máy chủ (lần đầu)

```bash
# Cài Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài PM2 và Nginx
sudo npm install -g pm2
sudo apt-get install -y nginx

# Tạo thư mục ứng dụng
sudo mkdir -p /opt/3d-lab
sudo chown -R $USER:$USER /opt/3d-lab
```

### Bước 2 — Deploy ứng dụng

```bash
# Clone code
cd /opt/3d-lab
git clone https://github.com/<your-username>/bcse-3d-printer-lab-manager.git .

# Cài dependencies (bao gồm devDependencies vì dùng tsx)
npm install

# Tạo .env production
cat > /opt/3d-lab/.env << 'EOF'
NODE_ENV=production
PORT=3000
JWT_SECRET=<chuỗi_random_64_bytes>
DATA_DIR=/opt/3d-lab/data
ALLOWED_ORIGINS=https://your-domain.com
LOG_LEVEL=info
EOF

# Build frontend
npm run build

# Tạo thư mục data
mkdir -p /opt/3d-lab/data/uploads /opt/3d-lab/data/logs /opt/3d-lab/data/backups
```

### Bước 3 — Khởi động PM2

```bash
# Start với PM2 (sử dụng pm2.config.cjs)
cd /opt/3d-lab
pm2 start pm2.config.cjs --env production

# Lưu danh sách process để tự khởi động khi reboot
pm2 save

# Cấu hình systemd startup
pm2 startup
# Chạy lệnh sudo mà PM2 in ra màn hình
```

> ⚠️ **Quan trọng:** `pm2.config.cjs` cấu hình `instances: 1, exec_mode: 'fork'`.
> **Không được dùng cluster mode** — SQLite chỉ hỗ trợ 1 writer process.

### Bước 4 — Cấu hình Nginx

Tạo `/etc/nginx/sites-available/3d-lab`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files (Vite build)
    root /opt/3d-lab/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API — proxy tới Express
    location /api {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        client_max_body_size 100m;
        proxy_read_timeout 120s;
    }

    # File uploads và ảnh máy in
    location /uploads {
        proxy_pass http://127.0.0.1:3000;
        client_max_body_size 100m;
    }

    location /printer-images {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

```bash
# Kích hoạt
sudo ln -s /etc/nginx/sites-available/3d-lab /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Bước 5 — HTTPS với Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
# Certbot tự cập nhật nginx config và tự gia hạn cert
```

### Cập nhật code (các lần sau)

```bash
cd /opt/3d-lab
git pull origin main
npm install          # cập nhật dependencies mới nếu có
npm run build        # build lại frontend
pm2 restart bcse-3d-lab
```

### Lệnh PM2 thường dùng

```bash
pm2 list                           # Xem trạng thái process
pm2 logs bcse-3d-lab              # Logs realtime
pm2 logs bcse-3d-lab --lines 50   # 50 dòng gần nhất
pm2 monit                          # Dashboard CPU/RAM
pm2 restart bcse-3d-lab           # Khởi động lại
pm2 stop bcse-3d-lab              # Dừng
```

### Kiểm tra sau khi deploy

```bash
# Health check
curl https://your-domain.com/api/health

# Xem log ứng dụng
cat /opt/3d-lab/data/logs/app.log | tail -20

# Xem log lỗi
cat /opt/3d-lab/data/logs/error.log | tail -20
```

### Backup thủ công

```bash
# Copy database
cp /opt/3d-lab/data/lab.db /backup/lab-$(date +%Y%m%d).db

# Hoặc dùng tính năng trong giao diện Admin → Backup
```

> Hệ thống tự động tạo backup 1 lần/ngày lúc 2AM, lưu tại `data/backups/lab-YYYY-MM-DD.db`.

---

## 11. Tài khoản demo

Sau khi cài đặt lần đầu, hệ thống tự seed các tài khoản:

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| **Admin** | `admin@vju.ac.vn` | `Admin@2024` |
| **Moderator** | `mod@vju.ac.vn` | `Mod@2024` |

> ⚠️ **Thay đổi mật khẩu ngay sau khi triển khai lên production!**

Để tạo tài khoản **Student**, dùng luồng đăng ký OTP với email `@st.vju.ac.vn` hoặc `@vju.ac.vn`.

---

## Ghi chú kỹ thuật

### Tại sao dùng SQLite thay vì PostgreSQL?

- Lab quy mô nhỏ (< 500 user, vài trăm job/tháng) không cần concurrent writes cao
- Không cần server database riêng → deploy đơn giản, không dependency ngoài
- WAL mode đủ hiệu năng cho workload này
- Backup chỉ cần copy 1 file `.db`

**Nên migrate sang PostgreSQL khi:**
- Nhiều lab dùng chung (multi-tenant)
- Concurrent users > 100 cùng lúc
- Cần full-text search phức tạp

### Tại sao PM2 dùng `instances: 1, exec_mode: 'fork'`?

`better-sqlite3` là synchronous và SQLite chỉ cho phép 1 writer tại một thời điểm. Cluster mode sẽ gây `SQLITE_BUSY` error. Fork mode với 1 instance là kiến trúc đúng.

### Server tự load `.env` không cần `dotenv` package

`server/index.ts` tự đọc file `.env` bằng `fs.readFileSync` ngay khi khởi động. Env vars từ OS process (PM2, Docker) luôn được ưu tiên — không bị overwrite.
