import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/home_bloc_realtime.dart';

/// Example usage of HomeBloc with Realtime Sync

class HomePageWithRealtimeSync extends StatelessWidget {
  final String linkId;

  const HomePageWithRealtimeSync({
    super.key,
    required this.linkId,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => HomeBloc()
        ..add(LoadProfile(linkId)), // Auto-starts realtime sync
      child: Scaffold(
        appBar: AppBar(title: const Text('Home')),
        body: BlocBuilder<HomeBloc, HomeState>(
          builder: (context, state) {
            if (state is HomeLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is HomeError) {
              return Center(child: Text(state.message));
            }

            if (state is HomeLoaded) {
              return _buildContent(context, state);
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, HomeLoaded state) {
    return Column(
      children: [
        // Sync indicator
        if (state.isSyncing)
          Container(
            color: Colors.green.shade100,
            padding: const EdgeInsets.all(8),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.sync, color: Colors.green, size: 16),
                SizedBox(width: 8),
                Text('Đã cập nhật!', style: TextStyle(color: Colors.green)),
              ],
            ),
          ),

        // Profile content
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Anniversary Date',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Text(
                  state.profile.anniversaryDate?.toString() ?? 'Not set',
                ),
                const SizedBox(height: 16),

                Text(
                  'Music URL',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Text(
                  state.profile.musicUrl ?? 'Not set',
                ),
                const SizedBox(height: 16),

                // Other profile info...
                Text('Partner 1: ${state.profile.partnerName1}'),
                Text('Partner 2: ${state.profile.partnerName2}'),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ============================================================================
// HOW IT WORKS
// ============================================================================

/// Realtime Sync Flow:
///
/// 1. User opens HomePageWithRealtimeSync
///    ↓
/// 2. BlocProvider creates HomeBloc
///    ↓
/// 3. LoadProfile(linkId) event is dispatched
///    ↓
/// 4. HomeBloc loads profile from Supabase
///    ↓
/// 5. StartRealtimeSync(linkId) is auto-dispatched
///    ↓
/// 6. Stream listener is set up:
///    supabase.from('profiles').stream(primaryKey: ['id']).eq('link_id', linkId)
///    ↓
/// 7. Owner updates anniversary_date or music_url on another device
///    ↓
/// 8. Supabase broadcasts change
///    ↓
/// 9. Stream listener receives update
///    ↓
/// 10. HomeBloc compares old vs new values
///    ↓
/// 11. If anniversary_date or music_url changed:
///     - ProfileUpdated event is dispatched
///     ↓
/// 12. HomeLoaded state emitted with isSyncing: true
///     ↓
/// 13. UI shows green sync indicator
///     ↓
/// 14. After 500ms, isSyncing: false
///     ↓
/// 15. Sync indicator fades out

// ============================================================================
// MANUAL CONTROL
// ============================================================================

class ManualRealtimeSyncExample extends StatelessWidget {
  const ManualRealtimeSyncExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manual Sync Control'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: () {
              // Manually start sync
              context.read<HomeBloc>().add(const StartRealtimeSync('link-id'));
            },
          ),
          IconButton(
            icon: const Icon(Icons.sync_disabled),
            onPressed: () {
              // Stop sync
              context.read<HomeBloc>().add(const StopRealtimeSync());
            },
          ),
        ],
      ),
      body: BlocBuilder<HomeBloc, HomeState>(
        builder: (context, state) {
          if (state is HomeLoaded) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Anniversary: ${state.profile.anniversaryDate}'),
                  Text('Music: ${state.profile.musicUrl}'),
                  if (state.isSyncing)
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(),
                    ),
                ],
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}

// ============================================================================
// TESTING REALTIME SYNC
// ============================================================================

/// To test realtime sync:
///
/// 1. Open app on Device A (Guest view)
/// 2. Open app on Device B (Owner edit mode)
/// 3. On Device B, change anniversary_date
/// 4. Device A should show green sync indicator automatically
/// 5. Anniversary date on Device A updates without refresh
///
/// Same for music_url changes!
