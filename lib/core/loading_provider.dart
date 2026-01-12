import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Provider quản lý trạng thái loading toàn cục
final isLoadingProvider = StateProvider<bool>((ref) => false);

/// Hàm tiện ích để bọc các thao tác async và tự động quản lý loading state
/// 
/// Usage:
/// ```dart
/// final result = await runWithLoading(ref, () async {
///   return await apiService.fetchData();
/// });
/// ```
Future<T> runWithLoading<T>(
  WidgetRef ref,
  Future<T> Function() action,
) async {
  try {
    // Set loading = true
    ref.read(isLoadingProvider.notifier).state = true;
    
    // Chạy action
    final result = await action();
    
    return result;
  } finally {
    // Luôn set loading = false, kể cả khi có exception
    ref.read(isLoadingProvider.notifier).state = false;
  }
}
