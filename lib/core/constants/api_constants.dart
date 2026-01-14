/// API Constants for the application
class ApiConstants {
  // Base URLs
  static const String baseUrl = 'https://api.example.com'; // TODO: Replace with actual API URL
  static const String apiVersion = 'v1';
  
  // Auth endpoints
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String verifyPin = '/auth/verify-pin';
  static const String refreshToken = '/auth/refresh';
  
  // UserLink endpoints
  static const String createLink = '/links';
  static const String getLinkByUsername = '/links'; // GET /links/{username}
  static const String checkUsername = '/links/check-username'; // GET /links/check-username/{username}
  static const String updateLink = '/links'; // PUT /links/{id}
  static const String deleteLink = '/links'; // DELETE /links/{id}
  static const String verifyPassword = '/links/verify-password';
  static const String verifyAdminPin = '/links/verify-pin';
  
  // Profile endpoints
  static const String getProfile = '/profiles'; // GET /profiles/{linkId}
  static const String updateProfile = '/profiles'; // PUT /profiles/{linkId}
  
  // Gallery endpoints
  static const String getGalleryImages = '/gallery'; // GET /gallery/{linkId}
  static const String uploadImage = '/gallery';
  static const String deleteImage = '/gallery'; // DELETE /gallery/{id}
  static const String reorderImages = '/gallery'; // PUT /gallery/{linkId}/reorder
  
  // Timeline endpoints
  static const String getTimelineEvents = '/timeline'; // GET /timeline/{linkId}
  static const String createEvent = '/timeline';
  static const String updateEvent = '/timeline'; // PUT /timeline/{id}
  static const String deleteEvent = '/timeline'; // DELETE /timeline/{id}
  
  // Flashcard endpoints
  static const String getFlashcards = '/flashcards'; // GET /flashcards/{linkId}
  static const String updateFlashcard = '/flashcards'; // PUT /flashcards/{id}
  static const String seedFlashcards = '/flashcards/seed'; // POST /flashcards/seed/{linkId}
  
  // TimeCapsule endpoints
  static const String getTimeCapsules = '/capsules'; // GET /capsules/{linkId}
  static const String createCapsule = '/capsules';
  static const String updateCapsule = '/capsules'; // PUT /capsules/{id}
  static const String deleteCapsule = '/capsules'; // DELETE /capsules/{id}
  static const String openCapsule = '/capsules'; // POST /capsules/{id}/open
  
  // Timeout durations
  static const int connectionTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds
}
