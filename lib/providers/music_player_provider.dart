import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Audio player instance provider
final audioPlayerProvider = Provider((ref) {
  final player = AudioPlayer();
  ref.onDispose(() {
    player.dispose();
  });
  return player;
});

/// Is playing state provider
final isPlayingMusicProvider = StateProvider<bool>((ref) => false);

/// Current music URL provider
final currentMusicUrlProvider = StateProvider<String?>((ref) => null);
