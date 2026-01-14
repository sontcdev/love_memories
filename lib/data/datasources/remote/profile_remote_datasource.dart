import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/error/error_handler.dart';
import '../../../core/network/network_service.dart';
import '../../models/profile_model.dart';

/// Remote data source for Profile operations
class ProfileRemoteDataSource {
  final Dio _dio;

  ProfileRemoteDataSource() : _dio = NetworkService.instance.dio;

  /// Get profile by link ID
  Future<ProfileModel> getProfile(String linkId) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.getProfile}/$linkId',
      );

      return ProfileModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Update profile
  Future<ProfileModel> updateProfile(String linkId, ProfileModel profile) async {
    try {
      final response = await _dio.put(
        '${ApiConstants.updateProfile}/$linkId',
        data: profile.toJson(),
      );

      return ProfileModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }
}
