import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../error/failures.dart';

/// Supabase service for database and storage operations
class SupabaseService {
  static SupabaseService? _instance;
  static SupabaseService get instance => _instance ??= SupabaseService._();

  late final SupabaseClient client;

  SupabaseService._();

  /// Initialize Supabase from .env file
  static Future<void> initialize() async {
    try {
      // Load credentials from .env
      final url = dotenv.env['NEXT_PUBLIC_SUPABASE_URL'];
      final anonKey = dotenv.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

      if (url == null || anonKey == null) {
        throw Exception('Missing Supabase credentials in .env file');
      }

      await Supabase.initialize(
        url: url,
        anonKey: anonKey,
        debug: kDebugMode,
      );

      instance.client = Supabase.instance.client;
      debugPrint('✅ Supabase initialized successfully');
    } catch (e) {
      debugPrint('❌ Supabase initialization failed: $e');
      rethrow;
    }
  }

  /// Get data from a table with optional filters
  /// Example: getData(table: 'links', filters: {'username': 'john'})
  Future<dynamic> getData({
    required String table,
    Map<String, dynamic>? filters,
    String? select,
    int? limit,
  }) async {
    try {
      var query = client.from(table).select(select ?? '*');

      // Apply filters if provided
      if (filters != null) {
        filters.forEach((key, value) {
          query = query.eq(key, value);
        });
      }

      // Apply limit and execute query
      final response = limit != null 
          ? await query.limit(limit)
          : await query;
          
      return response;
    } on PostgrestException catch (e) {
      throw _handlePostgrestError(e);
    } catch (e) {
      debugPrint('Error getting data from $table: $e');
      throw UnknownFailure(e.toString());
    }
  }

  /// Insert data into a table
  /// Example: insertData(table: 'links', data: {'username': 'john', ...})
  Future<dynamic> insertData({
    required String table,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await client.from(table).insert(data).select();
      return response;
    } on PostgrestException catch (e) {
      throw _handlePostgrestError(e);
    } catch (e) {
      debugPrint('Error inserting data into $table: $e');
      throw UnknownFailure(e.toString());
    }
  }

  /// Update data in a table
  /// Example: updateData(table: 'links', id: '123', data: {...})
  Future<dynamic> updateData({
    required String table,
    required String id,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await client
          .from(table)
          .update(data)
          .eq('id', id)
          .select();
      return response;
    } on PostgrestException catch (e) {
      throw _handlePostgrestError(e);
    } catch (e) {
      debugPrint('Error updating data in $table: $e');
      throw UnknownFailure(e.toString());
    }
  }

  /// Delete data from a table (soft delete recommended)
  /// Example: deleteData(table: 'links', id: '123')
  Future<void> deleteData({
    required String table,
    required String id,
  }) async {
    try {
      await client.from(table).delete().eq('id', id);
    } on PostgrestException catch (e) {
      throw _handlePostgrestError(e);
    } catch (e) {
      debugPrint('Error deleting data from $table: $e');
      throw UnknownFailure(e.toString());
    }
  }

  /// Upload file to Supabase Storage
  /// Example: uploadFile(bucket: 'images', path: 'gallery/123/photo.jpg', file: File(...))
  Future<String> uploadFile({
    required String bucket,
    required String path,
    required File file,
  }) async {
    try {
      await client.storage.from(bucket).upload(
            path,
            file,
            fileOptions: const FileOptions(
              cacheControl: '3600',
              upsert: false,
            ),
          );

      // Get public URL
      final url = client.storage.from(bucket).getPublicUrl(path);
      return url;
    } on StorageException catch (e) {
      throw _handleStorageError(e);
    } catch (e) {
      debugPrint('Error uploading file to $bucket/$path: $e');
      throw UnknownFailure(e.toString());
    }
  }

  /// Delete file from Supabase Storage
  /// Example: deleteFile(bucket: 'images', path: 'gallery/123/photo.jpg')
  Future<void> deleteFile({
    required String bucket,
    required String path,
  }) async {
    try {
      await client.storage.from(bucket).remove([path]);
    } on StorageException catch (e) {
      throw _handleStorageError(e);
    } catch (e) {
      debugPrint('Error deleting file from $bucket/$path: $e');
      // Silently fail for delete operations
    }
  }

  /// Call Supabase RPC function
  /// Example: rpcCall(function: 'get_server_time')
  Future<dynamic> rpcCall({
    required String function,
    Map<String, dynamic>? params,
  }) async {
    try {
      final response = await client.rpc(function, params: params);
      return response;
    } on PostgrestException catch (e) {
      throw _handlePostgrestError(e);
    } catch (e) {
      debugPrint('Error calling RPC function $function: $e');
      throw UnknownFailure(e.toString());
    }
  }

  /// Handle Postgrest errors and convert to Failure objects
  Failure _handlePostgrestError(PostgrestException e) {
    debugPrint('PostgrestException: ${e.message} (${e.code})');

    // Check error codes
    switch (e.code) {
      case '23505': // Unique violation
        return const ServerFailure('Dữ liệu đã tồn tại');
      case '23503': // Foreign key violation
        return const ServerFailure('Dữ liệu liên quan không tồn tại');
      case '23502': // Not null violation
        return const ServerFailure('Thiếu thông tin bắt buộc');
      case '42501': // Insufficient privilege
        return const UnauthorizedException('Không có quyền truy cập');
      case '42P01': // Table does not exist
        return const ServerFailure('Bảng dữ liệu không tồn tại');
      case 'PGRST116': // Row not found
        return const NotFoundException('Không tìm thấy dữ liệu');
      default:
        return ServerFailure('Lỗi database: ${e.message}');
    }
  }

  /// Handle Storage errors and convert to Failure objects
  Failure _handleStorageError(StorageException e) {
    debugPrint('StorageException: ${e.message} (${e.statusCode})');

    // Check status codes
    switch (e.statusCode) {
      case '404':
        return const NotFoundException('File không tồn tại');
      case '413':
        return const ServerFailure('File quá lớn');
      case '400':
        return const ServerFailure('Yêu cầu không hợp lệ');
      case '401':
      case '403':
        return const UnauthorizedException('Không có quyền upload');
      default:
        return ServerFailure('Lỗi storage: ${e.message}');
    }
  }
}
