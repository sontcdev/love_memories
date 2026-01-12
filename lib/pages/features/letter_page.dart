import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/design_system.dart';
import '../../core/loading_provider.dart';
import '../../models/content_item_model.dart';
import '../../providers/content_provider.dart';
import '../../providers/letter_provider.dart';
import 'package:intl/intl.dart';

class LetterPage extends ConsumerWidget {
  final String pageId;
  final Color backgroundColor;
  final Color primaryColor;

  const LetterPage({
    super.key,
    required this.pageId,
    required this.backgroundColor,
    required this.primaryColor,
  });

  void _showWriteLetterDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => WriteLetterDialog(
        pageId: pageId,
        primaryColor: primaryColor,
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lettersAsync = ref.watch(lettersProvider(pageId));

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: backgroundColor,
        title: Row(
          children: [
            const Text('Thư Tình'),
            const SizedBox(width: 8),
            lettersAsync.whenData((letters) {
              return Text(
                '(${letters.length})',
                style: AppTextStyles.caption(color: Colors.black54),
              );
            }).value ?? const SizedBox(),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.add, color: primaryColor),
            onPressed: () => _showWriteLetterDialog(context, ref),
            tooltip: 'Viết thư',
          ),
        ],
      ),
      body: lettersAsync.when(
        data: (letters) {
          if (letters.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.mail_outline,
                    size: 64,
                    color: Colors.black26,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Chưa có thư nào...',
                    style: AppTextStyles.body(color: Colors.black38),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Hãy viết bức thư tình đầu tiên!',
                    style: AppTextStyles.caption(color: Colors.black38),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => _showWriteLetterDialog(context, ref),
                    icon: const Icon(Icons.edit),
                    label: const Text('Viết thư'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: letters.length,
            itemBuilder: (context, index) {
              return LetterCard(
                letter: letters[index],
                primaryColor: primaryColor,
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Lỗi: $error')),
      ),
    );
  }
}

/// Letter card widget with envelope style
class LetterCard extends ConsumerWidget {
  final ContentItemModel letter;
  final Color primaryColor;

  const LetterCard({
    super.key,
    required this.letter,
    required this.primaryColor,
  });

  void _showReplyDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => ReplyDialog(
        letterId: letter.id,
        primaryColor: primaryColor,
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dateFormat = DateFormat('dd/MM/yyyy');

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              primaryColor.withOpacity(0.1),
              primaryColor.withOpacity(0.05),
            ],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Icon(Icons.mail, color: primaryColor, size: 32),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        letter.title ?? 'Không có tiêu đề',
                        style: AppTextStyles.h1(color: Colors.black87)
                            .copyWith(fontSize: 20),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        dateFormat.format(letter.createdAt),
                        style: AppTextStyles.caption(color: Colors.black54),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Content
            Text(
              letter.content ?? '',
              style: AppTextStyles.body(color: Colors.black87),
            ),

            // Video link if exists
            if (letter.videoUrl != null && letter.videoUrl!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: primaryColor.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.videocam, color: primaryColor, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        letter.videoUrl!,
                        style: AppTextStyles.caption(color: primaryColor),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Reply button and replies
            ElevatedButton.icon(
              onPressed: () => _showReplyDialog(context, ref),
              icon: const Icon(Icons.reply, size: 18),
              label: const Text('Phản hồi'),
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
              ),
            ),

            // Show replies
            Consumer(
              builder: (context, ref, child) {
                final repliesAsync = ref.watch(letterRepliesProvider(letter.id));
                
                return repliesAsync.when(
                  data: (replies) {
                    if (replies.isEmpty) return const SizedBox();

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 16),
                        const Divider(),
                        const SizedBox(height: 8),
                        Text(
                          'Phản hồi (${replies.length})',
                          style: AppTextStyles.body(color: Colors.black54)
                              .copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        ...replies.map((reply) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  reply.content,
                                  style: AppTextStyles.body(color: Colors.black87),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  DateFormat('dd/MM/yyyy HH:mm')
                                      .format(reply.createdAt),
                                  style: AppTextStyles.caption(
                                    color: Colors.black38,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ],
                    );
                  },
                  loading: () => const SizedBox(),
                  error: (_, __) => const SizedBox(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

/// Write letter dialog
class WriteLetterDialog extends ConsumerStatefulWidget {
  final String pageId;
  final Color primaryColor;

  const WriteLetterDialog({
    super.key,
    required this.pageId,
    required this.primaryColor,
  });

  @override
  ConsumerState<WriteLetterDialog> createState() => _WriteLetterDialogState();
}

class _WriteLetterDialogState extends ConsumerState<WriteLetterDialog> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _videoUrlController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _videoUrlController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập tiêu đề'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    if (_contentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập nội dung'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    if (_contentController.text.length > 2000) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nội dung tối đa 2000 ký tự'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    try {
      await runWithLoading(ref, () async {
        final repository = ref.read(contentRepositoryProvider);
        await repository.createLetter(
          pageId: widget.pageId,
          title: _titleController.text.trim(),
          content: _contentController.text.trim(),
          videoUrl: _videoUrlController.text.trim().isNotEmpty
              ? _videoUrlController.text.trim()
              : null,
        );
      });

      ref.read(refreshLettersProvider)();

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã gửi thư'),
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
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        width: 500,
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Icon(Icons.edit, color: widget.primaryColor),
                  const SizedBox(width: 12),
                  Text(
                    'Viết thư tình',
                    style: AppTextStyles.h1(color: Colors.black87),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Title
              Text(
                'Tiêu đề (${_titleController.text.length}/50)',
                style: AppTextStyles.body(color: Colors.black87),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _titleController,
                maxLength: 50,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Tiêu đề bức thư...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  counterText: '',
                ),
              ),

              const SizedBox(height: 16),

              // Content
              Text(
                'Nội dung (${_contentController.text.length}/2000)',
                style: AppTextStyles.body(color: Colors.black87),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _contentController,
                maxLength: 2000,
                maxLines: 6,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Viết những lời yêu thương...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  counterText: '',
                ),
              ),

              const SizedBox(height: 16),

              // Video URL (optional)
              Text(
                'Video (tùy chọn)',
                style: AppTextStyles.body(color: Colors.black87),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _videoUrlController,
                decoration: InputDecoration(
                  hintText: 'Dán link YouTube hoặc TikTok...',
                  prefixIcon: const Icon(Icons.videocam),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Submit button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _submit,
                  icon: const Icon(Icons.send),
                  label: const Text('Gửi thư'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.primaryColor,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Reply dialog
class ReplyDialog extends ConsumerStatefulWidget {
  final String letterId;
  final Color primaryColor;

  const ReplyDialog({
    super.key,
    required this.letterId,
    required this.primaryColor,
  });

  @override
  ConsumerState<ReplyDialog> createState() => _ReplyDialogState();
}

class _ReplyDialogState extends ConsumerState<ReplyDialog> {
  final _contentController = TextEditingController();

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

    if (_contentController.text.length > 150) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Phản hồi tối đa 150 ký tự'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    try {
      await runWithLoading(ref, () async {
        final repository = ref.read(letterReplyRepositoryProvider);
        await repository.createReply(
          letterId: widget.letterId,
          content: _contentController.text.trim(),
        );
      });

      ref.read(refreshLetterRepliesProvider)(widget.letterId);

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã gửi phản hồi'),
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
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        width: 400,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Icon(Icons.reply, color: widget.primaryColor),
                const SizedBox(width: 12),
                Text(
                  'Phản hồi',
                  style: AppTextStyles.h1(color: Colors.black87),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Content
            Text(
              'Nội dung (${_contentController.text.length}/150)',
              style: AppTextStyles.body(color: Colors.black87),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _contentController,
              maxLength: 150,
              maxLines: 3,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Viết phản hồi...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                counterText: '',
              ),
            ),

            const SizedBox(height: 16),

            // Submit button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _submit,
                icon: const Icon(Icons.send),
                label: const Text('Gửi'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: widget.primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
