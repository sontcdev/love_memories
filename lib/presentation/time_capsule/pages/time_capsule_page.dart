import 'package:flutter/material.dart';

/// Time Capsule Page - Future messages and memories
class TimeCapsulePage extends StatelessWidget {
  const TimeCapsulePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hộp Thời Gian'),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock_clock, size: 80),
            SizedBox(height: 16),
            Text('Time Capsule Feature - Coming Soon'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Create time capsule
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
