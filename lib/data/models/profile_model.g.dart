// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProfileModel _$ProfileModelFromJson(Map<String, dynamic> json) => ProfileModel(
      id: json['id'] as String,
      linkId: json['linkId'] as String,
      name1: json['name1'] as String,
      name2: json['name2'] as String,
      birthDate1: json['birthDate1'] == null
          ? null
          : DateTime.parse(json['birthDate1'] as String),
      birthDate2: json['birthDate2'] == null
          ? null
          : DateTime.parse(json['birthDate2'] as String),
      avatarUrl1: json['avatarUrl1'] as String?,
      avatarUrl2: json['avatarUrl2'] as String?,
      coupleImageUrl: json['coupleImageUrl'] as String?,
      anniversaryDate: json['anniversaryDate'] == null
          ? null
          : DateTime.parse(json['anniversaryDate'] as String),
      shortNote: json['shortNote'] as String?,
      dayCountTitle: json['dayCountTitle'] as String?,
      isCountUp: json['isCountUp'] as bool? ?? true,
    );

Map<String, dynamic> _$ProfileModelToJson(ProfileModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'linkId': instance.linkId,
      'name1': instance.name1,
      'name2': instance.name2,
      'birthDate1': instance.birthDate1?.toIso8601String(),
      'birthDate2': instance.birthDate2?.toIso8601String(),
      'avatarUrl1': instance.avatarUrl1,
      'avatarUrl2': instance.avatarUrl2,
      'coupleImageUrl': instance.coupleImageUrl,
      'anniversaryDate': instance.anniversaryDate?.toIso8601String(),
      'shortNote': instance.shortNote,
      'dayCountTitle': instance.dayCountTitle,
      'isCountUp': instance.isCountUp,
    };
