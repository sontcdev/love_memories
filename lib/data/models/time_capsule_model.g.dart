// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'time_capsule_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

TimeCapsuleModel _$TimeCapsuleModelFromJson(Map<String, dynamic> json) =>
    TimeCapsuleModel(
      id: json['id'] as String,
      linkId: json['linkId'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      openDate: DateTime.parse(json['openDate'] as String),
      youtubeUrl: json['youtubeUrl'] as String?,
      audioUrl: json['audioUrl'] as String?,
      response: json['response'] as String?,
      isOpened: json['isOpened'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$TimeCapsuleModelToJson(TimeCapsuleModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'linkId': instance.linkId,
      'title': instance.title,
      'content': instance.content,
      'openDate': instance.openDate.toIso8601String(),
      'youtubeUrl': instance.youtubeUrl,
      'audioUrl': instance.audioUrl,
      'response': instance.response,
      'isOpened': instance.isOpened,
      'createdAt': instance.createdAt.toIso8601String(),
    };
