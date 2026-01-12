import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/design_system.dart';
import '../../core/loading_provider.dart';
import '../../models/page_model.dart';
import '../../providers/pages_provider.dart';
import '../../providers/session_provider.dart';
import '../../widgets/shake_widget.dart';
import 'onboarding_wizard.dart';

class AuthPage extends ConsumerStatefulWidget {
  final String slug;

  const AuthPage({super.key, required this.slug});

  @override
  ConsumerState<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends ConsumerState<AuthPage> {
  String _pin = '';
  int _failedAttempts = 0;
  bool _isLocked = false;
  DateTime? _lockoutUntil;
  bool _shouldShake = false;
  PageModel? _page;

  @override
  void initState() {
    super.initState();
    _loadPage();
    _checkLockout();
  }

  Future<void> _loadPage() async {
    try {
      final repository = ref.read(pagesRepositoryProvider);
      final page = await repository.getPageByUsername(widget.slug);

      if (page == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Page not found')),
          );
          context.go('/');
        }
        return;
      }

      setState(() => _page = page);

      // If no passcode, go to onboarding
      if (page.passcodeHash == null || page.passcodeHash!.isEmpty) {
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) => OnboardingWizard(page: page),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _checkLockout() async {
    final prefs = await SharedPreferences.getInstance();
    final lockoutTimestamp = prefs.getInt('lockout_until_${widget.slug}');

    if (lockoutTimestamp != null) {
      final lockoutTime = DateTime.fromMillisecondsSinceEpoch(lockoutTimestamp);
      if (lockoutTime.isAfter(DateTime.now())) {
        setState(() {
          _isLocked = true;
          _lockoutUntil = lockoutTime;
        });
      } else {
        // Clear expired lockout
        await prefs.remove('lockout_until_${widget.slug}');
        await prefs.remove('failed_attempts_${widget.slug}');
      }
    }

    // Load failed attempts
    final attempts = prefs.getInt('failed_attempts_${widget.slug}') ?? 0;
    setState(() => _failedAttempts = attempts);
  }

  void _onNumberPressed(String number) {
    if (_isLocked || _pin.length >= 6) return;

    setState(() {
      _pin += number;
    });

    // Auto-submit khi đủ 6 số
    if (_pin.length == 6) {
      _verifyPin();
    }
  }

  void _onBackspace() {
    if (_isLocked || _pin.isEmpty) return;

    setState(() {
      _pin = _pin.substring(0, _pin.length - 1);
    });
  }

  Future<void> _verifyPin() async {
    if (_page == null) return;

    try {
      final verified = await runWithLoading(ref, () async {
        final repository = ref.read(pagesRepositoryProvider);
        final result = await repository.verifyPin(widget.slug, _pin);
        return result != null;
      });

      if (verified) {
        // Success - clear attempts and navigate
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('failed_attempts_${widget.slug}');

        // Set session
        ref.read(authenticatedPageIdProvider.notifier).state = _page!.id;

        if (mounted) {
          context.go('/${widget.slug}/dashboard');
        }
      } else {
        // Failed
        await _handleFailedAttempt();
      }
    } catch (e) {
      setState(() {
        _pin = '';
        _shouldShake = true;
      });
    }
  }

  Future<void> _handleFailedAttempt() async {
    final prefs = await SharedPreferences.getInstance();
    final newAttempts = _failedAttempts + 1;

    await prefs.setInt('failed_attempts_${widget.slug}', newAttempts);

    setState(() {
      _failedAttempts = newAttempts;
      _pin = '';
      _shouldShake = true;
    });

    // Lockout after 5 attempts
    if (newAttempts >= 5) {
      final lockoutTime = DateTime.now().add(const Duration(minutes: 10));
      await prefs.setInt(
        'lockout_until_${widget.slug}',
        lockoutTime.millisecondsSinceEpoch,
      );

      setState(() {
        _isLocked = true;
        _lockoutUntil = lockoutTime;
      });
    }
  }

  Color _getBackgroundColor() {
    if (_page == null) return AppColors.loveBackground;

    switch (_page!.templateType) {
      case TemplateType.love:
        return AppColors.loveBackground;
      case TemplateType.every:
        return AppColors.everyBackground;
      case TemplateType.idol:
        return AppColors.idolBackground;
    }
  }

  Color _getPrimaryColor() {
    if (_page == null) return AppColors.lovePrimary;

    switch (_page!.templateType) {
      case TemplateType.love:
        return AppColors.lovePrimary;
      case TemplateType.every:
        return AppColors.everyPrimary;
      case TemplateType.idol:
        return const Color(0xFF8B5CF6);
    }
  }

  IconData _getLogoIcon() {
    if (_page == null) return Icons.favorite;

    switch (_page!.templateType) {
      case TemplateType.love:
        return Icons.favorite;
      case TemplateType.every:
        return Icons.calendar_today;
      case TemplateType.idol:
        return Icons.star;
    }
  }

  String _getTitle() {
    if (_page == null) return 'Memorac';

    switch (_page!.templateType) {
      case TemplateType.love:
        return 'Memorac Love';
      case TemplateType.every:
        return 'Memorac Every';
      case TemplateType.idol:
        return 'Memorac Idol';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_page == null) {
      return Scaffold(
        backgroundColor: AppColors.loveBackground,
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      backgroundColor: _getBackgroundColor(),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: _getPrimaryColor(),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: _getPrimaryColor().withOpacity(0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Icon(
                      _getLogoIcon(),
                      size: 56,
                      color: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Title
                  Text(
                    _getTitle(),
                    style: AppTextStyles.h1(color: Colors.black87).copyWith(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Subtitle
                  Text(
                    'Mật mã ký niệm của chúng mình là gì nhỉ?',
                    style: AppTextStyles.body(color: Colors.black45),
                    textAlign: TextAlign.center,
                  ),

                  const SizedBox(height: 40),

                  // White Card Container
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 30,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        // PIN Input with shake
                        ShakeWidget(
                          shake: _shouldShake,
                          onAnimationComplete: () {
                            setState(() => _shouldShake = false);
                          },
                          child: PinCodeInput(
                            pin: _pin,
                            filledColor: _getPrimaryColor(),
                            emptyColor: const Color(0xFFF5F5F5),
                            borderColor: const Color(0xFFE0E0E0),
                          ),
                        ),

                        const SizedBox(height: 32),

                        // Lockout message or numpad
                        if (_isLocked && _lockoutUntil != null)
                          _buildLockoutMessage()
                        else
                          Column(
                            children: [
                              // Numpad
                              SizedBox(
                                width: 350,
                                child: VirtualNumpad(
                                  onNumberPressed: _onNumberPressed,
                                  onBackspace: _onBackspace,
                                  buttonColor: const Color(0xFFF5F5F5),
                                  textColor: Colors.black87,
                                  backspaceColor: _getPrimaryColor(),
                                ),
                              ),

                              const SizedBox(height: 24),

                              // Unlock button
                              SizedBox(
                                width: double.infinity,
                                height: 56,
                                child: ElevatedButton(
                                  onPressed: _pin.length == 6 ? _verifyPin : null,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: _getPrimaryColor(),
                                    disabledBackgroundColor: _getPrimaryColor().withOpacity(0.4),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    elevation: 0,
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.lock_open, color: Colors.white),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Mở khóa',
                                        style: AppTextStyles.body(color: Colors.white).copyWith(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Footer
                  Text(
                    'Ký niệm của bạn được bảo vệ 💕',
                    style: AppTextStyles.caption(color: Colors.black38),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLockoutMessage() {
    final remaining = _lockoutUntil!.difference(DateTime.now());
    final minutes = remaining.inMinutes;
    final seconds = remaining.inSeconds % 60;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.redAccent.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.redAccent),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.lock_clock,
            color: Colors.redAccent,
            size: 48,
          ),
          const SizedBox(height: 12),
          Text(
            'Bạn đã nhập sai quá nhiều lần',
            style: AppTextStyles.body(color: Colors.redAccent)
                .copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Thử lại sau: $minutes phút $seconds giây',
            style: AppTextStyles.caption(color: Colors.redAccent),
          ),
        ],
      ),
    );
  }
}
