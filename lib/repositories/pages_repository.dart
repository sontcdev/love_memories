import 'dart:convert';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';
import '../core/supabase_config.dart';
import '../models/page_model.dart';
import '../models/page_data_model.dart';

/// Repository để interact với pages table
class PagesRepository {
  final supabase = SupabaseConfig.client;

  /// Create new page
  Future<PageModel> createPage({
    required String username,
    required TemplateType templateType,
    String? pin,
  }) async {
    // Hash PIN nếu có
    String? passcodeHash;
    if (pin != null && pin.isNotEmpty) {
      // Simple MD5 hash (trong production nên dùng bcrypt hoặc argon2)
      final bytes = utf8.encode(pin);
      final digest = md5.convert(bytes);
      passcodeHash = digest.toString();
    }

    // Insert vào Supabase
    final response = await supabase
        .from('pages')
        .insert({
          'username': username.toLowerCase().trim(),
          'passcode_hash': passcodeHash,
          'template_type': templateType.value,
          'status': 'ACTIVE',
        })
        .select()
        .single();

    return PageModel.fromJson(response);
  }

  /// Fetch all pages
  Future<List<PageModel>> fetchPages() async {
    final response = await supabase
        .from('pages')
        .select()
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => PageModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Update page status
  Future<PageModel> updatePageStatus(String id, PageStatus status) async {
    final response = await supabase
        .from('pages')
        .update({'status': status.value})
        .eq('id', id)
        .select()
        .single();

    return PageModel.fromJson(response);
  }

  /// Delete page
  Future<void> deletePage(String id) async {
    await supabase.from('pages').delete().eq('id', id);
  }

  /// Check if username exists
  Future<bool> usernameExists(String username) async {
    final response = await supabase
        .from('pages')
        .select('id')
        .eq('username', username.toLowerCase().trim())
        .maybeSingle();

    return response != null;
  }

  /// Get page by username (slug)
  Future<PageModel?> getPageByUsername(String username) async {
    final response = await supabase
        .from('pages')
        .select()
        .eq('username', username.toLowerCase().trim())
        .maybeSingle();

    if (response == null) return null;
    return PageModel.fromJson(response);
  }

  /// Verify PIN
  Future<PageModel?> verifyPin(String username, String pin) async {
    final page = await getPageByUsername(username);
    if (page == null) return null;

    // Hash PIN
    final bytes = utf8.encode(pin);
    final digest = md5.convert(bytes);
    final pinHash = digest.toString();

    // Compare
    if (page.passcodeHash == pinHash) {
      return page;
    }
    return null;
  }

  /// Update passcode (for onboarding)
  Future<void> updatePasscode(String pageId, String pin) async {
    final bytes = utf8.encode(pin);
    final digest = md5.convert(bytes);
    final passcodeHash = digest.toString();

    await supabase
        .from('pages')
        .update({'passcode_hash': passcodeHash})
        .eq('id', pageId);
  }

  /// Create page data
  Future<PageDataModel> createPageData({
    required String pageId,
    required ModeCount modeCount,
    required List<Participant> participants,
    String? titleText,
    String? mainImageUrl,
  }) async {
    final response = await supabase
        .from('page_data')
        .insert({
          'page_id': pageId,
          'mode_count': modeCount.value,
          'participants': participants.map((p) => p.toJson()).toList(),
          'title_text': titleText,
          'main_image_url': mainImageUrl,
        })
        .select()
        .single();

    return PageDataModel.fromJson(response);
  }

  /// Upload image to Supabase Storage
  Future<String> uploadImage(Uint8List bytes, String filename) async {
    final path = 'profile_images/$filename';
    
    await supabase.storage.from('uploads').uploadBinary(
          path,
          bytes,
        );

    final url = supabase.storage.from('uploads').getPublicUrl(path);
    return url;
  }
}
