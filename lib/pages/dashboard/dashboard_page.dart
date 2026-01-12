import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/loading_provider.dart';
import '../../models/page_model.dart';
import '../../models/page_data_model.dart';
import '../../providers/pages_provider.dart';
import '../../templates/template_factory.dart';

/// Dashboard Page - sử dụng Factory Pattern để render template
class DashboardPage extends ConsumerStatefulWidget {
  final String slug;

  const DashboardPage({super.key, required this.slug});

  @override
  ConsumerState<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends ConsumerState<DashboardPage> {
  PageModel? _page;
  PageDataModel? _pageData;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      await runWithLoading(ref, () async {
        final repository = ref.read(pagesRepositoryProvider);

        // Load page
        final page = await repository.getPageByUsername(widget.slug);
        if (page == null) {
          throw Exception('Page not found');
        }

        // Load page data
        final pageDataResponse = await repository.supabase
            .from('page_data')
            .select()
            .eq('page_id', page.id)
            .maybeSingle();

        setState(() {
          _page = page;
          _pageData = pageDataResponse != null
              ? PageDataModel.fromJson(pageDataResponse)
              : null;
          _isLoading = false;
        });
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Error: $_error',
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    if (_page == null) {
      return const Scaffold(
        body: Center(
          child: Text('Page not found'),
        ),
      );
    }

    // Use Factory Pattern to create appropriate template
    final template = TemplateFactory.create(
      page: _page!,
      pageData: _pageData,
    );

    return template;
  }
}
