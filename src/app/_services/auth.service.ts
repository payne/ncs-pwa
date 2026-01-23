import { Injectable } from '@angular/core';
import { getAuth, Auth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;
  private currentUser: User | null = null;

  constructor(private firebaseService: FirebaseService) {
    this.auth = getAuth();

    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.saveUserToDatabase(user);
      }
    });
  }

  private saveUserToDatabase(user: User): void {
    if (user.email) {
      this.firebaseService.saveUser({
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastLogin: Date.now()
      }).catch(error => {
        console.error('Error saving user to database:', error);
      });
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAuthState(): Observable<User | null> {
    return new Observable(observer => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      });
      return () => unsubscribe();
    });
  }

  signInWithGoogle(): Promise<User | null> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider)
      .then((result) => {
        return result.user;
      })
      .catch((error) => {
        console.error('Error signing in with Google:', error);
        throw error;
      });
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getUserEmail(): string | null {
    return this.currentUser?.email || null;
  }

  getUserDisplayName(): string | null {
    return this.currentUser?.displayName || null;
  }

  getUserPhotoURL(): string | null {
    return this.currentUser?.photoURL || null;
  }
}
