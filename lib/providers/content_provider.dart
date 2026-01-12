import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/content_repository.dart';

/// Content repository provider
final contentRepositoryProvider = Provider((ref) => ContentRepository());

/// Gallery items provider
final galleryItemsProvider = FutureProvider.family((ref, String pageId) async {
  final repository = ref.read(contentRepositoryProvider);
  return await repository.fetchGalleryItems(pageId);
});

/// Refresh gallery provider
final refreshGalleryProvider = Provider((ref) {
  return () {
    ref.invalidate(galleryItemsProvider);
  };
});
