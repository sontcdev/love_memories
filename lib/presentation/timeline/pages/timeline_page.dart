import 'package:flutter/material.dart';

/// Timeline Page - Events and memories timeline
class TimelinePage extends StatelessWidget {
  const TimelinePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dòng Thời Gian'),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.timeline, size: 80),
            SizedBox(height: 16),
            Text('Timeline Feature - Coming Soon'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add event
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
