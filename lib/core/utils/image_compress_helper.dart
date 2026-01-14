import 'dart:io';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;

/// Helper class for image compression
class ImageCompressHelper {
  // Private constructor
  ImageCompressHelper._();

  /// Compress image file with specified quality
  static Future<File?> compressImage(
    File imageFile, {
    int quality = 85,
    int? maxWidth,
    int? maxHeight,
  }) async {
    try {
      // Get temporary directory
      final tempDir = await getTemporaryDirectory();
      final targetPath = path.join(
        tempDir.path,
        '${DateTime.now().millisecondsSinceEpoch}_compressed${path.extension(imageFile.path)}',
      );

      // Compress the image
      final compressedImage = await FlutterImageCompress.compressAndGetFile(
        imageFile.absolute.path,
        targetPath,
        quality: quality,
        minWidth: maxWidth ?? 1920,
        minHeight: maxHeight ?? 1080,
        format: _getCompressFormat(imageFile.path),
      );

      if (compressedImage == null) {
        return null;
      }

      return File(compressedImage.path);
    } catch (e) {
      return null;
    }
  }

  /// Compress image to specific file size (in KB)
  static Future<File?> compressToFileSize(
    File imageFile, {
    required int targetSizeKB,
  }) async {
    try {
      final tempDir = await getTemporaryDirectory();
      final targetPath = path.join(
        tempDir.path,
        '${DateTime.now().millisecondsSinceEpoch}_compressed${path.extension(imageFile.path)}',
      );

      // Start with quality 95 and reduce until we reach target size
      int quality = 95;
      XFile? compressedImage;

      while (quality > 10) {
        compressedImage = await FlutterImageCompress.compressAndGetFile(
          imageFile.absolute.path,
          targetPath,
          quality: quality,
          format: _getCompressFormat(imageFile.path),
        );

        if (compressedImage == null) {
          return null;
        }

        final fileSize = await File(compressedImage.path).length();
        final fileSizeKB = fileSize ~/ 1024;

        if (fileSizeKB <= targetSizeKB) {
          return File(compressedImage.path);
        }

        quality -= 10;
      }

      // If we couldn't reach target size, return the best we could do
      if (compressedImage != null) {
        return File(compressedImage.path);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Get compress format based on file extension
  static CompressFormat _getCompressFormat(String filePath) {
    final extension = path.extension(filePath).toLowerCase();
    
    switch (extension) {
      case '.png':
        return CompressFormat.png;
      case '.jpg':
      case '.jpeg':
        return CompressFormat.jpeg;
      case '.heic':
        return CompressFormat.heic;
      case '.webp':
        return CompressFormat.webp;
      default:
        return CompressFormat.jpeg;
    }
  }

  /// Create thumbnail from image
  static Future<File?> createThumbnail(
    File imageFile, {
    int size = 300,
    int quality = 70,
  }) async {
    return compressImage(
      imageFile,
      quality: quality,
      maxWidth: size,
      maxHeight: size,
    );
  }
}
