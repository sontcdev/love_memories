import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Simple admin credentials
const _adminUsername = 'admin';
const _adminPassword = 'admin';
const _authKey = 'is_admin_authenticated';

/// Provider cho auth state (check nếu admin đã login)
final authStateProvider = FutureProvider<bool>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool(_authKey) ?? false;
});

/// Provider cho current auth status
final currentUserProvider = Provider<bool>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.when(
    data: (isAuth) => isAuth,
    loading: () => false,
    error: (_, __) => false,
  );
});

/// Provider cho auth repository
final authRepositoryProvider = Provider((ref) => AuthRepository());

class AuthRepository {
  /// Sign in with username and password
  Future<void> signIn(String username, String password) async {
    // Simple hardcoded check
    if (username == _adminUsername && password == _adminPassword) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_authKey, true);
    } else {
      throw Exception('Invalid credentials');
    }
  }

  /// Sign out
  Future<void> signOut() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_authKey, false);
  }

  /// Check if user is authenticated
  Future<bool> get isAuthenticated async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_authKey) ?? false;
  }
}
