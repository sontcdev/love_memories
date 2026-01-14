import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/counter/calculate_duration_usecase.dart';
import 'counter_event.dart';
import 'counter_state.dart';

/// CounterBloc calculates real-time duration (Days/Hours/Minutes/Seconds)
/// for count-up (from past) and count-down (to future)
class CounterBloc extends Bloc<CounterEvent, CounterState> {
  final CalculateDurationUseCase _calculateDurationUseCase;
  Timer? _timer;
  DateTime? _targetDate;
  bool? _isCountUp;

  CounterBloc({
    CalculateDurationUseCase? calculateDurationUseCase,
  })  : _calculateDurationUseCase =
            calculateDurationUseCase ?? CalculateDurationUseCase(),
        super(const CounterInitial()) {
    on<StartCounter>(_onStartCounter);
    on<UpdateCounter>(_onUpdateCounter);
    on<StopCounter>(_onStopCounter);
  }

  Future<void> _onStartCounter(
    StartCounter event,
    Emitter<CounterState> emit,
  ) async {
    // Cancel existing timer if any
    _timer?.cancel();

    // Store target date and count direction
    _targetDate = event.targetDate;
    _isCountUp = event.isCountUp;

    // Calculate initial duration
    final duration = _calculateDurationUseCase(
      targetDate: event.targetDate,
      isCountUp: event.isCountUp,
    );

    emit(CounterRunning(
      duration: duration,
      targetDate: event.targetDate,
      isCountUp: event.isCountUp,
    ));

    // Start timer to update every second
    _timer = Timer.periodic(
      const Duration(seconds: 1),
      (_) => add(const UpdateCounter()),
    );
  }

  Future<void> _onUpdateCounter(
    UpdateCounter event,
    Emitter<CounterState> emit,
  ) async {
    if (_targetDate == null || _isCountUp == null) return;

    // Calculate new duration
    final duration = _calculateDurationUseCase(
      targetDate: _targetDate!,
      isCountUp: _isCountUp!,
    );

    emit(CounterRunning(
      duration: duration,
      targetDate: _targetDate!,
      isCountUp: _isCountUp!,
    ));
  }

  Future<void> _onStopCounter(
    StopCounter event,
    Emitter<CounterState> emit,
  ) async{
    // Cancel timer
    _timer?.cancel();
    _timer = null;
    _targetDate = null;
    _isCountUp = null;

    emit(const CounterStopped());
  }

  @override
  Future<void> close() {
    _timer?.cancel();
    return super.close();
  }
}
