import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/admin_bloc.dart';
import '../bloc/admin_event.dart';
import '../bloc/admin_state.dart';

/// Admin Dashboard Page
class AdminDashboardPage extends StatelessWidget {
  const AdminDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AdminBloc()..add(const LoadAdminData()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Quản Trị'),
        ),
        body: BlocBuilder<AdminBloc, AdminState>(
          builder: (context, state) {
            if (state is AdminLoading) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }

            if (state is AdminError) {
              return Center(
                child: Text(
                  'Lỗi: ${state.message}',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.error,
                  ),
                ),
              );
            }

            if (state is AdminLoaded) {
              return Center(
                child: Text(
                  'Admin Dashboard',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
              );
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}
