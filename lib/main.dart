import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'config/router_config.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/youtube_background_player.dart';
import 'core/widgets/mute_icon_overlay.dart';
import 'core/network/supabase_client.dart';
import 'presentation/auth/bloc/auth_bloc.dart';
import 'presentation/auth/bloc/auth_event.dart';

void main() {
  runZonedGuarded(() async {
    // Ensure Flutter is initialized
    WidgetsFlutterBinding.ensureInitialized();

    // Load environment variables from .env
    await dotenv.load(fileName: '.env');

    // Initialize Supabase from .env
    await SupabaseService.initialize();

    // Set preferred orientations
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    // Run the app
    runApp(const MyApp());
  }, (error, stack) {
    // Global error handler
    debugPrint('🔴 Global Error: $error');
    debugPrint('Stack trace: $stack');
  });
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        // Global Auth Bloc
        BlocProvider<AuthBloc>(
          create: (context) => AuthBloc()..add(const CheckAuthStatus()),
        ),
      ],
      child: MaterialApp.router(
        title: 'Kỷ Niệm Số',
        debugShowCheckedModeBanner: false,
        
        // Material 3 Theme
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        
        // Router configuration
        routerConfig: AppRouter.router,
        
        // Builder for global error handling
        builder: (context, child) {
          // Global error widget
          ErrorWidget.builder = (FlutterErrorDetails details) {
            return Material(
              child: Container(
                color: Theme.of(context).colorScheme.error,
                padding: const EdgeInsets.all(16),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        size: 48,
                        color: Theme.of(context).colorScheme.onError,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Đã xảy ra lỗi',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: Theme.of(context).colorScheme.onError,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Vui lòng khởi động lại ứng dụng',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.onError,
                            ),
                      ),
                      if (details.exception != null) ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.black26,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            details.exception.toString(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontFamily: 'monospace',
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          };
          
          
          // Wrap in Stack to add YouTube background player and mute overlay
          return Stack(
            children: [
              child ?? const SizedBox.shrink(),
              // Hidden YouTube player (1x1 pixel, offscreen)
              const YoutubeBackgroundPlayer(),
              // Mute icon overlay (shows when auto-paused)
              const MuteIconOverlay(),
            ],
          );
        },
      ),
    );
  }
}
