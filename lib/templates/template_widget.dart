import 'package:flutter/material.dart';
import '../models/page_model.dart';
import '../models/page_data_model.dart';

/// Abstract base class cho template widgets
abstract class TemplateWidget extends StatefulWidget {
  final PageModel page;
  final PageDataModel? pageData;

  const TemplateWidget({
    super.key,
    required this.page,
    this.pageData,
  });
}
