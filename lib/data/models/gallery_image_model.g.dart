// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'gallery_image_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GalleryImageModel _$GalleryImageModelFromJson(Map<String, dynamic> json) =>
    GalleryImageModel(
      id: json['id'] as String,
      linkId: json['linkId'] as String,
      url: json['url'] as String,
      caption: json['caption'] as String?,
      order: (json['order'] as num).toInt(),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$GalleryImageModelToJson(GalleryImageModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'linkId': instance.linkId,
      'url': instance.url,
      'caption': instance.caption,
      'order': instance.order,
      'createdAt': instance.createdAt.toIso8601String(),
    };
