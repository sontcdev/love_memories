/// Content type enum
enum ContentType {
  gallery,
  timeline,
  letter,
}

extension ContentTypeExtension on ContentType {
  String get value {
    switch (this) {
      case ContentType.gallery:
        return 'GALLERY';
      case ContentType.timeline:
        return 'TIMELINE';
      case ContentType.letter:
        return 'LETTER';
    }
  }
}

/// Content item model
class ContentItemModel {
  final String id;
  final String pageId;
  final ContentType contentType;
  final String? imageUrl;
  final String? title;
  final String? content;
  final String? videoUrl;
  final DateTime? dateEvent;
  final int sortOrder;
  final DateTime createdAt;
  final DateTime updatedAt;

  ContentItemModel({
    required this.id,
    required this.pageId,
    required this.contentType,
    this.imageUrl,
    this.title,
    this.content,
    this.videoUrl,
    this.dateEvent,
    required this.sortOrder,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ContentItemModel.fromJson(Map<String, dynamic> json) {
    return ContentItemModel(
      id: json['id'] as String,
      pageId: json['page_id'] as String,
      contentType: _parseContentType(json['content_type'] as String?),
      imageUrl: json['image_url'] as String?,
      title: json['title'] as String?,
      content: json['content'] as String?,
      videoUrl: json['video_url'] as String?,
      dateEvent: json['date_event'] != null
          ? DateTime.parse(json['date_event'] as String)
          : null,
      sortOrder: json['sort_order'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'page_id': pageId,
      'content_type': contentType.value,
      'image_url': imageUrl,
      'title': title,
      'content': content,
      'video_url': videoUrl,
      'date_event': dateEvent?.toIso8601String(),
      'sort_order': sortOrder,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  static ContentType _parseContentType(String? value) {
    switch (value?.toUpperCase()) {
      case 'GALLERY':
        return ContentType.gallery;
      case 'TIMELINE':
        return ContentType.timeline;
      case 'LETTER':
        return ContentType.letter;
      default:
        return ContentType.gallery;
    }
  }
}
