/// Template type enum
enum TemplateType {
  love,
  every,
  idol,
}

/// Page status enum
enum PageStatus {
  active,
  inactive,
}

/// Extension để convert enum to display string
extension TemplateTypeExtension on TemplateType {
  String get displayName {
    switch (this) {
      case TemplateType.love:
        return '❤️ Tình yêu';
      case TemplateType.every:
        return '📅 Hằng ngày';
      case TemplateType.idol:
        return '⭐ Thần tượng';
    }
  }

  String get value {
    switch (this) {
      case TemplateType.love:
        return 'LOVE';
      case TemplateType.every:
        return 'EVERY';
      case TemplateType.idol:
        return 'IDOL';
    }
  }
}

extension PageStatusExtension on PageStatus {
  String get displayName {
    switch (this) {
      case PageStatus.active:
        return 'Hoạt động';
      case PageStatus.inactive:
        return 'Tạm dừng';
    }
  }

  String get value {
    switch (this) {
      case PageStatus.active:
        return 'ACTIVE';
      case PageStatus.inactive:
        return 'INACTIVE';
    }
  }
}

/// Page model
class PageModel {
  final String id;
  final String username;
  final String? passcodeHash;
  final TemplateType templateType;
  final PageStatus status;
  final Map<String, dynamic>? themeConfig;
  final DateTime createdAt;
  final DateTime updatedAt;

  PageModel({
    required this.id,
    required this.username,
    this.passcodeHash,
    required this.templateType,
    required this.status,
    this.themeConfig,
    required this.createdAt,
    required this.updatedAt,
  });

  /// From JSON
  factory PageModel.fromJson(Map<String, dynamic> json) {
    return PageModel(
      id: json['id'] as String,
      username: json['username'] as String,
      passcodeHash: json['passcode_hash'] as String?,
      templateType: _parseTemplateType(json['template_type'] as String),
      status: _parseStatus(json['status'] as String),
      themeConfig: json['theme_config'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  /// To JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'passcode_hash': passcodeHash,
      'template_type': templateType.value,
      'status': status.value,
      'theme_config': themeConfig,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  /// Parse template type from string
  static TemplateType _parseTemplateType(String value) {
    switch (value.toUpperCase()) {
      case 'LOVE':
        return TemplateType.love;
      case 'EVERY':
        return TemplateType.every;
      case 'IDOL':
        return TemplateType.idol;
      default:
        return TemplateType.love;
    }
  }

  /// Parse status from string
  static PageStatus _parseStatus(String value) {
    switch (value.toUpperCase()) {
      case 'ACTIVE':
        return PageStatus.active;
      case 'INACTIVE':
        return PageStatus.inactive;
      default:
        return PageStatus.active;
    }
  }

  /// Copy with
  PageModel copyWith({
    String? id,
    String? username,
    String? passcodeHash,
    TemplateType? templateType,
    PageStatus? status,
    Map<String, dynamic>? themeConfig,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return PageModel(
      id: id ?? this.id,
      username: username ?? this.username,
      passcodeHash: passcodeHash ?? this.passcodeHash,
      templateType: templateType ?? this.templateType,
      status: status ?? this.status,
      themeConfig: themeConfig ?? this.themeConfig,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
