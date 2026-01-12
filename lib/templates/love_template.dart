import 'package:flutter/material.dart';
import '../core/design_system.dart';
import '../models/page_model.dart';
import '../models/page_data_model.dart';
import '../widgets/app_drawer.dart';
import '../widgets/music_fab.dart';
import 'template_widget.dart';

/// Love Template - cho couple
class LoveTemplate extends TemplateWidget {
  const LoveTemplate({
    super.key,
    required super.page,
    super.pageData,
  });

  @override
  State<LoveTemplate> createState() => _LoveTemplateState();
}

class _LoveTemplateState extends State<LoveTemplate>
    with SingleTickerProviderStateMixin {
  late AnimationController _heartController;
  late Animation<double> _heartAnimation;

  @override
  void initState() {
    super.initState();
    _heartController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    )..repeat(reverse: true);

    _heartAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _heartController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _heartController.dispose();
    super.dispose();
  }

  int _calculateDays() {
    final startDate = widget.pageData?.createdAt ?? widget.page.createdAt;
    final now = DateTime.now();
    return now.difference(startDate).inDays;
  }

  @override
  Widget build(BuildContext context) {
    final participants = widget.pageData?.participants ?? [];
    final person1 = participants.isNotEmpty ? participants[0] : null;
    final person2 = participants.length > 1 ? participants[1] : null;

    return Scaffold(
      backgroundColor: AppColors.loveBackground,
      appBar: AppBar(
        backgroundColor: AppColors.loveBackground,
        elevation: 0,
        iconTheme: IconThemeData(color: AppColors.lovePrimary),
      ),
      drawer: AppDrawer(page: widget.page),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                // Avatars Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildAvatar(
                      name: person1?.name ?? 'anh bé iu',
                      avatarUrl: person1?.avatarUrl,
                      color: const Color(0xFFE91E63),
                    ),
                    const SizedBox(width: 40),
                    // Heart with animation
                    ScaleTransition(
                      scale: _heartAnimation,
                      child: Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.lovePrimary.withOpacity(0.3),
                              blurRadius: 10,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.favorite,
                          color: AppColors.lovePrimary,
                          size: 32,
                        ),
                      ),
                    ),
                    const SizedBox(width: 40),
                    _buildAvatar(
                      name: person2?.name ?? 'em bé iu',
                      avatarUrl: person2?.avatarUrl,
                      color: const Color(0xFF9C27B0),
                    ),
                  ],
                ),

                const SizedBox(height: 40),

                // Title with gradient
                ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(
                    colors: [
                      Color(0xFFE91E63),
                      Color(0xFF9C27B0),
                    ],
                  ).createShader(bounds),
                  child: Text(
                    'Đáng iu quá trời ơiii',
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      fontStyle: FontStyle.italic,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),

                const SizedBox(height: 32),

                // Counter Box
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Text(
                        'Tui đã nắm em bé được',
                        style: AppTextStyles.body(color: Colors.black54),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            '${_calculateDays()}',
                            style: TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              color: AppColors.lovePrimary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'ngày',
                            style: AppTextStyles.body(color: Colors.black54),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 40),

                // Bottom Menu
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  alignment: WrapAlignment.center,
                  children: [
                    _buildMenuButton(
                      icon: Icons.image,
                      label: 'Ảnh',
                      onTap: () {},
                    ),
                    _buildMenuButton(
                      icon: Icons.timeline,
                      label: 'Dòng thời gian',
                      onTap: () {},
                    ),
                    _buildMenuButton(
                      icon: Icons.games,
                      label: 'Trò chơi',
                      onTap: () {},
                    ),
                    _buildMenuButton(
                      icon: Icons.mail,
                      label: 'Thư',
                      onTap: () {},
                    ),
                  ],
                ),

                const SizedBox(height: 40),

                // Footer
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.favorite,
                      color: AppColors.lovePrimary,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Được tạo với tình yêu',
                      style: AppTextStyles.caption(color: Colors.black38),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar({
    required String name,
    String? avatarUrl,
    required Color color,
  }) {
    return Column(
      children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 4),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.3),
                blurRadius: 10,
                spreadRadius: 2,
              ),
            ],
          ),
          child: CircleAvatar(
            backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
            backgroundColor: Colors.grey[300],
            child: avatarUrl == null
                ? Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: const TextStyle(fontSize: 36, color: Colors.white),
                  )
                : null,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          name,
          style: AppTextStyles.body(color: Colors.black87),
        ),
      ],
    );
  }

  Widget _buildMenuButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 140,
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppColors.lovePrimary, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: AppTextStyles.caption(color: Colors.black87),
            ),
          ],
        ),
      ),
    );
  }
}
