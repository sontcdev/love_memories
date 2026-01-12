import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/global_loading_overlay.dart';
import 'core/design_system.dart';
import 'core/supabase_config.dart';
import 'providers/auth_provider.dart';
import 'pages/admin/admin_login_page.dart';
import 'pages/admin/admin_dashboard_page.dart';
import 'pages/auth/auth_page.dart';
import 'pages/dashboard/dashboard_page.dart';
import 'pages/features/gallery_page.dart';
import 'pages/features/letter_page.dart';
import 'pages/features/game_page.dart';
import 'pages/features/timeline_page.dart';
import 'pages/features/settings_page.dart';
import 'models/page_data_model.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase
  await SupabaseConfig.initialize();

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return MaterialApp.router(
      title: 'Web Embee',
      debugShowCheckedModeBanner: false,
      routerConfig: _router(authState),
      builder: (context, child) {
        // Bọc toàn bộ app với GlobalLoadingOverlay
        return GlobalLoadingOverlay(
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }

  GoRouter _router(AsyncValue<dynamic> authState) {
    return GoRouter(
      initialLocation: '/admin',
      redirect: (context, state) {
        final isLoggedIn = authState.value == true;
        final isGoingToAdmin = state.matchedLocation.startsWith('/admin');

        // Redirect to dashboard if logged in and trying to access login
        if (isLoggedIn && state.matchedLocation == '/admin') {
          return '/admin/dashboard';
        }

        // Redirect to login if not logged in and trying to access dashboard
        if (!isLoggedIn && state.matchedLocation == '/admin/dashboard') {
          return '/admin';
        }

        return null;
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const HomePage(),
        ),
        GoRoute(
          path: '/admin',
          builder: (context, state) => const AdminLoginPage(),
        ),
        GoRoute(
          path: '/admin/dashboard',
          builder: (context, state) => const AdminDashboardPage(),
        ),
        GoRoute(
          path: '/:slug',
          builder: (context, state) {
            final slug = state.pathParameters['slug']!;
            return AuthPage(slug: slug);
          },
        ),
        GoRoute(
          path: '/:slug/dashboard',
          builder: (context, state) {
            final slug = state.pathParameters['slug']!;
            return DashboardPage(slug: slug);
          },
        ),
        GoRoute(
          path: '/:slug/gallery',
          builder: (context, state) {
            final slug = state.pathParameters['slug']!;
            // Get page first to determine background color
            return FutureBuilder(
              future: SupabaseConfig.client
                  .from('pages')
                  .select()
                  .eq('username', slug)
                  .single(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Scaffold(
                    body: Center(child: CircularProgressIndicator()),
                  );
                }
                final pageData = snapshot.data as Map<String, dynamic>;
                final templateType = pageData['template_type'] as String;
                Color bgColor;
                switch (templateType) {
                  case 'LOVE':
                    bgColor = AppColors.loveBackground;
                    break;
                  case 'EVERY':
                    bgColor = AppColors.everyBackground;
                    break;
                  case 'IDOL':
                    bgColor = AppColors.idolBackground;
                    break;
                  default:
                    bgColor = AppColors.loveBackground;
                }
                return GalleryPage(
                  pageId: pageData['id'] as String,
                  backgroundColor: bgColor,
                );
              },
            );
          },
        ),
        GoRoute(
          path: '/:slug/letter',
          builder: (context, state) {
            final slug = state.pathParameters['slug']!;
            return FutureBuilder(
              future: SupabaseConfig.client
                  .from('pages')
                  .select()
                  .eq('username', slug)
                  .single(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Scaffold(
                    body: Center(child: CircularProgressIndicator()),
                  );
                }
                final pageData = snapshot.data as Map<String, dynamic>;
                final templateType = pageData['template_type'] as String;
                Color bgColor;
                Color primaryColor;
                switch (templateType) {
                  case 'LOVE':
                    bgColor = AppColors.loveBackground;
                    primaryColor = AppColors.lovePrimary;
                    break;
                  case 'EVERY':
                    bgColor = AppColors.everyBackground;
                    primaryColor = AppColors.everyPrimary;
                    break;
                  case 'IDOL':
                    bgColor = AppColors.idolBackground;
                    primaryColor = const Color(0xFF8B5CF6);
                    break;
                  default:
                    bgColor = AppColors.loveBackground;
                    primaryColor = AppColors.lovePrimary;
                }
                return LetterPage(
                  pageId: pageData['id'] as String,
                  backgroundColor: bgColor,
                  primaryColor: primaryColor,
                );
              },
            );
          },
        ),
        GoRoute(
          path: '/:slug/game',
          builder: (context, state) {
            final slug = state.pathParameters['slug']!;
            return FutureBuilder(
              future: SupabaseConfig.client
                  .from('pages')
                  .select()
                  .eq('username', slug)
                  .single(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Scaffold(
                    body: Center(child: CircularProgressIndicator()),
                  );
                }
                final pageData = snapshot.data as Map<String, dynamic>;
                final templateType = pageData['template_type'] as String;
                
                // Game only for Love template
                if (templateType != 'LOVE') {
                  return Scaffold(
                    body: Center(
                      child: Text('Game chỉ dành cho Love template'),
                    ),
                  );
                }
                
                return GamePage(
                  backgroundColor: AppColors.loveBackground,
                  primaryColor: AppColors.lovePrimary,
                );
              },
            );
          },
        ),
        GoRoute(
          path: '/:slug/timeline',
          builder: (context, state) {
            final slug = state.pathParameters['slug']!;
            return FutureBuilder(
              future: SupabaseConfig.client
                  .from('pages')
                  .select()
                  .eq('username', slug)
                  .single(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Scaffold(
                    body: Center(child: CircularProgressIndicator()),
                  );
                }
                final pageData = snapshot.data as Map<String, dynamic>;
                final templateType = pageData['template_type'] as String;
                Color bgColor;
                Color primaryColor;
                switch (templateType) {
                  case 'LOVE':
                    bgColor = AppColors.loveBackground;
                    primaryColor = AppColors.lovePrimary;
                    break;
                  case 'EVERY':
                    bgColor = AppColors.everyBackground;
                    primaryColor = AppColors.everyPrimary;
                    break;
                  case 'IDOL':
                    bgColor = AppColors.idolBackground;
                    primaryColor = const Color(0xFF8B5CF6);
                    break;
                  default:
                    bgColor = AppColors.loveBackground;
                    primaryColor = AppColors.lovePrimary;
                }
                return TimelinePage(
                  pageId: pageData['id'] as String,
                  backgroundColor: bgColor,
                  primaryColor: primaryColor,
                );
              },
            );
          },
        ),
        GoRoute(
          path: '/:slug/settings',
          builder: (context, state) {
            final slug = state.pathParameters['slug']!;
            return FutureBuilder(
              future: Future.wait([
                SupabaseConfig.client
                    .from('pages')
                    .select()
                    .eq('username', slug)
                    .single(),
                SupabaseConfig.client
                    .from('page_data')
                    .select()
                    .eq('page_id', (SupabaseConfig.client
                        .from('pages')
                        .select('id')
                        .eq('username', slug)
                        .single() as Future<Map<String, dynamic>>).then((p) => p['id'] as String))
                    .maybeSingle(),
              ]),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Scaffold(
                    body: Center(child: CircularProgressIndicator()),
                  );
                }
                final pageData = snapshot.data![0] as Map<String, dynamic>;
                final pageDataModel = snapshot.data![1] != null
                    ? PageDataModel.fromJson(snapshot.data![1] as Map<String, dynamic>)
                    : null;
                final templateType = pageData['template_type'] as String;
                Color bgColor;
                Color primaryColor;
                switch (templateType) {
                  case 'LOVE':
                    bgColor = AppColors.loveBackground;
                    primaryColor = AppColors.lovePrimary;
                    break;
                  case 'EVERY':
                    bgColor = AppColors.everyBackground;
                    primaryColor = AppColors.everyPrimary;
                    break;
                  case 'IDOL':
                    bgColor = AppColors.idolBackground;
                    primaryColor = const Color(0xFF8B5CF6);
                    break;
                  default:
                    bgColor = AppColors.loveBackground;
                    primaryColor = AppColors.lovePrimary;
                }
                return SettingsPage(
                  pageId: pageData['id'] as String,
                  pageData: pageDataModel,
                  backgroundColor: bgColor,
                  primaryColor: primaryColor,
                );
              },
            );
          },
        ),
      ],
    );
  }
}

// Demo HomePage để test Design System
class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  String _pin = '';

  void _onNumberPressed(String number) {
    if (_pin.length < 6) {
      setState(() {
        _pin += number;
      });
    }
  }

  void _onBackspace() {
    if (_pin.isNotEmpty) {
      setState(() {
        _pin = _pin.substring(0, _pin.length - 1);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.loveBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Title
              Text(
                'Design System Demo',
                style: AppTextStyles.h1(color: AppColors.lovePrimary),
              ),

              const SizedBox(height: 40),

              // PIN Input
              PinCodeInput(
                pin: _pin,
                filledColor: AppColors.lovePrimary,
              ),

              const SizedBox(height: 40),

              // Virtual Numpad
              SizedBox(
                width: 300,
                height: 400,
                child: VirtualNumpad(
                  onNumberPressed: _onNumberPressed,
                  onBackspace: _onBackspace,
                  backspaceColor: AppColors.lovePrimary,
                ),
              ),

              const SizedBox(height: 40),

              // Primary Button
              SizedBox(
                width: double.infinity,
                child: PrimaryButton(
                  text: 'Submit PIN',
                  backgroundColor: AppColors.lovePrimary,
                  textColor: AppColors.loveTextButton,
                  onPressed: () {
                    if (_pin.length == 6) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('PIN: $_pin')),
                      );
                    }
                  },
                ),
              ),

              const SizedBox(height: 24),

              // Go to Admin Button
              TextButton(
                onPressed: () {
                  context.go('/admin');
                },
                child: Text(
                  'Go to Admin →',
                  style: AppTextStyles.body(color: AppColors.lovePrimary),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

