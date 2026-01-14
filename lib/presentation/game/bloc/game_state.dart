import 'package:equatable/equatable.dart';
import '../../../data/models/flashcard_model.dart';
import '../../../domain/entities/card_deck.dart';

/// Base class for GameBloc states
abstract class GameState extends Equatable {
  const GameState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class GameInitial extends GameState {
  const GameInitial();
}

/// Loading flashcards
class GameLoading extends GameState {
  const GameLoading();
}

/// Cards loaded successfully, deck ready
class CardsLoaded extends GameState {
  final CardDeck deck;

  const CardsLoaded(this.deck);

  @override
  List<Object?> get props => [deck];
}

/// Card drawn successfully
class CardDrawn extends GameState {
  final FlashcardModel card;
  final CardDeck deck;

  const CardDrawn({
    required this.card,
    required this.deck,
  });

  @override
  List<Object?> get props => [card, deck];
}

/// All cards have been drawn - show reset button
class DeckExhausted extends GameState {
  final List<FlashcardModel> drawnCards;

  const DeckExhausted(this.drawnCards);

  @override
  List<Object?> get props => [drawnCards];
}

/// Deck shuffled and reset
class CardsShuffled extends GameState {
  final CardDeck deck;

  const CardsShuffled(this.deck);

  @override
  List<Object?> get props => [deck];
}

/// Error state
class GameError extends GameState {
  final String message;

  const GameError(this.message);

  @override
  List<Object?> get props => [message];
}
