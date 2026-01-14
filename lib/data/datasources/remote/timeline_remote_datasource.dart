import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/error/error_handler.dart';
import '../../../core/network/network_service.dart';
import '../../models/timeline_event_model.dart';

/// Remote data source for Timeline operations
class TimelineRemoteDataSource {
  final Dio _dio;

  TimelineRemoteDataSource() : _dio = NetworkService.instance.dio;

  /// Get all timeline events for a link
  Future<List<TimelineEventModel>> getEvents(String linkId) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.getTimelineEvents}/$linkId',
      );

      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => TimelineEventModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Create a new timeline event
  Future<TimelineEventModel> createEvent(TimelineEventModel event) async {
    try {
      final response = await _dio.post(
        ApiConstants.createEvent,
        data: event.toJson(),
      );

      return TimelineEventModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Update a timeline event
  Future<TimelineEventModel> updateEvent(
    String id,
    TimelineEventModel event,
  ) async {
    try {
      final response = await _dio.put(
        '${ApiConstants.updateEvent}/$id',
        data: event.toJson(),
      );

      return TimelineEventModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Delete a timeline event
  Future<void> deleteEvent(String id) async {
    try {
      await _dio.delete('${ApiConstants.deleteEvent}/$id');
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }
}
