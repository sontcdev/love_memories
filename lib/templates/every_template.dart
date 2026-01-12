import 'package:flutter/material.dart';
import '../core/design_system.dart';
import '../models/page_model.dart';
import '../models/page_data_model.dart';
import '../widgets/app_drawer.dart';
import 'template_widget.dart';

/// Every Template - cho gia đình/nhóm
class EveryTemplate extends TemplateWidget {
  const EveryTemplate({
    super.key,
    required super.page,
    super.pageData,
  });

  @override
  State<EveryTemplate> createState() => _EveryTemplateState();
}

class _EveryTemplateState extends State<EveryTemplate> {
  @override
  Widget build(BuildContext context) {
    final participants = widget.pageData?.participants ?? [];

    return Scaffold(
      backgroundColor: AppColors.everyBackground,
      appBar: AppBar(
        backgroundColor: AppColors.everyPrimary,
        elevation: 0,
        title: const Text(
          'Gia đình/Nhóm',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      drawer: AppDrawer(page: widget.page),
      body: SafeArea(
        child: participants.isEmpty
            ? Center(
                child: Text(
                  'Chưa có thành viên',
                  style: AppTextStyles.body(color: Colors.black54),
                ),
              )
            : Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const SizedBox(height: 16),
                    Expanded(
                      child: GridView.builder(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.85,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                        ),
                        itemCount: participants.length,
                        itemBuilder: (context, index) {
                          return _MemberCard(participant: participants[index]);
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Footer
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.favorite,
                          color: AppColors.everyPrimary,
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Được tạo với tình yêu',
                          style: AppTextStyles.caption(color: Colors.black38),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
      ),
    );
  }
}

/// Member card widget
class _MemberCard extends StatelessWidget {
  final Participant participant;

  const _MemberCard({required this.participant});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Avatar
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.everyPrimary,
                width: 3,
              ),
            ),
            child: CircleAvatar(
              backgroundImage: participant.avatarUrl != null
                  ? NetworkImage(participant.avatarUrl!)
                  : null,
              backgroundColor: AppColors.everyPrimary.withOpacity(0.2),
              child: participant.avatarUrl == null
                  ? Text(
                      participant.name.isNotEmpty
                          ? participant.name[0].toUpperCase()
                          : '?',
                      style: TextStyle(
                        fontSize: 32,
                        color: AppColors.everyPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  : null,
            ),
          ),

          const SizedBox(height: 12),

          // Name
          Text(
            participant.name,
            style: AppTextStyles.body(color: Colors.black87).copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: 4),

          // Age
          Text(
            '${participant.age} tuổi',
            style: AppTextStyles.caption(color: Colors.black54),
          ),

          const SizedBox(height: 4),

          // Role
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.everyPrimary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              participant.role,
              style: AppTextStyles.caption(color: AppColors.everyPrimary),
            ),
          ),
        ],
      ),
    );
  }
}
