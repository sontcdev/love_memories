import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import 'enums.dart';

part 'flashcard_model.g.dart';

/// Flashcard data model for game
@JsonSerializable()
class FlashcardModel extends Equatable {
  /// Flashcard ID
  final String id;

  /// Reference to UserLink
  final String linkId;

  /// Difficulty level
  @JsonKey(
    fromJson: FlashcardLevel.fromJson,
    toJson: _flashcardLevelToJson,
  )
  final FlashcardLevel level;

  /// Question text
  final String question;

  /// Whether the card has been revealed
  final bool isRevealed;

  /// Display order
  final int order;

  const FlashcardModel({
    required this.id,
    required this.linkId,
    required this.level,
    required this.question,
    this.isRevealed = false,
    required this.order,
  });

  /// Create from JSON
  factory FlashcardModel.fromJson(Map<String, dynamic> json) =>
      _$FlashcardModelFromJson(json);

  /// Convert to JSON
  Map<String, dynamic> toJson() => _$FlashcardModelToJson(this);

  /// Helper for JSON serialization
  static String _flashcardLevelToJson(FlashcardLevel level) => level.toJson();

  /// Copy with method
  FlashcardModel copyWith({
    String? id,
    String? linkId,
    FlashcardLevel? level,
    String? question,
    bool? isRevealed,
    int? order,
  }) {
    return FlashcardModel(
      id: id ?? this.id,
      linkId: linkId ?? this.linkId,
      level: level ?? this.level,
      question: question ?? this.question,
      isRevealed: isRevealed ?? this.isRevealed,
      order: order ?? this.order,
    );
  }

  @override
  List<Object?> get props => [
        id,
        linkId,
        level,
        question,
        isRevealed,
        order,
      ];
}
