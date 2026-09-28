export const ONBOARDING_STORAGE_KEY = 'fog_onboarded_v1';

export function hasCompletedOnboarding() {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

export function markOnboardingComplete() {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
    return true;
  } catch {
    return false;
  }
}
