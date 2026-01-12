import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/design_system.dart';
import '../../models/content_item_model.dart';
import '../../providers/content_provider.dart';

class TimelinePage extends ConsumerWidget {
  final String pageId;
  final Color backgroundColor;
  final Color primaryColor;

  const TimelinePage({
    super.key,
    required this.pageId,
    required this.backgroundColor,
    required this.primaryColor,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final timelineAsync = ref.watch(
      contentRepositoryProvider.select((repo) => repo.fetchTimelineItems(pageId)),
    );

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: backgroundColor,
        title: const Text('Câu Chuyện Của Chúng Mình 💕'),
      ),
      body: FutureBuilder<List<ContentItemModel>>(
        future: ref.read(contentRepositoryProvider).fetchTimelineItems(pageId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Lỗi: ${snapshot.error}'));
          }

          final items = snapshot.data ?? [];

          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.timeline,
                    size: 64,
                    color: Colors.black26,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Chưa có câu chuyện nào',
                    style: AppTextStyles.body(color: Colors.black38),
                  ),
                ],
              ),
            );
          }

          // Sort ASC (oldest first)
          items.sort((a, b) => (a.dateEvent ?? a.createdAt)
              .compareTo(b.dateEvent ?? b.createdAt));

          return ListView.builder(
            padding: const EdgeInsets.all(24),
            itemCount: items.length,
            itemBuilder: (context, index) {
              return TimelineItemWidget(
                item: items[index],
                isLast: index == items.length - 1,
                primaryColor: primaryColor,
              );
            },
          );
        },
      ),
    );
  }
}

/// Timeline item widget
class TimelineItemWidget extends StatelessWidget {
  final ContentItemModel item;
  final bool isLast;
  final Color primaryColor;

  const TimelineItemWidget({
    super.key,
    required this.item,
    required this.isLast,
    required this.primaryColor,
  });

  @override
  Widget build(BuildContext context) {
    final date = item.dateEvent ?? item.createdAt;
    final day = DateFormat('dd').format(date);
    final month = DateFormat('MMM', 'vi').format(date);

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left: Date badge + vertical line
          Column(
            children: [
              // Date badge
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: primaryColor,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withOpacity(0.3),
                      blurRadius: 8,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      day,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      month,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),

              // Vertical line
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    color: primaryColor.withOpacity(0.3),
                  ),
                ),
            ],
          ),

          const SizedBox(width: 20),

          // Right: Content card
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: TimelineCard(
                item: item,
                primaryColor: primaryColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Timeline content card
class TimelineCard extends StatelessWidget {
  final ContentItemModel item;
  final Color primaryColor;

  const TimelineCard({
    super.key,
    required this.item,
    required this.primaryColor,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd MMMM, yyyy', 'vi');
    final date = item.dateEvent ?? item.createdAt;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Date text
          Text(
            dateFormat.format(date),
            style: AppTextStyles.caption(color: primaryColor),
          ),

          const SizedBox(height: 8),

          // Title
          if (item.title != null && item.title!.isNotEmpty)
            Text(
              item.title!,
              style: AppTextStyles.h1(color: Colors.black87).copyWith(
                fontSize: 20,
              ),
            ),

          const SizedBox(height: 12),

          // Content
          if (item.content != null && item.content!.isNotEmpty)
            Text(
              item.content!,
              style: AppTextStyles.body(color: Colors.black87),
            ),

          // Image
          if (item.imageUrl != null && item.imageUrl!.isNotEmpty) ...[
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                item.imageUrl!,
                width: double.infinity,
                fit: BoxFit.cover,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return Container(
                    height: 200,
                    color: Colors.grey[300],
                    child: const Center(child: CircularProgressIndicator()),
                  );
                },
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 200,
                    color: Colors.grey[300],
                    child: const Icon(Icons.error),
                  );
                },
              ),
            ),
          ],

          // Video link
          if (item.videoUrl != null && item.videoUrl!.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: primaryColor.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.video_library, color: primaryColor),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Video đính kèm',
                          style: AppTextStyles.caption(color: Colors.black54),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.videoUrl!,
                          style: AppTextStyles.caption(color: primaryColor),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Icon(Icons.open_in_new, color: primaryColor, size: 20),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
