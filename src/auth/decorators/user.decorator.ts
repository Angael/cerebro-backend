import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import firebase from 'firebase-admin';
import { Request } from 'express';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest() as Request;
  return request.user! as firebase.auth.DecodedIdToken;
});
