import 'package:equatable/equatable.dart';

/// Duration information for counter display
class DurationInfo extends Equatable {
  /// Number of days
  final int days;

  /// Number of hours (0-23)
  final int hours;

  /// Number of minutes (0-59)
  final int minutes;

  /// Number of seconds (0-59)
  final int seconds;

  /// Whether counting down to future date
  final bool isCountDown;

  const DurationInfo({
    required this.days,
    required this.hours,
    required this.minutes,
    required this.seconds,
    required this.isCountDown,
  });

  /// Create from Duration
  factory DurationInfo.fromDuration(Duration duration, {required bool isCountDown}) {
    final totalSeconds = duration.inSeconds.abs();
    final days = totalSeconds ~/ 86400;
    final hours = (totalSeconds % 86400) ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;

    return DurationInfo(
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      isCountDown: isCountDown,
    );
  }

  /// Format as string (e.g., "365 ngày 12 giờ 30 phút")
  String get formatted {
    final parts = <String>[];
    
    if (days > 0) parts.add('$days ngày');
    if (hours > 0) parts.add('$hours giờ');
    if (minutes > 0) parts.add('$minutes phút');
    
    return parts.isEmpty ? '0 phút' : parts.join(' ');
  }

  /// Format with seconds (e.g., "365 ngày 12 giờ 30 phút 45 giây")
  String get formattedWithSeconds {
    final parts = <String>[];
    
    if (days > 0) parts.add('$days ngày');
    if (hours > 0) parts.add('$hours giờ');
    if (minutes > 0) parts.add('$minutes phút');
    if (seconds > 0 || parts.isEmpty) parts.add('$seconds giây');
    
    return parts.join(' ');
  }

  @override
  List<Object?> get props => [days, hours, minutes, seconds, isCountDown];
}
