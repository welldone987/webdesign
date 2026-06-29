import { useReducedMotion } from 'framer-motion';

export function useReducedMotionPreference() {
  return Boolean(useReducedMotion());
}
