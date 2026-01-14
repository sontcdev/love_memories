import 'package:dartz/dartz.dart';
import '../../../core/error/failures.dart';

/// Validate gallery image count limit (max 20 images)
class ValidateGalleryLimitUseCase {
  /// Maximum number of images allowed
  static const int maxImages = 20;

  /// Call the use case
  /// Returns Right(true) if within limit, Left(Failure) if exceeded
  Either<Failure, bool> call(int currentImageCount) {
    if (currentImageCount >= maxImages) {
      return const Left(GalleryLimitExceededFailure());
    }
    return const Right(true);
  }
}
