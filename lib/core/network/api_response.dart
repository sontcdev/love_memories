/// Generic API response wrapper
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final int? statusCode;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.statusCode,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] ?? true,
      data: fromJsonT != null && json['data'] != null
          ? fromJsonT(json['data'])
          : json['data'] as T?,
      message: json['message']?.toString(),
      statusCode: json['statusCode'] as int?,
    );
  }

  Map<String, dynamic> toJson(Object Function(T value)? toJsonT) {
    return {
      'success': success,
      'data': toJsonT != null && data != null ? toJsonT(data as T) : data,
      'message': message,
      'statusCode': statusCode,
    };
  }
}
