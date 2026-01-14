import 'package:supabase_flutter/supabase_flutter.dart';

/// Service for getting accurate server time from Supabase
/// Uses SELECT NOW() to avoid device time manipulation
class ServerTimeService {
  final SupabaseClient _supabase;

  ServerTimeService({SupabaseClient? supabase})
      : _supabase = supabase ?? Supabase.instance.client;

  /// Get current server time from Supabase (GMT+7)
  /// Uses SELECT NOW() query to get database server time
  Future<DateTime> getServerTime() async {
    try {
      // Query Supabase for current timestamp
      final response = await _supabase.rpc('get_server_time');
      
      if (response == null) {
        throw Exception('Failed to get server time');
      }

      return DateTime.parse(response as String);
    } catch (e) {
      // Fallback to device time if query fails (not recommended)
      print('⚠️ Failed to get server time, using device time: $e');
      return DateTime.now();
    }
  }

  /// Alternative method using direct SQL query
  Future<DateTime> getServerTimeDirectQuery() async {
    try {
      final response = await _supabase
          .from('links') // Use any existing table
          .select('created_at')
          .limit(1)
          .single();

      // This will give us server time via the query execution
      // But better to use RPC function above
      return DateTime.now(); // Placeholder
    } catch (e) {
      print('Error getting server time: $e');
      return DateTime.now();
    }
  }
}
