/// Check if time capsule is locked based on server time
class CheckCapsuleLockStatusUseCase {
  /// Check if capsule is locked
  /// Returns true if locked (currentTime < openDate)
  /// Returns false if unlocked (currentTime >= openDate)
  bool call({
    required DateTime openDate,
    required DateTime serverTime,
  }) {
    // Capsule is locked if current time is before open date
    return serverTime.isBefore(openDate);
  }

  /// Get time remaining until unlock
  /// Returns null if already unlocked
  Duration? getTimeRemaining({
    required DateTime openDate,
    required DateTime serverTime,
  }) {
    if (!call(openDate: openDate, serverTime: serverTime)) {
      return null; // Already unlocked
    }

    return openDate.difference(serverTime);
  }
}
