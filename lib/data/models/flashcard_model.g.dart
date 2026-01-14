// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'flashcard_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FlashcardModel _$FlashcardModelFromJson(Map<String, dynamic> json) =>
    FlashcardModel(
      id: json['id'] as String,
      linkId: json['linkId'] as String,
      level: FlashcardLevel.fromJson(json['level'] as String),
      question: json['question'] as String,
      isRevealed: json['isRevealed'] as bool? ?? false,
      order: (json['order'] as num).toInt(),
    );

Map<String, dynamic> _$FlashcardModelToJson(FlashcardModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'linkId': instance.linkId,
      'level': FlashcardModel._flashcardLevelToJson(instance.level),
      'question': instance.question,
      'isRevealed': instance.isRevealed,
      'order': instance.order,
    };
