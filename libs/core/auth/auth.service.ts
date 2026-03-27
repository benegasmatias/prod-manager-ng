import { Injectable, signal, computed, inject } from '@angular/core';
import { createClient, SupabaseClient, Session, User, UserAttributes } from '@supabase/supabase-js';
import { environment } from '../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  
  private _session = signal<Session | null>(null);
  session = computed(() => this._session());
  
  private _user = signal<User | null>(null);
  user = computed(() => this._user());
  
  private _loading = signal<boolean>(true);
  loading = computed(() => this._loading());

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);
      this._loading.set(false);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);
      this._loading.set(false);
    });
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  async login(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({ email, password: pass });
  }

  async signup(email: string, pass: string, metadata: Record<string, any>) {
    return await this.supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: metadata
      }
    });
  }

  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
  }

  async signInWithGoogle() {
    return await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async logout() {
    return await this.supabase.auth.signOut();
  }

  async updateProfile(updates: UserAttributes['data']) {
    return await this.supabase.auth.updateUser({
      data: updates
    });
  }
}
