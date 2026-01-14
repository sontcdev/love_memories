import 'package:flutter/material.dart';
import '../core/network/supabase_client.dart';

/// Example usage of SupabaseService

// ============================================================================
// INITIALIZATION (in main.dart)
// ============================================================================

/// Initialize Supabase before running app
Future<void> initializeSupabase() async {
  await SupabaseService.initialize(
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here',
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

class SupabaseUsageExamples {
  final supabase = SupabaseService.instance;

  /// Example 1: Get data with filters
  Future<void> getLinksExample() async {
    try {
      // Get all links
      final allLinks = await supabase.getData(table: 'links');
      print('All links: $allLinks');

      // Get specific link by username
      final userLink = await supabase.getData(
        table: 'links',
        filters: {'username': 'johnandjane'},
      );
      print('User link: $userLink');

      // Get with custom select
      final limitedData = await supabase.getData(
        table: 'links',
        select: 'id,username,template_type',
        filters: {'is_deleted': false},
        limit: 10,
      );
      print('Limited data: $limitedData');
    } catch (e) {
      print('Error: $e'); // Failure object with Vietnamese message
    }
  }

  /// Example 2: Insert data
  Future<void> insertLinkExample() async {
    try {
      final newLink = await supabase.insertData(
        table: 'links',
        data: {
          'username': 'newuser',
          'template_type': 'LOVE',
          'owner_pin': '123456',
          'is_deleted': false,
        },
      );
      print('Created link: $newLink');
    } on Failure catch (e) {
      if (e.message.contains('đã tồn tại')) {
        print('Username already taken!');
      } else {
        print('Error: ${e.message}');
      }
    }
  }

  /// Example 3: Update data
  Future<void> updateLinkExample() async {
    try {
      final updated = await supabase.updateData(
        table: 'links',
        id: 'link-uuid-here',
        data: {
          'template_type': 'EVERY',
        },
      );
      print('Updated link: $updated');
    } catch (e) {
      print('Error: $e');
    }
  }

  /// Example 4: Soft delete
  Future<void> softDeleteExample() async {
    try {
      // Soft delete (update is_deleted = true)
      await supabase.updateData(
        table: 'links',
        id: 'link-uuid',
        data: {
          'is_deleted': true,
          'deleted_at': DateTime.now().toIso8601String(),
        },
      );
      print('Link soft deleted');
    } catch (e) {
      print('Error: $e');
    }
  }

  /// Example 5: Upload file
  Future<void> uploadImageExample() async {
    try {
      final imageFile = File('/path/to/image.jpg');
      final url = await supabase.uploadFile(
        bucket: 'images',
        path: 'gallery/link-id/photo.jpg',
        file: imageFile,
      );
      print('Uploaded! Public URL: $url');
    } on Failure catch (e) {
      if (e.message.contains('quá lớn')) {
        print('File too large!');
      } else {
        print('Upload error: ${e.message}');
      }
    }
  }

  /// Example 6: Delete file
  Future<void> deleteFileExample() async {
    try {
      await supabase.deleteFile(
        bucket: 'images',
        path: 'gallery/link-id/photo.jpg',
      );
      print('File deleted');
    } catch (e) {
      print('Delete error: $e');
    }
  }

  /// Example 7: Call RPC function
  Future<void> getServerTimeExample() async {
    try {
      final serverTime = await supabase.rpcCall(
        function: 'get_server_time',
      );
      print('Server time: $serverTime');
    } catch (e) {
      print('RPC error: $e');
    }
  }

  /// Example 8: Complex query with error handling
  Future<void> getGalleryImagesExample(String linkId) async {
    try {
      final images = await supabase.getData(
        table: 'gallery',
        filters: {'link_id': linkId},
        select: 'id,image_url,caption,created_at',
        limit: 20,
      );

      if (images is List && images.isEmpty) {
        print('No images found');
      } else {
        print('Found ${(images as List).length} images');
      }
    } on NotFoundException {
      print('Gallery not found');
    } on UnauthorizedException {
      print('No permission to view gallery');
    } on Failure catch (e) {
      print('Error: ${e.message}');
    }
  }
}

// ============================================================================
// ERROR HANDLING PATTERNS
// ============================================================================

class ErrorHandlingPatterns {
  final supabase = SupabaseService.instance;

  /// Pattern 1: Try-catch with specific failures
  Future<void> pattern1() async {
    try {
      await supabase.insertData(table: 'links', data: {...});
    } on NotFoundException catch (e) {
      print('Not found: ${e.message}');
    } on UnauthorizedException catch (e) {
      print('Unauthorized: ${e.message}');
    } on Failure catch (e) {
      print('General error: ${e.message}');
    }
  }

  /// Pattern 2: Check error messages
  Future<void> pattern2() async {
    try {
      await supabase.insertData(table: 'links', data: {...});
    } on Failure catch (e) {
      if (e.message.contains('đã tồn tại')) {
        // Handle duplicate
      } else if (e.message.contains('Thiếu thông tin')) {
        // Handle missing required field
      } else {
        // Handle other errors
      }
    }
  }

  /// Pattern 3: Return Either pattern (for repositories)
  Future<Either<Failure, dynamic>> pattern3() async {
    try {
      final result = await supabase.getData(table: 'links');
      return Right(result);
    } on Failure catch (e) {
      return Left(e);
    }
  }
}
