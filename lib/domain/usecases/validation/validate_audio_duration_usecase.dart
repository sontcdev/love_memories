import 'package:dartz/dartz.dart';
import '../../../core/error/failures.dart';

/// Validate audio duration (max 60 seconds)
class ValidateAudioDurationUseCase {
  /// Maximum audio duration in seconds (1 minute)
  static const int maxDurationSeconds = 60;

  /// Call the use case
  /// Returns Right(true) if within limit, Left(Failure) if exceeded
  Either<Failure, bool> call(int durationInSeconds) {
    if (durationInSeconds > maxDurationSeconds) {
      return const Left(AudioDurationExceededFailure());
    }
    return const Right(true);
  }
}
