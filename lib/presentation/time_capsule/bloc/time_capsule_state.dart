import 'package:equatable/equatable.dart';
import '../../../data/models/time_capsule_model.dart';

/// Base class for TimeCapsuleBloc states
abstract class TimeCapsuleState extends Equatable {
  const TimeCapsuleState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class TimeCapsuleInitial extends TimeCapsuleState {
  const TimeCapsuleInitial();
}

/// Loading capsules
class TimeCapsuleLoading extends TimeCapsuleState {
  const TimeCapsuleLoading();
}

/// Capsules loaded with lock status map
class CapsulesLoaded extends TimeCapsuleState {
  final List<TimeCapsuleModel> capsules;
  final Map<String, bool> lockStatus; // capsuleId -> isLocked
  final DateTime serverTime;

  const CapsulesLoaded({
    required this.capsules,
    required this.lockStatus,
    required this.serverTime,
  });

  @override
  List<Object?> get props => [capsules, lockStatus, serverTime];
}

/// Capsule is locked (cannot view content)
class CapsuleLocked extends TimeCapsuleState {
  final String capsuleId;
  final String message;
  final Duration? timeRemaining;

  const CapsuleLocked({
    required this.capsuleId,
    required this.message,
    this.timeRemaining,
  });

  @override
  List<Object?> get props => [capsuleId, message, timeRemaining];
}

/// Capsule is unlocked (can view content)
class CapsuleUnlocked extends TimeCapsuleState {
  final TimeCapsuleModel capsule;

  const CapsuleUnlocked(this.capsule);

  @override
  List<Object?> get props => [capsule];
}

/// Capsule opened successfully with response
class CapsuleOpened extends TimeCapsuleState {
  final TimeCapsuleModel capsule;

  const CapsuleOpened(this.capsule);

  @override
  List<Object?> get props => [capsule];
}

/// Error state
class TimeCapsuleError extends TimeCapsuleState {
  final String message;

  const TimeCapsuleError(this.message);

  @override
  List<Object?> get props => [message];
}
