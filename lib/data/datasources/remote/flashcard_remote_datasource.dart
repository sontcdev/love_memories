import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/error/error_handler.dart';
import '../../../core/network/network_service.dart';
import '../../models/flashcard_model.dart';

/// Remote data source for Flashcard operations
class FlashcardRemoteDataSource {
  final Dio _dio;

  FlashcardRemoteDataSource() : _dio = NetworkService.instance.dio;

  /// Get all flashcards for a link
  Future<List<FlashcardModel>> getFlashcards(String linkId) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.getFlashcards}/$linkId',
      );

      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => FlashcardModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Update a flashcard (primarily for revealed status)
  Future<FlashcardModel> updateFlashcard(
    String id,
    FlashcardModel flashcard,
  ) async {
    try {
      final response = await _dio.put(
        '${ApiConstants.updateFlashcard}/$id',
        data: flashcard.toJson(),
      );

      return FlashcardModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }

  /// Seed initial flashcards for a new link
  /// Generates 10 flashcards: 4 Easy, 4 Medium, 2 Hard
  Future<List<FlashcardModel>> seedFlashcards(String linkId) async {
    try {
      final response = await _dio.post(
        '${ApiConstants.seedFlashcards}/$linkId',
      );

      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => FlashcardModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleDioError(e);
    }
  }
}
