import 'dart:io';
import 'package:dio/dio.dart';
import 'exceptions.dart';

/// Global error handler for the application
class ErrorHandler {
  // Private constructor
  ErrorHandler._();

  /// Handle Dio errors and convert to custom exceptions
  static Exception handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkException(
          'Kết nối timeout. Vui lòng kiểm tra kết nối mạng.',
        );

      case DioExceptionType.badResponse:
        return _handleBadResponse(error.response);

      case DioExceptionType.cancel:
        return ServerException('Yêu cầu đã bị hủy');

      case DioExceptionType.connectionError:
        return NetworkException(
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        );

      case DioExceptionType.badCertificate:
        return ServerException(
          'Chứng chỉ bảo mật không hợp lệ',
        );

      case DioExceptionType.unknown:
        if (error.error is SocketException) {
          return NetworkException(
            'Không có kết nối internet',
          );
        }
        return ServerException(
          'Đã xảy ra lỗi không xác định',
        );
    }
  }

  /// Handle bad HTTP responses (4xx, 5xx)
  static Exception _handleBadResponse(Response? response) {
    if (response == null) {
      return ServerException('Không nhận được phản hồi từ máy chủ');
    }

    final statusCode = response.statusCode;
    final message = _extractErrorMessage(response.data);

    switch (statusCode) {
      case 400:
        return ValidationException(message ?? 'Dữ liệu không hợp lệ');
      
      case 401:
        return UnauthorizedException(
          message ?? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        );
      
      case 403:
        return AuthenticationException(
          message ?? 'Bạn không có quyền truy cập tài nguyên này',
          403,
        );
      
      case 404:
        return NotFoundException(
          message ?? 'Không tìm thấy tài nguyên',
        );
      
      case 409:
        return ServerException(
          message ?? 'Xung đột dữ liệu',
          409,
        );
      
      case 422:
        return ValidationException(
          message ?? 'Dữ liệu không thể xử lý',
        );
      
      case 429:
        return ServerException(
          message ?? 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
          429,
        );
      
      case 500:
        return ServerException(
          message ?? 'Lỗi máy chủ nội bộ',
          500,
        );
      
      case 502:
      case 503:
      case 504:
        return ServerException(
          message ?? 'Máy chủ đang bảo trì. Vui lòng thử lại sau.',
          statusCode,
        );
      
      default:
        return ServerException(
          message ?? 'Đã xảy ra lỗi (Code: $statusCode)',
          statusCode,
        );
    }
  }

  /// Extract error message from response data
  static String? _extractErrorMessage(dynamic data) {
    if (data == null) return null;

    if (data is Map) {
      // Try common error message keys
      if (data.containsKey('message')) {
        return data['message']?.toString();
      }
      if (data.containsKey('error')) {
        return data['error']?.toString();
      }
      if (data.containsKey('detail')) {
        return data['detail']?.toString();
      }
    }

    if (data is String) {
      return data;
    }

    return null;
  }

  /// Get user-friendly error message from exception
  static String getUserFriendlyMessage(Exception exception) {
    if (exception is ServerException) {
      return exception.message;
    } else if (exception is NetworkException) {
      return exception.message;
    } else if (exception is CacheException) {
      return exception.message;
    } else if (exception is AuthenticationException) {
      return exception.message;
    } else if (exception is ValidationException) {
      return exception.message;
    } else if (exception is PermissionException) {
      return exception.message;
    } else if (exception is NotFoundException) {
      return exception.message;
    } else if (exception is UnauthorizedException) {
      return exception.message;
    }

    return 'Đã xảy ra lỗi không xác định';
  }
}
