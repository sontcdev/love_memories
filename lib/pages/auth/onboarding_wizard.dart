import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import '../../core/design_system.dart';
import '../../core/loading_provider.dart';
import '../../models/page_model.dart';
import '../../models/page_data_model.dart';
import '../../providers/pages_provider.dart';
import '../../providers/session_provider.dart';

class OnboardingWizard extends ConsumerStatefulWidget {
  final PageModel page;

  const OnboardingWizard({super.key, required this.page});

  @override
  ConsumerState<OnboardingWizard> createState() => _OnboardingWizardState();
}

class _OnboardingWizardState extends ConsumerState<OnboardingWizard> {
  int _currentStep = 0;

  // Step 1: PIN
  String _pin = '';
  String _confirmPin = '';

  // Step 2: Mode
  ModeCount _selectedMode = ModeCount.up;

  // Step 3: Participants
  final _participant1NameController = TextEditingController();
  final _participant1AgeController = TextEditingController();
  final _participant2NameController = TextEditingController();
  final _participant2AgeController = TextEditingController();

  // Step 4: Image
  Uint8List? _imageBytes;

  @override
  void dispose() {
    _participant1NameController.dispose();
    _participant1AgeController.dispose();
    _participant2NameController.dispose();
    _participant2AgeController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 3) {
      setState(() => _currentStep++);
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  bool _validateStep1() {
    if (_pin.length != 6) {
      _showError('PIN phải là 6 chữ số');
      return false;
    }

    if (_pin != _confirmPin) {
      _showError('PIN không khớp');
      return false;
    }

    // Check weak PINs
    final weakPins = [
      '000000',
      '111111',
      '222222',
      '333333',
      '444444',
      '555555',
      '666666',
      '777777',
      '888888',
      '999999',
      '123456',
      '654321',
    ];

    if (weakPins.contains(_pin)) {
      _showError('PIN này quá dễ đoán. Vui lòng chọn PIN khác.');
      return false;
    }

    return true;
  }

  bool _validateStep3() {
    if (_participant1NameController.text.isEmpty ||
        _participant2NameController.text.isEmpty) {
      _showError('Vui lòng nhập tên cho cả hai người');
      return false;
    }

    if (_participant1AgeController.text.isEmpty ||
        _participant2AgeController.text.isEmpty) {
      _showError('Vui lòng nhập tuổi cho cả hai người');
      return false;
    }

    return true;
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.redAccent,
      ),
    );
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      final bytes = await pickedFile.readAsBytes();

      // Compress image
      final compressed = await FlutterImageCompress.compressWithList(
        bytes,
        minWidth: 800,
        minHeight: 800,
        quality: 85,
      );

      // Keep compressing if still > 50KB
      var finalBytes = compressed;
      var quality = 85;

      while (finalBytes.length > 50 * 1024 && quality > 20) {
        quality -= 10;
        finalBytes = await FlutterImageCompress.compressWithList(
          bytes,
          minWidth: 600,
          minHeight: 600,
          quality: quality,
        );
      }

      setState(() {
        _imageBytes = Uint8List.fromList(finalBytes);
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã nén ảnh: ${(finalBytes.length / 1024).toStringAsFixed(2)} KB'),
          backgroundColor: Colors.greenAccent,
        ),
      );
    }
  }

  Future<void> _complete() async {
    try {
      await runWithLoading(ref, () async {
        final repository = ref.read(pagesRepositoryProvider);

        // 1. Update passcode
        await repository.updatePasscode(widget.page.id, _pin);

        // 2. Upload image if selected
        String? imageUrl;
        if (_imageBytes != null) {
          final filename = '${widget.page.id}_${DateTime.now().millisecondsSinceEpoch}.jpg';
          imageUrl = await repository.uploadImage(_imageBytes!, filename);
        }

        // 3. Create participants
        final participants = [
          Participant(
            name: _participant1NameController.text,
            age: int.parse(_participant1AgeController.text),
            role: 'Partner 1',
          ),
          Participant(
            name: _participant2NameController.text,
            age: int.parse(_participant2AgeController.text),
            role: 'Partner 2',
          ),
        ];

        // 4. Create page_data
        await repository.createPageData(
          pageId: widget.page.id,
          modeCount: _selectedMode,
          participants: participants,
          titleText: '${_participant1NameController.text} & ${_participant2NameController.text}',
          mainImageUrl: imageUrl,
        );

        // 5. Set session
        ref.read(authenticatedPageIdProvider.notifier).state = widget.page.id;
      });

      if (mounted) {
        context.go('/${widget.page.username}/dashboard');
      }
    } catch (e) {
      _showError('Lỗi: ${e.toString()}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final backgroundColor = _getBackgroundColor();
    final primaryColor = _getPrimaryColor();

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: primaryColor,
        title: const Text('Thiết lập ban đầu'),
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress indicator
            LinearProgressIndicator(
              value: (_currentStep + 1) / 4,
              backgroundColor: Colors.white24,
              valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
            ),

            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    if (_currentStep == 0) _buildStep1(primaryColor),
                    if (_currentStep == 1) _buildStep2(primaryColor),
                    if (_currentStep == 2) _buildStep3(primaryColor),
                    if (_currentStep == 3) _buildStep4(primaryColor),
                  ],
                ),
              ),
            ),

            // Navigation
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  if (_currentStep > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _prevStep,
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: BorderSide(color: primaryColor),
                        ),
                        child: Text(
                          'Quay lại',
                          style: AppTextStyles.body(color: primaryColor),
                        ),
                      ),
                    ),
                  if (_currentStep > 0) const SizedBox(width: 16),
                  Expanded(
                    child: PrimaryButton(
                      text: _currentStep == 3 ? 'Hoàn thành' : 'Tiếp tục',
                      backgroundColor: primaryColor,
                      onPressed: () {
                        if (_currentStep == 0 && !_validateStep1()) return;
                        if (_currentStep == 2 && !_validateStep3()) return;

                        if (_currentStep == 3) {
                          _complete();
                        } else {
                          _nextStep();
                        }
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep1(Color primaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Bước 1: Tạo mã PIN',
          style: AppTextStyles.h1(color: Colors.black87),
        ),
        const SizedBox(height: 8),
        Text(
          'Tạo mã PIN 6 chữ số để bảo vệ kỷ niệm của bạn',
          style: AppTextStyles.body(color: Colors.black54),
        ),
        const SizedBox(height: 32),

        // PIN Input
        Text(
          'Nhập mã PIN',
          style: AppTextStyles.body(color: Colors.black87),
        ),
        const SizedBox(height: 8),
        TextField(
          onChanged: (value) => setState(() => _pin = value),
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: true,
          style: AppTextStyles.body(color: Colors.black),
          decoration: InputDecoration(
            hintText: 'Nhập 6 chữ số',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Confirm PIN
        Text(
          'Xác nhận mã PIN',
          style: AppTextStyles.body(color: Colors.black87),
        ),
        const SizedBox(height: 8),
        TextField(
          onChanged: (value) => setState(() => _confirmPin = value),
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: true,
          style: AppTextStyles.body(color: Colors.black),
          decoration: InputDecoration(
            hintText: 'Nhập lại 6 chữ số',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Warning
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.orange.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.orange),
          ),
          child: Row(
            children: [
              const Icon(Icons.warning_amber, color: Colors.orange),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Không sử dụng PIN dễ đoán (000000, 123456...)',
                  style: AppTextStyles.caption(color: Colors.orange),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStep2(Color primaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Bước 2: Chế độ đếm ngày',
          style: AppTextStyles.h1(color: Colors.black87),
        ),
        const SizedBox(height: 8),
        Text(
          'Chọn cách bạn muốn đếm kỷ niệm',
          style: AppTextStyles.body(color: Colors.black54),
        ),
        const SizedBox(height: 32),

        ...ModeCount.values.map((mode) {
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: RadioListTile<ModeCount>(
              value: mode,
              groupValue: _selectedMode,
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedMode = value);
                }
              },
              title: Text(
                mode.displayName,
                style: AppTextStyles.body(color: Colors.black87),
              ),
              activeColor: primaryColor,
              tileColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildStep3(Color primaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Bước 3: Thông tin',
          style: AppTextStyles.h1(color: Colors.black87),
        ),
        const SizedBox(height: 8),
        Text(
          'Nhập thông tin cho cả hai người',
          style: AppTextStyles.body(color: Colors.black54),
        ),
        const SizedBox(height: 32),

        // Partner 1
        Text(
          'Người thứ nhất',
          style: AppTextStyles.body(color: Colors.black87)
              .copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _participant1NameController,
          style: AppTextStyles.body(color: Colors.black),
          decoration: InputDecoration(
            labelText: 'Tên',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _participant1AgeController,
          keyboardType: TextInputType.number,
          style: AppTextStyles.body(color: Colors.black),
          decoration: InputDecoration(
            labelText: 'Tuổi',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
        ),

        const SizedBox(height: 24),

        // Partner 2
        Text(
          'Người thứ hai',
          style: AppTextStyles.body(color: Colors.black87)
              .copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _participant2NameController,
          style: AppTextStyles.body(color: Colors.black),
          decoration: InputDecoration(
            labelText: 'Tên',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _participant2AgeController,
          keyboardType: TextInputType.number,
          style: AppTextStyles.body(color: Colors.black),
          decoration: InputDecoration(
            labelText: 'Tuổi',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
           ),
          ),
        ),
      ],
    );
  }

  Widget _buildStep4(Color primaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Bước 4: Ảnh đại diện',
          style: AppTextStyles.h1(color: Colors.black87),
        ),
        const SizedBox(height: 8),
        Text(
          'Tải lên ảnh đại diện chung (tùy chọn)',
          style: AppTextStyles.body(color: Colors.black54),
        ),
        const SizedBox(height: 32),

        // Image preview
        if (_imageBytes != null)
          Center(
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                image: DecorationImage(
                  image: MemoryImage(_imageBytes!),
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),

        const SizedBox(height: 24),

        // Pick image button
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: _pickImage,
            icon: const Icon(Icons.image),
            label: Text(
              _imageBytes == null ? 'Chọn ảnh' : 'Chọn ảnh khác',
              style: AppTextStyles.body(color: primaryColor),
            ),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              side: BorderSide(color: primaryColor),
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Info
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.blue),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline, color: Colors.blue),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Ảnh sẽ được tự động nén để tiết kiệm dung lượng',
                  style: AppTextStyles.caption(color: Colors.blue),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Color _getBackgroundColor() {
    switch (widget.page.templateType) {
      case TemplateType.love:
        return AppColors.loveBackground;
      case TemplateType.every:
        return AppColors.everyBackground;
      case TemplateType.idol:
        return AppColors.idolBackground;
    }
  }

  Color _getPrimaryColor() {
    switch (widget.page.templateType) {
      case TemplateType.love:
        return AppColors.lovePrimary;
      case TemplateType.every:
        return AppColors.everyPrimary;
      case TemplateType.idol:
        return const Color(0xFF8B5CF6);
    }
  }
}
