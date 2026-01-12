import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/design_system.dart';
import '../../../core/loading_provider.dart';
import '../../../models/game_card_model.dart';
import '../../../providers/game_provider.dart';

class GameCardsTabView extends ConsumerStatefulWidget {
  const GameCardsTabView({super.key});

  @override
  ConsumerState<GameCardsTabView> createState() => _GameCardsTabViewState();
}

class _GameCardsTabViewState extends ConsumerState<GameCardsTabView> {
  Level? _filterLevel;

  Future<void> _deleteCard(String cardId, BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2c3e50),
        title: Text(
          'Xác nhận xóa',
          style: AppTextStyles.h1(color: Colors.white),
        ),
        content: Text(
          'Bạn có chắc muốn xóa thẻ này?',
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
          final repository = ref.read(gameCardRepositoryProvider);
          await repository.deleteCard(cardId);
        });

        ref.read(refreshGameCardsProvider)();

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã xóa thẻ'),
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
  }

  @override
  Widget build(BuildContext context) {
    final cardsAsync = ref.watch(allGameCardsProvider);

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
                  'Quản Lý Thẻ Trò Chơi',
                  style: AppTextStyles.h1(color: Colors.white)
                      .copyWith(fontSize: 28),
                ),
                const SizedBox(height: 4),
                Text(
                  'Tạo và quản lý thẻ thử thách tình yêu',
                  style: AppTextStyles.body(color: Colors.white60),
                ),
              ],
            ),
            Row(
              children: [
                // Filter dropdown
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF243447),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: DropdownButton<Level?>(
                    value: _filterLevel,
                    hint: Text(
                      'Tất cả độ khó',
                      style: AppTextStyles.body(color: Colors.white70),
                    ),
                    dropdownColor: const Color(0xFF243447),
                    underline: const SizedBox(),
                    icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                    items: [
                      DropdownMenuItem(
                        value: null,
                        child: Text(
                          'Tất cả độ khó',
                          style: AppTextStyles.body(color: Colors.white70),
                        ),
                      ),
                      ...Level.values.map((level) {
                        return DropdownMenuItem(
                          value: level,
                          child: Text(
                            level.displayName,
                            style: AppTextStyles.body(color: Colors.white70),
                          ),
                        );
                      }).toList(),
                    ],
                    onChanged: (value) {
                      setState(() => _filterLevel = value);
                    },
                  ),
                ),
                const SizedBox(width: 16),
                PrimaryButton(
                  text: '+ Tạo Thẻ Mới',
                  backgroundColor: const Color(0xFF8B5CF6),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => const CreateGameCardDialog(),
                    );
                  },
                ),
              ],
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Table
        Expanded(
          child: cardsAsync.when(
            data: (cards) {
              final filteredCards = _filterLevel == null
                  ? cards
                  : cards.where((c) => c.level == _filterLevel).toList();

              if (filteredCards.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.style_outlined,
                        size: 64,
                        color: Colors.white24,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Chưa có thẻ nào',
                        style: AppTextStyles.body(color: Colors.white38),
                      ),
                    ],
                  ),
                );
              }

              return Container(
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
                          Expanded(
                            flex: 4,
                            child: Text(
                              'Nội dung',
                              style: AppTextStyles.body(color: Colors.white70)
                                  .copyWith(fontWeight: FontWeight.bold),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              'Độ khó',
                              style: AppTextStyles.body(color: Colors.white70)
                                  .copyWith(fontWeight: FontWeight.bold),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              'Ngày tạo',
                              style: AppTextStyles.body(color: Colors.white70)
                                  .copyWith(fontWeight: FontWeight.bold),
                            ),
                          ),
                          Expanded(
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
                        itemCount: filteredCards.length,
                        itemBuilder: (context, index) {
                          final card = filteredCards[index];
                          final dateFormat = DateFormat('dd/MM/yyyy');

                          return Container(
                            padding: const EdgeInsets.all(16),
                            decoration: const BoxDecoration(
                              border: Border(
                                bottom: BorderSide(color: Colors.white12),
                              ),
                            ),
                            child: Row(
                              children: [
                                // Content
                                Expanded(
                                  flex: 4,
                                  child: Text(
                                    card.content,
                                    style: AppTextStyles.body(color: Colors.white),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),

                                // Level
                                Expanded(
                                  child: _buildLevelBadge(card.level),
                                ),

                                // Date
                                Expanded(
                                  child: Text(
                                    dateFormat.format(card.createdAt),
                                    style: AppTextStyles.body(color: Colors.white70),
                                  ),
                                ),

                                // Actions
                                Expanded(
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.edit, size: 20),
                                        color: Colors.white54,
                                        onPressed: () {
                                          showDialog(
                                            context: context,
                                            builder: (context) =>
                                                EditGameCardDialog(card: card),
                                          );
                                        },
                                        tooltip: 'Edit',
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.delete, size: 20),
                                        color: Colors.redAccent,
                                        onPressed: () =>
                                            _deleteCard(card.id, context),
                                        tooltip: 'Delete',
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              );
            },
            loading: () => const Center(
              child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
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

  Widget _buildLevelBadge(Level level) {
    Color color;
    switch (level) {
      case Level.easy:
        color = Colors.green;
        break;
      case Level.medium:
        color = Colors.pink;
        break;
      case Level.hard:
        color = Colors.red;
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
          Icon(Icons.circle, size: 8, color: color),
          const SizedBox(width: 4),
          Text(
            level.displayName,
            style: AppTextStyles.caption(color: color),
          ),
        ],
      ),
    );
  }
}

/// Create game card dialog
class CreateGameCardDialog extends ConsumerStatefulWidget {
  const CreateGameCardDialog({super.key});

  @override
  ConsumerState<CreateGameCardDialog> createState() =>
      _CreateGameCardDialogState();
}

class _CreateGameCardDialogState extends ConsumerState<CreateGameCardDialog> {
  final _contentController = TextEditingController();
  Level _selectedLevel = Level.easy;

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_contentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập nội dung'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    try {
      await runWithLoading(ref, () async {
        final repository = ref.read(gameCardRepositoryProvider);
        await repository.createCard(
          content: _contentController.text.trim(),
          level: _selectedLevel,
        );
      });

      ref.read(refreshGameCardsProvider)();

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã tạo thẻ'),
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
    return Dialog(
      backgroundColor: const Color(0xFF2c3e50),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        width: 500,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                const Icon(Icons.style, color: Color(0xFF8B5CF6)),
                const SizedBox(width: 12),
                Text(
                  'Tạo Thẻ Mới',
                  style: AppTextStyles.h1(color: Colors.white),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Level selector
            Text(
              'Độ khó',
              style: AppTextStyles.body(color: Colors.white70),
            ),
            const SizedBox(height: 8),
            Row(
              children: Level.values.map((level) {
                final isSelected = _selectedLevel == level;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () => setState(() => _selectedLevel = level),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFF8B5CF6)
                              : const Color(0xFF243447),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF8B5CF6)
                                : Colors.white24,
                          ),
                        ),
                        child: Text(
                          level.displayName,
                          style: AppTextStyles.body(
                            color: isSelected ? Colors.white : Colors.white54,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 16),

            // Content
            Text(
              'Nội dung thử thách',
              style: AppTextStyles.body(color: Colors.white70),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _contentController,
              maxLines: 4,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Viết thử thách tình yêu...',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF243447),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF8B5CF6)),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Submit button
            SizedBox(
              width: double.infinity,
              child: PrimaryButton(
                text: 'Tạo thẻ',
                backgroundColor: const Color(0xFF8B5CF6),
                onPressed: _submit,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Edit game card dialog
class EditGameCardDialog extends ConsumerStatefulWidget {
  final GameCardModel card;

  const EditGameCardDialog({super.key, required this.card});

  @override
  ConsumerState<EditGameCardDialog> createState() =>
      _EditGameCardDialogState();
}

class _EditGameCardDialogState extends ConsumerState<EditGameCardDialog> {
  late final TextEditingController _contentController;
  late Level _selectedLevel;

  @override
  void initState() {
    super.initState();
    _contentController = TextEditingController(text: widget.card.content);
    _selectedLevel = widget.card.level;
  }

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_contentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập nội dung'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    try {
      await runWithLoading(ref, () async {
        final repository = ref.read(gameCardRepositoryProvider);
        await repository.updateCard(
          id: widget.card.id,
          content: _contentController.text.trim(),
          level: _selectedLevel,
        );
      });

      ref.read(refreshGameCardsProvider)();

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã cập nhật thẻ'),
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
    return Dialog(
      backgroundColor: const Color(0xFF2c3e50),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        width: 500,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                const Icon(Icons.edit, color: Color(0xFF8B5CF6)),
                const SizedBox(width: 12),
                Text(
                  'Chỉnh Sửa Thẻ',
                  style: AppTextStyles.h1(color: Colors.white),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Level selector
            Text(
              'Độ khó',
              style: AppTextStyles.body(color: Colors.white70),
            ),
            const SizedBox(height: 8),
            Row(
              children: Level.values.map((level) {
                final isSelected = _selectedLevel == level;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () => setState(() => _selectedLevel = level),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFF8B5CF6)
                              : const Color(0xFF243447),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF8B5CF6)
                                : Colors.white24,
                          ),
                        ),
                        child: Text(
                          level.displayName,
                          style: AppTextStyles.body(
                            color: isSelected ? Colors.white : Colors.white54,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 16),

            // Content
            Text(
              'Nội dung thử thách',
              style: AppTextStyles.body(color: Colors.white70),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _contentController,
              maxLines: 4,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Viết thử thách tình yêu...',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF243447),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF8B5CF6)),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Submit button
            SizedBox(
              width: double.infinity,
              child: PrimaryButton(
                text: 'Cập nhật',
                backgroundColor: const Color(0xFF8B5CF6),
                onPressed: _submit,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
