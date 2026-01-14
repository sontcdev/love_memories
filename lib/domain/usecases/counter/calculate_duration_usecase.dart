import '../../entities/duration_info.dart';

/// Calculate duration between dates for counter display
class CalculateDurationUseCase {
  /// Calculate duration from target date to now (count up) or now to target date (count down)
  DurationInfo call({
    required DateTime targetDate,
    required bool isCountUp,
  }) {
    final now = DateTime.now();
    final Duration duration;

    if (isCountUp) {
      // Count up from past to present
      duration = now.difference(targetDate);
    } else {
      // Count down from present to future
      duration = targetDate.difference(now);
    }

    return DurationInfo.fromDuration(
      duration,
      isCountDown: !isCountUp,
    );
  }
}
