import 'package:go_router/go_router.dart';
import '../presentation/admin/pages/admin_dashboard_page.dart';
import '../presentation/auth/pages/login_page.dart';
import '../presentation/auth/pages/pin_entry_page.dart';
import '../presentation/home/pages/home_page.dart';
import '../presentation/gallery/pages/gallery_page.dart';
import '../presentation/timeline/pages/timeline_page.dart';
import '../presentation/game/pages/game_page.dart';
import '../presentation/time_capsule/pages/time_capsule_page.dart';

/// Go Router configuration for the app
class AppRouter {
  // Route paths
  static const String home = '/';
  static const String login = '/login';
  static const String pinEntry = '/pin';
  static const String admin = '/admin';
  static const String gallery = '/gallery';
  static const String timeline = '/timeline';
  static const String game = '/game';
  static const String timeCapsule = '/time-capsule';

  /// Create GoRouter instance
  static GoRouter get router => GoRouter(
        initialLocation: home,
        routes: [
          GoRoute(
            path: home,
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: login,
            builder: (context, state) => const LoginPage(),
          ),
          GoRoute(
            path: pinEntry,
            builder: (context, state) => const PinEntryPage(),
          ),
          GoRoute(
            path: admin,
            builder: (context, state) => const AdminDashboardPage(),
          ),
          GoRoute(
            path: gallery,
            builder: (context, state) => const GalleryPage(),
          ),
          GoRoute(
            path: timeline,
            builder: (context, state) => const TimelinePage(),
          ),
          GoRoute(
            path: game,
            builder: (context, state) => const GamePage(),
          ),
          GoRoute(
            path: timeCapsule,
            builder: (context, state) => const TimeCapsulePage(),
          ),
        ],
        errorBuilder: (context, state) => const HomePage(),
      );
}
