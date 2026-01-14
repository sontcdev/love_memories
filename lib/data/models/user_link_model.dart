import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import 'enums.dart';

part 'user_link_model.g.dart';

/// UserLink data model
@JsonSerializable()
class UserLinkModel extends Equatable {
  /// Unique identifier
  final String id;

  /// Unique username
  final String username;

  /// Template type (LOVE/EVERY/IDOL)
  @JsonKey(
    fromJson: TemplateType.fromJson,
    toJson: _templateTypeToJson,
  )
  final TemplateType templateType;

  /// Guest access password (nullable)
  final String? accessPassword;

  /// 6-digit owner PIN
  final String adminPin;

  /// Creation timestamp
  final DateTime createdAt;

  /// Last update timestamp
  final DateTime updatedAt;

  /// Soft delete flag
  final bool isDeleted;

  /// Soft delete timestamp
  final DateTime? deletedAt;

  const UserLinkModel({
    required this.id,
    required this.username,
    required this.templateType,
    this.accessPassword,
    required this.adminPin,
    required this.createdAt,
    required this.updatedAt,
    this.isDeleted = false,
    this.deletedAt,
  });

  /// Create from JSON
  factory UserLinkModel.fromJson(Map<String, dynamic> json) =>
      _$UserLinkModelFromJson(json);

  /// Convert to JSON
  Map<String, dynamic> toJson() => _$UserLinkModelToJson(this);

  /// Helper for JSON serialization
  static String _templateTypeToJson(TemplateType type) => type.toJson();

  /// Copy with method
  UserLinkModel copyWith({
    String? id,
    String? username,
    TemplateType? templateType,
    String? accessPassword,
    String? adminPin,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isDeleted,
    DateTime? deletedAt,
  }) {
    return UserLinkModel(
      id: id ?? this.id,
      username: username ?? this.username,
      templateType: templateType ?? this.templateType,
      accessPassword: accessPassword ?? this.accessPassword,
      adminPin: adminPin ?? this.adminPin,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isDeleted: isDeleted ?? this.isDeleted,
      deletedAt: deletedAt ?? this.deletedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        username,
        templateType,
        accessPassword,
        adminPin,
        createdAt,
        updatedAt,
        isDeleted,
        deletedAt,
      ];
}
