import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/error/error_handler.dart';
import '../../../core/network/network_service.dart';
import '../../models/user_link_model.dart';

/// Remote data source for UserLink operations
class UserLinkRemoteDataSource {
  final Dio _dio;

  UserLinkRemoteDataSource() : _dio = NetworkService.instance.dio;

  /// Create a new link
  Future<UserLinkModel> createLink(UserLinkModel link) async {
    try {
      final response = await _dio.post(
        ApiConstants.createLink,
        data: link.toJson(),
      );

      return UserLinkModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Get link by username
  Future<UserLinkModel> getLinkByUsername(String username) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.getLinkByUsername}/$username',
      );

      return UserLinkModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Check if username is available
  Future<bool> checkUsernameAvailability(String username) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.checkUsername}/$username',
      );

      return response.data['available'] ?? false;
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Update link
  Future<UserLinkModel> updateLink(String id, UserLinkModel link) async {
    try {
      final response = await _dio.put(
        '${ApiConstants.updateLink}/$id',
        data: link.toJson(),
      );

      return UserLinkModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Delete link
  Future<void> deleteLink(String id) async {
    try {
      await _dio.delete('${ApiConstants.deleteLink}/$id');
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Verify access password for guest
  Future<bool> verifyAccessPassword(String username, String password) async {
    try {
      final response = await _dio.post(
        ApiConstants.verifyPassword,
        data: {
          'username': username,
          'password': password,
        },
      );

      return response.data['verified'] ?? false;
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Verify admin PIN for owner
  Future<bool> verifyAdminPin(String username, String pin) async {
    try {
      final response = await _dio.post(
        ApiConstants.verifyAdminPin,
        data: {
          'username': username,
          'pin': pin,
        },
      );

      return response.data['verified'] ?? false;
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }
}
