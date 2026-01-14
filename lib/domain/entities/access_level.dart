/// Access level for authenticated users
enum AccessLevel {
  /// Guest access - view only (password protected)
  GUEST,
  
  /// Owner access - edit mode (PIN protected)
  OWNER,
  
  /// Admin access - full admin panel (login required)
  ADMIN;

  /// Get display name in Vietnamese
  String get displayName {
    switch (this) {
      case AccessLevel.GUEST:
        return 'Khách';
      case AccessLevel.OWNER:
        return 'Chủ sở hữu';
      case AccessLevel.ADMIN:
        return 'Quản trị viên';
    }
  }
}
