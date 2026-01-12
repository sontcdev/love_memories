import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/design_system.dart';
import '../../core/loading_provider.dart';
import '../../models/page_data_model.dart';
import '../../providers/pages_provider.dart';
import '../../repositories/pages_repository.dart';

class SettingsPage extends ConsumerStatefulWidget {
  final String pageId;
  final PageDataModel? pageData;
  final Color backgroundColor;
  final Color primaryColor;

  const SettingsPage({
    super.key,
    required this.pageId,
    this.pageData,
    required this.backgroundColor,
    required this.primaryColor,
  });

  @override
  ConsumerState<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends ConsumerState<SettingsPage> {
  late ModeCount _selectedMode;

  @override
  void initState() {
    super.initState();
    _selectedMode = widget.pageData?.modeCount ?? ModeCount.up;
  }

  Future<void> _updateMode(ModeCount newMode) async {
    setState(() => _selectedMode = newMode);

    try {
      await runWithLoading(ref, () async {
        final repository = ref.read(pagesRepositoryProvider);
        
        // Update mode_count in page_data table
        await repository.supabase
            .from('page_data')
            .update({'mode_count': newMode.value})
            .eq('page_id', widget.pageId);
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã cập nhật cài đặt'),
            backgroundColor: Colors.greenAccent,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString()}'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: widget.backgroundColor,
      appBar: AppBar(
        backgroundColor: widget.backgroundColor,
        title: const Text('Cài Đặt'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          // Count Mode Section
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.timer, color: widget.primaryColor),
                    const SizedBox(width: 12),
                    Text(
                      'Chế độ đếm ngày',
                      style: AppTextStyles.h1(color: Colors.black87).copyWith(
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Up mode
                RadioListTile<ModeCount>(
                  title: const Text('Đếm xuôi'),
                  subtitle: const Text('Đếm số ngày đã trải qua'),
                  value: ModeCount.up,
                  groupValue: _selectedMode,
                  activeColor: widget.primaryColor,
                  onChanged: (value) {
                    if (value != null) _updateMode(value);
                  },
                ),

                // Down mode
                RadioListTile<ModeCount>(
                  title: const Text('Đếm ngược'),
                  subtitle: const Text('Đếm ngược đến ngày kỷ niệm'),
                  value: ModeCount.down,
                  groupValue: _selectedMode,
                  activeColor: widget.primaryColor,
                  onChanged: (value) {
                    if (value != null) _updateMode(value);
                  },
                ),

                // None mode
                RadioListTile<ModeCount>(
                  title: const Text('Không đếm'),
                  subtitle: const Text('Tắt bộ đếm ngày'),
                  value: ModeCount.none,
                  groupValue: _selectedMode,
                  activeColor: widget.primaryColor,
                  onChanged: (value) {
                    if (value != null) _updateMode(value);
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Info section
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: widget.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, color: widget.primaryColor),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Thay đổi sẽ được áp dụng ngay lập tức',
                    style: AppTextStyles.caption(color: Colors.black54),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
