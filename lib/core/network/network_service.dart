import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import 'dio_interceptor.dart';

/// Dio network service for making HTTP requests
class NetworkService {
  late final Dio _dio;
  
  static NetworkService? _instance;
  
  // Private constructor
  NetworkService._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(milliseconds: ApiConstants.connectionTimeout),
        receiveTimeout: const Duration(milliseconds: ApiConstants.receiveTimeout),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    
    // Add interceptors
    _dio.interceptors.add(DioInterceptor());
    
    // Add logging interceptor in debug mode
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
        requestHeader: true,
        responseHeader: false,
      ),
    );
  }
  
  /// Get singleton instance
  static NetworkService get instance {
    _instance ??= NetworkService._internal();
    return _instance!;
  }
  
  /// Get Dio instance
  Dio get dio => _dio;
  
  /// Set authorization token
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }
  
  /// Remove authorization token
  void removeAuthToken() {
    _dio.options.headers.remove('Authorization');
  }
  
  /// Update base URL
  void updateBaseUrl(String baseUrl) {
    _dio.options.baseUrl = baseUrl;
  }
}
