/* Pixel Paws root service worker.
 * The imported worker owns the conservative offline navigation fallback and
 * optional Firebase Messaging handlers. Keeping one root-scoped registration
 * avoids competing service workers for PWA, auth, Firestore, and notifications.
 */
importScripts('/firebase-messaging-sw.js');
