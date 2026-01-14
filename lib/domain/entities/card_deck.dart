import 'package:equatable/equatable.dart';
import '../../data/models/flashcard_model.dart';

/// Flashcard deck state for game
class CardDeck extends Equatable {
  /// All available cards
  final List<FlashcardModel> allCards;

  /// Cards that have been drawn
  final List<FlashcardModel> drawnCards;

  /// Cards still in deck (not drawn yet)
  final List<FlashcardModel> remainingCards;

  const CardDeck({
    required this.allCards,
    required this.drawnCards,
    required this.remainingCards,
  });

  /// Check if all cards have been drawn
  bool get isExhausted => remainingCards.isEmpty;

  /// Get total number of cards
  int get totalCards => allCards.length;

  /// Get number of drawn cards
  int get drawnCount => drawnCards.length;

  /// Get number of remaining cards
  int get remainingCount => remainingCards.length;

  /// Get progress percentage (0-100)
  double get progressPercentage {
    if (totalCards == 0) return 0;
    return (drawnCount / totalCards * 100);
  }

  /// Create initial deck from all cards
  factory CardDeck.initial(List<FlashcardModel> cards) {
    return CardDeck(
      allCards: List.unmodifiable(cards),
      drawnCards: const [],
      remainingCards: List.from(cards)..shuffle(),
    );
  }

  /// Create deck after drawing a card
  CardDeck drawCard(FlashcardModel card) {
    final newDrawn = List<FlashcardModel>.from(drawnCards)..add(card);
    final newRemaining = List<FlashcardModel>.from(remainingCards)..remove(card);

    return CardDeck(
      allCards: allCards,
      drawnCards: newDrawn,
      remainingCards: newRemaining,
    );
  }

  /// Reset and shuffle deck
  CardDeck shuffle() {
    return CardDeck(
      allCards: allCards,
      drawnCards: const [],
      remainingCards: List.from(allCards)..shuffle(),
    );
  }

  @override
  List<Object?> get props => [allCards, drawnCards, remainingCards];
}
