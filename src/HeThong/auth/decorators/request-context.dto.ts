import { UserAccessTokenClaims } from '../dto/auth-token-output.dto';

export class RequestContext {
  public requestID: string;

  public url: string;

  public ip: string;

  public user: UserAccessTokenClaims;
}
