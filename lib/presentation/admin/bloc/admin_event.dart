import 'package:equatable/equatable.dart';

/// Events for Admin Bloc
abstract class AdminEvent extends Equatable {
  const AdminEvent();

  @override
  List<Object?> get props => [];
}

/// Load admin data event
class LoadAdminData extends AdminEvent {
  const LoadAdminData();
}

/// Refresh admin data event
class RefreshAdminData extends AdminEvent {
  const RefreshAdminData();
}
