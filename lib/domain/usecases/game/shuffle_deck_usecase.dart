import '../../../data/models/flashcard_model.dart';
import '../../entities/card_deck.dart';

/// Shuffle and reset the card deck
class ShuffleDeckUseCase {
  /// Create a new shuffled deck from all cards
  /// Resets drawn cards and shuffles remaining cards
  CardDeck call(List<FlashcardModel> allCards) {
    return CardDeck.initial(allCards);
  }
}
