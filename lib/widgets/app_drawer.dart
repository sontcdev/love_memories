import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/page_model.dart';

/// App Drawer Navigation
class AppDrawer extends StatelessWidget {
  final PageModel page;

  const AppDrawer({super.key, required this.page});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              color: _getHeaderColor(),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  page.username,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _getTemplateLabel(),
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.home),
            title: const Text('Home'),
            onTap: () {
              Navigator.pop(context);
            },
          ),
          ListTile(
            leading: const Icon(Icons.image),
            title: const Text('Ảnh'),
            onTap: () {
              Navigator.pop(context);
              context.go('/${page.username}/gallery');
            },
          ),
          ListTile(
            leading: const Icon(Icons.timeline),
            title: const Text('Dòng thời gian'),
            onTap: () {
              Navigator.pop(context);
              context.go('/${page.username}/timeline');
            },
          ),
          // Game menu - only for Love template
          if (page.templateType == TemplateType.love)
            ListTile(
              leading: const Icon(Icons.games),
              title: const Text('Trò chơi'),
              onTap: () {
                Navigator.pop(context);
                context.go('/${page.username}/game');
              },
            ),
          ListTile(
            leading: const Icon(Icons.mail),
            title: const Text('Thư'),
            onTap: () {
              Navigator.pop(context);
              context.go('/${page.username}/letter');
            },
          ),
          const Divider(),

          // Logout
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Cài đặt'),
            onTap: () {
              Navigator.pop(context);
              context.go('/${page.username}/settings');
            },
          ),

          // Logout
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Đăng xuất'),
            onTap: () {
              Navigator.pop(context);
              // Handle logout
            },
          ),
        ],
      ),
    );
  }

  Color _getHeaderColor() {
    switch (page.templateType) {
      case TemplateType.love:
        return const Color(0xFFE30523);
      case TemplateType.every:
        return const Color(0xFF3D2181);
      case TemplateType.idol:
        return const Color(0xFF8B5CF6);
    }
  }

  String _getTemplateLabel() {
    switch (page.templateType) {
      case TemplateType.love:
        return 'Template Tình Yêu';
      case TemplateType.every:
        return 'Template Gia Đình';
      case TemplateType.idol:
        return 'Template Idol';
    }
  }
}
