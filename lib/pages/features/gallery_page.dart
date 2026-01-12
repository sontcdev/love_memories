import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import '../../core/design_system.dart';
import '../../core/loading_provider.dart';
import '../../models/content_item_model.dart';
import '../../providers/content_provider.dart';

class GalleryPage extends ConsumerStatefulWidget {
  final String pageId;
  final Color backgroundColor;

  const GalleryPage({
    super.key,
    required this.pageId,
    required this.backgroundColor,
  });

  @override
  ConsumerState<GalleryPage> createState() => _GalleryPageState();
}

class _GalleryPageState extends ConsumerState<GalleryPage> {
  Future<void> _uploadImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile == null) return;

    try {
      final bytes = await pickedFile.readAsBytes();

      // Compress image to ~50KB
      var compressed = await FlutterImageCompress.compressWithList(
        bytes,
        minWidth: 800,
        minHeight: 800,
        quality: 85,
      );

      var quality = 85;
      while (compressed.length > 50 * 1024 && quality > 20) {
        quality -= 10;
        compressed = await FlutterImageCompress.compressWithList(
          bytes,
          minWidth: 600,
          minHeight: 600,
          quality: quality,
        );
      }

      await runWithLoading(ref, () async {
        final repository = ref.read(contentRepositoryProvider);

        // Upload image
        final filename =
            '${widget.pageId}_${DateTime.now().millisecondsSinceEpoch}.jpg';
        final imageUrl = await repository.uploadImage(
          Uint8List.fromList(compressed),
          filename,
        );

        // Create gallery item
        await repository.createGalleryItem(
          pageId: widget.pageId,
          imageUrl: imageUrl,
        );

        // Refresh gallery
        ref.read(refreshGalleryProvider)();
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Đã thêm ảnh (${(compressed.length / 1024).toStringAsFixed(1)} KB)',
            ),
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

  void _openFullscreen(List<ContentItemModel> items, int initialIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FullscreenGallery(
          items: items,
          initialIndex: initialIndex,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final galleryAsync = ref.watch(galleryItemsProvider(widget.pageId));

    return Scaffold(
      backgroundColor: widget.backgroundColor,
      appBar: AppBar(
        backgroundColor: widget.backgroundColor,
        title: const Text('Khoảnh Khắc Của Chúng Mình 📸'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_photo_alternate),
            onPressed: _uploadImage,
            tooltip: 'Thêm ảnh',
          ),
        ],
      ),
      body: galleryAsync.when(
        data: (items) {
          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.photo_library_outlined,
                    size: 64,
                    color: Colors.black26,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Chưa có ảnh nào',
                    style: AppTextStyles.body(color: Colors.black38),
                  ),
                  const SizedBox(height: 8),
                  TextButton.icon(
                    onPressed: _uploadImage,
                    icon: const Icon(Icons.add),
                    label: const Text('Thêm ảnh đầu tiên'),
                  ),
                ],
              ),
            );
          }

          return Padding(
            padding: const EdgeInsets.all(8),
            child: MasonryGridView.count(
              crossAxisCount: 2,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return GestureDetector(
                  onTap: () => _openFullscreen(items, index),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      item.imageUrl!,
                      fit: BoxFit.cover,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return AspectRatio(
                          aspectRatio: 1,
                          child: Container(
                            color: Colors.grey[300],
                            child: const Center(
                              child: CircularProgressIndicator(),
                            ),
                          ),
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
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text('Lỗi: $error'),
        ),
      ),
    );
  }
}

/// Fullscreen gallery viewer
class FullscreenGallery extends StatefulWidget {
  final List<ContentItemModel> items;
  final int initialIndex;

  const FullscreenGallery({
    super.key,
    required this.items,
    required this.initialIndex,
  });

  @override
  State<FullscreenGallery> createState() => _FullscreenGalleryState();
}

class _FullscreenGalleryState extends State<FullscreenGallery> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          '${_currentIndex + 1} / ${widget.items.length}',
          style: const TextStyle(color: Colors.white),
        ),
      ),
      body: PhotoViewGallery.builder(
        pageController: _pageController,
        itemCount: widget.items.length,
        builder: (context, index) {
          return PhotoViewGalleryPageOptions(
            imageProvider: NetworkImage(widget.items[index].imageUrl!),
            minScale: PhotoViewComputedScale.contained,
            maxScale: PhotoViewComputedScale.covered * 2,
          );
        },
        onPageChanged: (index) {
          setState(() => _currentIndex = index);
        },
        backgroundDecoration: const BoxDecoration(
          color: Colors.black,
        ),
      ),
    );
  }
}
