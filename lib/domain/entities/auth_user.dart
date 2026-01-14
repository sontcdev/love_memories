import 'package:equatable/equatable.dart';
import 'access_level.dart';

/// Authenticated user entity
class AuthUser extends Equatable {
  /// User identifier
  final String id;

  /// Username
  final String username;

  /// Access level (Guest, Owner, Admin)
  final AccessLevel accessLevel;

  /// Authentication token (for Admin only)
  final String? token;

  const AuthUser({
    required this.id,
    required this.username,
    required this.accessLevel,
    this.token,
  });

  /// Check if user has edit permissions
  bool get canEdit => accessLevel == AccessLevel.OWNER || accessLevel == AccessLevel.ADMIN;

  /// Check if user has admin permissions
  bool get isAdmin => accessLevel == AccessLevel.ADMIN;

  /// Check if user is guest
  bool get isGuest => accessLevel == AccessLevel.GUEST;

  @override
  List<Object?> get props => [id, username, accessLevel, token];
}
