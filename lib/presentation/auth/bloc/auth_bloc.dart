import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/constants/storage_keys.dart';
import '../../../core/error/failures.dart';
import '../../../data/datasources/remote/user_link_remote_datasource.dart';
import '../../../domain/entities/access_level.dart';
import '../../../domain/entities/auth_user.dart';
import 'auth_event.dart';
import 'auth_state.dart';

/// AuthBloc handles 3 access levels: Guest, Owner, Admin
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final UserLinkRemoteDataSource _userLinkDataSource;
  final FlutterSecureStorage _secureStorage;

  AuthBloc({
    UserLinkRemoteDataSource? userLinkDataSource,
    FlutterSecureStorage? secureStorage,
  })  : _userLinkDataSource = userLinkDataSource ?? UserLinkRemoteDataSource(),
        _secureStorage = secureStorage ?? const FlutterSecureStorage(),
        super(const AuthInitial()) {
    on<GuestLoginRequested>(_onGuestLoginRequested);
    on<OwnerLoginRequested>(_onOwnerLoginRequested);
    on<AdminLoginRequested>(_onAdminLoginRequested);
    on<CheckAuthStatus>(_onCheckAuthStatus);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onGuestLoginRequested(
    GuestLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      // Verify guest password
      final isValid = await _userLinkDataSource.verifyAccessPassword(
        event.username,
        event.password,
      );

      if (isValid) {
        // Create auth user with Guest access level
        final user = AuthUser(
          id: event.username, // Use username as ID for guest
          username: event.username,
          accessLevel: AccessLevel.GUEST,
        );

        // Save to secure storage
        await _saveAuthUser(user);

        emit(Authenticated(user));
      } else {
        emit(const AuthError('Mật khẩu không đúng'));
      }
    } on UnauthorizedException {
      emit(const AuthError('Mật khẩu không đúng'));
    } on NotFoundException {
      emit(const AuthError('Không tìm thấy tài khoản'));
    } catch (e) {
      emit(AuthError('Đã xảy ra lỗi: ${e.toString()}'));
    }
  }

  Future<void> _onOwnerLoginRequested(
    OwnerLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    // Validate PIN format (must be 6 digits)
    if (event.pin.length != 6 || !RegExp(r'^\d{6}$').hasMatch(event.pin)) {
      emit(const AuthError('PIN phải có đúng 6 chữ số'));
      return;
    }

    try {
      // Verify owner PIN
      final isValid = await _userLinkDataSource.verifyAdminPin(
        event.username,
        event.pin,
      );

      if (isValid) {
        // Create auth user with Owner access level
        final user = AuthUser(
          id: event.username,
          username: event.username,
          accessLevel: AccessLevel.OWNER,
        );

        // Save to secure storage
        await _saveAuthUser(user);

        emit(Authenticated(user));
      } else {
        emit(const AuthError('PIN không đúng'));
      }
    } on UnauthorizedException {
      emit(const AuthError('PIN không đúng'));
    } on NotFoundException {
      emit(const AuthError('Không tìm thấy tài khoản'));
    } catch (e) {
      emit(AuthError('Đã xảy ra lỗi: ${e.toString()}'));
    }
  }

  Future<void> _onAdminLoginRequested(
    AdminLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      // TODO: Implement actual admin login via AuthRepository
      // For now, simulate admin login
      await Future.delayed(const Duration(seconds: 1));

      // Create auth user with Admin access level
      final user = AuthUser(
        id: 'admin',
        username: event.username,
        accessLevel: AccessLevel.ADMIN,
        token: 'mock_admin_token', // TODO: Use real token from API
      );

      // Save to secure storage
      await _saveAuthUser(user);

      emit(Authenticated(user));
    } on UnauthorizedException {
      emit(const AuthError('Tên đăng nhập hoặc mật khẩu không đúng'));
    } catch (e) {
      emit(AuthError('Đã xảy ra lỗi: ${e.toString()}'));
    }
  }

  Future<void> _onCheckAuthStatus(
    CheckAuthStatus event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      // Try to restore from secure storage
      final userId = await _secureStorage.read(key: StorageKeys.userId);
      final username = await _secureStorage.read(key: 'username');
      final accessLevelStr = await _secureStorage.read(key: 'access_level');
      final token = await _secureStorage.read(key: StorageKeys.accessToken);

      if (userId != null && username != null && accessLevelStr != null) {
        final accessLevel = AccessLevel.values.firstWhere(
          (e) => e.name == accessLevelStr,
          orElse: () => AccessLevel.GUEST,
        );

        final user = AuthUser(
          id: userId,
          username: username,
          accessLevel: accessLevel,
          token: token,
        );

        emit(Authenticated(user));
      } else {
        emit(const Unauthenticated());
      }
    } catch (e) {
      emit(const Unauthenticated());
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      // Clear secure storage
      await _secureStorage.delete(key: StorageKeys.userId);
      await _secureStorage.delete(key: 'username');
      await _secureStorage.delete(key: 'access_level');
      await _secureStorage.delete(key: StorageKeys.accessToken);

      emit(const Unauthenticated());
    } catch (e) {
      emit(AuthError('Đã xảy ra lỗi khi đăng xuất: ${e.toString()}'));
    }
  }

  /// Save authenticated user to secure storage
  Future<void> _saveAuthUser(AuthUser user) async {
    await _secureStorage.write(key: StorageKeys.userId, value: user.id);
    await _secureStorage.write(key: 'username', value: user.username);
    await _secureStorage.write(
      key: 'access_level',
      value: user.accessLevel.name,
    );
    if (user.token != null) {
      await _secureStorage.write(
        key: StorageKeys.accessToken,
        value: user.token!,
      );
    }
  }
}
