import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'profile_model.g.dart';

/// Profile data model (LOVE template)
@JsonSerializable()
class ProfileModel extends Equatable {
  /// Profile ID
  final String id;

  /// Reference to UserLink
  final String linkId;

  /// First person's name
  final String name1;

  /// Second person's name
  final String name2;

  /// First person's birth date
  final DateTime? birthDate1;

  /// Second person's birth date
  final DateTime? birthDate2;

  /// First person's avatar URL
  final String? avatarUrl1;

  /// Second person's avatar URL
  final String? avatarUrl2;

  /// Couple photo URL
  final String? coupleImageUrl;

  /// Anniversary date
  final DateTime? anniversaryDate;

  /// Short note (max 50 characters)
  final String? shortNote;

  /// Day counter title (max 50 characters)
  final String? dayCountTitle;

  /// Count up (true) or count down (false)
  final bool isCountUp;

  const ProfileModel({
    required this.id,
    required this.linkId,
    required this.name1,
    required this.name2,
    this.birthDate1,
    this.birthDate2,
    this.avatarUrl1,
    this.avatarUrl2,
    this.coupleImageUrl,
    this.anniversaryDate,
    this.shortNote,
    this.dayCountTitle,
    this.isCountUp = true,
  });

  /// Create from JSON
  factory ProfileModel.fromJson(Map<String, dynamic> json) =>
      _$ProfileModelFromJson(json);

  /// Convert to JSON
  Map<String, dynamic> toJson() => _$ProfileModelToJson(this);

  /// Copy with method
  ProfileModel copyWith({
    String? id,
    String? linkId,
    String? name1,
    String? name2,
    DateTime? birthDate1,
    DateTime? birthDate2,
    String? avatarUrl1,
    String? avatarUrl2,
    String? coupleImageUrl,
    DateTime? anniversaryDate,
    String? shortNote,
    String? dayCountTitle,
    bool? isCountUp,
  }) {
    return ProfileModel(
      id: id ?? this.id,
      linkId: linkId ?? this.linkId,
      name1: name1 ?? this.name1,
      name2: name2 ?? this.name2,
      birthDate1: birthDate1 ?? this.birthDate1,
      birthDate2: birthDate2 ?? this.birthDate2,
      avatarUrl1: avatarUrl1 ?? this.avatarUrl1,
      avatarUrl2: avatarUrl2 ?? this.avatarUrl2,
      coupleImageUrl: coupleImageUrl ?? this.coupleImageUrl,
      anniversaryDate: anniversaryDate ?? this.anniversaryDate,
      shortNote: shortNote ?? this.shortNote,
      dayCountTitle: dayCountTitle ?? this.dayCountTitle,
      isCountUp: isCountUp ?? this.isCountUp,
    );
  }

  @override
  List<Object?> get props => [
        id,
        linkId,
        name1,
        name2,
        birthDate1,
        birthDate2,
        avatarUrl1,
        avatarUrl2,
        coupleImageUrl,
        anniversaryDate,
        shortNote,
        dayCountTitle,
        isCountUp,
      ];
}
