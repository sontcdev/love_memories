import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'gallery_image_model.g.dart';

/// Gallery image data model
@JsonSerializable()
class GalleryImageModel extends Equatable {
  /// Image ID
  final String id;

  /// Reference to UserLink
  final String linkId;

  /// Image URL
  final String url;

  /// Caption (max 50 characters)
  final String? caption;

  /// Display order for sorting
  final int order;

  /// Upload timestamp
  final DateTime createdAt;

  const GalleryImageModel({
    required this.id,
    required this.linkId,
    required this.url,
    this.caption,
    required this.order,
    required this.createdAt,
  });

  /// Create from JSON
  factory GalleryImageModel.fromJson(Map<String, dynamic> json) =>
      _$GalleryImageModelFromJson(json);

  /// Convert to JSON
  Map<String, dynamic> toJson() => _$GalleryImageModelToJson(this);

  /// Copy with method
  GalleryImageModel copyWith({
    String? id,
    String? linkId,
    String? url,
    String? caption,
    int? order,
    DateTime? createdAt,
  }) {
    return GalleryImageModel(
      id: id ?? this.id,
      linkId: linkId ?? this.linkId,
      url: url ?? this.url,
      caption: caption ?? this.caption,
      order: order ?? this.order,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        linkId,
        url,
        caption,
        order,
        createdAt,
      ];
}
