import 'dart:math';
import 'package:dartz/dartz.dart';
import '../../../core/error/failures.dart';
import '../../../data/models/flashcard_model.dart';
import '../../entities/card_deck.dart';

/// Draw random card from deck (no duplicates until shuffle)
class DrawRandomCardUseCase {
  final _random = Random();

  /// Draw a random card from the remaining deck
  /// Returns Left(DeckExhaustedFailure) if no cards remaining
  /// Returns Right(FlashcardModel) with the drawn card
  Either<Failure, FlashcardModel> call(CardDeck deck) {
    if (deck.isExhausted) {
      return const Left(DeckExhaustedFailure());
    }

    // Get random index from remaining cards
    final randomIndex = _random.nextInt(deck.remainingCards.length);
    final drawnCard = deck.remainingCards[randomIndex];

    return Right(drawnCard);
  }
}
