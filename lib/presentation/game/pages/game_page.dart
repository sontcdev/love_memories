import 'package:flutter/material.dart';

/// Game Page - Games and activities
class GamePage extends StatelessWidget {
  const GamePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trò Chơi'),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.games, size: 80),
            SizedBox(height: 16),
            Text('Game Feature - Coming Soon'),
          ],
        ),
      ),
    );
  }
}
