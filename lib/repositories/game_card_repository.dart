import '../core/supabase_config.dart';
import '../models/game_card_model.dart';

/// Repository cho game cards
class GameCardRepository {
  final supabase = SupabaseConfig.client;

  /// Fetch cards by level
  Future<List<GameCardModel>> fetchCardsByLevel(Level level) async {
    final response = await supabase
        .from('game_cards')
        .select()
        .eq('level', level.value);

    return (response as List)
        .map((json) => GameCardModel.fromJson(json))
        .toList();
  }

  /// Fetch all cards (for admin)
  Future<List<GameCardModel>> fetchAllCards() async {
    final response = await supabase
        .from('game_cards')
        .select()
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => GameCardModel.fromJson(json))
        .toList();
  }

  /// Create card
  Future<GameCardModel> createCard({
    required String content,
    required Level level,
  }) async {
    final response = await supabase
        .from('game_cards')
        .insert({
          'content': content,
          'level': level.value,
        })
        .select()
        .single();

    return GameCardModel.fromJson(response);
  }

  /// Update card
  Future<GameCardModel> updateCard({
    required String id,
    required String content,
    required Level level,
  }) async {
    final response = await supabase
        .from('game_cards')
        .update({
          'content': content,
          'level': level.value,
        })
        .eq('id', id)
        .select()
        .single();

    return GameCardModel.fromJson(response);
  }

  /// Delete card
  Future<void> deleteCard(String id) async {
    await supabase.from('game_cards').delete().eq('id', id);
  }
}
