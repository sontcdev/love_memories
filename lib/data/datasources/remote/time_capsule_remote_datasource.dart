import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/error/error_handler.dart';
import '../../../core/network/network_service.dart';
import '../../models/time_capsule_model.dart';

/// Remote data source for TimeCapsule operations
class TimeCapsuleRemoteDataSource {
  final Dio _dio;

  TimeCapsuleRemoteDataSource() : _dio = NetworkService.instance.dio;

  /// Get all time capsules for a link
  Future<List<TimeCapsuleModel>> getCapsules(String linkId) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.getTimeCapsules}/$linkId',
      );

      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => TimeCapsuleModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Create a new time capsule
  Future<TimeCapsuleModel> createCapsule(TimeCapsuleModel capsule) async {
    try {
      final response = await _dio.post(
        ApiConstants.createCapsule,
        data: capsule.toJson(),
      );

      return TimeCapsuleModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Update a time capsule
  Future<TimeCapsuleModel> updateCapsule(
    String id,
    TimeCapsuleModel capsule,
  ) async {
    try {
      final response = await _dio.put(
        '${ApiConstants.updateCapsule}/$id',
        data: capsule.toJson(),
      );

      return TimeCapsuleModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Delete a time capsule
  Future<void> deleteCapsule(String id) async {
    try {
      await _dio.delete('${ApiConstants.deleteCapsule}/$id');
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Open a time capsule with response
  Future<TimeCapsuleModel> openCapsule(String id, String response) async {
    try {
      final apiResponse = await _dio.post(
        '${ApiConstants.openCapsule}/$id/open',
        data: {
          'response': response,
        },
      );

      return TimeCapsuleModel.fromJson(apiResponse.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Get capsule with server time validation
  /// Returns full capsule content only if server time >= open_date
  /// Otherwise returns capsule with limited info (title, open_date only)
  Future<Map<String, dynamic>> getCapsuleWithServerTimeCheck(String id) async {
    try {
      // Call backend endpoint that validates server time
      final response = await _dio.get(
        '${ApiConstants.getTimeCapsule}/$id/check',
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }
}
