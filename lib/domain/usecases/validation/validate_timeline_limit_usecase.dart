import 'package:dartz/dartz.dart';
import '../../../core/error/failures.dart';

/// Validate timeline event count limit (max 10 events)
class ValidateTimelineLimitUseCase {
  /// Maximum number of timeline events allowed
  static const int maxEvents = 10;

  /// Call the use case
  /// Returns Right(true) if within limit, Left(Failure) if exceeded
  Either<Failure, bool> call(int currentEventCount) {
    if (currentEventCount >= maxEvents) {
      return const Left(TimelineLimitExceededFailure());
    }
    return const Right(true);
  }
}
