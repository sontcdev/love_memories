import 'dart:typed_data';
import '../core/supabase_config.dart';
import '../models/content_item_model.dart';

/// Repository cho content items (gallery, timeline, letter)
class ContentRepository {
  final supabase = SupabaseConfig.client;

  /// Fetch gallery items
  Future<List<ContentItemModel>> fetchGalleryItems(String pageId) async {
    final response = await supabase
        .from('content_items')
        .select()
        .eq('page_id', pageId)
        .eq('content_type', 'GALLERY')
        .order('sort_order', ascending: true);

    return (response as List)
        .map((json) => ContentItemModel.fromJson(json))
        .toList();
  }

  /// Fetch timeline items
  Future<List<ContentItemModel>> fetchTimelineItems(String pageId) async {
    final response = await supabase
        .from('content_items')
        .select()
        .eq('page_id', pageId)
        .eq('content_type', 'TIMELINE')
        .order('date_event', ascending: false);

    return (response as List)
        .map((json) => ContentItemModel.fromJson(json))
        .toList();
  }

  /// Fetch letters
  Future<List<ContentItemModel>> fetchLetters(String pageId) async {
    final response = await supabase
        .from('content_items')
        .select()
        .eq('page_id', pageId)
        .eq('content_type', 'LETTER')
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => ContentItemModel.fromJson(json))
        .toList();
  }

  /// Create gallery item
  Future<ContentItemModel> createGalleryItem({
    required String pageId,
    required String imageUrl,
    int? sortOrder,
  }) async {
    // Get max sort order if not provided
    if (sortOrder == null) {
      final maxResponse = await supabase
          .from('content_items')
          .select('sort_order')
          .eq('page_id', pageId)
          .eq('content_type', 'GALLERY')
          .order('sort_order', ascending: false)
          .limit(1)
          .maybeSingle();

      sortOrder = maxResponse != null ? (maxResponse['sort_order'] as int) + 1 : 0;
    }

    final response = await supabase
        .from('content_items')
        .insert({
          'page_id': pageId,
          'content_type': 'GALLERY',
          'image_url': imageUrl,
          'sort_order': sortOrder,
        })
        .select()
        .single();

    return ContentItemModel.fromJson(response);
  }

  /// Create letter
  Future<ContentItemModel> createLetter({
    required String pageId,
    required String title,
    required String content,
    String? videoUrl,
  }) async {
    final response = await supabase
        .from('content_items')
        .insert({
          'page_id': pageId,
          'content_type': 'LETTER',
          'title': title,
          'content': content,
          'video_url': videoUrl,
          'sort_order': 0,
        })
        .select()
        .single();

    return ContentItemModel.fromJson(response);
  }

  /// Update sort order
  Future<void> updateSortOrder(String itemId, int newOrder) async {
    await supabase
        .from('content_items')
        .update({'sort_order': newOrder})
        .eq('id', itemId);
  }

  /// Delete item
  Future<void> deleteItem(String itemId) async {
    await supabase.from('content_items').delete().eq('id', itemId);
  }

  /// Upload image
  Future<String> uploadImage(Uint8List bytes, String filename) async {
    final path = 'gallery/$filename';

    await supabase.storage.from('uploads').uploadBinary(
          path,
          bytes,
        );

    final url = supabase.storage.from('uploads').getPublicUrl(path);
    return url;
  }
}
