import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/error/error_handler.dart';
import '../../../core/network/network_service.dart';
import '../../models/gallery_image_model.dart';

/// Remote data source for Gallery operations
class GalleryRemoteDataSource {
  final Dio _dio;

  GalleryRemoteDataSource() : _dio = NetworkService.instance.dio;

  /// Get all images for a link
  Future<List<GalleryImageModel>> getImages(String linkId) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.getGalleryImages}/$linkId',
      );

      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => GalleryImageModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Upload a new image
  Future<GalleryImageModel> uploadImage(GalleryImageModel image) async {
    try {
      final response = await _dio.post(
        ApiConstants.uploadImage,
        data: image.toJson(),
      );

      return GalleryImageModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Delete an image
  Future<void> deleteImage(String id) async {
    try {
      await _dio.delete('${ApiConstants.deleteImage}/$id');
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Reorder images
  Future<void> reorderImages(String linkId, List<String> imageIds) async {
    try {
      await _dio.put(
        '${ApiConstants.reorderImages}/$linkId/reorder',
        data: {
          'imageIds': imageIds,
        },
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }
}
