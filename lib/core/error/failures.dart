import 'package:equatable/equatable.dart';

/// Base class for all failures in the application
abstract class Failure extends Equatable {
  final String message;
  final int? code;

  const Failure(this.message, [this.code]);

  @override
  List<Object?> get props => [message, code];
}

/// Server-related failures
class ServerFailure extends Failure {
  const ServerFailure(String message, [int? code]) : super(message, code);
}

/// Cache-related failures
class CacheFailure extends Failure {
  const CacheFailure(String message) : super(message);
}

/// Network connectivity failures
class NetworkFailure extends Failure {
  const NetworkFailure(String message) : super(message);
}

/// Authentication failures
class AuthenticationFailure extends Failure {
  const AuthenticationFailure(String message, [int? code]) : super(message, code);
}

/// Validation failures
class ValidationFailure extends Failure {
  const ValidationFailure(String message) : super(message);
}

/// Permission failures
class PermissionFailure extends Failure {
  const PermissionFailure(String message) : super(message);
}

/// Not found failures (404)
class NotFoundFailure extends Failure {
  const NotFoundFailure(String message) : super(message, 404);
}

/// Unauthorized failures (401)
class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure(String message) : super(message, 401);
}

/// Unknown/Generic failures
class UnknownFailure extends Failure {
  const UnknownFailure(String message, [int? code]) : super(message, code);
}

/// Gallery limit exceeded failure (max 20 images)
class GalleryLimitExceededFailure extends Failure {
  const GalleryLimitExceededFailure() 
      : super('Bạn đã đạt giới hạn 20 ảnh trong thư viện');
}

/// Timeline limit exceeded failure (max 10 events)
class TimelineLimitExceededFailure extends Failure {
  const TimelineLimitExceededFailure() 
      : super('Bạn đã đạt giới hạn 10 sự kiện trong dòng thời gian');
}

/// Audio duration exceeded failure (max 60 seconds)
class AudioDurationExceededFailure extends Failure {
  const AudioDurationExceededFailure() 
      : super('Ghi âm không được vượt quá 1 phút');
}

/// Deck exhausted failure (all cards drawn)
class DeckExhaustedFailure extends Failure {
  const DeckExhaustedFailure() 
      : super('Đã rút hết bài. Vui lòng xáo bài để chơi tiếp');
}

/// Invalid PIN failure (not 6 digits)
class InvalidPinFailure extends Failure {
  const InvalidPinFailure() 
      : super('PIN phải có đúng 6 chữ số');
}

// Type aliases for compatibility
typedef NotFoundException = NotFoundFailure;
typedef UnauthorizedException = UnauthorizedFailure;
