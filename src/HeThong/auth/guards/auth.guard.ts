import {
  ExecutionContext,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MESSAGE } from 'src/messageError';

// import { AuthService } from '../../auth/auth.service';
import { AuthService } from '../auth.service';
import { STRATEGY_JWT_AUTH } from '../constants/role.constant';
@Injectable()
export class AuthenticationGuard extends AuthGuard(STRATEGY_JWT_AUTH) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    // Add your custom authentication logic here
    const request = context.switchToHttp().getRequest();
    if (request.headers.authorization) {

      // Kiểm tra format của Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid authorization header format');
      }

      const token = authHeader.split('Bearer ')[1];

      // Kiểm tra token có tồn tại không
      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const payload: any = await this.authService.decodeToken(token);

      // Kiểm tra payload có hợp lệ không
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      request.user = payload;

      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (request.user.exp && request.user.exp < currentTimestamp) {
        throw new UnauthorizedException('Token expired');
      }
      return true;
    }
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException(`${info}`);
    }
    return user;
  }
}
