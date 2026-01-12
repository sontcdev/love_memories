import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/design_system.dart';
import '../../../core/loading_provider.dart';
import '../../../models/page_model.dart';
import '../../../providers/pages_provider.dart';
import '../../../repositories/pages_repository.dart';

class CreateLinkDialog extends ConsumerStatefulWidget {
  const CreateLinkDialog({super.key});

  @override
  ConsumerState<CreateLinkDialog> createState() => _CreateLinkDialogState();
}

class _CreateLinkDialogState extends ConsumerState<CreateLinkDialog> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _pinController = TextEditingController();
  TemplateType _selectedTemplate = TemplateType.love;

  @override
  void dispose() {
    _usernameController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _handleCreate() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      // Check username exists
      final repository = ref.read(pagesRepositoryProvider);
      final exists = await runWithLoading(ref, () async {
        return await repository.usernameExists(_usernameController.text.trim());
      });

      if (exists) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Username đã tồn tại. Vui lòng chọn tên khác.'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
        return;
      }

      // Create page
      final page = await runWithLoading(ref, () async {
        final pin = _pinController.text.trim().isEmpty
            ? null
            : _pinController.text.trim();
        return await repository.createPage(
          username: _usernameController.text.trim(),
          templateType: _selectedTemplate,
          pin: pin,
        );
      });

      if (mounted) {
        // Close create dialog
        Navigator.of(context).pop();

        // Show success dialog
        showDialog(
          context: context,
          builder: (context) => CreateSuccessDialog(
            page: page,
            pin: _pinController.text.trim().isEmpty
                ? '000000'
                : _pinController.text.trim(),
          ),
        );

        // Refresh pages list
        ref.read(refreshPagesProvider)();
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

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF2c3e50),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        width: 500,
        padding: const EdgeInsets.all(32),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tạo Liên Kết Mới',
                        style: AppTextStyles.h1(color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Tạo người dùng mới với liên kết cá nhân hóa',
                        style: AppTextStyles.caption(color: Colors.white60),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white54),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Username
              Text(
                'Tên người dùng',
                style: AppTextStyles.body(color: Colors.white70),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _usernameController,
                style: AppTextStyles.body(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Nhập tên người dùng',
                  hintStyle: AppTextStyles.body(color: Colors.white30),
                  filled: true,
                  fillColor: const Color(0xFF34495e),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF8B5CF6)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF4a5f7f)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: Color(0xFF8B5CF6),
                      width: 2,
                    ),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập tên người dùng';
                  }
                  if (value.contains(' ')) {
                    return 'Tên không được chứa khoảng trắng';
                  }
                  if (!RegExp(r'^[a-z0-9_-]+$').hasMatch(value)) {
                    return 'Chỉ được dùng chữ thường, số, gạch dưới, gạch ngang';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 20),

              // PIN
              Text(
                'Mã PIN (6 chữ số) - Tùy chọn',
                style: AppTextStyles.body(color: Colors.white70),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _pinController,
                style: AppTextStyles.body(color: Colors.white),
                keyboardType: TextInputType.number,
                maxLength: 6,
                decoration: InputDecoration(
                  hintText: 'Tự động tạo mã PIN để trống',
                  hintStyle: AppTextStyles.body(color: Colors.white30),
                  filled: true,
                  fillColor: const Color(0xFF34495e),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF8B5CF6)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF4a5f7f)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: Color(0xFF8B5CF6),
                      width: 2,
                    ),
                  ),
                  counterText: '',
                ),
                validator: (value) {
                  if (value != null && value.isNotEmpty) {
                    if (!RegExp(r'^\d{6}$').hasMatch(value)) {
                      return 'PIN phải là 6 chữ số';
                    }
                  }
                  return null;
                },
              ),
              Text(
                'Để trống để tự động tạo mã PIN 6 chữ số',
                style: AppTextStyles.caption(color: Colors.white38),
              ),

              const SizedBox(height: 20),

              // Template Dropdown
              Text(
                'Loại giao diện',
                style: AppTextStyles.body(color: Colors.white70),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<TemplateType>(
                value: _selectedTemplate,
                dropdownColor: const Color(0xFF34495e),
                style: AppTextStyles.body(color: Colors.white),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFF34495e),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF8B5CF6)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF4a5f7f)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: Color(0xFF8B5CF6),
                      width: 2,
                    ),
                  ),
                ),
                items: TemplateType.values.map((template) {
                  return DropdownMenuItem(
                    value: template,
                    child: Row(
                      children: [
                        Icon(
                          _getTemplateIcon(template),
                          color: _getTemplateColor(template),
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(template.displayName),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedTemplate = value);
                  }
                },
              ),

              const SizedBox(height: 32),

              // Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(
                      'Hủy',
                      style: AppTextStyles.body(color: Colors.white54),
                    ),
                  ),
                  const SizedBox(width: 16),
                  PrimaryButton(
                    text: 'Tạo liên kết',
                    backgroundColor: const Color(0xFF8B5CF6),
                    onPressed: _handleCreate,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getTemplateIcon(TemplateType template) {
    switch (template) {
      case TemplateType.love:
        return Icons.favorite;
      case TemplateType.every:
        return Icons.calendar_today;
      case TemplateType.idol:
        return Icons.star;
    }
  }

  Color _getTemplateColor(TemplateType template) {
    switch (template) {
      case TemplateType.love:
        return Colors.pinkAccent;
      case TemplateType.every:
        return Colors.greenAccent;
      case TemplateType.idol:
        return Colors.blueAccent;
    }
  }
}

// Success Dialog
class CreateSuccessDialog extends StatelessWidget {
  final PageModel page;
  final String pin;

  const CreateSuccessDialog({
    super.key,
    required this.page,
    required this.pin,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF2c3e50),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        width: 500,
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Success Icon
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: Colors.greenAccent,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check,
                size: 48,
                color: Colors.white,
              ),
            ),

            const SizedBox(height: 24),

            // Title
            Text(
              'Đã Tạo Liên Kết Thành Công!',
              style: AppTextStyles.h1(color: Colors.greenAccent),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 8),

            // Subtitle
            Text(
              'Lưu thông tin này - sẽ không hiển thị lại.',
              style: AppTextStyles.caption(color: Colors.white60),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 24),

            // Info Box
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF34495e),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  _buildInfoRow('Tên người dùng:', page.username),
                  const SizedBox(height: 12),
                  _buildInfoRow('Mã PIN:', pin),
                  const SizedBox(height: 12),
                  _buildInfoRow('Liên kết:', '/${page.username}',
                      valueColor: const Color(0xFF8B5CF6)),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Close Button
            SizedBox(
              width: double.infinity,
              child: PrimaryButton(
                text: 'Đóng',
                backgroundColor: Colors.white24,
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTextStyles.body(color: Colors.white60),
        ),
        Text(
          value,
          style: AppTextStyles.body(
            color: valueColor ?? Colors.white,
          ).copyWith(fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
