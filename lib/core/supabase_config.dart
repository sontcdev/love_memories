import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Supabase configuration và singleton client
class SupabaseConfig {
  static SupabaseClient? _client;

  /// Initialize Supabase client
  static Future<void> initialize() async {
    if (kIsWeb) {
      // Load from environment variables for web
      final supabaseUrl = const String.fromEnvironment('SUPABASE_URL');
      final supabaseAnonKey = const String.fromEnvironment('SUPABASE_ANON_KEY');

      if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
        throw Exception(
          'SUPABASE_URL and SUPABASE_ANON_KEY must be provided as environment variables',
        );
      }

      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      );
    } else {
      // Load from .env file for other platforms
      await dotenv.load();

      final supabaseUrl = dotenv.env['SUPABASE_URL'];
      final supabaseAnonKey = dotenv.env['SUPABASE_ANON_KEY'];

      if (supabaseUrl == null || supabaseAnonKey == null) {
        throw Exception(
          'SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file',
        );
      }

      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      );
    }

    _client = Supabase.instance.client;
  }

  /// Get Supabase client instance
  static SupabaseClient get client {
    if (_client == null) {
      throw Exception('Supabase has not been initialized. Call initialize() first.');
    }
    return _client!;
  }

  /// Get app domain from environment
  static String get appDomain {
    if (kIsWeb) {
      return const String.fromEnvironment('APP_DOMAIN', defaultValue: 'https://yourdomain.com');
    }
    return dotenv.env['APP_DOMAIN'] ?? 'https://yourdomain.com';
  }
}

/// Shorthand getter for Supabase client
SupabaseClient get supabase => SupabaseConfig.client;
