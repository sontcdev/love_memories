import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'time_capsule_model.g.dart';

/// Time capsule data model
@JsonSerializable()
class TimeCapsuleModel extends Equatable {
  /// Capsule ID
  final String id;

  /// Reference to UserLink
  final String linkId;

  /// Title (max 50 characters)
  final String title;

  /// Content (max 1000 characters)
  final String content;

  /// Scheduled open date
  final DateTime openDate;

  /// YouTube video URL
  final String? youtubeUrl;

  /// Audio URL
  final String? audioUrl;

  /// Response text (max 300 characters)
  final String? response;

  /// Whether the capsule has been opened
  final bool isOpened;

  /// Creation timestamp
  final DateTime createdAt;

  const TimeCapsuleModel({
    required this.id,
    required this.linkId,
    required this.title,
    required this.content,
    required this.openDate,
    this.youtubeUrl,
    this.audioUrl,
    this.response,
    this.isOpened = false,
    required this.createdAt,
  });

  /// Create from JSON
  factory TimeCapsuleModel.fromJson(Map<String, dynamic> json) =>
      _$TimeCapsuleModelFromJson(json);

  /// Convert to JSON
  Map<String, dynamic> toJson() => _$TimeCapsuleModelToJson(this);

  /// Copy with method
  TimeCapsuleModel copyWith({
    String? id,
    String? linkId,
    String? title,
    String? content,
    DateTime? openDate,
    String? youtubeUrl,
    String? audioUrl,
    String? response,
    bool? isOpened,
    DateTime? createdAt,
  }) {
    return TimeCapsuleModel(
      id: id ?? this.id,
      linkId: linkId ?? this.linkId,
      title: title ?? this.title,
      content: content ?? this.content,
      openDate: openDate ?? this.openDate,
      youtubeUrl: youtubeUrl ?? this.youtubeUrl,
      audioUrl: audioUrl ?? this.audioUrl,
      response: response ?? this.response,
      isOpened: isOpened ?? this.isOpened,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        linkId,
        title,
        content,
        openDate,
        youtubeUrl,
        audioUrl,
        response,
        isOpened,
        createdAt,
      ];
}
