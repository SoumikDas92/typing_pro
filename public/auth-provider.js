/*
  Optional Firebase adapter for Velora.

  Define window.VELORA_FIREBASE_CONFIG before this file loads to enable genuine
  Google and email authentication plus Firestore profile sync. With no config,
  Velora uses its local account/data adapter and never simulates Google login.
*/
(() => {
  const config = window.VELORA_FIREBASE_CONFIG;
  if (!config) return;

  const ready = Promise.all([
    import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js')
  ]).then(([appApi, authApi, dbApi]) => {
    const app = appApi.initializeApp(config);
    return { auth: authApi.getAuth(app), db: dbApi.getFirestore(app), authApi, dbApi };
  });

  const normalize = user => user ? {
    id: user.uid,
    email: user.email || '',
    username: user.displayName || user.email?.split('@')[0] || 'Learner',
    avatar: user.photoURL || '',
    mode: 'firebase'
  } : null;

  window.VELORA_AUTH_PROVIDER = {
    async getSession() {
      const { auth, authApi } = await ready;
      const user = await new Promise(resolve => {
        let off = () => {};
        off = authApi.onAuthStateChanged(auth, value => { off(); resolve(value); });
      });
      return normalize(user);
    },
    async signUp({ email, password, username }) {
      const { auth, authApi } = await ready;
      const credential = await authApi.createUserWithEmailAndPassword(auth, email, password);
      await authApi.updateProfile(credential.user, { displayName: username });
      return normalize(credential.user);
    },
    async signIn({ email, password }) {
      const { auth, authApi } = await ready;
      return normalize((await authApi.signInWithEmailAndPassword(auth, email, password)).user);
    },
    async signInWithGoogle() {
      const { auth, authApi } = await ready;
      const provider = new authApi.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      return normalize((await authApi.signInWithPopup(auth, provider)).user);
    },
    async signOut() {
      const { auth, authApi } = await ready;
      return authApi.signOut(auth);
    },
    async loadProfile(userId) {
      const { db, dbApi } = await ready;
      const snapshot = await dbApi.getDoc(dbApi.doc(db, 'profiles', userId));
      return snapshot.exists() ? snapshot.data() : null;
    },
    async saveProfile(userId, data) {
      const { db, dbApi } = await ready;
      return dbApi.setDoc(dbApi.doc(db, 'profiles', userId), data, { merge: true });
    }
  };
})();
