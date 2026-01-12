import '../models/page_model.dart';
import '../models/page_data_model.dart';
import 'template_widget.dart';
import 'love_template.dart';
import 'every_template.dart';
import 'idol_template.dart';

/// Template Factory - tạo widget dựa vào template type
class TemplateFactory {
  static TemplateWidget create({
    required PageModel page,
    PageDataModel? pageData,
  }) {
    switch (page.templateType) {
      case TemplateType.love:
        return LoveTemplate(page: page, pageData: pageData);
      case TemplateType.every:
        return EveryTemplate(page: page, pageData: pageData);
      case TemplateType.idol:
        return IdolTemplate(page: page, pageData: pageData);
    }
  }
}
