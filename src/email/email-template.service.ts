import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  private readonly templateCache = new Map<string, string>();
  private readonly templatesDir = join(__dirname, 'templates');

  async render(
    templateName: string,
    context: Record<string, string | number | undefined>,
  ): Promise<string> {
    const normalizedName = templateName.endsWith('.html')
      ? templateName
      : `${templateName}.html`;

    const template = await this.loadTemplate(normalizedName);
    return template.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => {
      const value = context[key];

      if (value === undefined || value === null) {
        this.logger.warn(
          `Missing value for template variable "${key}" in template "${normalizedName}"`,
        );
        return '';
      }

      return String(value);
    });
  }

  private async loadTemplate(templateName: string): Promise<string> {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const templatePath = join(this.templatesDir, templateName);
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    this.templateCache.set(templateName, templateContent);
    return templateContent;
  }
}

