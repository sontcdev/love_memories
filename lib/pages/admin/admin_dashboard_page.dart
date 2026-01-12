import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/design_system.dart';
import '../../core/loading_provider.dart';
import '../../models/page_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/pages_provider.dart';
import '../../repositories/pages_repository.dart';
import 'widgets/create_link_dialog.dart';
import 'widgets/qr_code_dialog.dart';
import 'widgets/game_cards_tab.dart';

class AdminDashboardPage extends ConsumerStatefulWidget {
  const AdminDashboardPage({super.key});

  @override
  ConsumerState<AdminDashboardPage> createState() =>
      _AdminDashboardPageState();
}

class _AdminDashboardPageState extends ConsumerState<AdminDashboardPage> {
  int _selectedTab = 0;

  Future<void> _toggleStatus(
    WidgetRef ref,
    PageModel page,
    BuildContext context,
  ) async {
    final newStatus = page.status == PageStatus.active
        ? PageStatus.inactive
        : PageStatus.active;

    try {
      await runWithLoading(ref, () async {
        final repository = ref.read(pagesRepositoryProvider);
        await repository.updatePageStatus(page.id, newStatus);
      });

      // Refresh list
      ref.read(refreshPagesProvider)();
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString()}'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<void> _deletePage(
    WidgetRef ref,
    String pageId,
    BuildContext context,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2c3e50),
        title: Text(
          'Xác nhận xóa',
          style: AppTextStyles.h1(color: Colors.white),
        ),
        content: Text(
          'Bạn có chắc muốn xóa liên kết này? Hành động này không thể hoàn tác.',
          style: AppTextStyles.body(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.redAccent),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await runWithLoading(ref, () async {
          final repository = ref.read(pagesRepositoryProvider);
          await repository.deletePage(pageId);
        });

        // Refresh list
        ref.read(refreshPagesProvider)();

        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã xóa liên kết'),
              backgroundColor: Colors.greenAccent,
            ),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Lỗi: ${e.toString()}'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final pagesAsync = ref.watch(pagesListProvider);
    final currentUser = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1a2332),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(24),
              color: const Color(0xFF243447),
              child: Row(
                children: [
                  // Logo
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF8B5CF6),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Center(
                      child: Text(
                        'M',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Trang Quản Trị',
                        style: AppTextStyles.h1(color: Colors.white),
                      ),
                      Text(
                        'Quản lý 3 liên kết',
                        style: AppTextStyles.caption(color: Colors.white54),
                      ),
                    ],
                  ),
                  const Spacer(),
                  // User info
                  Text(
                    'Xin chào, Admin',
                    style: AppTextStyles.body(color: Colors.white70),
                  ),
                  const SizedBox(width: 16),
                  TextButton(
                    onPressed: () async {
                      await ref.read(authRepositoryProvider).signOut();
                      ref.invalidate(authStateProvider);
                      if (context.mounted) {
                        context.go('/admin');
                      }
                    },
                    child: Text(
                      'Đăng xuất',
                      style: AppTextStyles.body(color: Colors.white54),
                    ),
                  ),
                ],
              ),
            ),

            // Tabs Section
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: [
                  _buildTab('Liên kết', 0),
                  const SizedBox(width: 24),
                  _buildTab('Thẻ trò chơi', 1),
                ],
              ),
            ),

            // Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: _selectedTab == 0 ? _buildLinksTab(ref) : const GameCardsTabView(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String label, int index) {
    final isActive = _selectedTab == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isActive ? const Color(0xFF8B5CF6) : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Text(
          label,
          style: AppTextStyles.body(
            color: isActive ? Colors.white : Colors.white54,
          ).copyWith(fontWeight: isActive ? FontWeight.bold : FontWeight.normal),
        ),
      ),
    );
  }

  Widget _buildLinksTab(WidgetRef ref) {
    final pagesAsync = ref.watch(pagesListProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Quản Lý Liên Kết',
                  style: AppTextStyles.h1(color: Colors.white)
                      .copyWith(fontSize: 28),
                ),
                const SizedBox(height: 4),
                Text(
                  'Tạo và quản lý liên kết người dùng',
                  style: AppTextStyles.body(color: Colors.white60),
                ),
              ],
            ),
            PrimaryButton(
              text: '+ Tạo Liên Kết Mới',
              backgroundColor: const Color(0xFF8B5CF6),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => const CreateLinkDialog(),
                );
              },
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Table
        Expanded(
          child: pagesAsync.when(
            data: (pages) => _buildTable(context, ref, pages),
            loading: () => const Center(
              child: CircularProgressIndicator(
                color: Color(0xFF8B5CF6),
              ),
            ),
            error: (error, stack) => Center(
              child: Text(
                'Lỗi: $error',
                style: AppTextStyles.body(color: Colors.redAccent),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOldTab(String label, bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: isActive ? const Color(0xFF8B5CF6) : Colors.transparent,
            width: 2,
          ),
        ),
      ),
      child: Text(
        label,
        style: AppTextStyles.body(
          color: isActive ? Colors.white : Colors.white54,
        ).copyWith(fontWeight: isActive ? FontWeight.bold : FontWeight.normal),
      ),
    );
  }

  Widget _buildTable(BuildContext context, WidgetRef ref, List<PageModel> pages) {
    if (pages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.link_off,
              size: 64,
              color: Colors.white24,
            ),
            const SizedBox(height: 16),
            Text(
              'Chưa có liên kết nào',
              style: AppTextStyles.body(color: Colors.white38),
            ),
          ],
        ),
      );
    }

    return Expanded(
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            minWidth: 840, // Total of all column widths
          ),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF243447),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                // Table Header
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: Colors.white12),
                    ),
                  ),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 150,
                        child: Text(
                          'Tên người dùng',
                          style: AppTextStyles.body(color: Colors.white70)
                              .copyWith(fontWeight: FontWeight.bold),
                        ),
                      ),
                      SizedBox(
                        width: 180,
                        child: Text(
                          'Liên kết',
                          style: AppTextStyles.body(color: Colors.white70)
                              .copyWith(fontWeight: FontWeight.bold),
                        ),
                      ),
                      SizedBox(
                        width: 120,
                        child: Text(
                          'Giao diện',
                          style: AppTextStyles.body(color: Colors.white70)
                              .copyWith(fontWeight: FontWeight.bold),
                        ),
                      ),
                      SizedBox(
                        width: 120,
                        child: Text(
                          'Trạng thái',
                          style: AppTextStyles.body(color: Colors.white70)
                              .copyWith(fontWeight: FontWeight.bold),
                        ),
                      ),
                      SizedBox(
                        width: 120,
                        child: Text(
                          'Ngày tạo',
                          style: AppTextStyles.body(color: Colors.white70)
                              .copyWith(fontWeight: FontWeight.bold),
                        ),
                      ),
                      SizedBox(
                        width: 150,
                        child: Text(
                          'Hành động',
                          style: AppTextStyles.body(color: Colors.white70)
                              .copyWith(fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),

                // Table Rows
                Expanded(
                  child: ListView.builder(
                    itemCount: pages.length,
                    itemBuilder: (context, index) {
                      final page = pages[index];
                      return _buildTableRow(context, ref, page);
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTableRow(BuildContext context, WidgetRef ref, PageModel page) {
    final dateFormat = DateFormat('dd/MM/yyyy');
    final pagesAsync = ref.watch(pagesListProvider);
    final pages = pagesAsync.value ?? [];
    final index = pages.indexOf(page);
    final isEven = index % 2 == 0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isEven ? Colors.white.withOpacity(0.03) : Colors.transparent,
        border: const Border(bottom: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Username
          SizedBox(
            width: 150,
            child: Text(
              page.username,
              style: AppTextStyles.body(color: Colors.white).copyWith(
                fontWeight: FontWeight.w500,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),

          // Link
          SizedBox(
            width: 180,
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    '/${page.username}',
                    style: AppTextStyles.body(color: const Color(0xFF8B5CF6)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.copy, size: 16),
                  color: Colors.white54,
                  onPressed: () {
                    // Copy functionality implementation needed
                  },
                  tooltip: 'Copy link',
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),

          // Template
          SizedBox(
            width: 120,
            child: _buildTemplateBadge(page.templateType),
          ),

          // Status
          SizedBox(
            width: 120,
            child: GestureDetector(
              onTap: () => _toggleStatus(ref, page, context),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: page.status == PageStatus.active
                      ? Colors.greenAccent.withOpacity(0.15)
                      : Colors.grey.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: page.status == PageStatus.active
                        ? Colors.greenAccent.withOpacity(0.6)
                        : Colors.grey.withOpacity(0.6),
                    width: 1.5,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      page.status == PageStatus.active
                          ? Icons.check_circle
                          : Icons.pause_circle,
                      size: 14,
                      color: page.status == PageStatus.active
                          ? Colors.greenAccent
                          : Colors.grey,
                    ),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        page.status.displayName,
                        style: AppTextStyles.caption(
                          color: page.status == PageStatus.active
                              ? Colors.greenAccent
                              : Colors.grey,
                        ).copyWith(fontSize: 11),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Date
          SizedBox(
            width: 120,
            child: Text(
              dateFormat.format(page.createdAt),
              style: AppTextStyles.body(color: Colors.white60),
            ),
          ),

          // Actions
          SizedBox(
            width: 150,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.qr_code, size: 18),
                  color: Colors.white54,
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => QrCodeDialog(page: page),
                    );
                  },
                  tooltip: 'Get QR Code',
                  padding: const EdgeInsets.all(8),
                ),
                IconButton(
                  icon: const Icon(Icons.edit, size: 18),
                  color: Colors.white54,
                  onPressed: () {
                    // Edit functionality
                  },
                  tooltip: 'Edit',
                ),
                IconButton(
                  icon: const Icon(Icons.open_in_new, size: 20),
                  color: Colors.white54,
                  onPressed: () {
                    // Open link
                  },
                  tooltip: 'Open',
                ),
                IconButton(
                  icon: const Icon(Icons.delete, size: 20),
                  color: Colors.redAccent,
                  onPressed: () => _deletePage(ref, page.id, context),
                  tooltip: 'Delete',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTemplateBadge(TemplateType template) {
    Color color;
    IconData icon;

    switch (template) {
      case TemplateType.love:
        color = Colors.pinkAccent;
        icon = Icons.favorite;
        break;
      case TemplateType.every:
        color = Colors.greenAccent;
        icon = Icons.calendar_today;
        break;
      case TemplateType.idol:
        color = Colors.blueAccent;
        icon = Icons.star;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            template.value,
            style: AppTextStyles.caption(color: color),
          ),
        ],
      ),
    );
  }
}
