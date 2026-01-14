/// Application-wide constants
class AppConstants {
  // App Information
  static const String appName = 'Kỷ Niệm Số';
  static const String appNameEnglish = 'Digital Memories';
  
  // Navigation
  static const String initialRoute = '/';
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Image
  static const int maxImageSizeMB = 5;
  static const int imageQuality = 85;
  static const int thumbnailSize = 300;
  
  // Media
  static const int maxVideoSizeMB = 50;
  static const int maxAudioDurationMinutes = 5;
  
  // Validation
  static const int minPinLength = 4;
  static const int maxPinLength = 6;
  static const int minPasswordLength = 6;
  
  // Date Format
  static const String dateFormat = 'dd/MM/yyyy';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';
  static const String timeFormat = 'HH:mm';
}
