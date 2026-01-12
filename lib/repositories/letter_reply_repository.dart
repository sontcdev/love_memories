import '../core/supabase_config.dart';
import '../models/letter_reply_model.dart';

/// Repository cho letter replies
class LetterReplyRepository {
  final supabase = SupabaseConfig.client;

  /// Fetch replies for a letter
  Future<List<LetterReplyModel>> fetchReplies(String letterId) async {
    final response = await supabase
        .from('letter_replies')
        .select()
        .eq('content_item_id', letterId)
        .order('created_at', ascending: true); // Old on top

    return (response as List)
        .map((json) => LetterReplyModel.fromJson(json))
        .toList();
  }

  /// Create reply
  Future<LetterReplyModel> createReply({
    required String letterId,
    required String content,
  }) async {
    final response = await supabase
        .from('letter_replies')
        .insert({
          'content_item_id': letterId,
          'content': content,
        })
        .select()
        .single();

    return LetterReplyModel.fromJson(response);
  }

  /// Delete reply
  Future<void> deleteReply(String replyId) async {
    await supabase.from('letter_replies').delete().eq('id', replyId);
  }
}
