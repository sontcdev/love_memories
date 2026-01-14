import 'package:equatable/equatable.dart';
import '../../../domain/entities/duration_info.dart';

/// Base class for CounterBloc states
abstract class CounterState extends Equatable {
  const CounterState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class CounterInitial extends CounterState {
  const CounterInitial();
}

/// Counter is running with current duration
class CounterRunning extends CounterState {
  final DurationInfo duration;
  final DateTime targetDate;
  final bool isCountUp;

  const CounterRunning({
    required this.duration,
    required this.targetDate,
    required this.isCountUp,
  });

  @override
  List<Object?> get props => [duration, targetDate, isCountUp];
}

/// Counter stopped
class CounterStopped extends CounterState {
  const CounterStopped();
}
