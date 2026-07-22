export interface PublicFormState {
  readonly status: 'idle' | 'success' | 'error' | 'disabled' | 'rate_limited'
  readonly message: string
  readonly fieldErrors?: Record<string, string[]>
}

export type PublicFormAction = (
  previousState: PublicFormState,
  formData: FormData,
) => Promise<PublicFormState>

export const INITIAL_PUBLIC_FORM_STATE: PublicFormState = {
  status: 'idle',
  message: '',
}

export async function unavailableFormAction(): Promise<PublicFormState> {
  return {
    status: 'disabled',
    message: 'Biểu mẫu chưa hoạt động vì website chưa kết nối CMS.',
  }
}
