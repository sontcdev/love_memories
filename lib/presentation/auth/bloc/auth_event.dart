import 'package:equatable/equatable.dart';

/// Base class for AuthBloc events
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

/// Guest login with password
class GuestLoginRequested extends AuthEvent {
  final String username;
  final String password;

  const GuestLoginRequested({
    required this.username,
    required this.password,
  });

  @override
  List<Object?> get props => [username, password];
}

/// Owner login with PIN (edit mode)
class OwnerLoginRequested extends AuthEvent {
  final String username;
  final String pin;

  const OwnerLoginRequested({
    required this.username,
    required this.pin,
  });

  @override
  List<Object?> get props => [username, pin];
}

/// Admin login with credentials
class AdminLoginRequested extends AuthEvent {
  final String username;
  final String password;

  const AdminLoginRequested({
    required this.username,
    required this.password,
  });

  @override
  List<Object?> get props => [username, password];
}

/// Check authentication status
class CheckAuthStatus extends AuthEvent {
  const CheckAuthStatus();
}

/// Logout
class LogoutRequested extends AuthEvent {
  const LogoutRequested();
}
