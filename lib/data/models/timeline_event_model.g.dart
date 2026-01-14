// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'timeline_event_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

TimelineEventModel _$TimelineEventModelFromJson(Map<String, dynamic> json) =>
    TimelineEventModel(
      id: json['id'] as String,
      linkId: json['linkId'] as String,
      date: DateTime.parse(json['date'] as String),
      title: json['title'] as String,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      audioUrl: json['audioUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$TimelineEventModelToJson(TimelineEventModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'linkId': instance.linkId,
      'date': instance.date.toIso8601String(),
      'title': instance.title,
      'description': instance.description,
      'imageUrl': instance.imageUrl,
      'audioUrl': instance.audioUrl,
      'createdAt': instance.createdAt.toIso8601String(),
    };
