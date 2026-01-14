import 'package:equatable/equatable.dart';
import '../../../data/models/time_capsule_model.dart';

/// Base class for TimeCapsuleBloc events
abstract class TimeCapsuleEvent extends Equatable {
  const TimeCapsuleEvent();

  @override
  List<Object?> get props => [];
}

/// Load time capsules for a link
class LoadCapsules extends TimeCapsuleEvent {
  final String linkId;

  const LoadCapsules(this.linkId);

  @override
  List<Object?> get props => [linkId];
}

/// Check lock status for a specific capsule
class CheckLockStatus extends TimeCapsuleEvent {
  final String capsuleId;

  const CheckLockStatus(this.capsuleId);

  @override
  List<Object?> get props => [capsuleId];
}

/// Open a capsule with response
class OpenCapsule extends TimeCapsuleEvent {
  final String capsuleId;
  final String response;

  const OpenCapsule({
    required this.capsuleId,
    required this.response,
  });

  @override
  List<Object?> get props => [capsuleId, response];
}

/// Create a new capsule
class CreateCapsule extends TimeCapsuleEvent {
  final TimeCapsuleModel capsule;

  const CreateCapsule(this.capsule);

  @override
  List<Object?> get props => [capsule];
}

/// Delete a capsule
class DeleteCapsule extends TimeCapsuleEvent {
  final String capsuleId;

  const DeleteCapsule(this.capsuleId);

  @override
  List<Object?> get props => [capsuleId];
}
