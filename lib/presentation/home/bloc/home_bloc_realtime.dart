import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../data/models/profile_model.dart';

// Events
abstract class HomeEvent extends Equatable {
  const HomeEvent();
  
  @override
  List<Object?> get props => [];
}

class LoadProfile extends HomeEvent {
  final String linkId;
  const LoadProfile(this.linkId);
  
  @override
  List<Object?> get props => [linkId];
}

class ProfileUpdated extends HomeEvent {
  final ProfileModel profile;
  const ProfileUpdated(this.profile);
  
  @override
  List<Object?> get props => [profile];
}

class StartRealtimeSync extends HomeEvent {
  final String linkId;
  const StartRealtimeSync(this.linkId);
  
  @override
  List<Object?> get props => [linkId];
}

class StopRealtimeSync extends HomeEvent {
  const StopRealtimeSync();
}

// States
abstract class HomeState extends Equatable {
  const HomeState();
  
  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  final ProfileModel profile;
  final bool isSyncing;
  
  const HomeLoaded(this.profile, {this.isSyncing = false});
  
  @override
  List<Object?> get props => [profile, isSyncing];
}

class HomeError extends HomeState {
  final String message;
  const HomeError(this.message);
  
  @override
  List<Object?> get props => [message];
}

// BLoC
class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final SupabaseClient _supabase;
  StreamSubscription? _profileStreamSubscription;
  String? _currentLinkId;

  HomeBloc({SupabaseClient? supabase})
      : _supabase = supabase ?? Supabase.instance.client,
        super(HomeInitial()) {
    on<LoadProfile>(_onLoadProfile);
    on<ProfileUpdated>(_onProfileUpdated);
    on<StartRealtimeSync>(_onStartRealtimeSync);
    on<StopRealtimeSync>(_onStopRealtimeSync);
  }

  Future<void> _onLoadProfile(
    LoadProfile event,
    Emitter<HomeState> emit,
  ) async {
    emit(HomeLoading());
    
    try {
      final data = await _supabase
          .from('profiles')
          .select()
          .eq('link_id', event.linkId)
          .single();
      
      final profile = ProfileModel.fromJson(data);
      emit(HomeLoaded(profile));
      
      // Auto-start realtime sync
      add(StartRealtimeSync(event.linkId));
    } catch (e) {
      emit(HomeError('Không thể tải profile: ${e.toString()}'));
    }
  }

  void _onProfileUpdated(
    ProfileUpdated event,
    Emitter<HomeState> emit,
  ) {
    // Emit updated profile with syncing flag
    emit(HomeLoaded(event.profile, isSyncing: true));
    
    // Reset syncing flag after animation
    Future.delayed(const Duration(milliseconds: 500), () {
      if (!isClosed && state is HomeLoaded) {
        emit(HomeLoaded(event.profile, isSyncing: false));
      }
    });
  }

  Future<void> _onStartRealtimeSync(
    StartRealtimeSync event,
    Emitter<HomeState> emit,
  ) async {
    // Cancel existing subscription
    await _profileStreamSubscription?.cancel();
    
    _currentLinkId = event.linkId;
    
    // Start listening to realtime changes
    _profileStreamSubscription = _supabase
        .from('profiles')
        .stream(primaryKey: ['id'])
        .eq('link_id', event.linkId)
        .listen((data) {
          if (data.isNotEmpty) {
            final profile = ProfileModel.fromJson(data.first);
            
            // Check if anniversary_date or music_url changed
            if (state is HomeLoaded) {
              final currentProfile = (state as HomeLoaded).profile;
              
              final anniversaryChanged = 
                  profile.anniversaryDate != currentProfile.anniversaryDate;
              final musicChanged = 
                  profile.musicUrl != currentProfile.musicUrl;
              
              if (anniversaryChanged || musicChanged) {
                print('🔄 Realtime update detected!');
                if (anniversaryChanged) {
                  print('  - Anniversary date changed: ${profile.anniversaryDate}');
                }
                if (musicChanged) {
                  print('  - Music URL changed: ${profile.musicUrl}');
                }
                
                // Emit event to update UI
                add(ProfileUpdated(profile));
              }
            } else {
              // Initial data, just update
              add(ProfileUpdated(profile));
            }
          }
        });
  }

  void _onStopRealtimeSync(
    StopRealtimeSync event,
    Emitter<HomeState> emit,
  ) {
    _profileStreamSubscription?.cancel();
    _profileStreamSubscription = null;
    _currentLinkId = null;
  }

  @override
  Future<void> close() {
    _profileStreamSubscription?.cancel();
    return super.close();
  }
}
