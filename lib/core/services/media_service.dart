import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import '../error/failures.dart';

/// Service for handling media operations (compression, upload, delete)
class MediaService {
  final SupabaseClient _supabase;
  final Uuid _uuid = const Uuid();

  MediaService({SupabaseClient? supabase})
      : _supabase = supabase ?? Supabase.instance.client;

  /// Compress image to max 1080px with 80% quality (~100kb target)
  Future<File> compressImage(File file) async {
    try {
      final dir = await getTemporaryDirectory();
      final targetPath = '${dir.path}/${_uuid.v4()}.jpg';

      // Get image dimensions
      final bytes = await file.readAsBytes();
      final image = await decodeImageFromList(bytes);

      // Calculate new dimensions (max 1080px)
      int width = image.width;
      int height = image.height;
      final maxDimension = 1080;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension / width).round();
          width = maxDimension;
        } else {
          width = (width * maxDimension / height).round();
          height = maxDimension;
        }
      }

      // Compress image
      final result = await FlutterImageCompress.compressAndGetFile(
        file.absolute.path,
        targetPath,
        quality: 80,
        minWidth: width,
        minHeight: height,
        format: CompressFormat.jpeg,
      );

      if (result == null) {
        throw Exception('Image compression failed');
      }

      return File(result.path);
    } catch (e) {
      debugPrint('Error compressing image: $e');
      rethrow;
    }
  }

  /// Check gallery image count for validation
  Future<int> _checkGalleryCount(String linkId) async {
    try {
      final response = await _supabase
          .from('gallery')
          .select('id')
          .eq('link_id', linkId);

      return (response as List).length;
    } catch (e) {
      debugPrint('Error checking gallery count: $e');
      return 0;
    }
  }

  /// Upload image to gallery with validation (max 20 images)
  Future<String> uploadImageToGallery({
    required String linkId,
    required File imageFile,
  }) async {
    try {
      // Validate: Check 20 image limit
      final count = await _checkGalleryCount(linkId);
      if (count >= 20) {
        throw const GalleryLimitExceededFailure();
      }

      // Compress image
      final compressed = await compressImage(imageFile);

      // Generate unique filename
      final fileName = '${_uuid.v4()}.jpg';
      final path = 'gallery/$linkId/$fileName';

      // Upload to Supabase Storage
      await _supabase.storage.from('images').upload(
            path,
            compressed,
            fileOptions: const FileOptions(
              cacheControl: '3600',
              upsert: false,
            ),
          );

      // Get public URL
      final url = _supabase.storage.from('images').getPublicUrl(path);

      return url;
    } on StorageException catch (e) {
      debugPrint('Storage error: ${e.message}');
      if (e.statusCode == '413') {
        throw const Failure('File quá lớn');
      }
      throw Failure('Lỗi upload: ${e.message}');
    } catch (e) {
      if (e is GalleryLimitExceededFailure) rethrow;
      debugPrint('Error uploading image: $e');
      throw Failure('Không thể upload ảnh: ${e.toString()}');
    }
  }

  /// Upload profile image (avatar or couple image)
  Future<String> uploadProfileImage({
    required String linkId,
    required File imageFile,
    required String type, // 'avatar1', 'avatar2', 'couple'
  }) async {
    try {
      // Compress image
      final compressed = await compressImage(imageFile);

      // Generate filename
      final fileName = '$type.jpg';
      final path = 'profiles/$linkId/$fileName';

      // Delete old file if exists
      try {
        await _supabase.storage.from('images').remove([path]);
      } catch (_) {
        // File doesn't exist, ignore
      }

      // Upload new file
      await _supabase.storage.from('images').upload(
            path,
            compressed,
            fileOptions: const FileOptions(
              cacheControl: '3600',
              upsert: true,
            ),
          );

      // Get public URL
      final url = _supabase.storage.from('images').getPublicUrl(path);

      return url;
    } catch (e) {
      debugPrint('Error uploading profile image: $e');
      throw Failure('Không thể upload ảnh profile: ${e.toString()}');
    }
  }

  /// Upload audio file (for timeline or time capsule)
  Future<String> uploadAudio({
    required String linkId,
    required File audioFile,
    required String type, // 'timeline' or 'capsule'
  }) async {
    try {
      // Get file extension
      final extension = audioFile.path.split('.').last;

      // Generate unique filename
      final fileName = '${_uuid.v4()}.$extension';
      final path = 'audio/$type/$linkId/$fileName';

      // Upload to Supabase Storage
      await _supabase.storage.from('audio').upload(
            path,
            audioFile,
            fileOptions: const FileOptions(
              cacheControl: '3600',
              upsert: false,
            ),
          );

      // Get public URL
      final url = _supabase.storage.from('audio').getPublicUrl(path);

      return url;
    } on StorageException catch (e) {
      debugPrint('Storage error: ${e.message}');
      throw Failure('Lỗi upload audio: ${e.message}');
    } catch (e) {
      debugPrint('Error uploading audio: $e');
      throw Failure('Không thể upload audio: ${e.toString()}');
    }
  }

  /// Delete file from Supabase Storage using public URL
  Future<void> deleteFile(String publicUrl) async {
    try {
      // Parse URL to extract bucket and path
      // URL format: https://.../storage/v1/object/public/{bucket}/{path}
      final uri = Uri.parse(publicUrl);
      final segments = uri.pathSegments;

      // Find 'public' segment and extract bucket + path
      final publicIndex = segments.indexOf('public');
      if (publicIndex == -1 || publicIndex >= segments.length - 1) {
        throw Exception('Invalid storage URL format');
      }

      final bucket = segments[publicIndex + 1];
      final path = segments.sublist(publicIndex + 2).join('/');

      // Delete from storage
      await _supabase.storage.from(bucket).remove([path]);

      debugPrint('Deleted file: $bucket/$path');
    } on StorageException catch (e) {
      debugPrint('Storage error deleting file: ${e.message}');
      // Don't throw error if file doesn't exist
      if (e.statusCode != '404') {
        throw Failure('Lỗi xóa file: ${e.message}');
      }
    } catch (e) {
      debugPrint('Error deleting file: $e');
      // Silently fail for delete operations
    }
  }

  /// Delete multiple files at once
  Future<void> deleteFiles(List<String> publicUrls) async {
    for (final url in publicUrls) {
      await deleteFile(url);
    }
  }
}
