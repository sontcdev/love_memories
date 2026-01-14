import 'package:flutter/material.dart';
import '../core/services/server_time_service.dart';
import '../data/models/time_capsule_model.dart';

/// Example usage of Server Time Service for Time Capsule validation
class TimeCapsuleServerTimeExample {
  final ServerTimeService _serverTimeService = ServerTimeService();

  /// Check if time capsule is locked using server time
  Future<bool> isCapsuleLocked(TimeCapsuleModel capsule) async {
    // Get accurate server time (not device time)
    final serverTime = await _serverTimeService.getServerTime();

    // Compare with open_date
    final isLocked = serverTime.isBefore(capsule.openDate);

    debugPrint('Server time: $serverTime');
    debugPrint('Open date: ${capsule.openDate}');
    debugPrint('Is locked: $isLocked');

    return isLocked;
  }

  /// Get time remaining until unlock
  Future<Duration?> getTimeRemaining(TimeCapsuleModel capsule) async {
    final serverTime = await _serverTimeService.getServerTime();

    if (serverTime.isAfter(capsule.openDate)) {
      return null; // Already unlocked
    }

    return capsule.openDate.difference(serverTime);
  }

  /// Fetch capsule content only if unlocked
  Future<TimeCapsuleModel?> fetchCapsuleIfUnlocked(
    TimeCapsuleModel capsule,
  ) async {
    // Check lock status with server time
    final isLocked = await isCapsuleLocked(capsule);

    if (isLocked) {
      // Don't fetch content, show locked message
      final timeRemaining = await getTimeRemaining(capsule);
      debugPrint('⏰ Locked! Time remaining: $timeRemaining');
      return null;
    }

    // Unlocked! Can fetch full content
    debugPrint('✅ Unlocked! Fetching content...');
    return capsule;
  }

  /// Format time remaining for UI display
  Future<String> getTimeRemainingText(TimeCapsuleModel capsule) async {
    final remaining = await getTimeRemaining(capsule);

    if (remaining == null) {
      return 'Đã mở khóa';
    }

    final days = remaining.inDays;
    final hours = remaining.inHours % 24;
    final minutes = remaining.inMinutes % 60;

    if (days > 0) {
      return 'Còn $days ngày $hours giờ';
    } else if (hours > 0) {
      return 'Còn $hours giờ $minutes phút';
    } else {
      return 'Còn $minutes phút';
    }
  }
}

/// Widget example showing locked/unlocked state
class TimeCapsuleCard extends StatelessWidget {
  final TimeCapsuleModel capsule;
  final bool isLocked;
  final String? timeRemaining;

  const TimeCapsuleCard({
    super.key,
    required this.capsule,
    required this.isLocked,
    this.timeRemaining,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Text(
              capsule.title,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),

            // Lock status
            if (isLocked) ...[
              Row(
                children: [
                  const Icon(Icons.lock, color: Colors.orange),
                  const SizedBox(width: 8),
                  Text(
                    'Đang khóa',
                    style: TextStyle(color: Colors.orange.shade700),
                  ),
                ],
              ),
              if (timeRemaining != null) Text('⏱️ $timeRemaining'),
            ] else ...[
              Row(
                children: [
                  const Icon(Icons.lock_open, color: Colors.green),
                  const SizedBox(width: 8),
                  Text(
                    'Đã mở',
                    style: TextStyle(color: Colors.green.shade700),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Show content only if unlocked
              Text(capsule.content),
            ],
          ],
        ),
      ),
    );
  }
}
