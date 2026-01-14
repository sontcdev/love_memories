import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'timeline_event_model.g.dart';

/// Timeline event data model
@JsonSerializable()
class TimelineEventModel extends Equatable {
  /// Event ID
  final String id;

  /// Reference to UserLink
  final String linkId;

  /// Event date (required)
  final DateTime date;

  /// Event title (max 50 characters, required)
  final String title;

  /// Description (max 100 characters)
  final String? description;

  /// Event image URL
  final String? imageUrl;

  /// Audio URL (max 1 minute)
  final String? audioUrl;

  /// Creation timestamp
  final DateTime createdAt;

  const TimelineEventModel({
    required this.id,
    required this.linkId,
    required this.date,
    required this.title,
    this.description,
    this.imageUrl,
    this.audioUrl,
    required this.createdAt,
  });

  /// Create from JSON
  factory TimelineEventModel.fromJson(Map<String, dynamic> json) =>
      _$TimelineEventModelFromJson(json);

  /// Convert to JSON
  Map<String, dynamic> toJson() => _$TimelineEventModelToJson(this);

  /// Copy with method
  TimelineEventModel copyWith({
    String? id,
    String? linkId,
    DateTime? date,
    String? title,
    String? description,
    String? imageUrl,
    String? audioUrl,
    DateTime? createdAt,
  }) {
    return TimelineEventModel(
      id: id ?? this.id,
      linkId: linkId ?? this.linkId,
      date: date ?? this.date,
      title: title ?? this.title,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      audioUrl: audioUrl ?? this.audioUrl,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        linkId,
        date,
        title,
        description,
        imageUrl,
        audioUrl,
        createdAt,
      ];
}
