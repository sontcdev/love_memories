import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/game_card_repository.dart';
import '../models/game_card_model.dart';

/// Game card repository provider
final gameCardRepositoryProvider = Provider((ref) => GameCardRepository());

/// Used card IDs provider (for non-repeat logic)
final usedCardIdsProvider = StateProvider<List<String>>((ref) => []);

/// Game cards by level provider
final gameCardsByLevelProvider =
    FutureProvider.family((ref, Level level) async {
  final repository = ref.read(gameCardRepositoryProvider);
  return await repository.fetchCardsByLevel(level);
});

/// All game cards provider (for admin)
final allGameCardsProvider = FutureProvider((ref) async {
  final repository = ref.read(gameCardRepositoryProvider);
  return await repository.fetchAllCards();
});

/// Refresh game cards provider
final refreshGameCardsProvider = Provider((ref) {
  return () {
    ref.invalidate(allGameCardsProvider);
    ref.invalidate(gameCardsByLevelProvider);
  };
});
