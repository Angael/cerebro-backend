import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import firebase from '../../firebase/firebase-params';

@Injectable()
export class TokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return false;
    }

    const decodedToken = await firebase
      .auth()
      .verifyIdToken(token)
      .then((decodedToken: firebase.auth.DecodedIdToken) => decodedToken);

    request.user = decodedToken;
    return true;
  }
}
