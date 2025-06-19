# 🍞 Custom Toastr Service - Hướng dẫn sử dụng

## Tổng quan

ToastService là service tùy chỉnh được xây dựng trên ngx-toastr với các tính năng:

- **Fixed position** - Thông báo cố định ở góc màn hình
- **Beautiful design** - Thiết kế đẹp với gradient và animation
- **Responsive** - Tự động điều chỉnh trên mobile
- **Specialized methods** - Các phương thức chuyên biệt cho từng loại thông báo

## Cài đặt và cấu hình

### 1. Import service

```typescript
import { ToastService } from "src/app/services/toast.service";
```

### 2. Inject vào constructor

```typescript
constructor(private toastService: ToastService) {}
```

## Các phương thức cơ bản

### Success Toast

```typescript
this.toastService.showSuccess("Dữ liệu đã được lưu thành công!", "Hoàn thành");
```

### Error Toast

```typescript
this.toastService.showError("Không thể kết nối đến server!", "Lỗi kết nối");
```

### Warning Toast

```typescript
this.toastService.showWarning("Vui lòng kiểm tra lại thông tin!", "Cảnh báo");
```

### Info Toast

```typescript
this.toastService.showInfo("Hệ thống sẽ bảo trì vào 2h sáng", "Thông báo");
```

## Các phương thức chuyên biệt

### Operation Success

```typescript
this.toastService.showOperationSuccess("Tạo tài khoản");
// Hiển thị: "Tạo tài khoản thành công!"
```

### Server Error

```typescript
this.toastService.showServerError(error);
// Tự động parse error message từ response
```

### Validation Error

```typescript
this.toastService.showValidationError("Email không đúng định dạng");
```

### Unauthorized

```typescript
this.toastService.showUnauthorized();
// Hiển thị: "Bạn không có quyền thực hiện thao tác này"
```

## Tính năng nâng cao

### Loading Toast

```typescript
const loadingToast = this.toastService.showLoading("Đang tải dữ liệu...");

// Sau khi hoàn thành
this.toastr.clear(loadingToast.toastId);
this.toastService.showSuccess("Tải dữ liệu thành công!");
```

### HTML Message

```typescript
this.toastService.showHtmlMessage("<strong>Chúc mừng!</strong><br/>Bạn đã đăng ký thành công.", "Đăng ký thành công", "success");
```

### Action Toast

```typescript
this.toastService.showActionToast("Bạn có muốn hoàn tác thao tác vừa rồi?", "Xác nhận", "Hoàn tác", () => {
  // Callback khi click button
  this.toastService.showInfo("Đã hoàn tác thành công!");
});
```

### Clear All Toasts

```typescript
this.toastService.clearAll();
```

## Ví dụ trong các component

### Login Component

```typescript
// Loading
const loadingToast = this.toastService.showLoading("Đang đăng nhập...");

this.authService.login(username, password).subscribe({
  next: (response) => {
    this.toastr.clear(loadingToast.toastId);
    this.toastService.showSuccess("Đăng nhập thành công!", "Thành công");
  },
  error: (error) => {
    this.toastr.clear(loadingToast.toastId);
    if (error.status === 401) {
      this.toastService.showError("Tài khoản hoặc mật khẩu không chính xác", "Đăng nhập thất bại");
    } else {
      this.toastService.showServerError(error);
    }
  },
});
```

### Form Validation

```typescript
if (this.form.invalid) {
  this.toastService.showValidationError("Vui lòng điền đầy đủ thông tin");
  return;
}
```

### CRUD Operations

```typescript
// Create
this.service.create(data).subscribe({
  next: () => this.toastService.showOperationSuccess("Tạo mới"),
  error: (error) => this.toastService.showServerError(error),
});

// Update
this.service.update(data).subscribe({
  next: () => this.toastService.showOperationSuccess("Cập nhật"),
  error: (error) => this.toastService.showServerError(error),
});

// Delete
this.service.delete(id).subscribe({
  next: () => this.toastService.showOperationSuccess("Xóa"),
  error: (error) => this.toastService.showServerError(error),
});
```

## Cấu hình CSS

### Vị trí hiển thị

- `toast-top-right` (mặc định)
- `toast-top-left`
- `toast-bottom-right`
- `toast-bottom-left`
- `toast-top-center`
- `toast-bottom-center`

### Tùy chỉnh thời gian

```typescript
// Trong ToastService, bạn có thể điều chỉnh:
timeOut: 4000,        // Success/Info: 4s
timeOut: 6000,        // Error: 6s
timeOut: 5000,        // Warning: 5s
```

## Demo Component

Để xem tất cả tính năng, truy cập: `/toast-demo`

## Lưu ý

- Service này được build trên ngx-toastr
- CSS đã được tối ưu cho responsive design
- Hỗ trợ dark theme tự động
- Fixed position đảm bảo toast luôn hiển thị ở vị trí cố định
- Animation mượt mà với slideInRight/slideOutRight
