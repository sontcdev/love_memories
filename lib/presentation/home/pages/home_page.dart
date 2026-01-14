import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../config/router_config.dart';

/// Home Page - Main landing page
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kỷ Niệm Số'),
        actions: [
          IconButton(
            icon: const Icon(Icons.admin_panel_settings),
            onPressed: () => context.push(AppRouter.admin),
          ),
        ],
      ),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        children: [
          _buildFeatureCard(
            context,
            title: 'Thư Viện',
            icon: Icons.photo_library,
            color: Colors.purple,
            onTap: () => context.push(AppRouter.gallery),
          ),
          _buildFeatureCard(
            context,
            title: 'Dòng Thời Gian',
            icon: Icons.timeline,
            color: Colors.blue,
            onTap: () => context.push(AppRouter.timeline),
          ),
          _buildFeatureCard(
            context,
            title: 'Trò Chơi',
            icon: Icons.games,
            color: Colors.orange,
            onTap: () => context.push(AppRouter.game),
          ),
          _buildFeatureCard(
            context,
            title: 'Hộp Thời Gian',
            icon: Icons.lock_clock,
            color: Colors.teal,
            onTap: () => context.push(AppRouter.timeCapsule),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                color.withValues(alpha: 0.7),
                color,
              ],
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 64,
                color: Colors.white,
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
