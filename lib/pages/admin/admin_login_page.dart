import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/design_system.dart';
import '../../core/loading_provider.dart';
import '../../providers/auth_provider.dart';

class AdminLoginPage extends ConsumerStatefulWidget {
  const AdminLoginPage({super.key});

  @override
  ConsumerState<AdminLoginPage> createState() => _AdminLoginPageState();
}

class _AdminLoginPageState extends ConsumerState<AdminLoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    try {
      await runWithLoading(ref, () async {
        final authRepo = ref.read(authRepositoryProvider);
        await authRepo.signIn(
          _emailController.text.trim(),
          _passwordController.text,
        );
      });

      // Invalidate auth state to trigger re-check
      ref.invalidate(authStateProvider);

      if (mounted) {
        context.go('/admin/dashboard');
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1a2332),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Lock Icon
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: const Color(0xFF8B5CF6),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Icon(
                      Icons.lock_outline,
                      size: 56,
                      color: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Title
                  Text(
                    'Cổng Quản Trị',
                    style: AppTextStyles.h1(color: Colors.white).copyWith(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Subtitle
                  Text(
                    'Đăng nhập để quản lý nền tảng',
                    style: AppTextStyles.body(color: Colors.white60),
                  ),

                  const SizedBox(height: 48),

                  // Login Form
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: const Color(0xFF243447),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Email Label
                          Text(
                            'Tên đăng nhập',
                            style: AppTextStyles.body(color: Colors.white70),
                          ),

                          const SizedBox(height: 8),

                          // Username Input
                          TextFormField(
                            controller: _emailController,
                            autofocus: true,
                            keyboardType: TextInputType.text,
                            textInputAction: TextInputAction.next,
                            style: AppTextStyles.body(color: Colors.white),
                            decoration: InputDecoration(
                              hintText: 'Nhập tên đăng nhập',
                              hintStyle: AppTextStyles.body(
                                color: Colors.white30,
                              ),
                              prefixIcon: const Icon(
                                Icons.person_outline,
                                color: Colors.white54,
                              ),
                              filled: true,
                              fillColor: const Color(0xFF1a2332),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 16,
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Vui lòng nhập tên đăng nhập';
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 24),

                          // Password Label
                          Text(
                            'Mật khẩu',
                            style: AppTextStyles.body(color: Colors.white70),
                          ),

                          const SizedBox(height: 8),

                          // Password Input
                          TextFormField(
                            controller: _passwordController,
                            obscureText: true,
                            keyboardType: TextInputType.visiblePassword,
                            textInputAction: TextInputAction.done,
                            onFieldSubmitted: (_) => _handleLogin(),
                            style: AppTextStyles.body(color: Colors.white),
                            decoration: InputDecoration(
                              hintText: 'Nhập mật khẩu',
                              hintStyle: AppTextStyles.body(
                                color: Colors.white30,
                              ),
                              prefixIcon: const Icon(
                                Icons.lock_outline,
                                color: Colors.white54,
                              ),
                              filled: true,
                              fillColor: const Color(0xFF1a2332),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 16,
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Vui lòng nhập mật khẩu';
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 8),

                          // Error Message
                          if (_errorMessage != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(
                                _errorMessage!,
                                style: AppTextStyles.caption(
                                  color: Colors.redAccent,
                                ),
                              ),
                            ),

                          const SizedBox(height: 32),

                          // Login Button
                          SizedBox(
                            width: double.infinity,
                            child: PrimaryButton(
                              text: 'Đăng Nhập',
                              backgroundColor: const Color(0xFF8B5CF6),
                              onPressed: _handleLogin,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Footer
                  Text(
                    'Nền tảng Lưu giữ Kỷ niệm Cá nhân',
                    style: AppTextStyles.caption(color: Colors.white38),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
