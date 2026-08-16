import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MockUser, PublicUser } from './interfaces/user.interface';

/**
 * Komplett gemockter Auth-Service.
 * Keine echte Verschlüsselung, kein echtes JWT, keine DB -
 * alles liegt nur im Arbeitsspeicher und dient als Platzhalter/Fake-API.
 */
@Injectable()
export class AuthService {
  private readonly users: MockUser[] = [
    {
      id: randomUUID(),
      email: 'demo@example.com',
      password: 'password123',
      name: 'Demo User',
    },
  ];

  // token -> userId
  private readonly sessions = new Map<string, string>();

  register(dto: RegisterDto): { user: PublicUser; token: string } {
    const existing = this.users.find((u) => u.email === dto.email);
    if (existing) {
      throw new ConflictException('Email bereits registriert');
    }

    const user: MockUser = {
      id: randomUUID(),
      email: dto.email,
      password: dto.password,
      name: dto.name,
    };
    this.users.push(user);

    const token = this.createSession(user.id);
    return { user: this.toPublicUser(user), token };
  }

  login(dto: LoginDto): { user: PublicUser; token: string } {
    const user = this.users.find(
      (u) => u.email === dto.email && u.password === dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Ungültige Zugangsdaten');
    }

    const token = this.createSession(user.id);
    return { user: this.toPublicUser(user), token };
  }

  logout(token: string): { success: boolean } {
    return { success: this.sessions.delete(token) };
  }

  me(token: string): PublicUser {
    const userId = this.sessions.get(token);
    if (!userId) {
      throw new UnauthorizedException('Ungültiges oder abgelaufenes Token');
    }

    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      throw new UnauthorizedException('User nicht gefunden');
    }

    return this.toPublicUser(user);
  }

  validateToken(token: string | undefined): boolean {
    return !!token && this.sessions.has(token);
  }

  private createSession(userId: string): string {
    const token = `mock-${randomUUID()}`;
    this.sessions.set(token, userId);
    return token;
  }

  private toPublicUser(user: MockUser): PublicUser {
    const { password, ...publicUser } = user;
    void password;
    return publicUser;
  }
}
