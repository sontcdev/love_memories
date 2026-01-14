import 'dart:developer';
import 'package:dio/dio.dart';

/// Custom Dio interceptor for handling errors and authentication
class DioInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    log('🚀 Request: ${options.method} ${options.path}', name: 'DioInterceptor');
    super.onRequest(options, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    log('✅ Response: ${response.statusCode} ${response.requestOptions.path}', 
        name: 'DioInterceptor');
    super.onResponse(response, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    log('❌ Error: ${err.response?.statusCode} ${err.requestOptions.path}', 
        name: 'DioInterceptor');
    
    // Handle specific error codes
    final statusCode = err.response?.statusCode;
    
    if (statusCode == 401) {
      // Handle unauthorized - token expired or invalid
      log('🔒 Unauthorized (401): Token expired or invalid', name: 'DioInterceptor');
      
      // TODO: Implement token refresh logic here
      // For now, just pass the error through
      // You can implement automatic token refresh like this:
      // try {
      //   final newToken = await refreshToken();
      //   err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
      //   return handler.resolve(await _retry(err.requestOptions));
      // } catch (e) {
      //   // Token refresh failed, logout user
      //   return handler.reject(err);
      // }
      
      return handler.reject(err);
    } else if (statusCode == 404) {
      // Handle not found
      log('🔍 Not Found (404): ${err.requestOptions.path}', name: 'DioInterceptor');
      return handler.reject(err);
    } else if (statusCode == 403) {
      // Handle forbidden
      log('🚫 Forbidden (403): Access denied', name: 'DioInterceptor');
      return handler.reject(err);
    } else if (statusCode != null && statusCode >= 500) {
      // Handle server errors (5xx)
      log('🔥 Server Error ($statusCode)', name: 'DioInterceptor');
      return handler.reject(err);
    }
    
    super.onError(err, handler);
  }
}
