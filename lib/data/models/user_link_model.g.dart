// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_link_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserLinkModel _$UserLinkModelFromJson(Map<String, dynamic> json) =>
    UserLinkModel(
      id: json['id'] as String,
      username: json['username'] as String,
      templateType: TemplateType.fromJson(json['templateType'] as String),
      accessPassword: json['accessPassword'] as String?,
      adminPin: json['adminPin'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      isDeleted: json['isDeleted'] as bool? ?? false,
      deletedAt: json['deletedAt'] == null
          ? null
          : DateTime.parse(json['deletedAt'] as String),
    );

Map<String, dynamic> _$UserLinkModelToJson(UserLinkModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'username': instance.username,
      'templateType': UserLinkModel._templateTypeToJson(instance.templateType),
      'accessPassword': instance.accessPassword,
      'adminPin': instance.adminPin,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'isDeleted': instance.isDeleted,
      'deletedAt': instance.deletedAt?.toIso8601String(),
    };
