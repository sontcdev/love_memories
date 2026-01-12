import 'package:flutter/material.dart';
import '../core/design_system.dart';
import '../models/page_model.dart';
import '../models/page_data_model.dart';
import '../widgets/app_drawer.dart';
import 'template_widget.dart';

/// Idol Template - cho fan page
class IdolTemplate extends TemplateWidget {
  const IdolTemplate({
    super.key,
    required super.page,
    super.pageData,
  });

  @override
  State<IdolTemplate> createState() => _IdolTemplateState();
}

class _IdolTemplateState extends State<IdolTemplate> {
  @override
  Widget build(BuildContext context) {
    final participants = widget.pageData?.participants ?? [];
    final idol = participants.isNotEmpty ? participants[0] : null;
    final fan = participants.length > 1 ? participants[1] : null;

    return Scaffold(
      backgroundColor: AppColors.idolBackground,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // App Bar with Cover Image
            SliverAppBar(
              expandedHeight: 200,
              pinned: true,
              backgroundColor: const Color(0xFF8B5CF6),
              flexibleSpace: FlexibleSpaceBar(
                background: widget.pageData?.mainImageUrl != null
                    ? Image.network(
                        widget.pageData!.mainImageUrl!,
                        fit: BoxFit.cover,
                      )
                    : Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              const Color(0xFF8B5CF6),
                              AppColors.idolBackground,
                            ],
                          ),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.star,
                            size: 80,
                            color: Colors.white,
                          ),
                        ),
                      ),
              ),
            ),

            // Content
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    // Avatars Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildAvatar(
                          name: idol?.name ?? 'Idol',
                          avatarUrl: idol?.avatarUrl,
                          label: 'Idol',
                          color: const Color(0xFF9C27B0),
                        ),
                        const SizedBox(width: 40),
                        // Star Icon
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF8B5CF6).withOpacity(0.3),
                                blurRadius: 10,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.star,
                            color: Color(0xFF8B5CF6),
                            size: 32,
                          ),
                        ),
                        const SizedBox(width: 40),
                        _buildAvatar(
                          name: fan?.name ?? 'Fan',
                          avatarUrl: fan?.avatarUrl,
                          label: 'Fan',
                          color: const Color(0xFF64B5F6),
                        ),
                      ],
                    ),

                    const SizedBox(height: 32),

                    // Title
                    const Text(
                      'Idol Fan Page',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF9C27B0),
                        fontStyle: FontStyle.italic,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: 24),

                    // Idol Info
                    if (idol != null)
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 10,
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Text(
                              idol.name,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Năm sinh: ${DateTime.now().year - idol.age}',
                              style: AppTextStyles.body(color: Colors.black54),
                            ),
                            const SizedBox(height: 16),
                            // Slogan
                            Text(
                              widget.pageData?.titleText ?? 'Fan tự hào ủng hộ',
                              style: AppTextStyles.body(
                                color: const Color(0xFF8B5CF6),
                              ).copyWith(
                                fontStyle: FontStyle.italic,
                                fontWeight: FontWeight.w600,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),

                    const SizedBox(height: 32),

                    // Bottom Menu
                    Wrap(
                      spacing: 16,
                      runSpacing: 16,
                      alignment: WrapAlignment.center,
                      children: [
                        _buildMenuButton(
                          icon: Icons.photo_library,
                          label: 'Khoảnh khắc',
                          onTap: () {},
                        ),
                        _buildMenuButton(
                          icon: Icons.timeline,
                          label: 'Sự nghiệp',
                          onTap: () {},
                        ),
                        _buildMenuButton(
                          icon: Icons.quiz,
                          label: 'Fandom Quiz',
                          onTap: () {},
                        ),
                        _buildMenuButton(
                          icon: Icons.mail,
                          label: 'Gửi Idol',
                          onTap: () {},
                        ),
                      ],
                    ),

                    const SizedBox(height: 40),

                    // Footer
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.star,
                          color: Color(0xFF8B5CF6),
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
          ],
        ),
      ),
      drawer: AppDrawer(page: widget.page),
    );
  }

  Widget _buildAvatar({
    required String name,
    String? avatarUrl,
    required String label,
    required Color color,
  }) {
    return Column(
      children: [
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 3),
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
            backgroundColor: color.withOpacity(0.2),
            child: avatarUrl == null
                ? Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: TextStyle(
                      fontSize: 32,
                      color: color,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
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
            Icon(icon, color: const Color(0xFF8B5CF6), size: 20),
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
