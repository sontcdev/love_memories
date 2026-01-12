import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Provider để lưu page đã authenticated
final authenticatedPageIdProvider = StateProvider<String?>((ref) => null);

/// Provider để check authentication status
final isAuthenticatedProvider = Provider<bool>((ref) {
  final pageId = ref.watch(authenticatedPageIdProvider);
  return pageId != null;
});
