## Kế hoạch thiết lập chức năng cơ bản cho User (Auth)

Mục tiêu cung cấp luồng xác thực người dùng đầy đủ ở phía frontend (Quasar/Vue), làm việc với backend theo các endpoint sau:

- POST `/api/auth/register` → đăng ký tài khoản mới
- POST `/api/auth/login` → đăng nhập
- GET `/api/auth/user-profile` → lấy thông tin user (cần token)
- POST `/api/auth/refresh` → làm mới token (cần token)
- POST `/api/auth/logout` → đăng xuất (cần token)

Tài liệu này mô tả: cấu trúc thư mục, cấu hình cần thiết, hợp đồng API dự kiến, vòng đời token, guard router, và checklist triển khai.

---

## 1) Kiến trúc tổng quan

- **Mô hình token**: JWT 2 tầng
  - Access Token: sống ngắn (5–15 phút), dùng cho mọi request cần xác thực.
  - Refresh Token: sống dài (7–30 ngày), chỉ dùng để lấy Access Token mới.
- **Lưu trữ đề xuất**:
  - Refresh Token: lưu trong HttpOnly Secure Cookie do backend set (khuyến nghị).
  - Access Token: lưu tạm trong bộ nhớ ứng dụng (Pinia store) và đồng bộ vào `localStorage` chỉ khi cần duy trì sau reload (tuỳ config).
- **Dòng chảy chính**:
  1. Đăng ký → Đăng nhập (hoặc auto-login tuỳ backend trả về) → điều hướng về trang trước đó hoặc trang chủ.
  2. Mọi request có `Authorization: Bearer <accessToken>`.
  3. Khi 401 và lý do là token hết hạn, tự động gọi `/api/auth/refresh`, cập nhật token, retry request ban đầu.
  4. Đăng xuất → xoá token (client), gọi `/api/auth/logout` để vô hiệu refresh token (server), điều hướng về trang public.

---

## 2) Cấu trúc thư mục (frontend)

Các mục đã có sẵn giữ nguyên; mục mới đánh dấu (new). Đường dẫn tính từ `src/`.

```
src/
  boot/
    axios.js            # Cấu hình Axios + interceptors (sẽ bổ sung logic token)
  config/
    api.js              # Base URL, timeout, headers mặc định
  stores/
    auth.js             # (new) Pinia store quản lý trạng thái auth & token
  composables/
    auth/
      useAuth.js        # (new) API hooks: login, register, refresh, logout, getProfile
  router/
    index.js            # Bổ sung guard cho route cần đăng nhập
    guards/
      auth.js           # (new) beforeEach guard kiểm tra `meta.requiresAuth`
  pages/
    SiteLoginPage.vue   # (new) Trang đăng nhập
    SiteRegisterPage.vue# (new) Trang đăng ký
    SiteProfilePage.vue # (new) Trang hồ sơ người dùng (bảo vệ bởi auth)
  utils/
    auth.js             # (new) Helper xử lý lưu/đọc token, header, key storage
  i18n/
    ...                 # (tùy chọn) thêm message cho Auth
```

Tuỳ dự án, có thể thay `pages/*` bằng modal/slide-over nếu UX yêu cầu.

---

## 3) Cấu hình & cài đặt cần thiết

- **Biến môi trường** (Vite/Quasar):
  - `VITE_API_BASE_URL` (ví dụ: `https://api.example.com` hoặc `http://localhost:3000`)
- **Axios boot (`src/boot/axios.js`)**:
  - Thiết lập `baseURL` từ `VITE_API_BASE_URL`.
  - Request interceptor: thêm `Authorization: Bearer <accessToken>` nếu có.
  - Response interceptor: nếu nhận 401 và chưa refresh trong cùng chu kỳ, gọi `/api/auth/refresh`, cập nhật token, rồi retry request.
  - Ngăn vòng lặp vô hạn refresh (dùng cờ `isRefreshing` + hàng đợi subscriber).
- **Pinia store (`src/stores/auth.js`)**:
  - Trạng thái: `accessToken`, `user`, `isAuthenticated`, `tokenExpiresAt`.
  - Actions: `login`, `register`, `loadProfile`, `refreshToken`, `logout`, `hydrateFromStorage`.
  - Persist: cân nhắc chỉ lưu `accessToken` (hoặc không lưu) tuỳ yêu cầu bảo mật.
- **Router guard (`src/router/guards/auth.js`)**:
  - Kiểm tra `to.meta.requiresAuth`; nếu chưa có `accessToken`, thử `hydrateFromStorage` hoặc `/refresh` 1 lần trước khi chuyển hướng đến `/login?redirect=...`.
- **Utils (`src/utils/auth.js`)**:
  - Key lưu token: `ACCESS_TOKEN_KEY = 'fa_access_token'`.
  - Hàm `getAccessToken`, `setAccessToken`, `clearAccessToken`, `getAuthHeader`.

---

## 4) Hợp đồng API (dự kiến)

Chuẩn hoá response để frontend xử lý nhất quán. Ví dụ dạng envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Trường hợp lỗi:

```json
{
  "success": false,
  "data": null,
  "error": { "code": "VALIDATION_ERROR", "message": "Email đã tồn tại" }
}
```

### 4.1 POST /api/auth/register

- Headers: `Content-Type: application/json`
- Body:

```json
{
  "email": "user@example.com",
  "password": "string(min 8)",
  "name": "Optional display name"
}
```

- 201 Created:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User",
    "createdAt": "2025-10-07T00:00:00Z"
  },
  "error": null
}
```

- 400/409 khi trùng email hoặc dữ liệu không hợp lệ.

### 4.2 POST /api/auth/login

- Headers: `Content-Type: application/json`
- Body:

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

- 200 OK (tuỳ chọn set-cookie HttpOnly refresh token):

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 900,
    "user": { "id": "uuid", "email": "user@example.com", "name": "User" }
  },
  "error": null
}
```

- 401 khi sai thông tin.

### 4.3 GET /api/auth/user-profile (cần token)

- Headers: `Authorization: Bearer <accessToken>`
- 200 OK:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User",
    "roles": ["user"],
    "avatarUrl": null
  },
  "error": null
}
```

- 401 nếu không có/không hợp lệ.

### 4.4 POST /api/auth/refresh (cần token)

- Trường hợp refresh token lưu ở cookie HttpOnly: không cần gửi body/headers đặc biệt, chỉ cần cookie.
- 200 OK:

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 900
  },
  "error": null
}
```

- 401 nếu refresh token không hợp lệ/hết hạn.

### 4.5 POST /api/auth/logout (cần token)

- Mục đích: vô hiệu refresh token phía server và xóa cookie.
- 204 No Content hoặc 200 với envelope rỗng.

---

## 5) Vòng đời token & Axios interceptor (pseudo)

```js
// Pseudo-code
let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

axiosInstance.interceptors.request.use((config) => {
  const token = authStore.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const { accessToken } = await authStore.refreshToken()
          onRefreshed(accessToken)
        } finally {
          isRefreshing = false
        }
      }
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(axiosInstance(originalRequest))
        })
      })
    }
    return Promise.reject(error)
  },
)
```

---

## 6) Guard router (beforeEach)

- Với mọi route có `meta.requiresAuth = true`:
  1. Nếu đã có `accessToken`: cho qua.
  2. Nếu chưa: thử `hydrateFromStorage()`; nếu vẫn chưa, thử gọi `/refresh` 1 lần.
  3. Nếu vẫn thất bại: chuyển hướng đến `/login?redirect=<path gốc>`.

---

## 7) Luồng UI/UX tối thiểu

- **Đăng ký**: form `email`, `password`, `name` → gọi `/register` → thông báo thành công → tự động đăng nhập hoặc điều hướng đến `/login`.
- **Đăng nhập**: form `email`, `password` → `/login` → lưu `accessToken` và `user` → điều hướng đến `redirect` (nếu có) hoặc trang chủ.
- **Hồ sơ**: load `/user-profile` khi vào `SiteProfilePage.vue`; nếu 401 thì luồng refresh xử lý tự động.
- **Đăng xuất**: gọi `/logout` (best-effort), xoá token phía client, chuyển về trang chủ.

---

## 8) Bảo mật & thực hành tốt

- Ưu tiên lưu Refresh Token trong HttpOnly Secure Cookie, không để lộ cho JS.
- Hạn chế lưu Access Token trong `localStorage`; nếu cần, đặt thời hạn ngắn và xoá khi tab đóng (có thể dùng `sessionStorage`).
- Chống CSRF bằng SameSite Cookie và/hoặc CSRF token cho các endpoint nhạy cảm.
- Tránh log token ra console.

---

## 9) Tích hợp mock API (tuỳ chọn cho dev)

- Thư mục `mock-api/db.json` hiện có thể dùng với `json-server`. Tuy nhiên, auth với refresh token thường cần logic tùy biến; cân nhắc tạo mock đơn giản hoặc dùng một service mock khác.
- Có thể cấu hình proxy dev để gọi `http://localhost:<mock-port>/api` qua `quasar.config.js` nếu cần.

---

## 10) Checklist triển khai

1. Thiết lập `VITE_API_BASE_URL` và kiểm tra `src/config/api.js`.
2. Bổ sung interceptor tại `src/boot/axios.js` theo pseudo ở trên.
3. Tạo `src/stores/auth.js` với state/actions: login, register, refresh, loadProfile, logout.
4. Tạo `src/composables/auth/useAuth.js` wrap các lời gọi API.
5. Tạo guard `src/router/guards/auth.js` và dùng trong `router/index.js`.
6. Tạo trang `SiteLoginPage.vue`, `SiteRegisterPage.vue`, `SiteProfilePage.vue` và cập nhật `src/router/routes.js`.
7. Hiển thị avatar/tên và nút Login/Logout trên `site-header` theo `isAuthenticated`.
8. Kiểm thử các case: đăng nhập sai, token hết hạn, refresh thất bại, logout.

---

## 11) Ví dụ hợp đồng API tối thiểu (tóm tắt)

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/user-profile     Authorization: Bearer <accessToken>
POST /api/auth/refresh          (Cookie HttpOnly chứa refresh token)
POST /api/auth/logout           Authorization: Bearer <accessToken>
```

Mọi response dùng envelope `{ success, data, error }`. Access Token trả về từ login/refresh, Refresh Token quản lý bởi server (cookie).
