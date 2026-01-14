import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

/// Singleton service for YouTube background playback
/// Manages hidden player with overlay trigger and auto-pause detection
class YoutubeBackgroundService extends ChangeNotifier {
  static final YoutubeBackgroundService _instance =
      YoutubeBackgroundService._internal();
  static YoutubeBackgroundService get instance => _instance;

  YoutubePlayerController? _controller;
  YoutubePlayerController? get controller => _controller;

  bool _showMuteIcon = false;
  bool get showMuteIcon => _showMuteIcon;

  bool _isPlaying = false;
  bool get isPlaying => _isPlaying;

  String? _currentVideoId;
  String? get currentVideoId => _currentVideoId;

  bool _userPaused = false;
  bool _initialized = false;

  YoutubeBackgroundService._internal();

  /// Play video with overlay trigger
  /// Parameters: autoplay=1, loop=1, mute=0
  Future<void> playWithOverlayTrigger({
    required String videoId,
    VoidCallback? onPlay,
  }) async {
    try {
      // Dispose old controller if exists
      if (_controller != null) {
        _controller!.dispose();
      }

      _currentVideoId = videoId;
      _userPaused = false;
      _showMuteIcon = false;

      // Create new controller with specific flags
      _controller = YoutubePlayerController(
        initialVideoId: videoId,
        flags: const YoutubePlayerFlags(
          autoPlay: true, // autoplay=1
          mute: false, // mute=0 (audio enabled)
          loop: true, // loop=1
          hideControls: true, // Hide controls
          enableCaption: false,
          isLive: false,
          forceHD: false,
          showLiveFullscreenButton: false,
        ),
      );

      _initialized = true;

      // Setup listener for auto-pause detection
      _setupAutoPlayListener();

      // Notify callback
      onPlay?.call();

      _isPlaying = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error playing video: $e');
    }
  }

  /// Setup listener to detect browser auto-pause
  void _setupAutoPlayListener() {
    _controller?.addListener(() {
      if (_controller == null) return;

      final state = _controller!.value.playerState;

      // Detect browser auto-pause (paused without user action)
      if (state == PlayerState.paused && !_userPaused && _isPlaying) {
        // Browser likely auto-paused due to autoplay policy
        debugPrint('🔊 Browser auto-paused detected, showing mute icon');
        _showMuteIcon = true;
        _isPlaying = false;
        notifyListeners();
      }

      // Video is playing
      if (state == PlayerState.playing) {
        _isPlaying = true;
        _showMuteIcon = false;
        _userPaused = false;
        notifyListeners();
      }

      // Video ended (shouldn't happen with loop, but handle it)
      if (state == PlayerState.ended) {
        _isPlaying = false;
        notifyListeners();
      }
    });
  }

  /// Unmute and play (called when user taps mute icon)
  /// Workaround for browser autoplay policy:
  /// 1. Mute first
  /// 2. Play (browsers allow muted autoplay)
  /// 3. Wait briefly
  /// 4. Unmute (now we have user interaction)
  Future<void> unmute() async {
    if (_controller == null) return;

    try {
      // Step 1: Mute
      _controller!.mute();

      // Step 2: Play (muted autoplay is allowed)
      await Future.delayed(const Duration(milliseconds: 100));
      _controller!.play();

      // Step 3: Wait for playback to start
      await Future.delayed(const Duration(milliseconds: 500));

      // Step 4: Unmute (user interaction satisfied)
      _controller!.unMute();

      _showMuteIcon = false;
      _isPlaying = true;
      _userPaused = false;
      notifyListeners();

      debugPrint('🔊 Unmuted and playing');
    } catch (e) {
      debugPrint('Error unmuting: $e');
    }
  }

  /// Pause video (user action)
  void pause() {
    if (_controller == null) return;
    _userPaused = true;
    _controller!.pause();
    _isPlaying = false;
    notifyListeners();
  }

  /// Resume video (user action)
  void resume() {
    if (_controller == null) return;
    _userPaused = false;
    _controller!.play();
    _isPlaying = true;
    notifyListeners();
  }

  /// Stop and dispose
  void stop() {
    if (_controller != null) {
      _controller!.pause();
      _controller!.dispose();
      _controller = null;
    }
    _currentVideoId = null;
    _isPlaying = false;
    _showMuteIcon = false;
    _userPaused = false;
    _initialized = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }
}
