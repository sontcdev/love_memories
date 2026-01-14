import 'package:equatable/equatable.dart';

/// Base class for GameBloc events
abstract class GameEvent extends Equatable {
  const GameEvent();

  @override
  List<Object?> get props => [];
}

/// Load flashcards from datasource
class LoadCards extends GameEvent {
  final String linkId;

  const LoadCards(this.linkId);

  @override
  List<Object?> get props => [linkId];
}

/// Draw a random card from deck
class DrawCard extends GameEvent {
  const DrawCard();
}

/// Shuffle and reset deck (only when exhausted)
class ShuffleCards extends GameEvent {
  const ShuffleCards();
}

/// Mark a card as revealed
class RevealCard extends GameEvent {
  final String cardId;

  const RevealCard(this.cardId);

  @override
  List<Object?> get props => [cardId];
}
