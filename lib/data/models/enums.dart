/// Enum types for data models
library;

/// Template type for UserLink
enum TemplateType {
  LOVE,
  EVERY,
  IDOL;

  /// Convert to string for JSON
  String toJson() => name;

  /// Create from string
  static TemplateType fromJson(String json) {
    return TemplateType.values.firstWhere(
      (e) => e.name == json,
      orElse: () => TemplateType.LOVE,
    );
  }
}

/// Flashcard difficulty level
enum FlashcardLevel {
  EASY('Dễ'),
  MEDIUM('Trung bình'),
  HARD('Khó');

  final String label;
  const FlashcardLevel(this.label);

  /// Convert to string for JSON
  String toJson() => name;

  /// Create from string
  static FlashcardLevel fromJson(String json) {
    return FlashcardLevel.values.firstWhere(
      (e) => e.name == json,
      orElse: () => FlashcardLevel.EASY,
    );
  }
}
