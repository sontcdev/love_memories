import 'package:flutter/material.dart';

/// Gallery Page - Photo gallery display
class GalleryPage extends StatelessWidget {
  const GalleryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thư Viện Ảnh'),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.photo_library, size: 80),
            SizedBox(height: 16),
            Text('Gallery Feature - Coming Soon'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add image upload
        },
        child: const Icon(Icons.add_a_photo),
      ),
    );
  }
}
