import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/datasources/remote/flashcard_remote_datasource.dart';
import '../../../domain/entities/card_deck.dart';
import '../../../domain/usecases/game/draw_random_card_usecase.dart';
import '../../../domain/usecases/game/shuffle_deck_usecase.dart';
import 'game_event.dart';
import 'game_state.dart';

/// GameBloc handles flashcard shuffle logic with no-duplicate drawing
/// Only allows shuffle when deck is exhausted
class GameBloc extends Bloc<GameEvent, GameState> {
  final FlashcardRemoteDataSource _flashcardDataSource;
  final DrawRandomCardUseCase _drawCardUseCase;
  final ShuffleDeckUseCase _shuffleDeckUseCase;

  CardDeck? _currentDeck;

  GameBloc({
    FlashcardRemoteDataSource? flashcardDataSource,
    DrawRandomCardUseCase? drawCardUseCase,
    ShuffleDeckUseCase? shuffleDeckUseCase,
  })  : _flashcardDataSource =
            flashcardDataSource ?? FlashcardRemoteDataSource(),
        _drawCardUseCase = drawCardUseCase ?? DrawRandomCardUseCase(),
        _shuffleDeckUseCase = shuffleDeckUseCase ?? ShuffleDeckUseCase(),
        super(const GameInitial()) {
    on<LoadCards>(_onLoadCards);
    on<DrawCard>(_onDrawCard);
    on<ShuffleCards>(_onShuffleCards);
    on<RevealCard>(_onRevealCard);
  }

  Future<void> _onLoadCards(
    LoadCards event,
    Emitter<GameState> emit,
  ) async {
    emit(const GameLoading());

    try {
      // Load flashcards from datasource
      final flashcards = await _flashcardDataSource.getFlashcards(event.linkId);

      if (flashcards.isEmpty) {
        emit(const GameError('Chưa có thẻ bài nào. Vui lòng thêm thẻ bài.'));
        return;
      }

      // Create initial shuffled deck
      _currentDeck = CardDeck.initial(flashcards);

      emit(CardsLoaded(_currentDeck!));
    } catch (e) {
      emit(GameError('Không thể tải thẻ bài: ${e.toString()}'));
    }
  }

  Future<void> _onDrawCard(
    DrawCard event,
    Emitter<GameState> emit,
  ) async {
    if (_currentDeck == null) {
      emit(const GameError('Vui lòng tải thẻ bài trước'));
      return;
    }

    // Try to draw a card using UseCase
    final result = _drawCardUseCase(_currentDeck!);

    result.fold(
      // Deck exhausted
      (failure) {
        emit(DeckExhausted(_currentDeck!.drawnCards));
      },
      // Card drawn successfully
      (drawnCard) {
        // Update deck state
        _currentDeck = _currentDeck!.drawCard(drawnCard);

        emit(CardDrawn(
          card: drawnCard,
          deck: _currentDeck!,
        ));
      },
    );
  }

  Future<void> _onShuffleCards(
    ShuffleCards event,
    Emitter<GameState> emit,
  ) async {
    if (_currentDeck == null) {
      emit(const GameError('Vui lòng tải thẻ bài trước'));
      return;
    }

    // Shuffle deck using UseCase
    _currentDeck = _shuffleDeckUseCase(_currentDeck!.allCards);

    emit(CardsShuffled(_currentDeck!));
  }

  Future<void> _onRevealCard(
    RevealCard event,
    Emitter<GameState> emit,
  ) async {
    if (_currentDeck == null) return;

    try {
      // Find the card in the deck
      final cardIndex = _currentDeck!.allCards
          .indexWhere((card) => card.id == event.cardId);

      if (cardIndex == -1) return;

      final card = _currentDeck!.allCards[cardIndex];

      // Update card revealed status via datasource
      await _flashcardDataSource.updateFlashcard(
        event.cardId,
        card.copyWith(isRevealed: true),
      );

      // Note: State doesn't change here, just updating backend
      // UI can handle the reveal animation separately
    } catch (e) {
      // Silently fail, not critical
    }
  }
}
