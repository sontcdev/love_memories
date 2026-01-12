/// Level enum for game cards
enum Level {
  easy,
  medium,
  hard,
}

extension LevelExtension on Level {
  String get value {
    switch (this) {
      case Level.easy:
        return 'EASY';
      case Level.medium:
        return 'MEDIUM';
      case Level.hard:
        return 'HARD';
    }
  }

  String get displayName {
    switch (this) {
      case Level.easy:
        return 'Dễ';
      case Level.medium:
        return 'Trung bình';
      case Level.hard:
        return 'Khó';
    }
  }
}

/// Game card model
class GameCardModel {
  final String id;
  final String content;
  final Level level;
  final DateTime createdAt;
  final DateTime updatedAt;

  GameCardModel({
    required this.id,
    required this.content,
    required this.level,
    required this.createdAt,
    required this.updatedAt,
  });

  factory GameCardModel.fromJson(Map<String, dynamic> json) {
    return GameCardModel(
      id: json['id'] as String,
      content: json['content'] as String,
      level: _parseLevel(json['level'] as String?),
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'level': level.value,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  static Level _parseLevel(String? value) {
    switch (value?.toUpperCase()) {
      case 'EASY':
        return Level.easy;
      case 'MEDIUM':
        return Level.medium;
      case 'HARD':
        return Level.hard;
      default:
        return Level.easy;
    }
  }
}
