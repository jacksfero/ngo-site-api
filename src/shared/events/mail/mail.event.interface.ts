export interface MailTemplateEvent {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  template: string;
  context?: Record<string, any>;
}
