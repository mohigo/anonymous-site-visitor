export type ContactSource = 'contact_form' | 'contact_sales' | 'start_pro' | 'start_free';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: ContactSource;
}

export async function submitContactForm(formData: ContactFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Something went wrong',
    };
  }
} 