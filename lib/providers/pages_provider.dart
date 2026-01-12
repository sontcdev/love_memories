import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/page_model.dart';
import '../repositories/pages_repository.dart';

/// Provider for pages repository
final pagesRepositoryProvider = Provider((ref) => PagesRepository());

/// Provider để fetch pages list
final pagesListProvider = FutureProvider<List<PageModel>>((ref) async {
  final repository = ref.read(pagesRepositoryProvider);
  return await repository.fetchPages();
});

/// Provider để refresh pages list
final refreshPagesProvider = Provider((ref) {
  return () {
    ref.invalidate(pagesListProvider);
  };
});
