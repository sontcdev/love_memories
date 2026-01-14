import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import '../services/youtube_background_service.dart';

/// Hidden YouTube player widget (1x1 pixel, positioned offscreen)
/// Used for background audio playback
class YoutubeBackgroundPlayer extends StatelessWidget {
  const YoutubeBackgroundPlayer({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: YoutubeBackgroundService.instance,
      builder: (context, child) {
        final controller = YoutubeBackgroundService.instance.controller;

        // Don't render if no controller
        if (controller == null) {
          return const SizedBox.shrink();
        }

        // Render hidden player (offscreen, 1x1 pixel)
        return Positioned(
          left: -1000, // Offscreen left
          top: -1000, // Offscreen top
          child: SizedBox(
            width: 1, // 1 pixel wide
            height: 1, // 1 pixel tall
            child: YoutubePlayer(
              controller: controller,
              showVideoProgressIndicator: false,
              progressIndicatorColor: Colors.transparent,
              progressColors: const ProgressBarColors(
                playedColor: Colors.transparent,
                handleColor: Colors.transparent,
              ),
              onReady: () {
                debugPrint('🎵 YouTube player ready');
              },
              onEnded: (metadata) {
                debugPrint('🎵 Video ended (should loop)');
              },
            ),
          ),
        );
      },
    );
  }
}
