import 'package:equatable/equatable.dart';

/// Base class for CounterBloc events
abstract class CounterEvent extends Equatable {
  const CounterEvent();

  @override
  List<Object?> get props => [];
}

/// Start counter with target date
class StartCounter extends CounterEvent {
  final DateTime targetDate;
  final bool isCountUp;

  const StartCounter({
    required this.targetDate,
    required this.isCountUp,
  });

  @override
  List<Object?> get props => [targetDate, isCountUp];
}

/// Update counter (triggered by timer)
class UpdateCounter extends CounterEvent {
  const UpdateCounter();
}

/// Stop counter
class StopCounter extends CounterEvent {
  const StopCounter();
}
