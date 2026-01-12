import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ============================================================================
// APP COLORS - 3 Templates
// ============================================================================

class AppColors {
  // Template Love
  static const loveBackground = Color(0xFFFFCDD4);
  static const lovePrimary = Color(0xFFE30523);
  static const loveTextButton = Color(0xFFFFFFFF);
  
  // Template Every
  static const everyBackground = Color(0xFF6AD59D);
  static const everyPrimary = Color(0xFF3D2181);
  static const everyTextButton = Color(0xFFFFFFFF);
  
  // Template Idol
  static const idolBackground = Color(0xFF97D5FF);
  static const idolText = Color(0xFFFFFFFF);
  static const idolButton = Color(0xFFFFFFFF);
  static const idolTextButton = Color(0xFFE30523);
}

// ============================================================================
// APP TEXT STYLES - Montserrat
// ============================================================================

class AppTextStyles {
  static TextStyle h1({Color? color}) => GoogleFonts.montserrat(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: color ?? Colors.black,
      );

  static TextStyle body({Color? color}) => GoogleFonts.montserrat(
        fontSize: 16,
        fontWeight: FontWeight.normal,
        color: color ?? Colors.black,
      );

  static TextStyle caption({Color? color}) => GoogleFonts.montserrat(
        fontSize: 12,
        fontWeight: FontWeight.normal,
        color: color ?? Colors.black,
      );
}

// ============================================================================
// PRIMARY BUTTON
// ============================================================================

class PrimaryButton extends StatelessWidget {
  final String text;
  final Color backgroundColor;
  final Color textColor;
  final VoidCallback onPressed;
  final double height;
  final double borderRadius;

  const PrimaryButton({
    super.key,
    required this.text,
    required this.backgroundColor,
    required this.onPressed,
    this.textColor = Colors.white,
    this.height = 50,
    this.borderRadius = 30,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(borderRadius),
          child: Center(
            child: Text(
              text,
              style: AppTextStyles.body(color: textColor),
            ),
          ),
        ),
      ),
    );
  }
}

// ============================================================================
// PIN CODE INPUT - 6 ô tròn
// ============================================================================

class PinCodeInput extends StatelessWidget {
  final String pin;
  final int length;
  final double dotSize;
  final double spacing;
  final Color filledColor;
  final Color emptyColor;
  final Color borderColor;

  const PinCodeInput({
    super.key,
    required this.pin,
    this.length = 6,
    this.dotSize = 60,
    this.spacing = 12,
    this.filledColor = const Color(0xFFE30523),
    this.emptyColor = Colors.white,
    this.borderColor = const Color(0xFFE0E0E0),
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: List.generate(6, (index) {
        final isFilled = index < pin.length;
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 4), // Reduced from 6
          width: 48, // Reduced from 60
          height: 60, // Reduced from 70
          decoration: BoxDecoration(
            color: isFilled ? filledColor : emptyColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: borderColor ?? filledColor.withOpacity(0.3),
              width: isFilled ? 0 : 2,
            ),
          ),
          child: isFilled
              ? Center(
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                  ),
                )
              : null,
        );
      }),
    );
  }
}

// ============================================================================
// VIRTUAL NUMPAD - 3x4 Grid
// ============================================================================

class VirtualNumpad extends StatelessWidget {
  final Function(String) onNumberPressed;
  final VoidCallback onBackspace;
  final Color buttonColor;
  final Color textColor;
  final Color backspaceColor;

  const VirtualNumpad({
    super.key,
    required this.onNumberPressed,
    required this.onBackspace,
    this.buttonColor = const Color(0xFFF5F5F5),
    this.textColor = Colors.black,
    this.backspaceColor = const Color(0xFFE30523),
  });

  @override
  Widget build(BuildContext context) {
    final buttons = [
      '1', '2', '3',
      '4', '5', '6',
      '7', '8', '9',
      '', '0', 'backspace',
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1,
      ),
      itemCount: buttons.length,
      itemBuilder: (context, index) {
        final button = buttons[index];
        
        if (button.isEmpty) {
          return const SizedBox.shrink();
        }

        if (button == 'backspace') {
          return _NumpadButton(
            backgroundColor: buttonColor,
            onPressed: onBackspace,
            child: Icon(
              Icons.backspace_outlined,
              color: backspaceColor,
              size: 28,
            ),
          );
        }

        return _NumpadButton(
          backgroundColor: buttonColor,
          onPressed: () => onNumberPressed(button),
          child: Text(
            button,
            style: AppTextStyles.h1(color: textColor),
          ),
        );
      },
    );
  }
}

// Widget nút cho numpad
class _NumpadButton extends StatelessWidget {
  final Widget child;
  final VoidCallback onPressed;
  final Color backgroundColor;

  const _NumpadButton({
    required this.child,
    required this.onPressed,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        shape: BoxShape.circle,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          customBorder: const CircleBorder(),
          child: Center(child: child),
        ),
      ),
    );
  }
}
