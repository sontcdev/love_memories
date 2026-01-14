import 'package:flutter/material.dart';
import '../services/youtube_background_service.dart';

/// Overlay icon for unmuting when browser auto-pauses
/// Shows in bottom-right corner with semi-transparent background
class MuteIconOverlay extends StatelessWidget {
  const MuteIconOverlay({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: YoutubeBackgroundService.instance,
      builder: (context, child) {
        // Only show when mute icon should be visible
        if (!YoutubeBackgroundService.instance.showMuteIcon) {
          return const SizedBox.shrink();
        }

        return Positioned(
          bottom: 80, // Above navigation bar
          right: 16,
          child: GestureDetector(
            onTap: () {
              YoutubeBackgroundService.instance.unmute();
            },
            child: AnimatedOpacity(
              opacity: YoutubeBackgroundService.instance.showMuteIcon ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 300),
              child: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.7),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.volume_off_rounded,
                  color: Colors.white,
                  size: 24,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
