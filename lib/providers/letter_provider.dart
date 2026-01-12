import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/content_item_model.dart';
import '../models/letter_reply_model.dart';
import '../repositories/letter_reply_repository.dart';
import 'content_provider.dart'; // Import for contentRepositoryProvider

/// Letter reply repository provider
final letterReplyRepositoryProvider =
    Provider((ref) => LetterReplyRepository());

/// Letter replies provider
final letterRepliesProvider =
    FutureProvider.family((ref, String letterId) async {
  final repository = ref.read(letterReplyRepositoryProvider);
  return await repository.fetchReplies(letterId);
});

/// Refresh letter replies provider
final refreshLetterRepliesProvider = Provider((ref) {
  return (String letterId) {
    ref.invalidate(letterRepliesProvider(letterId));
  };
});

/// Letters provider (using content provider)
final lettersProvider = FutureProvider.family((ref, String pageId) async {
  final repository = ref.read(contentRepositoryProvider);
  return await repository.fetchLetters(pageId);
});

/// Refresh letters provider
final refreshLettersProvider = Provider((ref) {
  return () {
    ref.invalidate(lettersProvider);
  };
});
