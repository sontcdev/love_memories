/// Letter reply model
class LetterReplyModel {
  final String id;
  final String contentItemId;
  final String content;
  final DateTime createdAt;

  LetterReplyModel({
    required this.id,
    required this.contentItemId,
    required this.content,
    required this.createdAt,
  });

  factory LetterReplyModel.fromJson(Map<String, dynamic> json) {
    return LetterReplyModel(
      id: json['id'] as String,
      contentItemId: json['content_item_id'] as String,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content_item_id': contentItemId,
      'content': content,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
