import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:audioplayers/audioplayers.dart';
import '../providers/music_player_provider.dart';

/// Music FAB with rotation animation
class MusicFAB extends ConsumerStatefulWidget {
  final String? musicUrl;
  final Color color;

  const MusicFAB({
    super.key,
    this.musicUrl,
    required this.color,
  });

  @override
  ConsumerState<MusicFAB> createState() => _MusicFABState();
}

class _MusicFABState extends ConsumerState<MusicFAB>
    with SingleTickerProviderStateMixin {
  late AnimationController _rotationController;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _rotationController.dispose();
    super.dispose();
  }

  Future<void> _toggleMusic() async {
    if (widget.musicUrl == null || widget.musicUrl!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Chưa có nhạc nền'),
          backgroundColor: Colors.orangeAccent,
        ),
      );
      return;
    }

    final player = ref.read(audioPlayerProvider);
    final isPlaying = ref.read(isPlayingMusicProvider);

    try {
      if (isPlaying) {
        // Stop music
        await player.stop();
        _rotationController.stop();
        _rotationController.reset();
        ref.read(isPlayingMusicProvider.notifier).state = false;
      } else {
        // Play music
        await player.play(UrlSource(widget.musicUrl!));
        await player.setReleaseMode(ReleaseMode.loop); // Loop music
        _rotationController.repeat();
        ref.read(isPlayingMusicProvider.notifier).state = true;
        ref.read(currentMusicUrlProvider.notifier).state = widget.musicUrl;
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi phát nhạc: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPlaying = ref.watch(isPlayingMusicProvider);

    // Sync rotation with playing state
    if (isPlaying && !_rotationController.isAnimating) {
      _rotationController.repeat();
    } else if (!isPlaying && _rotationController.isAnimating) {
      _rotationController.stop();
      _rotationController.reset();
    }

    return RotationTransition(
      turns: _rotationController,
      child: FloatingActionButton(
        onPressed: _toggleMusic,
        backgroundColor: widget.color,
        child: Icon(
          isPlaying ? Icons.pause : Icons.music_note,
          color: Colors.white,
        ),
      ),
    );
  }
}
