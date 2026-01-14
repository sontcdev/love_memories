/// Example usage of YoutubeBackgroundService
/// 
/// This file demonstrates how to use the YouTube background service
/// in features like TimeCapsule or Letter opening.

import 'package:flutter/material.dart';
import '../core/services/youtube_background_service.dart';
import '../core/utils/youtube_utils.dart';

/// Example: Opening a letter with YouTube background music
class LetterOpeningExample extends StatelessWidget {
  final String youtubeUrl;

  const LetterOpeningExample({
    super.key,
    required this.youtubeUrl,
  });

  void _onOpenLetter() {
    // Extract video ID from URL
    final videoId = YoutubeUtils.extractVideoId(youtubeUrl);

    if (videoId != null) {
      // Play video with overlay trigger
      // autoplay=1, loop=1, mute=0
      YoutubeBackgroundService.instance.playWithOverlayTrigger(
        videoId: videoId,
        onPlay: () {
          print('🎵 Background music started');
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mở thư')),
      body: Center(
        child: ElevatedButton(
          onPressed: _onOpenLetter,
          child: const Text('Mở thư với nhạc nền'),
        ),
      ),
    );
  }
}

/// Example: Time Capsule with YouTube video
class TimeCapsuleExample extends StatelessWidget {
  final String youtubeUrl;

  const TimeCapsuleExample({
    super.key,
    required this.youtubeUrl,
  });

  void _onOpenCapsule() {
    final videoId = YoutubeUtils.extractVideoId(youtubeUrl);

    if (videoId != null) {
      // Play background music when opening time capsule
      YoutubeBackgroundService.instance.playWithOverlayTrigger(
        videoId: videoId,
        onPlay: () {
          print('🎵 Time capsule music started playing');
        },
      );
    }
  }

  void _onCloseCapsule() {
    // Stop background music when closing
    YoutubeBackgroundService.instance.stop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hộp thời gian'),
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              _onCloseCapsule();
              Navigator.pop(context);
            },
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Nội dung hộp thời gian'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _onOpenCapsule,
              child: const Text('Phát nhạc nền'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Example: Manual control of playback
class ManualControlExample extends StatefulWidget {
  const ManualControlExample({super.key});

  @override
  State<ManualControlExample> createState() => _ManualControlExampleState();
}

class _ManualControlExampleState extends State<ManualControlExample> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Điều khiển phát nhạc')),
      body: ListenableBuilder(
        listenable: YoutubeBackgroundService.instance,
        builder: (context, child) {
          final service = YoutubeBackgroundService.instance;

          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  service.isPlaying ? 'Đang phát' : 'Đã dừng',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 20),
                if (service.currentVideoId != null)
                  Text('Video ID: ${service.currentVideoId}'),
                const SizedBox(height: 40),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton(
                      onPressed: service.isPlaying ? service.pause : service.resume,
                      child: Text(service.isPlaying ? 'Tạm dừng' : 'Tiếp tục'),
                    ),
                    const SizedBox(width: 16),
                    ElevatedButton(
                      onPressed: service.stop,
                      child: const Text('Dừng'),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
