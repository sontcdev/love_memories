import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/datasources/remote/time_capsule_remote_datasource.dart';
import '../../../domain/usecases/time_capsule/check_capsule_lock_status_usecase.dart';
import 'time_capsule_event.dart';
import 'time_capsule_state.dart';

/// TimeCapsuleBloc handles lock/unlock logic based on server time (GMT+7)
class TimeCapsuleBloc extends Bloc<TimeCapsuleEvent, TimeCapsuleState> {
  final TimeCapsuleRemoteDataSource _capsuleDataSource;
  final CheckCapsuleLockStatusUseCase _checkLockStatusUseCase;

  TimeCapsuleBloc({
    TimeCapsuleRemoteDataSource? capsuleDataSource,
    CheckCapsuleLockStatusUseCase? checkLockStatusUseCase,
  })  : _capsuleDataSource =
            capsuleDataSource ?? TimeCapsuleRemoteDataSource(),
        _checkLockStatusUseCase =
            checkLockStatusUseCase ?? CheckCapsuleLockStatusUseCase(),
        super(const TimeCapsuleInitial()) {
    on<LoadCapsules>(_onLoadCapsules);
    on<CheckLockStatus>(_onCheckLockStatus);
    on<OpenCapsule>(_onOpenCapsule);
    on<CreateCapsule>(_onCreateCapsule);
    on<DeleteCapsule>(_onDeleteCapsule);
  }

  Future<void> _onLoadCapsules(
    LoadCapsules event,
    Emitter<TimeCapsuleState> emit,
  ) async {
    emit(const TimeCapsuleLoading());

    try {
      // Load capsules from datasource
      final capsules = await _capsuleDataSource.getCapsules(event.linkId);

      // Get current server time (GMT+7)
      // TODO: Fetch actual server time from API
      final serverTime = DateTime.now().toUtc().add(const Duration(hours: 7));

      // Check lock status for each capsule
      final lockStatus = <String, bool>{};
      for (final capsule in capsules) {
        final isLocked = _checkLockStatusUseCase(
          openDate: capsule.openDate,
          serverTime: serverTime,
        );
        lockStatus[capsule.id] = isLocked;
      }

      emit(CapsulesLoaded(
        capsules: capsules,
        lockStatus: lockStatus,
        serverTime: serverTime,
      ));
    } catch (e) {
      emit(TimeCapsuleError('Không thể tải hộp thời gian: ${e.toString()}'));
    }
  }

  Future<void> _onCheckLockStatus(
    CheckLockStatus event,
    Emitter<TimeCapsuleState> emit,
  ) async {
    // Get current state
    if (state is! CapsulesLoaded) return;

    final currentState = state as CapsulesLoaded;

    // Find the capsule
    final capsule = currentState.capsules
        .firstWhere((c) => c.id == event.capsuleId, orElse: () => throw Exception('Capsule not found'));

    // Check lock status
    final isLocked = _checkLockStatusUseCase(
      openDate: capsule.openDate,
      serverTime: currentState.serverTime,
    );

    if (isLocked) {
      // Get time remaining
      final timeRemaining = _checkLockStatusUseCase.getTimeRemaining(
        openDate: capsule.openDate,
        serverTime: currentState.serverTime,
      );

      emit(CapsuleLocked(
        capsuleId: event.capsuleId,
        message: 'Hộp thời gian vẫn còn khóa. Vui lòng quay lại sau.',
        timeRemaining: timeRemaining,
      ));
    } else {
      emit(CapsuleUnlocked(capsule));
    }
  }

  Future<void> _onOpenCapsule(
    OpenCapsule event,
    Emitter<TimeCapsuleState> emit,
  ) async {
    emit(const TimeCapsuleLoading());

    try {
      // Open capsule with response
      final openedCapsule = await _capsuleDataSource.openCapsule(
        event.capsuleId,
        event.response,
      );

      emit(CapsuleOpened(openedCapsule));
    } catch (e) {
      emit(TimeCapsuleError('Không thể mở hộp thời gian: ${e.toString()}'));
    }
  }

  Future<void> _onCreateCapsule(
    CreateCapsule event,
    Emitter<TimeCapsuleState> emit,
  ) async {
    emit(const TimeCapsuleLoading());

    try {
      // Create new capsule
      await _capsuleDataSource.createCapsule(event.capsule);

      // Note: In real implementation, reload capsules or optimistically update list
    } catch (e) {
      emit(TimeCapsuleError('Không thể tạo hộp thời gian: ${e.toString()}'));
    }
  }

  Future<void> _onDeleteCapsule(
    DeleteCapsule event,
    Emitter<TimeCapsuleState> emit,
  ) async {
    emit(const TimeCapsuleLoading());

    try {
      // Delete capsule
      await _capsuleDataSource.deleteCapsule(event.capsuleId);

      // Note: In real implementation, reload capsules or optimistically update list
    } catch (e) {
      emit(TimeCapsuleError('Không thể xóa hộp thời gian: ${e.toString()}'));
    }
  }
}
