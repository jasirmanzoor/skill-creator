/**
 * The site's motion values, shared by every Motion (JS) animation. The same curves live in globals.css as
 * --ease-out and --ease-in-out for CSS transitions.
 */
type Bezier = [number, number, number, number];

/** entrances, exits and feedback */
export const EASE_OUT: Bezier = [0.23, 1, 0.32, 1];
/** movement that stays on screen */
export const EASE_IN_OUT: Bezier = [0.77, 0, 0.175, 1];

/** a control settling into a new state: quick, no bounce */
export const SPRING_UI = { stiffness: 420, damping: 32 };
/** smoothing a value that follows the pointer or the scroll */
export const SPRING_SMOOTH = { stiffness: 90, damping: 22 };
