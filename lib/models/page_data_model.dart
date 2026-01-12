/// Mode count enum
enum ModeCount {
  up,
  down,
  none,
}

extension ModeCountExtension on ModeCount {
  String get value {
    switch (this) {
      case ModeCount.up:
        return 'UP';
      case ModeCount.down:
        return 'DOWN';
      case ModeCount.none:
        return 'NONE';
    }
  }

  String get displayName {
    switch (this) {
      case ModeCount.up:
        return '📈 Đếm xuôi';
      case ModeCount.down:
        return '📉 Đếm ngược';
      case ModeCount.none:
        return '⏸️ Không đếm';
    }
  }
}

/// Participant model
class Participant {
  final String name;
  final int age;
  final String role;
  final String? avatarUrl;

  Participant({
    required this.name,
    required this.age,
    required this.role,
    this.avatarUrl,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'age': age,
      'role': role,
      'avatar_url': avatarUrl,
    };
  }

  factory Participant.fromJson(Map<String, dynamic> json) {
    return Participant(
      name: json['name'] as String,
      age: json['age'] as int,
      role: json['role'] as String,
      avatarUrl: json['avatar_url'] as String?,
    );
  }
}

/// Page data model
class PageDataModel {
  final String id;
  final String pageId;
  final ModeCount modeCount;
  final List<Participant> participants;
  final String? titleText;
  final String? mainImageUrl;
  final String? musicUrl;
  final bool isMusicAutoplay;
  final DateTime createdAt;
  final DateTime updatedAt;

  PageDataModel({
    required this.id,
    required this.pageId,
    required this.modeCount,
    required this.participants,
    this.titleText,
    this.mainImageUrl,
    this.musicUrl,
    this.isMusicAutoplay = false,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PageDataModel.fromJson(Map<String, dynamic> json) {
    return PageDataModel(
      id: json['id'] as String,
      pageId: json['page_id'] as String,
      modeCount: _parseModeCount(json['mode_count'] as String?),
      participants: (json['participants'] as List<dynamic>?)
              ?.map((p) => Participant.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
      titleText: json['title_text'] as String?,
      mainImageUrl: json['main_image_url'] as String?,
      musicUrl: json['music_url'] as String?,
      isMusicAutoplay: json['is_music_autoplay'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'page_id': pageId,
      'mode_count': modeCount.value,
      'participants': participants.map((p) => p.toJson()).toList(),
      'title_text': titleText,
      'main_image_url': mainImageUrl,
      'music_url': musicUrl,
      'is_music_autoplay': isMusicAutoplay,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  static ModeCount _parseModeCount(String? value) {
    switch (value?.toUpperCase()) {
      case 'UP':
        return ModeCount.up;
      case 'DOWN':
        return ModeCount.down;
      case 'NONE':
        return ModeCount.none;
      default:
        return ModeCount.up;
    }
  }
}
