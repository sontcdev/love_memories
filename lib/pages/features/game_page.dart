import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/design_system.dart';
import '../../models/game_card_model.dart';
import '../../providers/game_provider.dart';

class GamePage extends ConsumerStatefulWidget {
  final Color backgroundColor;
  final Color primaryColor;

  const GamePage({
    super.key,
    required this.backgroundColor,
    required this.primaryColor,
  });

  @override
  ConsumerState<GamePage> createState() => _GamePageState();
}

class _GamePageState extends ConsumerState<GamePage> {
  GameCardModel? _currentCard;
  Level? _selectedLevel;
  bool _showCard = false;

  Future<void> _drawCard(Level level) async {
    setState(() {
      _selectedLevel = level;
      _showCard = false;
    });

    final cardsAsync = ref.read(gameCardsByLevelProvider(level));

    cardsAsync.when(
      data: (allCards) {
        final usedIds = ref.read(usedCardIdsProvider);

        final availableCards =
            allCards.where((card) => !usedIds.contains(card.id)).toList();

        if (availableCards.isEmpty) {
          // Reset and shuffle
          ref.read(usedCardIdsProvider.notifier).state = [];

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('🔄 Xào lại bài!'),
              backgroundColor: widget.primaryColor,
            ),
          );

          // Recursive call after reset
          _drawCard(level);
          return;
        }

        // Random pick
        final randomIndex = Random().nextInt(availableCards.length);
        final randomCard = availableCards[randomIndex];

        // Mark as used
        ref.read(usedCardIdsProvider.notifier).state = [
          ...usedIds,
          randomCard.id,
        ];

        setState(() {
          _currentCard = randomCard;
          _showCard = true;
        });
      },
      loading: () {},
      error: (error, stack) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $error'),
            backgroundColor: Colors.redAccent,
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: widget.backgroundColor,
      appBar: AppBar(
        backgroundColor: widget.backgroundColor,
        title: const Text('Thử Thách Tình Yêu 💕'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 20),

            // Title
            Text(
              'Thử Thách Tình Yêu 💕',
              style: AppTextStyles.h1(color: Colors.black87).copyWith(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 12),

            // Subtitle
            Text(
              'Chọn độ khó và khám phá thử thách của bạn!',
              style: AppTextStyles.body(color: Colors.black54),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 40),

            // Level buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildLevelButton(
                  Level.easy,
                  Colors.green,
                  Icons.favorite,
                ),
                const SizedBox(width: 16),
                _buildLevelButton(
                  Level.medium,
                  Colors.pink,
                  Icons.local_fire_department,
                ),
                const SizedBox(width: 16),
                _buildLevelButton(
                  Level.hard,
                  Colors.red,
                  Icons.star,
                ),
              ],
            ),

            const SizedBox(height: 40),

            // Card display
            if (_showCard && _currentCard != null)
              FlipCard(
                card: _currentCard!,
                primaryColor: widget.primaryColor,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLevelButton(Level level, Color color, IconData icon) {
    return Expanded(
      child: InkWell(
        onTap: () => _drawCard(level),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.3),
                blurRadius: 10,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Column(
            children: [
              Icon(icon, color: Colors.white, size: 32),
              const SizedBox(height: 8),
              Text(
                level.displayName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// 3D Flip card widget
class FlipCard extends StatefulWidget {
  final GameCardModel card;
  final Color primaryColor;

  const FlipCard({
    super.key,
    required this.card,
    required this.primaryColor,
  });

  @override
  State<FlipCard> createState() => _FlipCardState();
}

class _FlipCardState extends State<FlipCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _showFront = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _flip() {
    if (_showFront) {
      _controller.reverse();
    } else {
      _controller.forward();
    }
    setState(() => _showFront = !_showFront);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _flip,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final angle = _animation.value * pi;
          final isBack = angle < pi / 2;

          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateY(angle),
            child: isBack ? _buildCardBack() : _buildCardFront(),
          );
        },
      ),
    );
  }

  Widget _buildCardBack() {
    return Container(
      width: 300,
      height: 400,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            widget.primaryColor,
            widget.primaryColor.withOpacity(0.7),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: widget.primaryColor.withOpacity(0.3),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
      ),
      child: Stack(
        children: [
          // Pattern
          Positioned.fill(
            child: CustomPaint(
              painter: CardPatternPainter(color: Colors.white.withOpacity(0.1)),
            ),
          ),
          // Center icon
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.favorite,
                  size: 80,
                  color: Colors.white.withOpacity(0.8),
                ),
                const SizedBox(height: 16),
                Text(
                  'Tap để lật',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCardFront() {
    return Transform(
      alignment: Alignment.center,
      transform: Matrix4.identity()..rotateY(pi),
      child: Container(
        width: 300,
        height: 400,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: widget.primaryColor.withOpacity(0.3),
              blurRadius: 20,
              spreadRadius: 5,
            ),
          ],
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.favorite,
              color: widget.primaryColor,
              size: 48,
            ),
            const SizedBox(height: 24),
            Text(
              widget.card.content,
              style: AppTextStyles.body(color: Colors.black87).copyWith(
                fontSize: 18,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: widget.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                widget.card.level.displayName,
                style: AppTextStyles.caption(color: widget.primaryColor),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Custom painter for card pattern
class CardPatternPainter extends CustomPainter {
  final Color color;

  CardPatternPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    // Draw hearts pattern
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 7; j++) {
        final x = i * 60.0 + 30;
        final y = j * 60.0 + 30;

        _drawHeart(canvas, paint, Offset(x, y), 20);
      }
    }
  }

  void _drawHeart(Canvas canvas, Paint paint, Offset center, double size) {
    final path = Path();
    path.moveTo(center.dx, center.dy + size * 0.3);
    path.cubicTo(
      center.dx - size * 0.5,
      center.dy - size * 0.3,
      center.dx - size,
      center.dy + size * 0.3,
      center.dx,
      center.dy + size,
    );
    path.cubicTo(
      center.dx + size,
      center.dy + size * 0.3,
      center.dx + size * 0.5,
      center.dy - size * 0.3,
      center.dx,
      center.dy + size * 0.3,
    );

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
