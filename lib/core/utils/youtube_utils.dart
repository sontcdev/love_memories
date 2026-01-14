/// YouTube URL utilities for extracting video IDs
class YoutubeUtils {
  /// Extract video ID from YouTube URL
  /// Supports formats:
  /// - https://www.youtube.com/watch?v=VIDEO_ID
  /// - https://youtu.be/VIDEO_ID
  /// - https://www.youtube.com/embed/VIDEO_ID
  /// - https://www.youtube.com/v/VIDEO_ID
  static String? extractVideoId(String url) {
    if (url.isEmpty) return null;

    final regExp = RegExp(
      r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})',
      caseSensitive: false,
    );

    final match = regExp.firstMatch(url);
    return match?.group(1);
  }

  /// Validate if string is a valid YouTube URL
  static bool isValidYoutubeUrl(String url) {
    return extractVideoId(url) != null;
  }

  /// Get thumbnail URL for video ID
  static String getThumbnailUrl(String videoId, {String quality = 'hq'}) {
    // Quality options: default, hq, mq, sd, maxres
    return 'https://img.youtube.com/vi/$videoId/$quality.jpg';
  }
}
